import { Document,Packer,Paragraph,TextRun,ImageRun,PageBreak,AlignmentType,Table,TableRow,TableCell,WidthType,ExternalHyperlink,BorderStyle,Footer,PageNumber } from "docx";
import { officeEquation } from "./office-equation";
import { mathSegments,validateUnifiedQuestion,validateExamMatrix,matrixAssessmentSummary,canonicalLevel,EVALUATION_LEVELS,QUESTION_KIND_LABELS,type UnifiedQuestion,type ExamMatrixSpec,type QuestionKind } from "./unified-question-bank";
import {fitQuestionFigure} from "./question-bank-display";
import {WORKSHEET_PHASES,WORKSHEET_PHASE_LABELS,resolveWorksheetQuestions,type WorksheetPhase} from "./unified-worksheet";
import type {PlanActivity,PlanResource} from "./teaching-plan";
import {WORKSHEET_RUBRIC,WORKSHEET_RUBRIC_LEVELS,worksheetPhaseDetails,type WorksheetPhaseDetails} from "./worksheet-instructions";
export type WorksheetDocumentOptions={title?:string;phaseTasks?:Record<WorksheetPhase,string>;phaseResources?:Record<WorksheetPhase,PlanResource[]>;phaseDetails?:Record<WorksheetPhase,WorksheetPhaseDetails>;requirements?:string[];origin?:string};
export function officeText(text:string){return mathSegments(text).map(s=>s.math?officeEquation(s.text):new TextRun({text:s.text}));}
function p(text:string,bold=false,keepNext=bold){return new Paragraph({children:bold?[new TextRun({text,bold})]:officeText(text),spacing:{after:110,line:276},keepNext});}
export async function unifiedWorksheetDocx(lesson:string,activity:PlanActivity,items:{question:UnifiedQuestion;phase:WorksheetPhase}[],images:Map<string,{data:Uint8Array;width:number;height:number}>,teacher=false,options:WorksheetDocumentOptions={}){
 resolveWorksheetQuestions(items.map(i=>i.question),items.map(i=>({id:i.question.id,phase:i.phase})),lesson);
 const children:(Paragraph|Table)[]=[];
 const details=options.phaseDetails||worksheetPhaseDetails();
 const phaseTasks=options.phaseTasks??{before_class:"1. Đọc học liệu được giao.\n2. Trả lời câu hỏi và ghi điều chưa hiểu.",in_class:activity.instructions,after_class:"1. Tự giải bài vận dụng.\n2. Kiểm tra kết quả và ghi điều đã sửa."};
 const lines=(text:string)=>text.split("\n").filter(Boolean).map(line=>p(line));
 const heading=(text:string)=>p(text,true);
 const border={style:BorderStyle.SINGLE,size:4,color:"B8BEC5"};
 const borders={top:border,bottom:border,left:border,right:border};
 const answerBox=(count:number)=>new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[new TableRow({children:[new TableCell({borders,margins:{top:120,bottom:120,left:120,right:120},children:[p("Bài làm của em"),...Array.from({length:count},()=>p("................................................................................................"))]})]})]});
 const title=options.title||activity.title;
 children.push(new Paragraph({style:"Title",alignment:AlignmentType.CENTER,children:[new TextRun({text:teacher?"Hướng dẫn giáo viên cho phiếu học tập":"Phiếu học tập ba pha",bold:true,size:28})]}),heading(title),p("Vật lí 12 · Chương 4 Vật lí hạt nhân · "+lesson));
 if(!teacher)children.push(p("Họ và tên ........................................................ Lớp .......... Nhóm .........."));
 children.push(heading("1 Hướng dẫn sử dụng phiếu học tập"),p("Phiếu gồm nhiệm vụ trước giờ học, trong giờ học và sau giờ học. Hoàn thành phần chuẩn bị trước khi đến lớp; giữ phiếu để tiếp tục trao đổi và tự làm phần vận dụng."),heading("Mục tiêu"),...lines(activity.objective),heading("Thời gian và cách thực hiện"));
 WORKSHEET_PHASES.forEach(phase=>children.push(p(WORKSHEET_PHASE_LABELS[phase]+": "+details[phase].minutes+" phút. "+details[phase].product)));
 children.push(p("Đọc nhiệm vụ của từng pha rồi làm các câu hỏi ngay bên dưới. Ghi cách làm và căn cứ vào khung trả lời. Khi chưa hiểu, ghi cụ thể chỗ cần hỗ trợ; khi đã hiểu, ghi cách kiểm tra kết quả."),p("Trước khi làm, xem rubrics ở phần 3 để biết tiêu chí. Trong giờ học, mỗi bạn vẫn ghi bài làm riêng sau khi trao đổi nhóm. Sau giờ học, hoàn thành phần vận dụng và nộp phiếu theo thời hạn giáo viên giao."),heading("Học liệu sử dụng"));
 let materialCount=0;
 WORKSHEET_PHASES.forEach(phase=>{for(const r of options.phaseResources?.[phase]||[]){materialCount++;const url=r.url.startsWith("activity:")?new URL("/hoc-lieu?resource="+encodeURIComponent(r.id),options.origin||"http://localhost:3001").href:new URL(r.url,options.origin||"http://localhost:3001").href;children.push(new Paragraph({children:[new TextRun(WORKSHEET_PHASE_LABELS[phase]+": "),new ExternalHyperlink({link:url,children:[new TextRun({text:r.title,style:"Hyperlink"})]})],spacing:{after:90}}));}});
 if(!materialCount)children.push(p("Sử dụng học liệu của bài do giáo viên giao cùng phiếu."));
 if(teacher)children.push(p("Giáo viên giao phần trước giờ học kèm đường dẫn học liệu; trong giờ học kiểm tra phần chuẩn bị, tổ chức trao đổi và yêu cầu từng học sinh hoàn thiện lời giải. Sau giờ học nhận phiếu, đối chiếu đáp án và nhận xét theo rubrics."));
 WORKSHEET_PHASES.forEach((phase,pi)=>{
  children.push(new Paragraph({children:[new PageBreak()]}));
  if(!pi)children.push(heading("2 Phiếu học tập cho học sinh"));
  children.push(heading("Pha "+(pi+1)+" "+WORKSHEET_PHASE_LABELS[phase]),p("Thời gian dự kiến: "+details[phase].minutes+" phút"),p("Mục tiêu của pha: "+details[phase].objective),heading("Việc cần làm"),...lines(phaseTasks[phase]));
  items.forEach(({question:q,phase:assigned},i)=>{
   if(assigned!==phase)return;
   children.push(heading("Câu "+(i+1)),...q.prompt.split("\n").map(line=>p(line,false,true)));
   if(q.figure){const image=images.get(q.figure.url);if(!image)throw new Error("Thiếu hình minh họa câu "+(i+1)+".");const {width,height}=fitQuestionFigure(image.width,image.height);children.push(new Paragraph({alignment:AlignmentType.CENTER,keepNext:true,children:[new ImageRun({type:"png",data:image.data,transformation:{width,height},altText:{title:"Hình minh họa của câu hỏi",description:q.figure.description,name:q.id}})]}));}
   q.options?.forEach((o,j)=>children.push(p("ABCD"[j]+". "+o,false,j<3)));
   q.statements?.forEach((s,j)=>children.push(p(String.fromCharCode(97+j)+") "+s.text+"   □ Đúng   □ Sai",false,j<3)));
   if(teacher){const answer=q.kind==="choice"?"ABCD"[q.answer!]:q.kind==="true_false"?q.statements!.map((s,j)=>String.fromCharCode(97+j)+") "+(s.answer?"Đúng":"Sai")).join("; "):q.answerText||(q.answer!==undefined?String(q.answer)+" "+(q.unit||""):"");children.push(heading("Đáp án và hướng dẫn"),...(answer?[p(answer)]:[]),...lines(q.explanation||q.rubric?.map(r=>r.text).join("\n")||""));}
   else children.push(answerBox(q.kind==="written"||q.kind==="numeric"?5:2),p(""));
  });
  children.push(heading("Sản phẩm cần hoàn thành"),...lines(details[phase].product),p("Tự kiểm tra: "+details[phase].criteria));
  if(!teacher)children.push(p(phase==="before_class"?"Điều em chưa hiểu hoặc căn cứ của câu trả lời:":phase==="in_class"?"Kết luận của em sau trao đổi và điều đã sửa:":"Điều em đã sửa hoặc cách em kiểm tra kết quả:"),p("................................................................................................"),p("................................................................................................"));
  if(teacher)children.push(p("Giáo viên đối chiếu sản phẩm với tiêu chí của pha, hỏi học sinh về căn cứ của lời giải và ghi nhận xét theo phần 3."));
 });
 children.push(new Paragraph({children:[new PageBreak()]}),heading("3 Rubrics đánh giá"),p("Chọn một mức cho mỗi tiêu chí dựa trên bài làm và phần tự kiểm tra. Học sinh tự đánh giá trước; giáo viên đối chiếu sản phẩm và ghi nhận xét, hướng dẫn sửa."));
 const cell=(text:string,bold=false)=>new TableCell({borders,margins:{top:110,bottom:110,left:100,right:100},children:[new Paragraph({children:[new TextRun({text,bold,size:21})],spacing:{after:40,line:252}})]});
 children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:[1600,1993,1993,1993,1993],rows:[new TableRow({tableHeader:true,children:[cell("Tiêu chí",true),...WORKSHEET_RUBRIC_LEVELS.map(text=>cell(text,true))]}),...WORKSHEET_RUBRIC.map(r=>new TableRow({cantSplit:true,children:[cell(r.criterion,true),...r.levels.map(text=>cell(text))]}))]}),p(""));
 for(const r of WORKSHEET_RUBRIC)children.push(p(r.criterion+": Học sinh chọn mức ............ Giáo viên chọn mức ............"));
 children.push(heading("Nhận xét và việc cần làm tiếp"),p("Điểm đã làm được: ............................................................................"),p("Nội dung cần sửa: .............................................................................."),p("Cách sửa và thời hạn hoàn thành: ......................................................"));
 if(teacher&&options.requirements?.length)children.push(heading("Yêu cầu cần đạt được sử dụng"),...options.requirements.map(text=>p(text)),p("Yêu cầu được diễn giải từ chương trình môn Vật lí ban hành kèm Thông tư 32/2018. Phiếu dùng để học tập và đánh giá thường xuyên theo sản phẩm; khi dùng cho kiểm tra định kì, giáo viên lập thêm ma trận, bản đặc tả, đề và hướng dẫn chấm theo Công văn 7991."));
 return Packer.toBlob(new Document({styles:{default:{document:{run:{font:"Times New Roman",size:24,color:"000000"}}},paragraphStyles:[{id:"Title",name:"Title",basedOn:"Normal",run:{font:"Times New Roman",size:28,bold:true,color:"000000"}}]},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({children:["Trang ",PageNumber.CURRENT],size:20})]})]})},children}]}));
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
