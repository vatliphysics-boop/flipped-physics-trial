import fs from 'node:fs/promises';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const workbook=Workbook.create(),sheet=workbook.worksheets.add('Ma tran');sheet.showGridLines=false;
sheet.getRange('A1:E2').values=[['Bài/chủ đề','Loại câu','Mức độ','Số câu','Điểm mỗi câu'],['CTST B1','Trả lời ngắn','Nhận biết',1,10]];
sheet.getRange('A1:E2').format.columnWidth=22;sheet.getRange('A1:E2').format.rowHeight=28;
workbook.recalculate();await (await SpreadsheetFile.exportXlsx(workbook)).save('/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/tmp/book-extraction/fixtures/ma-tran.xlsx');
await fs.writeFile('/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/tmp/book-extraction/fixtures/ma-tran-xlsx.png',new Uint8Array(await (await workbook.render({sheetName:'Ma tran',range:'A1:E3',scale:1})).arrayBuffer()));
