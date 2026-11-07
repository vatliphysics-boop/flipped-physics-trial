import {CANONICAL_SYSTEM_MATERIALS,type MaterialItem} from "./material-bank";
import {createPlanTemplate} from "./teaching-plan-templates";
import {lessonPlanReview,validateTeachingPlan,type TeachingPlan,type PlanActivity} from "./teaching-plan";
import {checkPreparationPlan} from "./teacher-preparation";
import {SAMPLE_WORKSHEET_TASKS,worksheetPhaseDetails} from "./worksheet-instructions";
import {WORKSHEET_SAMPLES,worksheetResources} from "./guided-worksheet";
import {NUCLEAR_LESSONS,requirementsForLesson,requirementTexts} from "./nuclear-curriculum";
import {FLIPPED_ROLE_GUIDES} from "./flipped-classroom";
export type GuidedPreparationDraft={plan:TeachingPlan;budget:number;className:string;device:"projector"|"groups"|"individual"};
export const DEFAULT_TARGETS:Record<string,string[]>=Object.fromEntries(Object.entries(WORKSHEET_SAMPLES).map(([lesson,sample])=>[lesson,sample.targets]));
export function resizeClassTime(plan:TeachingPlan,budget:number):TeachingPlan{
 const during=plan.activities.filter(a=>a.phase==="in_class");
 if(!Number.isInteger(budget)||budget<10||budget>180||during.length>budget)throw new Error("Thời gian trên lớp từ 10 đến 180 phút, đủ cho số hoạt động đã chọn.");
 const total=during.reduce((n,a)=>n+a.minutes,0);
 const times=during.map(a=>Math.max(1,Math.floor(budget*(total?a.minutes/total:1/during.length))));
 let rest=budget-times.reduce((n,t)=>n+t,0);
 for(let i=0;rest>0;i=(i+1)%Math.max(1,times.length)){if(!times.length)break;times[i]++;rest--;}
 for(let i=times.length-1;rest<0&&i>=0;i--){const change=Math.min(times[i]-1,-rest);times[i]-=change;rest+=change;}
 return {...plan,activities:plan.activities.map(a=>a.phase==="in_class"?{...a,minutes:times[during.findIndex(d=>d.id===a.id)]}:a)};
}
export function createGuidedPreparation(lesson:string,materials:MaterialItem[]=CANONICAL_SYSTEM_MATERIALS,form:TeachingPlan["flippedForm"]="standard"):GuidedPreparationDraft{
 const plan=createPlanTemplate(lesson,undefined,materials,form),targets=DEFAULT_TARGETS[lesson]||[],sample=WORKSHEET_SAMPLES[lesson],details=worksheetPhaseDetails(),resources=worksheetResources(lesson,materials);
 plan.title=(NUCLEAR_LESSONS[lesson as keyof typeof NUCLEAR_LESSONS]||plan.title)+" · "+sample.title;
 plan.classContext="Nhóm dùng chung thiết bị";
 plan.curriculumTargets=targets;plan.knowledgeGoals=requirementTexts(targets).join("\n");plan.goals=plan.knowledgeGoals;
 plan.preparation="Học liệu của bài; phiếu học tập “"+sample.title+"” có ba phần hướng dẫn, nhiệm vụ và rubrics, xuất từ công cụ Phiếu học tập ba pha. Chuẩn bị bản học sinh và đáp án riêng cho giáo viên; thiết bị có trình duyệt để mở học liệu và mô phỏng.";
 const make=(id:string,phase:PlanActivity['phase'],type:PlanActivity['activityType'],title:string,minutes:number,instructions:string,objective:string,product:string,evaluation:string):PlanActivity=>({id,phase,activityType:type,title,minutes,objective,instructions,studentActions:instructions,
 teacherActions:phase==='before_class'?"Giao phiếu và đường dẫn học liệu, thông báo thời hạn phần chuẩn bị. Xem câu trả lời để chọn vấn đề cần trao đổi trên lớp.":phase==='after_class'?"Giao phần sau giờ học và thời hạn nộp. Đối chiếu đáp án, nhận xét bài làm và cách tự kiểm tra theo rubrics.":"Giao nhiệm vụ trong phiếu, quan sát cách làm, hỏi về căn cứ; tổ chức báo cáo và chốt kiến thức.",product,evaluation,
 support:"Học sinh cần hỗ trợ đọc lại dữ kiện và mục kiến thức tương ứng; giáo viên gợi ý từng bước. Học sinh hoàn thành sớm giải thích cách kiểm tra kết quả cho nhóm.",resources:resources[phase],
 assignment:"Giáo viên giao nhiệm vụ nêu ở phần nội dung, chỉ rõ học liệu, sản phẩm và tiêu chí đánh giá.",
 implementation:phase==='in_class'?"Học sinh trao đổi nhóm theo hướng dẫn; mỗi bạn ghi lời giải riêng. Giáo viên theo dõi, yêu cầu nêu dữ kiện và hỗ trợ chỗ chưa hiểu.":"Học sinh tự đọc học liệu và làm nhiệm vụ trong phiếu. Ghi điều chưa hiểu hoặc cách kiểm tra lời giải.",
 discussion:phase==='before_class'?"Giáo viên tổng hợp phần chuẩn bị và chọn một số câu trả lời để trao đổi khi đến lớp.":phase==='after_class'?"Giáo viên nhận phiếu, chọn cách giải và lỗi tiêu biểu để phản hồi ở lần học tiếp theo.":"Nhóm trình bày sản phẩm; các bạn đối chiếu dữ kiện, giải thích cách làm và phản hồi.",
 conclusion:phase==='in_class'?"Giáo viên nhận xét theo tiêu chí; học sinh ghi kết luận đúng và điều đã điều chỉnh.":"Học sinh hoàn thiện sản phẩm sau phản hồi của giáo viên và ghi việc cần học tiếp."});
 const tasks=SAMPLE_WORKSHEET_TASKS[lesson];
 const before=make('guided-before','before_class','opening','Chuẩn bị câu 1 trong phiếu',15,tasks.before_class,details.before_class.objective,details.before_class.product,details.before_class.criteria);
 const opening=make('guided-opening','in_class','opening','Xác định vấn đề từ phần tự học',5,"Mỗi học sinh nêu điều chưa hiểu hoặc căn cứ trả lời câu 1. Giáo viên chọn một vấn đề gắn với mục tiêu để lớp giải quyết.","Xác định nội dung cần giải thích từ phần chuẩn bị.","Câu hỏi cần giải quyết và cách hiểu ban đầu.","Nêu cụ thể chỗ chưa hiểu hoặc căn cứ của cách trả lời.");
 const knowledge=make('guided-knowledge','in_class','knowledge','Thực hiện câu 2 và trao đổi bằng chứng',30,tasks.in_class,details.in_class.objective,details.in_class.product,details.in_class.criteria);
 const practice=make('guided-practice','in_class','practice','Hoàn thiện lời giải cá nhân sau trao đổi',10,"Mỗi học sinh hoàn thiện lời giải câu 2 trong phiếu. Chỉ ra dữ kiện, hình hoặc công thức làm căn cứ; kiểm tra đơn vị và kết luận. Giáo viên hỏi một số học sinh giải thích cách làm, phản hồi chỗ còn thiếu.","Củng cố kiến thức qua lời giải và cách kiểm tra.","Lời giải riêng của từng học sinh và điều chỉnh sau trao đổi.","Lời giải phù hợp yêu cầu; có căn cứ và tự kiểm tra kết quả.");
 practice.resources=resources.in_class;
 const after=make('guided-after','after_class','application','Làm câu 3 và tự đánh giá theo rubrics',15,tasks.after_class,details.after_class.objective,details.after_class.product,details.after_class.criteria);
 plan.activities=[before,opening,knowledge,practice,after];
 if(form!=="standard")for(const activity of plan.activities){
  const guide=FLIPPED_ROLE_GUIDES[form][activity.phase];
  activity.teacherActions=guide.teacher+" Nhiệm vụ cụ thể sử dụng câu hỏi trong phiếu “"+sample.title+"”.";
  activity.studentActions=activity.instructions+"\n"+guide.student;
  activity.implementation=guide.student+" Giáo viên theo dõi và hỗ trợ theo mục tiêu của hoạt động.";
  if(activity.id==='guided-knowledge'){
   activity.product=details.in_class.product+" "+guide.evidence;
   activity.discussion=form==='demonstration'?"Học sinh trình bày bảng quan sát mô phỏng, đối chiếu với câu 2; giáo viên kiểm tra cách đọc dữ kiện và giới hạn mô hình.":form==='discussion'?"Mỗi nhóm nêu cách giải thích câu 2 cùng bằng chứng. Nhóm khác phản biện; mỗi học sinh ghi kết luận sau trao đổi.":"Nhóm phân công điều phối, ghi chép, kiểm tra và trình bày; báo cáo lời giải câu 2 cùng đóng góp của từng thành viên.";
  }
 }
 return {plan:resizeClassTime(plan,45),budget:45,className:"Lớp 12",device:"groups"};
}
export function parsePreparationDraft(v:unknown):GuidedPreparationDraft|null{
 if(!v||typeof v!=="object")return null;const d=v as GuidedPreparationDraft,checked=validateTeachingPlan(d.plan);
 if(!checked.plan||!DEFAULT_TARGETS[checked.plan.lessonCode]||!Number.isInteger(d.budget)||d.budget<10||d.budget>180||typeof d.className!=="string"||d.className.length>100||!["groups","projector","individual"].includes(d.device)||!checked.plan.curriculumTargets?.every(id=>requirementsForLesson(checked.plan!.lessonCode).some(r=>r.id===id)))return null;
 return {...d,plan:checked.plan};
}
export function supportingActivity(current:PlanActivity,support:PlanActivity):PlanActivity{
 return {...current,...support,id:current.id,phase:current.phase,activityType:current.activityType,minutes:current.minutes,
  assignment:"Giáo viên giao nhiệm vụ: "+support.studentActions,
  implementation:"Học sinh thực hiện nhiệm vụ; giáo viên theo dõi và hỗ trợ: "+support.support,
  discussion:"Nhóm báo cáo sản phẩm, trình bày bằng chứng và phản hồi cho nhóm khác.",
  conclusion:"Giáo viên nhận xét theo tiêu chí: "+support.evaluation+" Học sinh điều chỉnh lời giải."};
}
export function preparationReadiness(d:GuidedPreparationDraft){
 const errors=[...lessonPlanReview(d.plan),...checkPreparationPlan(d.plan,d.budget).map(c=>c.message)];
 if(!d.className.trim())errors.push("Điền lớp sử dụng kế hoạch.");
 if(!d.plan.curriculumTargets?.length)errors.push("Chọn ít nhất một yêu cầu cần đạt theo chương trình Vật lí.");
 if(!d.plan.preparation.trim())errors.push("Ghi thiết bị và học liệu sử dụng.");
 const checked=validateTeachingPlan(d.plan);if(!checked.plan)errors.push(checked.error||"Kế hoạch chưa hợp lệ.");
 return [...new Set(errors)];
}
