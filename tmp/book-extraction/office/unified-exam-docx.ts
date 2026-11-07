import { Document,Packer,Paragraph,TextRun,ImageRun,PageBreak,AlignmentType,Table,TableRow,TableCell,WidthType } from "docx";
import { officeEquation } from "./office-equation";
import { mathSegments,validateUnifiedQuestion,validateExamMatrix,matrixAssessmentSummary,canonicalLevel,EVALUATION_LEVELS,QUESTION_KIND_LABELS,type UnifiedQuestion,type ExamMatrixSpec,type QuestionKind } from "./unified-question-bank";
import {fitQuestionFigure} from "./question-bank-display";
import {WORKSHEET_PHASES,WORKSHEET_PHASE_LABELS,resolveWorksheetQuestions,type WorksheetPhase} from "./unified-worksheet";
import type {PlanActivity} from "./teaching-plan";
export function officeText(text:string){return mathSegments(text).map(s=>s.math?officeEquation(s.text):new TextRun({text:s.text}));}
function p(text:string,bold=false,keepNext=bold){return new Paragraph({children:bold?[new TextRun({text,bold})]:officeText(text),spacing:{after:110,line:276},keepNext});}
export async function unifiedWorksheetDocx(lesson:string,activity:PlanActivity,items:{question:UnifiedQuestion;phase:WorksheetPhase}[],images:Map<string,{data:Uint8Array;width:number;height:number}>,teacher=false){
 resolveWorksheetQuestions(items.map(i=>i.question),items.map(i=>({id:i.question.id,phase:i.phase})),lesson);
 const children:Paragraph[]=[];
 const phaseTasks={before_class:"Đọc học liệu được giao. Ghi dự đoán và câu hỏi chưa hiểu trước khi xem mô phỏng.",in_class:`${activity.instructions} ${activity.studentActions}`,after_class:"Giải câu vận dụng, đối chiếu dự đoán và ghi điều đã sửa cùng cách kiểm tra tiếp."};
 WORKSHEET_PHASES.forEach((phase,pi)=>{
  if(pi)children.push(new Paragraph({children:[new PageBreak()]}));
  children.push(p(`${teacher?"HƯỚNG DẪN GIÁO VIÊN":"PHIẾU HỌC TẬP BA PHA"} ${lesson}`,true),p(activity.title),p(`${pi+1}. ${WORKSHEET_PHASE_LABELS[phase]}`,true),p(`Mục tiêu: ${activity.objective}`));
  if(!teacher)children.push(p("Họ và tên .................................................. Lớp/nhóm ................"));
  children.push(p(phaseTasks[phase]));
  items.forEach(({question:q,phase:assigned},i)=>{
   if(assigned!==phase)return;
   children.push(p(`Câu ${i+1}`,true));
   if(teacher){const answer=q.kind==="choice"?"ABCD"[q.answer!]:q.kind==="true_false"?q.statements!.map((s,j)=>`${String.fromCharCode(97+j)}) ${s.answer?"Đúng":"Sai"}`).join("; "):q.answerText||(q.answer!==undefined?`${q.answer} ${q.unit||""}`:"Theo hướng dẫn chấm");children.push(p(`Đáp án: ${answer}`),p(q.explanation||q.rubric?.map(r=>r.text).join("\n")||""));}
   else{
    children.push(...q.prompt.split("\n").map(line=>p(line,false,true)));
    if(q.figure){const image=images.get(q.figure.url);if(!image)throw new Error(`Thiếu hình minh họa câu ${i+1}.`);const {width,height}=fitQuestionFigure(image.width,image.height);children.push(new Paragraph({alignment:AlignmentType.CENTER,keepNext:true,children:[new ImageRun({type:"png",data:image.data,transformation:{width,height},altText:{title:"Hình minh họa từ câu hỏi",description:q.figure.description,name:q.id}})]}));}
    q.options?.forEach((o,j)=>children.push(p(`${"ABCD"[j]}. ${o}`,false,j<3)));
    q.statements?.forEach((s,j)=>children.push(p(`${String.fromCharCode(97+j)}) ${s.text}   □ Đúng   □ Sai`,false,j<3)));
    children.push(p("Trả lời / quan sát / giải thích:"),p("................................................................................................"),p("................................................................................................"));
   }

  });
  if(teacher&&phase==="in_class")children.push(p(`Việc giáo viên: ${activity.teacherActions||""}`),p(`Sản phẩm học sinh: ${activity.product}`),p(`Tiêu chí: ${activity.evaluation}`),p(activity.support));
 });
 return Packer.toBlob(new Document({styles:{default:{document:{run:{font:"Times New Roman",size:24,color:"000000"}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},children}]}));
}
export async function unifiedExamDocx(matrix:ExamMatrixSpec,versions:{code:string;questions:UnifiedQuestion[]}[],images:Map<string,{data:Uint8Array;width:number;height:number}>,teacher=false){
 const children:(Paragraph|Table)[]=[];const totals=validateExamMatrix(matrix);
 for(const [vindex,v] of versions.entries()){
  if(vindex)children.push(new Paragraph({children:[new PageBreak()]}));
  children.push(new Paragraph({heading:"Title",alignment:AlignmentType.CENTER,children:[new TextRun({text:teacher?"Đáp án và hướng dẫn chấm":matrix.title,bold:true,color:"000000",font:"Times New Roman",size:28})]}),p(`Vật lí 12   Thời gian ${matrix.minutes} phút   Mã đề ${v.code}   ${totals.total.toLocaleString("vi")} điểm`));
  if(!teacher)children.push(p("Họ và tên .......................................................... Lớp ................"));
  for(const [i,q] of v.questions.entries()){
   validateUnifiedQuestion(q);children.push(p(`Câu ${i+1} (${q.points.toLocaleString("vi")} điểm)`,true));
   if(teacher){const answer=q.kind==="choice"?"ABCD"[q.answer!]:q.kind==="true_false"?q.statements!.map((s,j)=>`${String.fromCharCode(97+j)} ${s.answer?"Đúng":"Sai"}`).join(", "):q.answerText || (q.answer!==undefined?`${q.answer} ${q.unit||""}`:"Theo hướng dẫn chấm");children.push(p(`Đáp án: ${answer}`),p(q.explanation||""));for(const r of q.rubric||[])children.push(p(`${r.text} (${Number(r.points.toFixed(3)).toLocaleString("vi")} điểm)`));continue;}
   children.push(...q.prompt.split("\n").map(line=>p(line,false,true)));
   if(q.figure){const image=images.get(q.figure.url);if(!image)throw new Error(`Thiếu hình minh họa câu ${i+1}.`);const {width,height}=fitQuestionFigure(image.width,image.height);children.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({type:"png",data:image.data,transformation:{width,height},altText:{title:"Hình minh họa câu hỏi",description:q.figure.description,name:q.id}})]}));}
   q.options?.forEach((o,j)=>children.push(p(`${"ABCD"[j]}. ${o}`,false,j<3)));q.statements?.forEach((s,j)=>children.push(p(`${String.fromCharCode(97+j)}) ${s.text}   □ Đúng   □ Sai`,false,j<3)));
   if(q.kind==="numeric")children.push(p("Trả lời ..........................................."));if(q.kind==="written")children.push(p("................................................................................................"));
  }
  if(teacher){children.push(p("Phân bố câu theo ma trận",true));const cell=(s:string)=>new TableCell({children:[p(s)]});children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[new TableRow({children:["Bài/chủ đề","Loại câu","Mức độ","Số câu","Điểm mỗi câu"].map(cell)}),...matrix.rows.map(r=>new TableRow({children:[r.topic,QUESTION_KIND_LABELS[r.kind].replace("Ngân hàng đề ",""),canonicalLevel(r.level)||r.level,String(r.count),String(r.points)].map(cell)}))]}));}
 }
 return Packer.toBlob(new Document({styles:{default:{document:{run:{font:"Times New Roman",size:24,color:"000000"}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},children}]}));
}
export async function matrixSpecificationDocx(matrix:ExamMatrixSpec,questions:UnifiedQuestion[]) {
 const audit=matrixAssessmentSummary(matrix);
 if(audit.incomplete.length)throw new Error(`Bản đặc tả còn thiếu ở dòng ${audit.incomplete.join(", ")}.`);
 if(questions.length!==validateExamMatrix(matrix).count)throw new Error("Tập câu hỏi chưa khớp số câu trong ma trận.");
 const kinds=Object.keys(QUESTION_KIND_LABELS) as QuestionKind[];
 const combos=kinds.flatMap(kind=>EVALUATION_LEVELS.map(level=>({kind,level})));
 const small=(text:string,bold=false)=>new Paragraph({children:[new TextRun({text,bold,size:18})],spacing:{after:40,line:240}});
 const cell=(text:string,span=1,bold=false)=>new TableCell({columnSpan:span,children:[small(text,bold)],margins:{top:60,bottom:60,left:60,right:60}});
 const header=(spec:boolean)=>[
  new TableRow({tableHeader:true,children:[cell("TT",1,true),cell("Chủ đề/Chương",1,true),cell("Nội dung/đơn vị kiến thức",1,true),...(spec?[cell("Yêu cầu cần đạt và năng lực",1,true)]:[]),...kinds.map(kind=>cell(QUESTION_KIND_LABELS[kind].replace("Ngân hàng đề ",""),3,true)),...(!spec?[cell("Tổng",3,true),cell("Tỉ lệ % điểm",1,true)]:[])]}),
  new TableRow({tableHeader:true,children:[cell(""),cell(""),cell(""),...(spec?[cell("")]:[]),...combos.map(c=>cell(c.level,1,true)),...(!spec?[...EVALUATION_LEVELS.map(level=>cell(level,1,true)),cell("")]:[])]})
 ];
 let offset=0;
 const rowNumbers=matrix.rows.map(r=>{const numbers=Array.from({length:r.count},(_,i)=>offset+i+1);offset+=r.count;return numbers;});
 // The supplied question order is the assembled base exam, before version shuffling.
 matrix.rows.forEach((r,i)=>rowNumbers[i].forEach(n=>{const q=questions[n-1];if(q.kind!==r.kind||canonicalLevel(q.level)!==canonicalLevel(r.level)||q.points!==r.points)throw new Error(`Câu ${n} không khớp dòng ma trận.`);}));
 const table=(spec:boolean)=>new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:spec?[350,1300,1600,2600,...Array(12).fill(410)]:[350,1300,1800,...Array(15).fill(480),600],rows:[...header(spec),...matrix.rows.map((r,i)=>new TableRow({cantSplit:true,children:[cell(String(i+1)),cell(r.chapter!),cell(`${r.topic}: ${r.contentUnit}`),...(spec?[cell(`${r.requirement}\nNăng lực: ${r.competency}`)]:[]),...combos.map(c=>cell(c.kind===r.kind&&c.level===canonicalLevel(r.level)?spec?rowNumbers[i].join(", "):String(r.count):"")),...(!spec?[...EVALUATION_LEVELS.map(level=>cell(level===canonicalLevel(r.level)?String(r.count):"")),cell(String(Number((r.count*r.points/audit.total*100).toFixed(2))))]:[])]})),new TableRow({children:[cell("Tổng số câu",spec?4:3,true),...combos.map(c=>cell(String(matrix.rows.filter(r=>r.kind===c.kind&&canonicalLevel(r.level)===c.level).reduce((n,r)=>n+r.count,0)))),...(!spec?[...EVALUATION_LEVELS.map(level=>cell(String(matrix.rows.filter(r=>canonicalLevel(r.level)===level).reduce((n,r)=>n+r.count,0)))),cell("100")]:[])]})]});
 const title=(text:string)=>new Paragraph({heading:"Title",children:[new TextRun({text,bold:true,color:"000000",size:28})]});
 const context=()=>[p(matrix.title),p(`Vật lí 12 · ${matrix.minutes} phút · ${audit.total.toLocaleString("vi")} điểm · Mã đề 101`)];
 return Packer.toBlob(new Document({styles:{default:{document:{run:{font:"Times New Roman",color:"000000",size:22}}}},sections:[{properties:{page:{size:{width:16838,height:11906},margin:{top:720,bottom:720,left:720,right:720}}},children:[title("Ma trận đề kiểm tra"),...context(),table(false),p(`Điểm theo loại câu: ${kinds.map(k=>`${QUESTION_KIND_LABELS[k].replace("Ngân hàng đề ","")} ${audit.kindPoints[k]} điểm (${audit.kindPercent[k]}%)`).join("; ")}`),p(`Điểm theo mức độ: ${Object.entries(audit.levelPoints).map(([l,n])=>`${l} ${n} điểm (${audit.levelPercent[l]}%)`).join("; ")}`),p("Cấu trúc tham khảo Phụ lục Công văn 7991/BGDĐT-GDTrH ngày 17/12/2024. Giáo viên đối chiếu với kế hoạch kiểm tra của đơn vị; phân bố trên là phân bố thực tế của đề."),new Paragraph({children:[new PageBreak()]}),title("Bản đặc tả đề kiểm tra"),...context(),table(true),p("Các số trong ô là số câu của mã đề 101. Yêu cầu cần đạt và năng lực do giáo viên lựa chọn, rà soát cùng nội dung từng câu trước khi sử dụng.")]}]}));
}
export function reorderExam(questions:UnifiedQuestion[],version:number){
 const shifted=questions.map(q=>({...q,options:q.options?.slice(),statements:q.statements?.map(s=>({...s}))}));
 // Rotate options by version; answer key moves with its original option. Stems and figures retain their associations.
 for(const q of shifted)if(q.kind==="choice"){const shift=version%4;q.options=[...q.options!.slice(shift),...q.options!.slice(0,shift)];q.answer=(q.answer!-shift+4)%4;}
 if(version%2)shifted.reverse();return {code:String(101+version),questions:shifted};
}
