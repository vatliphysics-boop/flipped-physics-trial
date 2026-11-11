import {Document,Packer,Paragraph,TextRun,AlignmentType,Table,TableRow,TableCell,WidthType,BorderStyle,Footer,PageNumber} from "docx";

// Nội dung tiêu chí trích từ Phụ lục V Công văn 5512/BGDĐT-GDTrH ngày 18/12/2020.
// Trường học, giáo viên, ngày đánh giá để trống khi chưa cung cấp; không tự điền.
const SECTIONS: {title:string; rows:[string,string][]}[] = [
  {title:"1. Kế hoạch bài dạy", rows:[
    ["Mức độ phù hợp của các hoạt động học với mục tiêu, nội dung và phương pháp dạy học được sử dụng.","1,00"],
    ["Mức độ rõ ràng, chính xác của mục tiêu, nội dung, sản phẩm, cách thức tổ chức thực hiện mỗi hoạt động học của học sinh.","2,00"],
    ["Mức độ phù hợp của thiết bị dạy học và học liệu được sử dụng để tổ chức các hoạt động học của học sinh.","1,00"],
    ["Mức độ phù hợp của phương án kiểm tra, đánh giá trong quá trình tổ chức hoạt động học của học sinh.","2,00"],
  ]},
  {title:"2. Hoạt động của giáo viên", rows:[
    ["Mức độ chính xác, phù hợp, sinh động, hấp dẫn của nội dung, phương pháp và hình thức giao nhiệm vụ học tập cho học sinh.","2,00"],
    ["Khả năng theo dõi, quan sát, phát hiện kịp thời những khó khăn của học sinh.","1,00"],
    ["Mức độ phù hợp, hiệu quả của các biện pháp hỗ trợ và khuyến khích học sinh hợp tác, giúp đỡ nhau khi thực hiện nhiệm vụ học tập.","2,00"],
    ["Mức độ chính xác, hiệu quả trong việc tổng hợp, phân tích, đánh giá quá trình và kết quả học tập của học sinh (làm rõ những nội dung/yêu cầu về kiến thức, kĩ năng học sinh cần ghi nhận, thực hiện).","2,00"],
  ]},
  {title:"3. Hoạt động của học sinh", rows:[
    ["Khả năng tiếp nhận và sẵn sàng thực hiện nhiệm vụ học tập của học sinh trong lớp.","2,00"],
    ["Mức độ tích cực, chủ động, sáng tạo, hợp tác của học sinh trong việc thực hiện các nhiệm vụ học tập.","2,00"],
    ["Mức độ tham gia tích cực của học sinh trong trình bày, thảo luận về kết quả thực hiện nhiệm vụ học tập.","2,00"],
    ["Mức độ đúng đắn, chính xác, phù hợp của các kết quả thực hiện nhiệm vụ học tập của học sinh.","1,00"],
  ]},
];

export type ObservationMeta={lessonTitle?:string;subject?:string;className?:string;periods?:string;date?:string;teacherName?:string};
const DOTS="……………";
const headerCell=(text:string)=>{const border={style:BorderStyle.SINGLE,size:4,color:"B8BEC5"};return new TableCell({borders:{top:border,bottom:border,left:border,right:border},margins:{top:80,bottom:80,left:90,right:90},children:[new Paragraph({children:[new TextRun({text,bold:true,size:22})]})]});};
const bodyCell=(text:string,isScore=false)=>{const border={style:BorderStyle.SINGLE,size:4,color:"B8BEC5"};return new TableCell({borders:{top:border,bottom:border,left:border,right:border},margins:{top:80,bottom:80,left:90,right:90},children:[new Paragraph({alignment:isScore?AlignmentType.CENTER:AlignmentType.LEFT,children:[new TextRun({text,size:22})]})]});};

export async function lessonObservationDocx(meta:ObservationMeta={}):Promise<Blob>{
  const identity=(v?:string)=>v?.trim()||DOTS;
  const p=(text:string,bold=false,size?:number)=>new Paragraph({children:[new TextRun({text,bold,size})],spacing:{after:90,line:276}});
  const children:(Paragraph|Table)[]=[
    new Paragraph({style:"Title",alignment:AlignmentType.CENTER,children:[new TextRun({text:"PHIẾU ĐÁNH GIÁ BÀI DẠY",bold:true,size:28})]}),
    new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"(Phụ lục V Công văn 5512/BGDĐT-GDTrH ngày 18/12/2020)",italics:true,size:20})],spacing:{after:160}}),
    p("Tên bài dạy: "+identity(meta.lessonTitle)),
    p("Môn học/Hoạt động giáo dục: "+(meta.subject?.trim()||"Vật lí")+"; lớp: "+identity(meta.className)+"; Tiết: "+identity(meta.periods)+"; ngày "+identity(meta.date)),
    p("Họ và tên giáo viên thực hiện: "+identity(meta.teacherName)),
    p(""),
  ];
  const tableRows:TableRow[]=[new TableRow({cantSplit:true,tableHeader:true,children:[headerCell("Nội dung"),headerCell("Tiêu chí"),headerCell("Điểm tối đa"),headerCell("Điểm đánh giá")]})];
  for(const section of SECTIONS){
    tableRows.push(new TableRow({cantSplit:true,children:[bodyCell(section.title,true),bodyCell(""),bodyCell(""),bodyCell("")]}));
    for(const [criterion,max] of section.rows){
      tableRows.push(new TableRow({cantSplit:true,children:[bodyCell(""),bodyCell(criterion),bodyCell(max,true),bodyCell("")]}));
    }
  }
  tableRows.push(new TableRow({cantSplit:true,children:[bodyCell("Tổng điểm",true),bodyCell(""),bodyCell("20,00",true),bodyCell("")]}));
  children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:[1800,5533,1200,1400],rows:tableRows}));
  children.push(
    p(""),
    p("Người đánh giá",true),
    p("(Ký và ghi rõ họ tên)"),
    p(""),
    p("Hướng dẫn đánh giá và cho điểm",true),
    p("Các tiêu chí được nhận xét, đánh giá theo 3 mức: Đạt mức 1 cho khoảng 50–65% điểm tối đa; Đạt mức 2 cho khoảng 65–80% điểm tối đa; Đạt mức 3 cho khoảng 80–100% điểm tối đa. Cho điểm đánh giá thành phần là bội số của 0,25."),
    p("Xếp loại bài dạy: GIỎI: tổng điểm đạt từ 18 đến 20; KHÁ: từ 13,5 đến dưới 18; TRUNG BÌNH: từ 10 đến dưới 13,5; KHÔNG ĐẠT: dưới 10."),
    p("Ghi chú: phiếu này dùng để đánh giá quá trình thực hiện bài dạy; không thay thế đánh giá thường xuyên, định kì của học sinh.",true),
  );
  return Packer.toBlob(new Document({styles:{default:{document:{run:{font:"Times New Roman",size:24,color:"000000"}}},paragraphStyles:[{id:"Title",name:"Title",basedOn:"Normal",run:{font:"Times New Roman",size:28,bold:true,color:"000000"}}]},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1417,right:1134}}},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({children:["Trang ",PageNumber.CURRENT],size:20})]})]})},children}]}));
}
