import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import JSZip from "jszip";
// @ts-expect-error Node runner uses TypeScript source extension
import {createWorksheetSample,parseWorksheetDraft,worksheetReadiness,worksheetActivity,worksheetResources} from "../src/lib/guided-worksheet.ts";
// @ts-expect-error Node runner uses TypeScript source extension
import {createGuidedPreparation,resizeClassTime,parsePreparationDraft,preparationReadiness,supportingActivity} from "../src/lib/guided-preparation.ts";
// @ts-expect-error Node runner uses TypeScript source extension
import {unifiedWorksheetDocx} from "../src/lib/unified-exam-docx.ts";
// @ts-expect-error Node runner uses TypeScript source extension
import {teachingPlanDocx} from "../src/lib/teaching-plan-docx.ts";
// @ts-expect-error Node runner uses TypeScript source extension
import {resolveWorksheetQuestions,WORKSHEET_PHASES} from "../src/lib/unified-worksheet.ts";
import type {UnifiedQuestion} from "../src/lib/unified-question-bank.ts";
const bank=JSON.parse(fs.readFileSync(new URL('../src/data/unified-question-bank.json',import.meta.url),'utf8')) as UnifiedQuestion[];
async function xml(blob:Blob){const zip=await JSZip.loadAsync(await blob.arrayBuffer());return {body:await zip.file('word/document.xml')!.async('string'),rels:await zip.file('word/_rels/document.xml.rels')!.async('string')};}
test('all five worksheet samples pair checked source questions, lesson-specific instructions and phase products',()=>{
 for(const lesson of ['B21','B22','B23','B24','B25']){const draft=createWorksheetSample(lesson,bank);assert.deepEqual(worksheetReadiness(draft,bank),[]);const resolved=resolveWorksheetQuestions(bank,draft.selection,lesson);assert.equal(resolved.length,3);assert.deepEqual(resolved.map(q=>q.phase),WORKSHEET_PHASES);for(const item of resolved){assert.equal(item.question.status,'ready');assert.equal(item.question.source.bookId,'sgk-kntt');}assert.ok(Object.values(draft.tasks).every(t=>t.includes('1.')&&t.includes('2.')&&t.includes('3.')));assert.deepEqual(parseWorksheetDraft(JSON.parse(JSON.stringify(draft))),draft);}
 assert.equal(worksheetResources('B22').in_class[0].id,'system-sim-binding-energy');
 assert.equal(worksheetResources('B23').in_class[0].id,'system-sim-half-life');
 const draft=createWorksheetSample('B23',bank);draft.phases.after_class.product='';assert.ok(worksheetReadiness(draft,bank).length);
});
test('worksheet migration and phase changes keep question numbering in reading order',()=>{
 const draft=createWorksheetSample('B23',bank);const reordered={...draft,selection:[draft.selection[2],draft.selection[0],draft.selection[1]]};assert.deepEqual(parseWorksheetDraft(reordered)?.selection,draft.selection);
 const old={...draft,phases:undefined};assert.ok(parseWorksheetDraft(old)?.phases.before_class.product);
 assert.equal(parseWorksheetDraft({...draft,phases:{...draft.phases,in_class:{...draft.phases.in_class,minutes:NaN}}}),null);
});
test('Word worksheet has exactly three main sections, all questions, phase products and an analytic rubric without answer leakage',async()=>{
 const draft=createWorksheetSample('B23',bank),items=resolveWorksheetQuestions(bank,draft.selection,'B23'),options={title:draft.title,phaseTasks:draft.tasks,phaseDetails:draft.phases,phaseResources:worksheetResources('B23'),origin:'https://example.edu'};
 const student=await xml(await unifiedWorksheetDocx('B23',worksheetActivity(draft),items,new Map(),false,options));
 const teacher=await xml(await unifiedWorksheetDocx('B23',worksheetActivity(draft),items,new Map(),true,options));
 const headings=['1 Hướng dẫn sử dụng phiếu học tập','2 Phiếu học tập cho học sinh','3 Rubrics đánh giá'];
 let prior=-1;for(const h of headings){const i=student.body.indexOf(h);assert.ok(i>prior);assert.equal(student.body.split(h).length-1,1);prior=i;}
 for(const {question:q} of items)assert.ok(student.body.includes(q.prompt.split('$')[0]));
 assert.ok(student.body.includes('Tự kiểm tra và điều chỉnh'));assert.ok(student.body.includes('Chưa có sản phẩm'));assert.ok(student.body.includes('<w:tblHeader'));assert.ok(student.body.includes('<m:oMath'));assert.ok(student.rels.includes('https://example.edu/hoc-lieu?resource='));
 assert.ok(!student.body.includes('Đáp án và hướng dẫn'));assert.equal(teacher.body.split('Đáp án và hướng dẫn').length-1,3);
 for(const phase of WORKSHEET_PHASES)assert.ok(student.body.includes(draft.phases[phase].product));
});
test('lesson-plan samples preserve curriculum targets, four activity types, four organization steps and classroom time',async()=>{
 for(const lesson of ['B21','B22','B23','B24','B25']){const d=createGuidedPreparation(lesson);assert.deepEqual(preparationReadiness(d),[]);assert.ok(parsePreparationDraft(d));assert.equal(d.plan.activities.filter(a=>a.phase==='in_class').reduce((n,a)=>n+a.minutes,0),45);assert.equal(new Set(d.plan.activities.map(a=>a.activityType)).size,4);const resized={...d,budget:90,plan:resizeClassTime(d.plan,90)};assert.deepEqual(preparationReadiness(resized),[]);assert.equal(resized.plan.activities.filter(a=>a.phase==='before_class')[0].minutes,d.plan.activities[0].minutes);const a=d.plan.activities.find(a=>a.activityType==='knowledge')!,support=supportingActivity(a,{...a,id:'other',phase:'after_class',minutes:10});assert.equal(support.id,a.id);assert.equal(support.phase,a.phase);assert.equal(support.minutes,a.minutes);assert.equal(support.activityType,'knowledge');}
 const d=createGuidedPreparation('B23'),out=await xml(await teachingPlanDocx(d,'https://example.edu'));
 for(const s of ['I. Mục tiêu','II. Thiết bị dạy học và học liệu','III. Tiến trình dạy học','Giao nhiệm vụ','Thực hiện nhiệm vụ','Báo cáo và thảo luận','Kết luận và nhận định'])assert.ok(out.body.includes(s));
 const invalid={...d,budget:90};await assert.rejects(()=>teachingPlanDocx(invalid,'https://example.edu'),/phút/);
 assert.equal(parsePreparationDraft({...d,plan:{...d.plan,curriculumTargets:['not-in-curriculum']}}),null);
});
test('one lesson matrix can combine all four source question kinds without duplicate questions',async()=>{
 const {assembleMatrixExam,canonicalLevel}=await import('@/lib/unified-question-bank');
 const kinds=['choice','true_false','numeric','written'] as const;
 const matrix={title:'Đề phối hợp bốn loại câu B23',minutes:45,rows:kinds.map(kind=>{const q=bank.find(q=>q.topic==='B23'&&q.kind===kind&&q.status==='ready')!;return {topic:'B23',kind,level:canonicalLevel(q.level)!,count:1,points:2.5};})};
 const selected=assembleMatrixExam(bank,matrix,'FOUR-KINDS');assert.equal(selected.length,4);assert.equal(new Set(selected.map(q=>q.id)).size,4);assert.deepEqual(selected.map(q=>q.kind),kinds);assert.ok(selected.every(q=>q.topic==='B23'&&q.source.bookId));assert.equal(selected.find(q=>q.kind==='true_false')!.statements!.length,4);assert.equal(selected.reduce((n,q)=>n+q.points,0),10);
});
