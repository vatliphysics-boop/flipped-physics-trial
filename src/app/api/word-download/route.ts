import {createHash,randomBytes} from 'node:crypto';
import {canReadBookBank} from '@/lib/book-bank-server';
export const runtime='nodejs';
type Download={data:Uint8Array;name:string;owner:string;expires:number};
const state=globalThis as typeof globalThis&{physicsWordDownloads?:Map<string,Download>};
const files=state.physicsWordDownloads??=new Map<string,Download>();
const scope=(request:Request)=>createHash('sha256').update(request.headers.get('cookie')||'local-preview').digest('hex');
function clean(){for(const [token,file] of files)if(file.expires<Date.now())files.delete(token);}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Tạo tệp từ trang học liệu.'},{status:403});
 if(!await canReadBookBank(request))return Response.json({error:'Cần đăng nhập giáo viên để tải tài liệu.'},{status:401});
 try{
  const name=decodeURIComponent(request.headers.get('x-download-name')||'TAI_LIEU.docx');
  if(!/^[\p{L}\p{N} _.-]{1,140}\.docx$/u.test(name))throw new Error('Tên tệp Word chưa hợp lệ.');
  const reader=request.body?.getReader();if(!reader)throw new Error('Chưa có nội dung Word.');
  const chunks:Uint8Array[]=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8000000){await reader.cancel();throw new Error('Tệp Word tối đa 8 MB.');}chunks.push(value);}
  const data=new Uint8Array(Buffer.concat(chunks));if(data.length<4||data[0]!==80||data[1]!==75||data[2]!==3||data[3]!==4)throw new Error('Nội dung chưa đúng tệp DOCX.');
  clean();if(files.size>=20||[...files.values()].reduce((n,f)=>n+f.data.length,0)+size>32000000)throw new Error('Máy chủ đang giữ nhiều tệp tải. Thử lại sau ít phút.');
  const token=randomBytes(24).toString('hex');files.set(token,{data,name,owner:scope(request),expires:Date.now()+15*60000});
  return Response.json({url:'/api/word-download?token='+token},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Chưa tạo được tệp tải.'},{status:400});}
}
export async function GET(request:Request){
 if(!await canReadBookBank(request))return new Response('Cần đăng nhập giáo viên.',{status:401});
 clean();const token=new URL(request.url).searchParams.get('token')||'',file=files.get(token);
 if(!file||file.owner!==scope(request))return new Response('Đường dẫn tải đã hết hạn. Nhấn xuất Word để tạo lại.',{status:404});
 return new Response(new Uint8Array(file.data),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','Content-Disposition':`attachment; filename="TAI_LIEU.docx"; filename*=UTF-8''${encodeURIComponent(file.name)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
