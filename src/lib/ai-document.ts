// Check ZIP central-directory sizes before DOCX extraction (no external content).
export function validateDocxArchive(buffer: Buffer) {
  let end = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50 && i + 22 + buffer.readUInt16LE(i + 20) === buffer.length) { end = i; break; }
  }
  if (end < 0) throw new Error("Tệp DOCX không hợp lệ.");
  const count = buffer.readUInt16LE(end + 10), size = buffer.readUInt32LE(end + 12), start = buffer.readUInt32LE(end + 16);
  if (count > 2000 || start + size > end || count === 0) throw new Error("Tệp DOCX quá phức tạp hoặc không hợp lệ.");
  let offset = start, total = 0, hasDocument = false;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("Tệp DOCX không hợp lệ.");
    total += buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28), extra = buffer.readUInt16LE(offset + 30), comment = buffer.readUInt16LE(offset + 32);
    if (total > 20000000 || offset + 46 + nameLength + extra + comment > end) throw new Error("Nội dung DOCX sau giải nén quá lớn.");
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);
    if (name === "word/document.xml") hasDocument = true;
    offset += 46 + nameLength + extra + comment;
  }
  if (!hasDocument) throw new Error("Đây không phải tài liệu Word DOCX.");
}
