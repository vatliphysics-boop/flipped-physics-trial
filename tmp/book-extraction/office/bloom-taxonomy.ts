export const BLOOM_LEVELS = {remember:"Nhớ",understand:"Hiểu",apply:"Vận dụng",analyze:"Phân tích",evaluate:"Đánh giá",create:"Sáng tạo"} as const;
export type BloomLevel = keyof typeof BLOOM_LEVELS;
export type BloomTag = {level:BloomLevel;rationale:string;review:"reviewed"|"proposed"};
export const BLOOM_REFERENCE = "https://doi.org/10.1207/s15430421tip4104_2";
export function validateBloomTag(tag:BloomTag){
 if(!Object.hasOwn(BLOOM_LEVELS,tag.level)||!tag.rationale.trim()||tag.rationale.length>2000||!["reviewed","proposed"].includes(tag.review))throw new Error("Nhãn Bloom cần mức nhận thức, căn cứ và tình trạng kiểm tra.");
 return tag;
}
