export function checkBrowserDocx(bytes: Uint8Array) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (v.getUint32(i, true) === 0x06054b50 && i + 22 + v.getUint16(i + 20, true) === bytes.length) { end = i; break; }
  if (end < 0) throw new Error("Tệp DOCX không hợp lệ.");
  const count = v.getUint16(end + 10, true), size = v.getUint32(end + 12, true), start = v.getUint32(end + 16, true);
  if (!count || count > 2000 || start + size > end) throw new Error("Tệp quá phức tạp hoặc không hợp lệ.");
  let offset = start, total = 0, document = false;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || v.getUint32(offset, true) !== 0x02014b50) throw new Error("DOCX không hợp lệ.");
    total += v.getUint32(offset + 24, true);
    const n = v.getUint16(offset + 28, true), extra = v.getUint16(offset + 30, true), comment = v.getUint16(offset + 32, true);
    if (total > 20000000 || offset + 46 + n + extra + comment > end) throw new Error("DOCX sau giải nén vượt 20 MB.");
    if (new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + n)) === "word/document.xml") document = true;
    offset += 46 + n + extra + comment;
  }
  if (!document) throw new Error("Chưa tìm thấy nội dung Word.");
}
