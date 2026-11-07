"use client";
import {lazy,Suspense,useEffect,useState} from "react";
import {BookQuestionBank} from "./BookQuestionBank";
import {TeacherWorksheetStudio} from "./TeacherWorksheetStudio";
import {TeacherPreparationWizard} from "./TeacherPreparationWizard";
import {LocalAIAvailability} from "./LocalAIAvailability";
const TeacherAIWorkspace=lazy(()=>import("./TeacherAIWorkspace").then(m=>({default:m.TeacherAIWorkspace})));
import type {MaterialItem} from "@/lib/material-bank";
import {validateUnifiedQuestion,type UnifiedQuestion} from "@/lib/unified-question-bank";
export function TeacherWorkroom({teacherId,materials,demo=false}:{teacherId?:string;materials?:MaterialItem[];demo?:boolean}){
 const [tab,setTab]=useState<"bank"|"worksheet"|"preparation">("bank");
 const [aiReady,setAIReady]=useState(false),[aiOpen,setAIOpen]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch('/api/ai/status',{signal:controller.signal,cache:'no-store'}).then(r=>r.json()).then(d=>setAIReady(d.ready===true)).catch(()=>{});return()=>controller.abort();},[]);
 const [bankView,setBankView]=useState({key:0,matrix:false});
 const [bank,setBank]=useState<UnifiedQuestion[]>([]),[loaded,setLoaded]=useState(false),[sourceNotice,setSourceNotice]=useState(""),[loadError,setLoadError]=useState("");
 useEffect(()=>{let alive=true;fetch("/api/question-bank").then(async response=>{
  const data=await response.json();if(!response.ok)throw new Error(data.error||"Không tải được ngân hàng đề. Vui lòng thử lại.");
  let edits:Record<string,UnifiedQuestion>={};try{edits=JSON.parse(localStorage.getItem("unified-question-bank-edits-v1")||"{}");}catch{}
  const questions=data.questions.map((q:UnifiedQuestion)=>{const edit=edits[q.id];if(edit&&JSON.stringify(edit.source)===JSON.stringify(q.source)){try{return validateUnifiedQuestion(edit);}catch{}}return q;});
  if(alive){setBank(questions);setLoaded(true);setSourceNotice(data.note||"");}
 }).catch(error=>{if(alive)setLoadError(error instanceof Error?error.message:"Không tải được ngân hàng đề. Vui lòng thử lại.");});return()=>{alive=false;};},[]);
 function updateQuestion(question:UnifiedQuestion){
  validateUnifiedQuestion(question);setBank(previous=>previous.map(q=>q.id===question.id?question:q));
  try{const stored=JSON.parse(localStorage.getItem("unified-question-bank-edits-v1")||"{}");localStorage.setItem("unified-question-bank-edits-v1",JSON.stringify({...stored,[question.id]:question}));}
  catch{setSourceNotice("Đã sửa trong phiên hiện tại. Tải bản biên soạn để giữ nội dung khi bộ nhớ trình duyệt không lưu được.");}
 }
 return <LocalAIAvailability.Provider value={aiReady}><div><div className="teacher-workroom-nav" role="group" aria-label="Công việc của giáo viên">{([["bank","Ngân hàng đề"],["worksheet","Phiếu học tập ba pha"],["preparation","Chuẩn bị giờ học"]] as const).map(([key,label])=><button className={`btn ${tab===key?"primary":""}`} aria-pressed={tab===key} key={key} onClick={()=>setTab(key)}>{label}</button>)}</div><div hidden={tab!=="bank"}><BookQuestionBank key={bankView.key} initialTab={bankView.matrix?"matrix":"choice"} bank={bank} loaded={loaded} loadError={loadError} sourceNotice={sourceNotice} onChange={updateQuestion}/></div><div hidden={tab!=="worksheet"}><TeacherWorksheetStudio bank={bank} loaded={loaded} loadError={loadError} teacherId={teacherId} materials={materials} onCreateExam={()=>{setBankView(v=>({key:v.key+1,matrix:true}));setTab("bank");}}/></div><div hidden={tab!=="preparation"}><TeacherPreparationWizard teacherId={teacherId} materials={materials}/></div>{aiReady&&<details className="teacher-file-tools" onToggle={e=>setAIOpen(e.currentTarget.open)}><summary>Đọc tài liệu với AI cục bộ</summary>{aiOpen&&<Suspense fallback={<p>Đang mở công cụ…</p>}><TeacherAIWorkspace demo={demo}/></Suspense>}</details>}</div></LocalAIAvailability.Provider>;
}
