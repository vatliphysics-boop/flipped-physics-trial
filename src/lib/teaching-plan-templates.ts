import packs from "@/data/teaching-guides.json";
import { FLIPPED_ROLE_GUIDES, getFlippedForm } from "./flipped-classroom";
import { CANONICAL_SYSTEM_MATERIALS, type MaterialItem } from "./material-bank";
import {
  PLAN_PHASES,
  type TeachingPlan,
  type PlanResource,
} from "./teaching-plan";
export function materialToPlanResource(m: MaterialItem): PlanResource {
  return {
    id: m.id,
    title: m.title,
    url: m.content_url,
    type: m.material_type,
  };
}
export function createPlanTemplate(
  code = "B23",
  materialId?: string,
  availableMaterials = CANONICAL_SYSTEM_MATERIALS,
  formId?: string,
): TeachingPlan {
  const guide = packs.guides.find((g) => g.code === code);
  const form = getFlippedForm(formId) ?? getFlippedForm(code === "B24" ? "discussion" : ["B21", "B22", "B25"].includes(code) ? "demonstration" : "standard")!;
  const roleGuide = FLIPPED_ROLE_GUIDES[form.id];
  const simulation = CANONICAL_SYSTEM_MATERIALS.find((m) =>
    code === "B23"
      ? m.id === "system-sim-half-life"
      : m.lesson_tag === code && m.material_type === "simulation",
  );
  const items = {
    before_class: CANONICAL_SYSTEM_MATERIALS.find(
      (m) => m.id === `system-notes-${code}`,
    ),
    in_class: simulation,
    after_class: CANONICAL_SYSTEM_MATERIALS.find(
      (m) => m.id === `system-remediation-${code}`,
    ),
  };
  const plan: TeachingPlan = {
    version: 1,
    id: "unsaved",
    title: guide
      ? `${code} · Kế hoạch ${guide.title}`
      : "Kế hoạch dạy học của tôi",
    lessonCode: guide ? code : "general",
    classContext: "",
    goals: guide?.goals.join("\n") ?? "",
    knowledgeGoals: guide?.goals.join("\n") ?? "",
    competenceGoals: guide ? "Nhận thức vật lí: giải thích khái niệm và quan hệ bằng kí hiệu, sơ đồ. Tìm hiểu thế giới tự nhiên dưới góc độ vật lí: nêu dự đoán, thu thập dữ liệu mô phỏng và đối chiếu với dự đoán. Tự chủ và tự học: lập mục tiêu, ghi điều chưa hiểu và điều chỉnh cách học sau phản hồi." : "",
    qualityGoals: guide ? "Trung thực khi ghi dữ liệu mô phỏng và nguồn tài liệu; chịu trách nhiệm về phần việc cá nhân; tôn trọng ý kiến của bạn trong thảo luận." : "",
    preparation:
      "Thiết bị có trình duyệt/WebGL; phiếu học tập; phân công nhóm và phương án dùng chung thiết bị.",
    reflection: "",
    updatedAt: "",
    ...(guide ? { flippedForm: form.id } : {}),
    activities: guide
      ? PLAN_PHASES.map((phase, i) => ({
          id: `template-${i}`,
          phase,
          activityType: (["opening", "knowledge", "practice"] as const)[i],
          title: [
            "Chuẩn bị và dự đoán",
            "Khám phá, thảo luận và giải thích",
            "Tự kiểm tra và sửa lỗi",
          ][i],
          minutes: [20, 35, 15][i],
          objective: guide.goals[i] ?? guide.goals[0],
          instructions: (i === 0
            ? guide.before
            : i === 1
              ? guide.during
              : guide.after
          ).join("\n"),
          teacherActions: roleGuide[phase].teacher,
          studentActions: `${roleGuide[phase].student}\n${(i === 0 ? guide.before : i === 1 ? guide.during : guide.after).join("\n")}`,
          product: `${guide.product}\n${roleGuide[phase].evidence}`,
          evaluation:
            "Đối chiếu mục tiêu, bảng ghi và lời giải; nhận xét bằng chứng tự học, chưa quy thành điểm năng lực.",
          support: guide.support,
          resources: [
            items[phase],
            ...(phase === "before_class" ? [CANONICAL_SYSTEM_MATERIALS.find(m => m.id === `system-youtube-${code}`), CANONICAL_SYSTEM_MATERIALS.find(m => m.id === `system-quiz-${code}`)] : []),
          ].filter((m): m is MaterialItem => Boolean(m)).map(materialToPlanResource),
        }))
      : [],
  };
  if (guide && code === "B24" && (form.id === "discussion" || form.id === "group")) {
    const activity = plan.activities.find(a => a.phase === "in_class")!;
    activity.title = form.id === "discussion" ? "Thảo luận dự án điện hạt nhân giả định" : "Bản đồ tư duy ứng dụng hạt nhân của nhóm";
    activity.objective = form.id === "discussion" ? "Phân tích lợi ích, giới hạn và điều kiện sử dụng điện hạt nhân bằng dẫn chứng khoa học." : "Hệ thống hóa cơ chế, lợi ích và giới hạn của các ứng dụng hạt nhân bằng nguồn đáng tin cậy.";
    activity.studentActions = `${roleGuide.in_class.student}\n${form.id === "discussion" ? "Chọn vai nhà khoa học, người dân, chuyên gia kinh tế hoặc nhà môi trường. Ghi lợi ích, giới hạn, bằng chứng và phản biện. Mỗi học sinh ghi kết luận riêng sau trao đổi." : "Phân công điều phối, ghi chép, kiểm tra nguồn và trình bày. Ghi các nhánh năng lượng, y học, nông nghiệp, công nghiệp; mỗi nhánh có cơ chế, lợi ích, giới hạn và nguồn. Mỗi học sinh ghi đóng góp của mình."}`;
    activity.instructions = "Nhóm làm việc trên một thiết bị và trình bày trực tiếp. Giáo viên theo dõi đóng góp cá nhân; web chưa đồng biên tập qua nhiều thiết bị.";
    activity.product = roleGuide.in_class.evidence;
    if (form.id === "discussion") {
      activity.evaluation = "Kiểm tra cơ chế chuyển hóa năng lượng, độ phù hợp của nguồn, cách nêu lợi ích và giới hạn; mỗi học sinh giải thích một điều đã điều chỉnh sau phản biện.";
      activity.support = "Nhóm cần hỗ trợ dùng sơ đồ dòng năng lượng và thẻ nguồn–lập luận. Nhóm nâng cao so sánh các điều kiện sử dụng điện hạt nhân và chỉ rõ giới hạn của nguồn.";
    }
    const material = CANONICAL_SYSTEM_MATERIALS.find(m => m.id === (form.id === "discussion" ? "system-roleplay" : "system-mindmap"));
    activity.resources = material ? [materialToPlanResource(material)] : [];
  }
  const material = availableMaterials.find((m) => m.id === materialId);
  if (material)
    plan.activities.push({
      id: "selected-material",
      phase: material.metadata?.recommendedPhase ?? "in_class",
      title: material.title,
      minutes: material.metadata?.durationMinutes ?? 15,
      objective: "",
      instructions: material.description,
      teacherActions: "Giao nhiệm vụ theo mục tiêu; kiểm tra sản phẩm và nhận xét nội dung cần sửa.",
      studentActions: material.description,
      product: "Bản ghi quan sát, trả lời và điều cần sửa.",
      evaluation: "",
      support: "",
      resources: [materialToPlanResource(material)],
    });
  if (guide) {
    const applications:Record<string,string>={
      B21:"Từ một tài liệu về đồng vị dùng trong đời sống, xác định số proton, neutron và số khối của đồng vị được nêu; giải thích ý nghĩa kí hiệu và ghi nguồn.",
      B22:"Dùng sơ đồ phân hạch và nhiệt hạch trong kho để giải thích nguồn năng lượng của nhà máy điện hạt nhân và Mặt Trời; chỉ rõ đại lượng cần có để tính năng lượng một phản ứng.",
      B23:"Quan sát mô phỏng an toàn bức xạ; thay đổi thời gian, khoảng cách và che chắn. Giải thích biện pháp giảm tiếp xúc trong tình huống giả định bằng các nguyên tắc đã học.",
      B24:"Chọn một ứng dụng chiếu xạ thực phẩm hoặc y học hạt nhân trong kho; trình bày cơ chế, lợi ích và giới hạn bằng nguồn đã cung cấp.",
      B25:"Chọn một tình huống về bán rã, năng lượng hoặc an toàn bức xạ trong kho; nêu kiến thức cần dùng, giải quyết và ghi điều đã sửa sau phản hồi."
    };
    const applicationResources:Record<string,string[]>={B21:["system-sim-isotope-size"],B22:["system-sim-nuclear-fission","system-sim-nuclear-fusion"],B23:["system-sim-radiation-safety"],B24:["system-sim-radiation-applications","system-sim-nuclear-medicine"],B25:["system-sim-practice-lab"]};
    plan.activities.push({id:"template-application",phase:"after_class",activityType:"application",title:"Vận dụng kiến thức vào tình huống thực tiễn",minutes:10,objective:"Vận dụng kiến thức hạt nhân để giải thích một tình huống; tự kiểm tra căn cứ và điều chỉnh câu trả lời.",instructions:applications[code],teacherActions:"Giao nhiệm vụ, công bố yêu cầu sản phẩm; nhận xét căn cứ khoa học và góp ý điều cần chỉnh.",studentActions:applications[code],product:"Bản giải thích cá nhân có nguồn, kết luận và điều cần điều chỉnh.",evaluation:"Đúng kiến thức; nguồn rõ; giải thích gắn với tình huống; ghi được cách tự sửa.",support:"Nhóm cần hỗ trợ dùng sơ đồ và câu hỏi định hướng của học liệu đã gắn; nhóm nâng cao nêu thêm giới hạn của mô hình và căn cứ cho kết luận.",resources:CANONICAL_SYSTEM_MATERIALS.filter(m=>applicationResources[code]?.includes(m.id)).map(materialToPlanResource)});
    for(const activity of plan.activities){
      activity.assignment=`Giáo viên giao nhiệm vụ: ${activity.studentActions || activity.instructions}\nThông báo sản phẩm và tiêu chí đánh giá.`;
      activity.implementation=`Học sinh thực hiện nhiệm vụ với học liệu đã gắn, ghi kết quả và điều chưa hiểu. Giáo viên theo dõi, hỗ trợ: ${activity.support}`;
      activity.discussion="Giáo viên chọn sản phẩm để trao đổi; học sinh trình bày căn cứ, so sánh kết quả và phản hồi cho bạn. Nhiệm vụ ngoài lớp được thảo luận ở thời điểm do giáo viên bố trí.";
      activity.conclusion=`Giáo viên nhận xét sản phẩm theo tiêu chí: ${activity.evaluation}\nHọc sinh ghi kết luận và chỉnh sửa sản phẩm.`;
    }
  }
  return plan;
}
