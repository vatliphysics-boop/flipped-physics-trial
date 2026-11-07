import {CANONICAL_SYSTEM_MATERIALS,type MaterialItem} from "./material-bank";
import {materialToPlanResource} from "./teaching-plan-templates";
import {requirementsForLesson,requirementTexts} from "./nuclear-curriculum";
import {WORKSHEET_PHASES,resolveWorksheetQuestions,type WorksheetPhase,type WorksheetSelection} from "./unified-worksheet";
import type {UnifiedQuestion} from "./unified-question-bank";
import type {PlanActivity,PlanResource} from "./teaching-plan";
import {SAMPLE_WORKSHEET_TASKS,worksheetPhaseDetails,type WorksheetPhaseDetails} from "./worksheet-instructions";
export const WORKSHEET_SAMPLES:Record<string,{title:string;numbers:number[];targets:string[]}>={
 B21:{title:"Thí nghiệm tán xạ hạt alpha",numbers:[1,2,3],targets:["structure-scattering","structure-model"]},
 B22:{title:"Năng lượng liên kết và độ bền hạt nhân",numbers:[19,20,24],targets:["binding-energy","binding-stability"]},
 B23:{title:"Chu kì bán rã",numbers:[42,43,45],targets:["decay-half-life","decay-law"]},
 B24:{title:"Vai trò của nhà máy điện hạt nhân",numbers:[54,52,55],targets:["industry-role"]},
 B25:{title:"Vận dụng kiến thức vật lí hạt nhân",numbers:[62,63,68],targets:["decay-law","radiation-types"]},
};
export type GuidedWorksheetDraft={lesson:string;title:string;objective:string;targets:string[];selection:WorksheetSelection[];tasks:Record<WorksheetPhase,string>;phases:Record<WorksheetPhase,WorksheetPhaseDetails>};
export function createWorksheetSample(lesson:string,bank:UnifiedQuestion[]):GuidedWorksheetDraft{
 const sample=WORKSHEET_SAMPLES[lesson]||WORKSHEET_SAMPLES.B23;
 const selection=sample.numbers.flatMap((n,i)=>{const id=`sgk-kntt-nuclear-${String(n).padStart(3,'0')}`;return bank.some(q=>q.id===id&&q.status==='ready'&&q.topic===lesson)?[{id,phase:WORKSHEET_PHASES[i]}]:[];});
 return {lesson,title:sample.title,objective:requirementTexts(sample.targets).join('\n'),targets:sample.targets,selection,tasks:SAMPLE_WORKSHEET_TASKS[lesson]||SAMPLE_WORKSHEET_TASKS.B23,phases:worksheetPhaseDetails()};
}
export function parseWorksheetDraft(v:unknown):GuidedWorksheetDraft|null{
 if(!v||typeof v!=='object')return null;const d=v as GuidedWorksheetDraft;
 if(!WORKSHEET_SAMPLES[d.lesson]||typeof d.title!=='string'||d.title.length>200||typeof d.objective!=='string'||d.objective.length>4000||!Array.isArray(d.targets)||!d.targets.every(id=>requirementsForLesson(d.lesson).some(r=>r.id===id))||!Array.isArray(d.selection)||d.selection.length>9||!d.selection.every(s=>typeof s.id==='string'&&WORKSHEET_PHASES.includes(s.phase))||!d.tasks||!WORKSHEET_PHASES.every(p=>typeof d.tasks[p]==='string'&&d.tasks[p].length<=4000))return null;
 const phases=d.phases||worksheetPhaseDetails();
 if(!WORKSHEET_PHASES.every(p=>Number.isInteger(phases[p]?.minutes)&&phases[p].minutes>=5&&phases[p].minutes<=60&&[phases[p].objective,phases[p].product,phases[p].criteria].every(s=>typeof s==="string"&&s.length<=4000)))return null;
 return {...d,phases,selection:d.selection.slice().sort((a,b)=>WORKSHEET_PHASES.indexOf(a.phase)-WORKSHEET_PHASES.indexOf(b.phase))};
}
export function worksheetResources(lesson:string,materials:MaterialItem[]=CANONICAL_SYSTEM_MATERIALS){
 const preferred:Record<string,string>={B22:'system-sim-binding-energy',B23:'system-sim-half-life'};
 const simulation=materials.find(m=>m.lesson_tag===lesson&&m.material_type==='simulation'&&(!preferred[lesson]||m.id===preferred[lesson]));
 const byPhase:Record<WorksheetPhase,PlanResource[]>={before_class:[],in_class:[],after_class:[]};
 for(const [phase,id] of [['before_class',`system-notes-${lesson}`],['in_class',simulation?.id],['after_class',`system-remediation-${lesson}`]] as const){const m=materials.find(m=>m.id===id);if(m)byPhase[phase].push(materialToPlanResource(m));}
 return byPhase;
}
export function worksheetActivity(d:GuidedWorksheetDraft):PlanActivity{
 return {id:'worksheet-activity',phase:'in_class',title:d.title,minutes:15,objective:d.objective,instructions:d.tasks.in_class,studentActions:"",teacherActions:"Đối chiếu lời giải trong hướng dẫn giáo viên; nhận xét kiến thức, cách giải thích và điều học sinh đã sửa.",product:"Lời giải, bằng chứng và bản tự sửa của học sinh.",evaluation:"Nội dung đúng; sử dụng dữ kiện/hình phù hợp; giải thích kết quả và ghi điều cần chỉnh sửa.",support:"Học sinh cần hỗ trợ dùng học liệu của bài; học sinh hoàn thành sớm giải thích thêm căn cứ của lời giải.",resources:[]};
}
export function worksheetReadiness(d:GuidedWorksheetDraft,bank:UnifiedQuestion[]){
 const errors:string[]=[];
 if(!d.title.trim())errors.push('Điền tên phiếu.');if(!d.objective.trim())errors.push('Điền mục tiêu của phiếu.');if(!d.targets.length)errors.push('Chọn ít nhất một yêu cầu cần đạt.');
 for(const p of WORKSHEET_PHASES){const label=p==='before_class'?'trước':p==='in_class'?'trong':'sau';if(!d.tasks[p].trim())errors.push(`Điền hướng dẫn cho ${label} giờ học.`);if(!d.phases[p].objective.trim()||!d.phases[p].product.trim()||!d.phases[p].criteria.trim())errors.push(`Bổ sung mục tiêu, sản phẩm và tiêu chí cho ${label} giờ học.`);if(!Number.isInteger(d.phases[p].minutes)||d.phases[p].minutes<5||d.phases[p].minutes>60)errors.push(`Thời gian ${label} giờ học từ 5 đến 60 phút.`);}
 try{resolveWorksheetQuestions(bank,d.selection,d.lesson);}catch(e){errors.push((e as Error).message);}return errors;
}
