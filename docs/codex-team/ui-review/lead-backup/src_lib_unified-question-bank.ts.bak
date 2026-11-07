import {validateBloomTag,type BloomTag} from "./bloom-taxonomy";
export type QuestionKind = "choice" | "true_false" | "numeric" | "written";
export const QUESTION_KIND_LABELS: Record<QuestionKind,string> = {choice:"Ngân hàng đề trắc nghiệm",true_false:"Ngân hàng đề đúng sai",numeric:"Ngân hàng đề trả lời ngắn",written:"Ngân hàng đề tự luận"};
export type UnifiedQuestion = {id:string;kind:QuestionKind;topic:string;chapter:string;level:string;prompt:string;options?:string[];statements?:{text:string;answer?:boolean;explanation?:string}[];answer?:number;answerText?:string;unit?:string;explanation?:string;rubric?:{text:string;points:number}[];points:number;figure?:{url:string;description:string;origin?:"source_crop"|"authored"};source:{book:string;label:string;pages:number[];bookId?:string;sequence?:number;printedPages?:number[];parts?:{questionId:string;book:string;bookId?:string;label:string;pages:number[];printedPages?:number[];statementIndexes:number[]}[]};bloom?:BloomTag;status:"ready"|"draft";notes?:string[]};
export type MatrixRow = {topic:string;kind:QuestionKind;level:string;count:number;points:number;chapter?:string;contentUnit?:string;requirement?:string;competency?:string};
export type ExamMatrixSpec = {title:string;minutes:number;rows:MatrixRow[]};
export const normalize = (s:string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/đ/g,"d").trim();
export const EVALUATION_LEVELS = ["Biết", "Hiểu", "Vận dụng"] as const;
export function canonicalLevel(level:string) {
 const value=normalize(level);
 return ["biet","nhan biet"].includes(value)?"Biết":["hieu","thong hieu"].includes(value)?"Hiểu":value==="van dung"?"Vận dụng":null;
}
export function mathSegments(text:string) {
  const result:{math:boolean;text:string;display?:boolean}[]=[];const re=/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;let last=0;
  for(const m of text.matchAll(re)){if(m.index!>last)result.push({math:false,text:text.slice(last,m.index)});result.push({math:true,text:m[1]||m[2],display:!!m[1]});last=m.index!+m[0].length;}
  if(last<text.length)result.push({math:false,text:text.slice(last)});
  if(result.filter(x=>!x.math).some(x=>x.text.includes("$")))throw new Error("Công thức cần đủ cặp dấu $ hoặc $$.");return result;
}
export function validateUnifiedQuestion(q:UnifiedQuestion) {
 if(q.bloom)validateBloomTag(q.bloom);
 if(!q.prompt.trim() || q.prompt.length>12000 || !q.topic.trim())throw new Error("Câu hỏi cần nội dung và bài/chủ đề.");
 if(q.kind==="choice" && (q.options?.length!==4 || !q.options.every(o=>o.trim()) || !Number.isInteger(q.answer) || q.answer!<0 || q.answer!>3))throw new Error("Trắc nghiệm cần bốn phương án và đáp án A–D.");
 if(q.kind==="true_false" && (q.statements?.length!==4 || !q.statements.every(s=>s.text.trim() && typeof s.answer==="boolean")))throw new Error("Đúng sai cần đúng 4 ý a–d và đáp án của từng ý.");
 if(q.kind==="numeric" && !q.answerText?.trim() && !Number.isFinite(q.answer))throw new Error("Trả lời ngắn cần đáp án.");
 if(q.kind==="written" && !q.explanation?.trim() && !q.rubric?.length)throw new Error("Tự luận cần hướng dẫn chấm.");
 for(const text of [q.prompt,...(q.options||[]),...(q.statements?.map(s=>s.text)||[]),q.explanation||"",q.answerText||""])mathSegments(text);
 if(q.figure && !/^\/(?:learning|api\/book-bank\/asset)/.test(q.figure.url))throw new Error("Hình cần nằm trong kho hình của hệ thống.");
 if(q.status!=="ready")throw new Error("Câu chưa được kiểm tra, chưa dùng để xuất đề.");return q;
}
export function validateExamMatrix(matrix:ExamMatrixSpec) {
 if(!matrix.title.trim() || matrix.title.length>180 || !Number.isInteger(matrix.minutes) || matrix.minutes<5 || matrix.minutes>180 || !Array.isArray(matrix.rows) || !matrix.rows.length || matrix.rows.length>80)throw new Error("Ma trận cần tên đề, thời gian 5–180 phút và 1–80 dòng.");
 let count=0,total=0;
 for(const r of matrix.rows){if(!Object.hasOwn(QUESTION_KIND_LABELS,r.kind) || !r.topic.trim() || !Number.isInteger(r.count) || r.count<1 || r.count>100 || !Number.isFinite(r.points) || r.points<=0 || r.points>10)throw new Error("Mỗi dòng cần bài/chủ đề, loại câu, số câu nguyên dương và điểm mỗi câu.");count+=r.count;total+=r.count*r.points;}
 if(count>100)throw new Error("Mỗi đề tối đa 100 câu.");return {count,total:Number(total.toFixed(6))};
}
function random(seed:string){let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function assembleMatrixExam(bank:UnifiedQuestion[],matrix:ExamMatrixSpec,seed:string) {
 validateExamMatrix(matrix);const rng=random(seed),pool=bank.filter(q=>q.status==="ready");for(const q of pool)validateUnifiedQuestion(q);
 const slots=matrix.rows.flatMap((r,row)=>Array.from({length:r.count},()=>({r,row})));const candidates=slots.map(({r})=>pool.filter(q=>q.kind===r.kind && [q.topic,q.chapter,"Tất cả"].some(t=>normalize(t)===normalize(r.topic)) && (!r.level || normalize(r.level)==="tat ca" || (canonicalLevel(r.level)!==null && canonicalLevel(q.level)===canonicalLevel(r.level)))).map(q=>({q,order:rng()})).sort((a,b)=>a.order-b.order).map(o=>o.q.id));
 const owners=new Map<string,number>();
 function match(slot:number,visited:Set<string>):boolean{for(const id of candidates[slot]){if(visited.has(id))continue;visited.add(id);const owner=owners.get(id);if(owner===undefined || match(owner,visited)){owners.set(id,slot);return true;}}return false;}
 for(let s=0;s<slots.length;s++)if(!match(s,new Set()))throw new Error(`Dòng ${slots[s].row+1}: chưa đủ câu đã kiểm tra cho ${slots[s].r.topic}, ${QUESTION_KIND_LABELS[slots[s].r.kind]}, ${slots[s].r.level||"tất cả mức độ"}. Cần ${slots[s].r.count} câu, hiện có ${candidates[s].length} câu phù hợp; không dùng lặp câu.`);
 const selected=slots.map((slot,i)=>{const id=[...owners].find(([,owner])=>owner===i)![0],q=pool.find(q=>q.id===id)!;return {...q,points:slot.r.points,rubric:q.rubric?.map(r=>({...r,points:r.points/q.points*slot.r.points})),matrixRow:slot.row};});return selected;
}
export function matrixAssessmentSummary(matrix:ExamMatrixSpec) {
 const {total}=validateExamMatrix(matrix);
 const kindPoints=Object.fromEntries(Object.keys(QUESTION_KIND_LABELS).map(k=>[k,0])) as Record<QuestionKind,number>;
 const levelPoints:Record<string,number>={Biết:0,Hiểu:0,"Vận dụng":0};const incomplete:number[]=[];
 matrix.rows.forEach((r,i)=>{kindPoints[r.kind]+=r.count*r.points;const level=canonicalLevel(r.level);if(level)levelPoints[level]+=r.count*r.points;else levelPoints["Chưa xác định"]=(levelPoints["Chưa xác định"]||0)+r.count*r.points;if(!r.chapter?.trim()||!r.contentUnit?.trim()||!r.requirement?.trim()||!r.competency?.trim()||!level)incomplete.push(i+1);});
 const percentage=(points:number)=>Number((points/total*100).toFixed(2));
 return {total,kindPoints,levelPoints,kindPercent:Object.fromEntries(Object.entries(kindPoints).map(([k,v])=>[k,percentage(v)])),levelPercent:Object.fromEntries(Object.entries(levelPoints).map(([k,v])=>[k,percentage(v)])),incomplete};
}
