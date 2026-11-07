// Source: the user's Physics curriculum PDF, printed pages 27–28, issued with TT 32/2018.
export const NUCLEAR_LESSONS = {B21:"Cấu trúc hạt nhân",B22:"Phản ứng hạt nhân và năng lượng liên kết",B23:"Phóng xạ",B24:"Công nghiệp hạt nhân",B25:"Bài tập về vật lí hạt nhân"} as const;
export const NUCLEAR_REQUIREMENTS = [
 {id:"structure-scattering",lessons:["B21"],text:"Rút ra sự tồn tại và đánh giá kích thước hạt nhân từ kết quả thí nghiệm tán xạ hạt alpha.",page:27},
 {id:"structure-symbol",lessons:["B21"],text:"Biểu diễn kí hiệu hạt nhân bằng số nucleon và số proton.",page:27},
 {id:"structure-model",lessons:["B21"],text:"Mô tả mô hình đơn giản của nguyên tử gồm proton, neutron và electron.",page:27},
 {id:"reaction-equation",lessons:["B22"],text:"Viết đúng phương trình phân rã hạt nhân đơn giản.",page:27},
 {id:"binding-energy",lessons:["B22"],text:"Thảo luận hệ thức E = mc² và liên hệ giữa khối lượng và năng lượng.",page:27},
 {id:"binding-stability",lessons:["B22"],text:"Nêu liên hệ giữa năng lượng liên kết riêng và độ bền vững của hạt nhân.",page:27},
 {id:"reaction-fission-fusion",lessons:["B22"],text:"Nêu sự phân hạch và sự tổng hợp hạt nhân.",page:28},
 {id:"industry-role",lessons:["B24"],text:"Thảo luận để đánh giá vai trò của một số ngành công nghiệp hạt nhân trong đời sống.",page:28},
 {id:"decay-random",lessons:["B23"],text:"Nêu bản chất tự phát và ngẫu nhiên của phân rã phóng xạ.",page:28},
 {id:"decay-activity",lessons:["B23"],text:"Định nghĩa độ phóng xạ, hằng số phóng xạ và vận dụng liên hệ H = λN.",page:28},
 {id:"decay-law",lessons:["B23"],text:"Vận dụng công thức x = x₀e⁻λᵗ với độ phóng xạ, số hạt chưa phân rã hoặc tốc độ số hạt đếm được.",page:28},
 {id:"decay-half-life",lessons:["B23"],text:"Định nghĩa chu kì bán rã.",page:28},
 {id:"radiation-types",lessons:["B23"],text:"Mô tả sơ lược tính chất phóng xạ alpha, beta và gamma.",page:28},
 {id:"radiation-signs",lessons:["B23"],text:"Nhận biết dấu hiệu vị trí có phóng xạ thông qua biển báo.",page:28},
 {id:"radiation-safety",lessons:["B23"],text:"Nêu và tuân thủ các nguyên tắc an toàn phóng xạ.",page:28},
];
export function requirementsForLesson(lesson:string){return NUCLEAR_REQUIREMENTS.filter(r=>lesson==="B25"||r.lessons.includes(lesson));}
export function requirementTexts(ids:string[]){return ids.flatMap(id=>NUCLEAR_REQUIREMENTS.filter(r=>r.id===id).map(r=>r.text));}
