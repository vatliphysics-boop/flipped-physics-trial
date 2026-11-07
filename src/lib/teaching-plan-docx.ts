import {Document,Packer,Paragraph,TextRun,ExternalHyperlink,AlignmentType,Table,TableRow,TableCell,WidthType,BorderStyle,Footer,PageNumber} from "docx";
import {PHASE_NAMES,LESSON_ACTIVITY_TYPES} from "./teaching-plan";
import {parsePreparationDraft,preparationReadiness,type GuidedPreparationDraft} from "./guided-preparation";
import {officeText} from "./unified-exam-docx";
const p=(text:string,bold=false)=>new Paragraph({children:bold?[new TextRun({text,bold})]:officeText(text),spacing:{after:100,line:276},keepNext:bold});
const lines=(text:string)=>text.split("\n").map(line=>p(line));
export async function teachingPlanDocx(draft:GuidedPreparationDraft,origin:string){
 const d=parsePreparationDraft(draft);if(!d)throw new Error("Kế hoạch chưa đúng cấu trúc.");
 const errors=preparationReadiness(d);if(errors.length)throw new Error(errors.join(" "));
 const plan=d.plan;
 const children:(Paragraph|Table)[]=[new Paragraph({style:"Title",alignment:AlignmentType.CENTER,children:[new TextRun({text:"KẾ HOẠCH BÀI DẠY",bold:true,size:28})]}),p(plan.title,true),p("Môn Vật lí · "+d.className),p("Thời gian trên lớp: "+d.budget+" phút. Thời gian tự học trước và sau giờ được ghi riêng."),p("I. Mục tiêu",true),p("1. Kiến thức và yêu cầu cần đạt",true),...lines(plan.knowledgeGoals||plan.goals),p("2. Năng lực",true),...lines(plan.competenceGoals||""),p("3. Phẩm chất",true),...lines(plan.qualityGoals||""),p("II. Thiết bị dạy học và học liệu",true),...lines(plan.preparation),p("Điều kiện lớp: "+plan.classContext)];
 const allResources=[...new Map(plan.activities.flatMap(a=>a.resources).map(r=>[r.id,r])).values()];
 for(const r of allResources){
  const url=r.url.startsWith("activity:")?new URL("/hoc-lieu?resource="+encodeURIComponent(r.id),origin).href:new URL(r.url,origin).href;
  children.push(new Paragraph({children:[new ExternalHyperlink({link:url,children:[new TextRun({text:r.title,style:"Hyperlink"})]})],spacing:{after:90}}));
 }
 children.push(p("III. Tiến trình dạy học",true));
 plan.activities.forEach((a,i)=>{
  children.push(p((i+1)+". "+a.title,true),p(PHASE_NAMES[a.phase]+" · "+a.minutes+" phút · "+(a.activityType?LESSON_ACTIVITY_TYPES[a.activityType]:"Hoạt động học tập")),p("a) Mục tiêu",true),...lines(a.objective),p("b) Nội dung",true),...lines(a.instructions),...(a.studentActions&&a.studentActions!==a.instructions?[p("Việc học sinh: "+a.studentActions)]:[]),p("Việc giáo viên: "+(a.teacherActions||"")),p("c) Sản phẩm",true),...lines(a.product),p("d) Tổ chức thực hiện",true));
  const border={style:BorderStyle.SINGLE,size:4,color:"B8BEC5"};
  const cell=(text:string,bold=false)=>new TableCell({borders:{top:border,bottom:border,left:border,right:border},margins:{top:90,bottom:90,left:100,right:100},children:[p(text,bold)]});
  children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:[2400,6913],rows:([["Giao nhiệm vụ",a.assignment],["Thực hiện nhiệm vụ",a.implementation],["Báo cáo và thảo luận",a.discussion],["Kết luận và nhận định",a.conclusion]] as const).map(([label,value])=>new TableRow({cantSplit:true,children:[cell(label,true),cell(value||"")]}))}));
  children.push(p("Tiêu chí đánh giá: "+a.evaluation),p("Hỗ trợ học sinh: "+a.support));
  if(a.resources.length)children.push(p("Học liệu của hoạt động: "+a.resources.map(r=>r.title).join("; ")));
 });
 children.push(p("IV. Điều chỉnh sau bài dạy",true),...lines(plan.reflection||"Giáo viên bổ sung sau khi tổ chức dạy học."),p("Căn cứ thiết kế",true),p("Khung kế hoạch bài dạy: Phụ lục IV Công văn 5512/BGDĐT-GDTrH ngày 18/12/2020."),p("Yêu cầu cần đạt: chủ đề Vật lí hạt nhân và phóng xạ, chương trình môn Vật lí ban hành kèm Thông tư 32/2018/TT-BGDĐT, trang 27–28 (diễn giải)."),p("Đánh giá trong hoạt động bằng nhận xét theo sản phẩm và tiêu chí đã nêu. Nếu tổ chức kiểm tra định kì, giáo viên xây dựng thêm ma trận, bản đặc tả, đề và hướng dẫn chấm theo Công văn 7991/BGDĐT-GDTrH."));
 return Packer.toBlob(new Document({styles:{default:{document:{run:{font:"Times New Roman",size:24,color:"000000"}}},paragraphStyles:[{id:"Title",name:"Title",basedOn:"Normal",run:{font:"Times New Roman",size:28,bold:true,color:"000000"}}]},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1417,right:1134}}},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({children:["Trang ",PageNumber.CURRENT],size:20})]})]})},children}]}));
}
