"use server";

import { createClient } from "@/lib/supabase/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");

export type ParsedQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  question_type: string;
  difficulty: string;
  page: number;
};

function parseQuestionsFromText(text: string, numpages: number): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const questionRegex = /(?:Câu\s*\d+|Bài\s*\d+|\n\s*\d+)[\.\:]([\s\S]*?)(?=(?:Câu\s*\d+|Bài\s*\d+|\n\s*\d+)[\.\:]|$)/gi;
  let match;
  let qIndex = 0;
  
  while ((match = questionRegex.exec(text)) !== null) {
    const qText = match[1].trim();
    if (qText.length < 10) continue;
    
    const optA = /A[\.\)]([\s\S]*?)(?=B[\.\)]|$)/i.exec(qText);
    const optB = /B[\.\)]([\s\S]*?)(?=C[\.\)]|$)/i.exec(qText);
    const optC = /C[\.\)]([\s\S]*?)(?=D[\.\)]|$)/i.exec(qText);
    const optD = /D[\.\)]([\s\S]*?)(?=(Đáp án|ĐA|Hướng dẫn|Câu|$))/i.exec(qText);
    
    let prompt = qText;
    const options: string[] = [];
    
    if (optA && optB) {
      options.push(optA[1].trim());
      options.push(optB[1].trim());
      if (optC) options.push(optC[1].trim());
      if (optD) options.push(optD[1].trim());
      prompt = prompt.substring(0, optA.index).trim();
    }
    
    let answer = "";
    const ansMatch = /(?:Đáp án|ĐA|Chọn)[\:\s]*([A-D])/i.exec(qText);
    if (ansMatch) {
      answer = ansMatch[1].toUpperCase();
      if (options.length > 0) {
        const charCode = answer.charCodeAt(0) - 65; 
        if (charCode >= 0 && charCode < options.length) {
          answer = options[charCode];
        }
      }
    }
    
    qIndex++;
    questions.push({
      id: `ext-${Date.now()}-${qIndex}`,
      prompt,
      options,
      correctAnswer: answer,
      question_type: options.length > 0 ? "single_choice" : "short_answer",
      difficulty: "nhan_biet",
      page: numpages 
    });
  }

  if (questions.length === 0 && text.trim().length > 50) {
    questions.push({
      id: `ext-${Date.now()}-1`,
      prompt: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
      options: [],
      correctAnswer: "",
      question_type: "short_answer",
      difficulty: "nhan_biet",
      page: numpages
    });
  }

  return questions;
}

export async function extractQuestionsFromPdf(lessonId: string, storageUrl: string): Promise<{ questions: ParsedQuestion[], error?: string, totalPages?: number }> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { questions: [], error: "Bạn chưa đăng nhập." };
    
    const { data: lesson } = await supabase.from("lessons").select("teacher_id").eq("id", lessonId).single();
    if (!lesson || lesson.teacher_id !== user.id) {
      return { questions: [], error: "Không có quyền truy cập bài học này." };
    }
    
    if (!storageUrl.startsWith("storage:")) {
      return { questions: [], error: "Định dạng URL không hợp lệ." };
    }
    
    const path = storageUrl.replace("storage:lesson-materials/", "");
    const { data: fileData, error: downloadError } = await supabase.storage.from("lesson-materials").download(path);
    
    if (downloadError || !fileData) {
      return { questions: [], error: "Không thể tải file PDF từ Storage: " + (downloadError?.message || "") };
    }
    
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let data;
    try {
      data = await pdf(buffer);
    } catch (err: unknown) {
      return { questions: [], error: "Lỗi đọc PDF: " + (err as Error).message };
    }
    
    const text = data.text;
    if (!text || text.trim().length < 50) {
      return { questions: [], error: "Giới hạn: PDF này có thể là dạng ảnh quét (scan) hoặc không đọc được chữ (OCR không khả dụng). Tính năng hiện CHỈ HỖ TRỢ PDF CÓ CHỮ. Vui lòng dùng PDF chuẩn hoặc tự điền tay." };
    }
    
    const questions = parseQuestionsFromText(text, data.numpages);
    return { questions, totalPages: data.numpages };
  } catch (err: unknown) {
    return { questions: [], error: "Lỗi hệ thống: " + (err as Error).message };
  }
}

export async function saveExtractedQuestions(lessonId: string, drafts: ParsedQuestion[]) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Bạn chưa đăng nhập." };
    
    const { data: lesson } = await supabase.from("lessons").select("teacher_id").eq("id", lessonId).single();
    if (!lesson || lesson.teacher_id !== user.id) {
      return { success: false, error: "Không có quyền truy cập bài học này." };
    }

    const { data: existing } = await supabase.from("phase_assessment_questions").select("content").eq("lesson_id", lessonId);
    const existingPrompts = new Set((existing || []).map(q => q.content.prompt));

    const inserts = [];
    for (const q of drafts) {
      if (!q.correctAnswer) return { success: false, error: `Câu "${q.prompt.substring(0, 30)}..." chưa có đáp án đúng.` };
      
      if (q.question_type === "single_choice") {
         if (q.options.length < 2) return { success: false, error: `Câu trắc nghiệm "${q.prompt.substring(0, 30)}..." phải có ít nhất 2 phương án.` };
         if (!q.options.includes(q.correctAnswer)) return { success: false, error: `Đáp án đúng phải khớp với phương án (câu: "${q.prompt.substring(0, 30)}...").` };
      }

      if (existingPrompts.has(q.prompt)) {
        continue;
      }

      let statements: {text: string, isCorrect: boolean}[] = [];
      if (q.question_type === "true_false") {
         statements = q.options.length > 0 
           ? q.options.map(opt => ({ text: opt, isCorrect: false })) // Default false, teacher needs to edit later
           : [{text: "Phát biểu 1", isCorrect: true}, {text: "Phát biểu 2", isCorrect: false}];
      }

      inserts.push({
        lesson_id: lessonId,
        question_type: q.question_type,
        difficulty: q.difficulty,
        content: {
          prompt: q.prompt,
          options: q.question_type === "single_choice" ? q.options : [],
          statements: q.question_type === "true_false" ? statements : [],
          correctAnswer: q.question_type === "true_false" ? "Xem statements" : q.correctAnswer,
          source_page: q.page
        },
        is_published: false
      });
      
      existingPrompts.add(q.prompt);
    }
    
    if (inserts.length === 0) return { success: true, count: 0, message: "Không có câu nào mới được lưu (trùng lặp toàn bộ)." };

    const { error } = await supabase.from("phase_assessment_questions").insert(inserts);
    if (error) throw error;
    
    return { success: true, count: inserts.length };
  } catch (err: unknown) {
    return { success: false, error: "Lỗi lưu dữ liệu: " + (err as Error).message };
  }
}
