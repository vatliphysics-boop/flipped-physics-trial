import fs from 'node:fs/promises';
import {Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType} from 'docx';
import {officeEquation} from './office-equation.ts';
const root='/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09';
const index=JSON.parse(await fs.readFile(`${root}/data/book-bank/index.json`,'utf8'));
const trans=JSON.parse(await fs.readFile(`${root}/src/data/book-equation-transcriptions.json`,'utf8'));
const p=(s,b=false)=>new Paragraph({children:[new TextRun({text:s,bold:b})],spacing:{after:100}});
const children=[new Paragraph({heading:'Title',children:[new TextRun({text:'Công thức Vật lí 12 biên soạn bằng Equation',bold:true,color:'000000'})]}),p('20 công thức được biên soạn từ ảnh SGK Vật lí 12 Kết nối tri thức. Mỗi công thức kèm vùng ảnh và số trang để kiểm tra. Công thức Equation có thể chỉnh sửa trong Word và sao chép sang PowerPoint hoặc Excel bản máy tính. Đây là phần đã biên soạn, chưa bao gồm toàn bộ công thức của ba sách.')];
for(const [i,t] of trans.entries()){
 const e=index.equations.find(e=>e.id===t.id);if(!e)throw new Error(t.id);
 children.push(p(`Công thức ${i+1}   Trang sách ${e.page-2}   Trang PDF ${e.page}`,true));
 const width=430,height=Math.round(width*e.image.height/e.image.width);
 children.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({type:'jpg',data:new Uint8Array(await fs.readFile(`${root}/data/book-bank/${e.image.file}`)),transformation:{width,height},altText:{title:'Ảnh công thức nguồn',description:`SGK Vật lí 12 Kết nối tri thức, trang ${e.page-2}`,name:e.id}})]}));
 children.push(new Paragraph({children:[officeEquation(t.latex)],alignment:AlignmentType.CENTER,spacing:{before:100,after:240}}));
}
const doc=new Document({styles:{default:{document:{run:{font:'Times New Roman',size:24,color:'000000'}}},paragraphStyles:[{id:'Title',name:'Title',basedOn:'Normal',run:{bold:true,size:28,color:'000000'}}]},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},children}]});
await fs.writeFile(`${root}/output/book-bank/CONG_THUC_EQUATION_DOT_1.docx`,await Packer.toBuffer(doc));
console.log('Wrote 20 native Office equations');
