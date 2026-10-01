"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MaterialType, MaterialCategory } from "@/lib/material-bank";

export type MaterialActionState = {
  error?: string;
  message?: string;
  materialId?: string;
};

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createMaterialItemAction(
  _prev: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const materialType = readText(formData, "material_type") as MaterialType;
  const category = (readText(formData, "category") || "nuclear_physics") as MaterialCategory;
  const lessonTag = readText(formData, "lesson_tag") || null;
  const contentUrl = readText(formData, "content_url");
  const isPublished = formData.get("is_published") === "true";

  if (!title) {
    return { error: "Vui lòng nhập tiêu đề học liệu." };
  }
  if (!materialType) {
    return { error: "Vui lòng chọn loại học liệu." };
  }
  if (!contentUrl) {
    return { error: "Vui lòng cung cấp đường dẫn tệp hoặc liên kết học liệu." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Bạn cần đăng nhập với vai trò giáo viên." };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") {
    return { error: "Chỉ giáo viên mới có quyền tạo học liệu vào kho." };
  }

  // Insert into material_bank
  try {
    const { data: created, error } = await supabase
      .from("material_bank")
      .insert({
        teacher_id: user.id,
        title,
        description,
        material_type: materialType,
        category,
        lesson_tag: lessonTag,
        content_url: contentUrl,
        is_published: isPublished,
        is_system: false,
        metadata: {},
      })
      .select("id")
      .single();

    if (error) {
      // If table doesn't exist yet, we notify gracefully
      return { error: `Không thể lưu vào cơ sở dữ liệu: ${error.message}. (Gợi ý: cần áp dụng migration 018).` };
    }

    revalidatePath("/teacher/materials");
    return { message: "Đã thêm học liệu vào kho thành công.", materialId: created?.id };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Lỗi không xác định khi lưu học liệu." };
  }
}

export async function updateMaterialItemAction(
  _prev: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  const id = readText(formData, "id");
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const isPublished = formData.get("is_published") === "true";

  if (!id || !title) {
    return { error: "Thiếu mã học liệu hoặc tiêu đề." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  try {
    const { error } = await supabase
      .from("material_bank")
      .update({
        title,
        description,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("teacher_id", user.id);

    if (error) {
      return { error: `Lỗi cập nhật: ${error.message}` };
    }

    revalidatePath("/teacher/materials");
    return { message: "Đã cập nhật thông tin học liệu." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Lỗi khi cập nhật học liệu." };
  }
}

export async function deleteMaterialItemAction(
  _prev: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  const id = readText(formData, "id");
  if (!id) return { error: "Thiếu mã học liệu cần xóa." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  try {
    const { error } = await supabase
      .from("material_bank")
      .delete()
      .eq("id", id)
      .eq("teacher_id", user.id);

    if (error) {
      return { error: `Không thể xóa học liệu: ${error.message}` };
    }

    revalidatePath("/teacher/materials");
    return { message: "Đã xóa học liệu khỏi kho." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Lỗi khi xóa học liệu." };
  }
}
