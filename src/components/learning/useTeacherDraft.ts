"use client";
import {useCallback,useMemo,useState,useSyncExternalStore} from "react";
const empty=()=>"";
export function useTeacherDraft<T>(key:string,initial:T,parse:(value:unknown)=>T|null){
 const subscribe=useCallback((listener:()=>void)=>{window.addEventListener('storage',listener);window.addEventListener('teacher-draft-changed',listener);return()=>{window.removeEventListener('storage',listener);window.removeEventListener('teacher-draft-changed',listener);};},[]);
 const snapshot=useSyncExternalStore(subscribe,useCallback(()=>{try{return localStorage.getItem(key)||"";}catch{return "";}},[key]),empty);
 const saved=useMemo(()=>{try{return parse(JSON.parse(snapshot||"null"));}catch{return null;}},[snapshot,parse]);
 const [working,setWorking]=useState<T|null>(null),[storageError,setStorageError]=useState("");
 function update(value:T){setWorking(value);try{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event('teacher-draft-changed'));setStorageError("");}catch{setStorageError("Trình duyệt chưa lưu được. Xuất tệp trước khi đóng trang để giữ nội dung.");}}
 return {value:working??saved??initial,update,saved:!!saved,storageError};
}
