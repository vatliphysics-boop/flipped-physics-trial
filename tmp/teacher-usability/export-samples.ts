import fs from 'node:fs/promises';
import path from 'node:path';
import {createWorksheetSample,worksheetActivity,worksheetResources} from '../../src/lib/guided-worksheet.ts';
import {resolveWorksheetQuestions} from '../../src/lib/unified-worksheet.ts';
import {unifiedWorksheetDocx} from '../../src/lib/unified-exam-docx.ts';
import {createGuidedPreparation} from '../../src/lib/guided-preparation.ts';
import {teachingPlanDocx} from '../../src/lib/teaching-plan-docx.ts';
const bank=JSON.parse(await fs.readFile('src/data/unified-question-bank.json','utf8'));
const folder='docs/worksheets';await fs.mkdir(folder,{recursive:true});
for(const lesson of ['B23','B21']){
 const d=createWorksheetSample(lesson,bank),items=resolveWorksheetQuestions(bank,d.selection,lesson),images=new Map();
 for(const {question:q} of items){if(!q.figure)continue;const file=await fs.readFile(q.figure.url.startsWith('/api/book-bank/asset')?path.join('data/book-bank',new URL(q.figure.url,'http://localhost:3001').searchParams.get('file')):path.join('public',q.figure.url));const width=file.readUInt32BE(16),height=file.readUInt32BE(20);images.set(q.figure.url,{data:new Uint8Array(file),width,height});}
 const options={title:d.title,phaseTasks:d.tasks,phaseDetails:d.phases,phaseResources:worksheetResources(lesson),origin:'http://localhost:3001',requirements:d.objective.split('\n')};
 for(const teacher of (lesson==='B23'?[false,true]:[false])){
  const blob=await unifiedWorksheetDocx(lesson,worksheetActivity(d),items,images,teacher,options),file=folder+'/'+lesson+'-'+(teacher?'huong-dan-giao-vien':'phieu-hoc-sinh')+'.docx';
  await fs.writeFile(file,new Uint8Array(await blob.arrayBuffer()));process.stdout.write(file+'\n');
 }
}
const plan=await teachingPlanDocx(createGuidedPreparation('B23'),'http://localhost:3001');await fs.writeFile(folder+'/B23-ke-hoach-bai-day.docx',new Uint8Array(await plan.arrayBuffer()));
