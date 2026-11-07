import fs from 'node:fs/promises';
import {unifiedExamDocx,reorderExam} from './unified-exam-docx.ts';
const root='/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09';
const bank=JSON.parse(await fs.readFile(`${root}/data/book-bank/unified.json`,'utf8'));
const questions=[bank.find(q=>q.id==='ctst-nuclear-023'),bank.find(q=>q.source.parts?.length>1)];
const matrix={title:'Kiểm tra câu đúng sai Vật lí hạt nhân',minutes:15,rows:[{topic:'B22',kind:'true_false',level:'',count:2,points:1}]};
await fs.mkdir(`${root}/tmp/book-extraction/tf-four-word`,{recursive:true});
for(const teacher of [false,true]){
 const blob=await unifiedExamDocx(matrix,[reorderExam(questions,0)],new Map(),teacher);
 await fs.writeFile(`${root}/tmp/book-extraction/tf-four-word/${teacher?'dap-an':'de'}.docx`,Buffer.from(await blob.arrayBuffer()));
}
console.log('Exported two four-statement questions with corresponding answer keys.');
