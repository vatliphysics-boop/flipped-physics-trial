import type { ExamMatrixSpec, MatrixRow, QuestionKind } from "./unified-question-bank";
import { normalize, validateExamMatrix } from "./unified-question-bank";
export const MATRIX_TEMPLATE = "Bài/chủ đề,Loại câu,Mức độ,Số câu,Điểm mỗi câu,Chương,Nội dung/đơn vị kiến thức,Yêu cầu cần đạt,Năng lực\nB21,Trắc nghiệm,Biết,2,0.5,Chương 4 Vật lí hạt nhân,Cấu trúc hạt nhân,Biểu diễn được kí hiệu hạt nhân của nguyên tử bằng số nucleon và số proton,Nhận thức vật lí\nB23,Đúng sai,Hiểu,1,2,Chương 4 Vật lí hạt nhân,Sự phóng xạ và chu kì bán rã,Nêu được bản chất tự phát và ngẫu nhiên của sự phân rã phóng xạ,Nhận thức vật lí\nB23,Trả lời ngắn,Vận dụng,2,1,Chương 4 Vật lí hạt nhân,Sự phóng xạ và chu kì bán rã,Vận dụng được công thức phân rã phóng xạ,Vận dụng kiến thức kĩ năng đã học\nB23,Tự luận,Vận dụng,1,5,Chương 4 Vật lí hạt nhân,Sự phóng xạ và chu kì bán rã,Vận dụng được công thức phân rã phóng xạ,Vận dụng kiến thức kĩ năng đã học\n";
export function csvRows(text:string):string[][] {
 const rows:string[][]=[];let row:string[]=[],field="",quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted && text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field="";}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(s=>s.trim()))rows.push(row);row=[];field="";}else field+=c;}
 if(quoted)throw new Error("CSV còn thiếu dấu đóng ngoặc kép.");row.push(field);if(row.some(s=>s.trim()))rows.push(row);return rows;
}
const kindMap:Record<string,QuestionKind>={choice:"choice",numeric:"numeric",written:"written",true_false:"true_false","trac nghiem":"choice","tn":"choice","dung sai":"true_false","tra loi ngan":"numeric","tu luan":"written"};
export function matrixFromRows(table:string[][],title="Đề kiểm tra Vật lí 12",minutes=45):ExamMatrixSpec {
 const aliases=[['bai/chu de','bai','chu de','topic'],['loai cau','loai cau hoi','kind'],['muc do','level'],['so cau','count'],['diem moi cau','diem/cau','points']];
 const headerIndex=table.findIndex(r=>aliases.every(a=>r.some(c=>a.includes(normalize(c)))));
 if(headerIndex<0)throw new Error("Ma trận cần các cột Bài/chủ đề, Loại câu, Mức độ, Số câu, Điểm mỗi câu. Dùng mẫu CSV để xem cấu trúc.");
 const header=table[headerIndex].map(normalize),cols=aliases.map(a=>header.findIndex(c=>a.includes(c)));const rows:MatrixRow[]=[];
 for(const [i,r] of table.slice(headerIndex+1).entries()){
  if(!r.some(c=>c.trim()))continue;
  const values=cols.map(c=>(r[c]||"").trim()),kind=kindMap[normalize(values[1])];
  if(!kind)throw new Error(`Dòng ${headerIndex+i+2}: loại câu chưa hợp lệ.`);
  const optional=(aliases:string[])=>{const col=header.findIndex(c=>aliases.includes(c));return col<0?undefined:(r[col]||'').trim();};
  rows.push({topic:values[0],kind,level:values[2],count:Number(values[3].replace(',','.')),points:Number(values[4].replace(',','.')),chapter:optional(['chuong','chapter']),contentUnit:optional(['noi dung/don vi kien thuc','don vi kien thuc','contentunit']),requirement:optional(['yeu cau can dat','requirement']),competency:optional(['nang luc','competency'])});
 }
 const matrix={title,minutes,rows};validateExamMatrix(matrix);return matrix;
}
function checkOfficeZip(bytes:Uint8Array){const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(v.getUint32(i,true)===0x06054b50&&i+22+v.getUint16(i+20,true)===bytes.length){end=i;break;}
 if(end<0)throw new Error("Tệp Office không hợp lệ.");const n=v.getUint16(end+10,true),start=v.getUint32(end+16,true),size=v.getUint32(end+12,true);if(!n||n>1000||start+size>end)throw new Error("Tệp quá phức tạp.");let offset=start,total=0;
 for(let i=0;i<n;i++){if(offset+46>end||v.getUint32(offset,true)!==0x02014b50)throw new Error("Cấu trúc tệp không hợp lệ.");if(v.getUint16(offset+8,true)&1)throw new Error("Không đọc tệp mã hóa.");total+=v.getUint32(offset+24,true);const name=v.getUint16(offset+28,true),extra=v.getUint16(offset+30,true),comment=v.getUint16(offset+32,true);if(total>20000000||offset+46+name+extra+comment>end)throw new Error("Tệp giải nén vượt 20 MB.");offset+=46+name+extra+comment;}
}
export async function readMatrixFile(file:File):Promise<ExamMatrixSpec>{
 if(file.size>5000000)throw new Error("Ma trận tối đa 5 MB.");
 if(/\.json$/i.test(file.name)){const matrix=JSON.parse(await file.text()) as ExamMatrixSpec;validateExamMatrix(matrix);return matrix;}
 if(/\.csv$/i.test(file.name))return matrixFromRows(csvRows((await file.text()).replace(/^\uFEFF/,'')));
 if(!/\.(docx|xlsx)$/i.test(file.name))throw new Error("Chọn ma trận CSV, JSON, DOCX hoặc XLSX.");
 const bytes=new Uint8Array(await file.arrayBuffer());checkOfficeZip(bytes);const {default:JSZip}=await import("jszip"),zip=await JSZip.loadAsync(bytes);
 const xml=async(name:string)=>{const file=zip.file(name);if(!file)throw new Error(`Tệp thiếu phần ${name}.`);const text=await file.async("string");if(/<!DOCTYPE|<!ENTITY/i.test(text))throw new Error("Không đọc XML có khai báo thực thể.");const doc=new DOMParser().parseFromString(text,"application/xml");if(doc.querySelector("parsererror"))throw new Error("XML ma trận bị lỗi.");return doc;};
 const children=(node:Element|Document,name:string)=>Array.from(node.getElementsByTagNameNS("*",name));
 if(/\.docx$/i.test(file.name)){const doc=await xml("word/document.xml");for(const table of children(doc,"tbl")){const rows=children(table,"tr").map(tr=>Array.from(tr.children).filter(c=>c.localName==="tc").map(tc=>children(tc,"t").map(t=>t.textContent||"").join("")));try{return matrixFromRows(rows);}catch{ /* Try the next table; none is silently treated as a valid matrix. */ }}throw new Error("Chưa tìm được bảng ma trận đủ năm cột trong Word. Dùng cấu trúc mẫu CSV.");}
 const shared=zip.file("xl/sharedStrings.xml") ? children(await xml("xl/sharedStrings.xml"),"si").map(si=>children(si,"t").map(t=>t.textContent||"").join("")) : [];
 const wb=await xml("xl/workbook.xml"),rels=await xml("xl/_rels/workbook.xml.rels");
 for(const sheet of children(wb,"sheet")){
  const rid=sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id"),rel=children(rels,"Relationship").find(r=>r.getAttribute("Id")===rid);const target=rel?.getAttribute("Target")||"";
  if(rel?.getAttribute("TargetMode")==="External"||target.includes(".."))continue;const name=target.startsWith("/")?target.slice(1):`xl/${target}`;if(!zip.file(name))continue;
  const data=await xml(name);const rows=children(data,"row").map(row=>{const values:string[]=[];for(const c of children(row,"c")){const ref=c.getAttribute("r")||"",letters=ref.match(/^[A-Z]+/)?.[0]||"A";let col=0;for(const ch of letters)col=col*26+ch.charCodeAt(0)-64;if(col>100)throw new Error("Ma trận quá nhiều cột.");const value=children(c,"v")[0]?.textContent||"";values[col-1]=c.getAttribute("t")==="s"?(shared[Number(value)]||""):c.getAttribute("t")==="inlineStr"?children(c,"t").map(t=>t.textContent||"").join(""):value;}return values;});
  try{return matrixFromRows(rows);}catch{ /* Continue only to inspect another actual sheet. */ }
 }
 throw new Error("Chưa tìm được bảng ma trận đủ năm cột trong Excel. Dùng cấu trúc mẫu CSV.");
}
