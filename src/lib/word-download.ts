export async function createWordDownload(blob:Blob,name:string){
 const response=await fetch('/api/word-download',{method:'POST',headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','X-Download-Name':encodeURIComponent(name)},body:blob});
 const data=await response.json();
 if(!response.ok)throw new Error(data.error||'Chưa tạo được đường dẫn tải Word.');
 if(typeof data.url!=='string'||!/^\/api\/word-download\?token=[a-f0-9]{48}$/.test(data.url))throw new Error('Đường dẫn tải Word chưa hợp lệ.');
 return {url:data.url as string,name};
}
export function startWordDownload(file:{url:string;name:string}){
 const link=document.createElement('a');link.href=file.url;link.download=file.name;document.body.appendChild(link);link.click();link.remove();
}
