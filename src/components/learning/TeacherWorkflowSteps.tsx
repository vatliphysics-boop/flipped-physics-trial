"use client";
export function TeacherWorkflowSteps({labels,step,onChange}:{labels:string[];step:number;onChange:(step:number)=>void}){
 return <nav className="teacher-workflow-steps" aria-label="Các bước biên soạn">{labels.map((label,i)=><button type="button" key={label} aria-current={step===i?"step":undefined} onClick={()=>onChange(i)}><span>{i+1}</span><strong>{label}</strong></button>)}</nav>;
}
