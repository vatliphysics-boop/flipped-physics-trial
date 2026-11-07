import assert from 'node:assert/strict';
const base=process.env.BASE_URL??'http://localhost:3471';
const assets=['b21','b22','b23','b24','b25'];
await Promise.all(assets.map(async code=>{
 const url=`${base}/videos/nuclear-lessons/${code}`;
 const [first,end,captions,poster]=await Promise.all([
   fetch(url+'.mp4',{headers:{Range:'bytes=0-15'}}),
   fetch(url+'.mp4',{headers:{Range:'bytes=-16'}}),
   fetch(url+'.vi.vtt'),
   fetch(url+'.jpg')
 ]);
 const body=Buffer.from(await first.arrayBuffer());
 const tail=await end.arrayBuffer();
 const size=Number(first.headers.get('content-range')?.match(/^bytes 0-15\/(\d+)$/)?.[1]);
 assert(first.status===206&&end.status===206&&size>1e6,code+' video range status');
 assert(body.subarray(4,8).toString()==='ftyp'&&body.length===16&&tail.byteLength===16,code+' video byte range');
 assert(end.headers.get('content-range')===`bytes ${size-16}-${size-1}/${size}`,code+' video suffix range');
 assert((await captions.text()).startsWith('WEBVTT')&&captions.status===200,code+' captions');
 assert(poster.status===200&&poster.headers.get('content-type')==='image/jpeg',code+' poster');
 console.log(`${code.toUpperCase()} bytes 0-15 and ${size-16}-${size-1} = HTTP 206, MP4 size ${size}; VTT and JPG 200`);
}));
