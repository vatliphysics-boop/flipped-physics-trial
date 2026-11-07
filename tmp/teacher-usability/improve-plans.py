from pathlib import Path
p=Path('src/lib/guided-preparation.ts');s=p.read_text()
s=s.replace('import {NUCLEAR_LESSONS', 'import {SAMPLE_WORKSHEET_TASKS,worksheetPhaseDetails} from "./worksheet-instructions";\nimport {WORKSHEET_SAMPLES,worksheetResources} from "./guided-worksheet";\nimport {NUCLEAR_LESSONS')
a=s.index('export const DEFAULT_TARGETS:');b=s.index('export function resizeClassTime',a)
s=s[:a]+'''export const DEFAULT_TARGETS:Record<string,string[]>=Object.fromEntries(Object.entries(WORKSHEET_SAMPLES).map(([lesson,sample])=>[lesson,sample.targets]));
'''+s[b:]
a=s.index('export function createGuidedPreparation(');b=s.index('export function parsePreparationDraft',a)
s=s[:a]+'''export function createGuidedPreparation(lesson:string,materials:MaterialItem[]=CANONICAL_SYSTEM_MATERIALS,form:TeachingPlan["flippedForm"]="standard"):GuidedPreparationDraft{
 const plan=createPlanTemplate(lesson,undefined,materials,form),targets=DEFAULT_TARGETS[lesson]||[],sample=WORKSHEET_SAMPLES[lesson],details=worksheetPhaseDetails(),resources=worksheetResources(lesson,materials);
 plan.title=(NUCLEAR_LESSONS[lesson as keyof typeof NUCLEAR_LESSONS]||plan.title)+" · "+sample.title;
 plan.classContext="Nhóm dùng chung thiết bị";
 plan.curriculumTargets=targets;plan.knowledgeGoals=requirementTexts(targets).join("\\n");plan.goals=plan.knowledgeGoals;
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
 return {plan:resizeClassTime(plan,45),budget:45,className:"Lớp 12",device:"groups"};
}
'''+s[b:]
p.write_text(s)
p=Path('src/lib/unified-exam-docx.ts');s=p.read_text()
s=s.replace('cell(r.criterion+"\\n"+WORKSHEET_PHASE_LABELS[r.phase as WorksheetPhase],true)', 'cell(r.criterion,true)')
s=s.replace(':"Theo hướng dẫn chấm");children.push(heading("Đáp án và hướng dẫn"),p(answer),...lines', ':"");children.push(heading("Đáp án và hướng dẫn"),...(answer?[p(answer)]:[]),...lines')
p.write_text(s)
p=Path('src/lib/teaching-plan-docx.ts');s=p.read_text().replace('ExternalHyperlink,AlignmentType}', 'ExternalHyperlink,AlignmentType,Table,TableRow,TableCell,WidthType,BorderStyle,Footer,PageNumber}')
s=s.replace('const children:Paragraph[]=', 'const children:(Paragraph|Table)[]=')
s=s.replace('...lines(a.instructions),p("Việc học sinh: "+(a.studentActions||a.instructions)),p("Việc giáo viên: "+(a.teacherActions||""))', '...lines(a.instructions),...(a.studentActions&&a.studentActions!==a.instructions?[p("Việc học sinh: "+a.studentActions)]:[]),p("Việc giáo viên: "+(a.teacherActions||""))')
a=s.index('  for(const [label,value]');b=s.index('  if(a.resources.length)',a)
s=s[:a]+'''  const border={style:BorderStyle.SINGLE,size:4,color:"B8BEC5"};
  const cell=(text:string,bold=false)=>new TableCell({borders:{top:border,bottom:border,left:border,right:border},margins:{top:90,bottom:90,left:100,right:100},children:[p(text,bold)]});
  children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:[2400,6913],rows:([["Giao nhiệm vụ",a.assignment],["Thực hiện nhiệm vụ",a.implementation],["Báo cáo và thảo luận",a.discussion],["Kết luận và nhận định",a.conclusion]] as const).map(([label,value])=>new TableRow({cantSplit:true,children:[cell(label,true),cell(value||"")]}))}));
  children.push(p("Tiêu chí đánh giá: "+a.evaluation),p("Hỗ trợ học sinh: "+a.support));
'''+s[b:]
s=s.replace('...requirementTexts(plan.curriculumTargets||[]).map(text=>p(text)),','')
s=s.replace('import {requirementTexts} from "./nuclear-curriculum";\n','')
s=s.replace('},children}]}));','},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({children:["Trang ",PageNumber.CURRENT],size:20})]})]})},children}]}));')
p.write_text(s)
