import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
// @ts-expect-error Node native TypeScript requires source extension
import {resolveWorksheetQuestions,WORKSHEET_PHASES} from "../src/lib/unified-worksheet.ts";
import type {UnifiedQuestion} from "../src/lib/unified-question-bank.ts";
const bank=JSON.parse(fs.readFileSync(new URL("../src/data/unified-question-bank.json",import.meta.url),"utf8")) as UnifiedQuestion[];
test("worksheet uses current unified records and refuses drafts, duplicate IDs and missing phases",()=>{
 const questions=bank.filter(q=>q.topic==="B23"&&q.figure?.origin==='source_crop').slice(0,3);
 assert.equal(questions.length,3);
 const selected=questions.map((q,i)=>({id:q.id,phase:WORKSHEET_PHASES[i]}));
 const edited={...questions[0],prompt:"Sau $2T$, giải thích sự khác nhau giữa phần còn lại và phần đã phân rã."};
 const current=bank.map(q=>q.id===edited.id?edited:q);
 const resolved=resolveWorksheetQuestions(current,selected,"B23");
 assert.equal(resolved[0].question,edited);assert.equal(resolved[0].question.figure?.url,questions[0].figure?.url);
 assert.throws(()=>resolveWorksheetQuestions(current,[selected[0],selected[0],selected[2]],"B23"),/khác nhau/);
 assert.throws(()=>resolveWorksheetQuestions(current,selected.map(s=>({...s,phase:"in_class"})),"B23"),/Mỗi pha/);
 assert.throws(()=>resolveWorksheetQuestions(current.map(q=>q.id===edited.id?{...q,status:"draft"}:q),selected,"B23"),/chưa được kiểm tra/);
 assert.throws(()=>resolveWorksheetQuestions(current,selected,"B21"),/không còn phù hợp/);
});
