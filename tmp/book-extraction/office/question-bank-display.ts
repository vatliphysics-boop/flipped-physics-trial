import type {UnifiedQuestion,QuestionKind} from "./unified-question-bank";

/** Stable within each bank category; searching/pagination never renumbers a question. */
export function numberQuestionBank(bank:UnifiedQuestion[]){
 const counts:Record<QuestionKind,number>={choice:0,true_false:0,numeric:0,written:0};
 return bank.map(question=>({...question,displayNumber:++counts[question.kind]}));
}

/** Fit the source crop without stretching, cropping or discarding tall figures. */
export function fitQuestionFigure(width:number,height:number){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error("Kích thước hình minh họa không hợp lệ.");
 const scale=Math.min(430/width,450/height,1);
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
