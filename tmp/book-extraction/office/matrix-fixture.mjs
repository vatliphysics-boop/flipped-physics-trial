import fs from 'node:fs/promises';
import {Document,Packer,Paragraph,Table,TableRow,TableCell} from 'docx';
const table=[['Bài/chủ đề','Loại câu','Mức độ','Số câu','Điểm mỗi câu'],['CTST B1','Trả lời ngắn','Nhận biết','1','10']];
const document=new Document({sections:[{children:[new Table({rows:table.map(row=>new TableRow({children:row.map(text=>new TableCell({children:[new Paragraph(text)]}))}))})]}]});
await fs.writeFile('/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/tmp/book-extraction/fixtures/ma-tran.docx',await Packer.toBuffer(document));
