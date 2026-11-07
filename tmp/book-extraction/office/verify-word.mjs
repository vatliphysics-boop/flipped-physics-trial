import fs from 'node:fs/promises';
import {assembleMatrixExam} from './unified-question-bank.ts';
import {MATRIX_TEMPLATE,matrixFromRows,csvRows} from './exam-matrix-import.ts';
import {matrixSpecificationDocx,unifiedExamDocx,reorderExam} from './unified-exam-docx.ts';
const root='/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09';
const bank=JSON.parse(await fs.readFile(`${root}/data/book-bank/unified.json`,'utf8'));
const m=matrixFromRows(csvRows(MATRIX_TEMPLATE),'Đề kiểm tra Chương 4 Vật lí hạt nhân');
const qs=assembleMatrixExam(bank,m,'DE-01');
const images=new Map();
const {default:sharp}=await import('sharp');
for(const q of qs){if(!q.figure||images.has(q.figure.url))continue;const data=await fs.readFile(`${root}/public${q.figure.url}`);const meta=await sharp(data).metadata();images.set(q.figure.url,{data:new Uint8Array(data),width:meta.width,height:meta.height});}
const out=`${root}/tmp/book-extraction/word-qa`;await fs.mkdir(out,{recursive:true});
for(const [name,blob] of [['ma-tran.docx',await matrixSpecificationDocx(m,qs)],['de.docx',await unifiedExamDocx(m,[reorderExam(qs,0)],images)],['dap-an.docx',await unifiedExamDocx(m,[reorderExam(qs,0)],images,true)]])await fs.writeFile(`${out}/${name}`,Buffer.from(await blob.arrayBuffer()));
const question=bank.find(q=>q.id==='ctst-q0012');
const cm={title:'Bài tập nhiệt nóng chảy riêng',minutes:15,rows:[{topic:question.topic,kind:'numeric',level:question.level,count:1,points:10}]};
await fs.writeFile(`${out}/equation.docx`,Buffer.from(await (await unifiedExamDocx(cm,[{code:'101',questions:[{...question,points:10}]}],new Map())).arrayBuffer()));
console.log('Created four Word QA files');
