from pathlib import Path
p=Path('src/lib/unified-exam-docx.ts')
s=p.read_text()
s=s.replace('WidthType,ExternalHyperlink }','WidthType,ExternalHyperlink,BorderStyle,Footer,PageNumber }')
s=s.replace('export type WorksheetDocumentOptions=', 'import {WORKSHEET_RUBRIC,WORKSHEET_RUBRIC_LEVELS,worksheetPhaseDetails,type WorksheetPhaseDetails} from "./worksheet-instructions";\nexport type WorksheetDocumentOptions=')
s=s.replace('phaseResources?:Record<WorksheetPhase,PlanResource[]>;', 'phaseResources?:Record<WorksheetPhase,PlanResource[]>;phaseDetails?:Record<WorksheetPhase,WorksheetPhaseDetails>;')
a=s.index('export async function unifiedWorksheetDocx(')
b=s.index('export async function unifiedExamDocx(',a)
s=s[:a]+'''export async function unifiedWorksheetDocx(lesson:string,activity:PlanActivity,items:{question:UnifiedQuestion;phase:WorksheetPhase}[],images:Map<string,{data:Uint8Array;width:number;height:number}>,teacher=false,options:WorksheetDocumentOptions={}){
 resolveWorksheetQuestions(items.map(i=>i.question),items.map(i=>({id:i.question.id,phase:i.phase})),lesson);
 const children:(Paragraph|Table)[]=[];
 const details=options.phaseDetails||worksheetPhaseDetails();
 const phaseTasks=options.phaseTasks??{before_class:"1. Đọc học liệu được giao.\\n2. Trả lời câu hỏi và ghi điều chưa hiểu.",in_class:activity.instructions,after_class:"1. Tự giải bài vận dụng.\\n2. Kiểm tra kết quả và ghi điều đã sửa."};
 const lines=(text:string)=>text.split("\\n").filter(Boolean).map(line=>p(line));
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
   children.push(heading("Câu "+(i+1)),...q.prompt.split("\\n").map(line=>p(line,false,true)));
   if(q.figure){const image=images.get(q.figure.url);if(!image)throw new Error("Thiếu hình minh họa câu "+(i+1)+".");const {width,height}=fitQuestionFigure(image.width,image.height);children.push(new Paragraph({alignment:AlignmentType.CENTER,keepNext:true,children:[new ImageRun({type:"png",data:image.data,transformation:{width,height},altText:{title:"Hình minh họa của câu hỏi",description:q.figure.description,name:q.id}})]}));}
   q.options?.forEach((o,j)=>children.push(p("ABCD"[j]+". "+o,false,j<3)));
   q.statements?.forEach((s,j)=>children.push(p(String.fromCharCode(97+j)+") "+s.text+"   □ Đúng   □ Sai",false,j<3)));
   if(teacher){const answer=q.kind==="choice"?"ABCD"[q.answer!]:q.kind==="true_false"?q.statements!.map((s,j)=>String.fromCharCode(97+j)+") "+(s.answer?"Đúng":"Sai")).join("; "):q.answerText||(q.answer!==undefined?String(q.answer)+" "+(q.unit||""):"Theo hướng dẫn chấm");children.push(heading("Đáp án và hướng dẫn"),p(answer),...lines(q.explanation||q.rubric?.map(r=>r.text).join("\\n")||""));}
   else children.push(answerBox(q.kind==="written"||q.kind==="numeric"?5:2),p(""));
  });
  children.push(heading("Sản phẩm cần hoàn thành"),...lines(details[phase].product),p("Tự kiểm tra: "+details[phase].criteria));
  if(!teacher)children.push(p(phase==="before_class"?"Điều em chưa hiểu hoặc căn cứ của câu trả lời:":phase==="in_class"?"Kết luận của em sau trao đổi và điều đã sửa:":"Điều em đã sửa hoặc cách em kiểm tra kết quả:"),p("................................................................................................"),p("................................................................................................"));
  if(teacher)children.push(p("Giáo viên đối chiếu sản phẩm với tiêu chí của pha, hỏi học sinh về căn cứ của lời giải và ghi nhận xét theo phần 3."));
 });
 children.push(new Paragraph({children:[new PageBreak()]}),heading("3 Rubrics đánh giá"),p("Chọn một mức cho mỗi tiêu chí dựa trên bài làm và phần tự kiểm tra. Học sinh tự đánh giá trước; giáo viên đối chiếu sản phẩm và ghi nhận xét, hướng dẫn sửa."));
 const cell=(text:string,bold=false)=>new TableCell({borders,margins:{top:110,bottom:110,left:100,right:100},children:[new Paragraph({children:[new TextRun({text,bold,size:21})],spacing:{after:40,line:252}})]});
 children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:[1600,1993,1993,1993,1993],rows:[new TableRow({tableHeader:true,children:[cell("Tiêu chí",true),...WORKSHEET_RUBRIC_LEVELS.map(text=>cell(text,true))]}),...WORKSHEET_RUBRIC.map(r=>new TableRow({cantSplit:true,children:[cell(r.criterion+"\\n"+WORKSHEET_PHASE_LABELS[r.phase as WorksheetPhase],true),...r.levels.map(text=>cell(text))]}))]}),p(""));
 for(const r of WORKSHEET_RUBRIC)children.push(p(r.criterion+": Học sinh chọn mức ............ Giáo viên chọn mức ............"));
 children.push(heading("Nhận xét và việc cần làm tiếp"),p("Điểm đã làm được: ............................................................................"),p("Nội dung cần sửa: .............................................................................."),p("Cách sửa và thời hạn hoàn thành: ......................................................"));
 if(teacher&&options.requirements?.length)children.push(heading("Yêu cầu cần đạt được sử dụng"),...options.requirements.map(text=>p(text)),p("Yêu cầu được diễn giải từ chương trình môn Vật lí ban hành kèm Thông tư 32/2018. Phiếu dùng để học tập và đánh giá thường xuyên theo sản phẩm; khi dùng cho kiểm tra định kì, giáo viên lập thêm ma trận, bản đặc tả, đề và hướng dẫn chấm theo Công văn 7991."));
 return Packer.toBlob(new Document({styles:{default:{document:{run:{font:"Times New Roman",size:24,color:"000000"}}},paragraphStyles:[{id:"Title",name:"Title",basedOn:"Normal",run:{font:"Times New Roman",size:28,bold:true,color:"000000"}}]},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({children:["Trang ",PageNumber.CURRENT],size:20})]})]})},children}]}));
}
''' +s[b:]
p.write_text(s)
