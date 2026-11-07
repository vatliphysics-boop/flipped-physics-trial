export const EXAM_TYPES = { short: { label: "Kiểm tra 15 phút", minutes: 15, defaultCount: 6 }, midterm: { label: "Giữa kỳ trong chủ đề hạt nhân", minutes: 45, defaultCount: 18 }, final: { label: "Cuối kỳ trong chủ đề hạt nhân", minutes: 60, defaultCount: 20 } };
export function validateBankQuestion(value) {
    if (!value || typeof value !== "object")
        throw new Error("Câu hỏi không hợp lệ.");
    const q = value;
    if (typeof q.id !== "string" || q.id.length > 100 || !["B21", "B22", "B23", "B24", "B25"].includes(q.topic) || !["choice", "numeric", "written", "true_false"].includes(q.kind) || typeof q.prompt !== "string" || !q.prompt.trim() || q.prompt.length > 4000 || typeof q.level !== "string" || q.level.length > 60 || !Number.isFinite(q.points) || q.points <= 0 || q.points > 10 || (q.imageId !== undefined && (typeof q.imageId !== "string" || q.imageId.length > 100)))
        throw new Error("Câu hỏi cần đủ nội dung, phạm vi B21–B25 và điểm hợp lệ.");
    const text = (s) => typeof s === "string" && s.length <= 2000;
    if (q.kind === "choice" && (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.every(s => text(s) && s.trim()) || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3))
        throw new Error("Trắc nghiệm cần đúng bốn lựa chọn và đáp án A–D.");
    if (q.kind === "numeric" && (!Number.isFinite(q.answer) || !text(q.unit ?? "") || (q.tolerance !== undefined && (!Number.isFinite(q.tolerance) || q.tolerance < 0))))
        throw new Error("Câu trả lời số chưa có đáp án hoặc đơn vị hợp lệ.");
    if (q.kind === "true_false" && (!Array.isArray(q.statements) || q.statements.length < 1 || q.statements.length > 6 || !q.statements.every(s => text(s.text) && typeof s.answer === "boolean" && text(s.explanation ?? ""))))
        throw new Error("Câu đúng sai cần các ý và đáp án đi kèm.");
    if (q.kind === "written" && (!Array.isArray(q.rubric) || !q.rubric.length || q.rubric.length > 10 || !q.rubric.every(r => text(r.text) && Number.isFinite(r.points) && r.points > 0) || Math.abs(q.rubric.reduce((n, r) => n + r.points, 0) - q.points) > 0.001))
        throw new Error("Tự luận cần rubric có tổng điểm bằng điểm câu.");
    if (!text(q.explanation ?? "") || !text(q.source ?? ""))
        throw new Error("Lời giải hoặc nguồn quá dài.");
    return { id: q.id, topic: q.topic, kind: q.kind, level: q.level, prompt: q.prompt, points: q.points, ...(q.imageId ? { imageId: q.imageId } : {}), ...(q.source ? { source: q.source } : {}), ...(q.options ? { options: [...q.options] } : {}), ...(q.answer !== undefined ? { answer: q.answer } : {}), ...(q.unit ? { unit: q.unit } : {}), ...(q.tolerance !== undefined ? { tolerance: q.tolerance } : {}), ...(q.explanation ? { explanation: q.explanation } : {}), ...(q.statements ? { statements: q.statements.map(s => ({ ...s })) } : {}), ...(q.rubric ? { rubric: q.rubric.map(r => ({ ...r })) } : {}) };
}
function random(seed) {
    let state = 2166136261;
    for (const c of seed)
        state = Math.imul(state ^ c.charCodeAt(0), 16777619);
    return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}
function shuffled(items, rng) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
export function examMatrix(questions) {
    const map = new Map();
    for (const q of questions) {
        const key = `${q.topic}-${q.level}`, row = map.get(key) ?? { topic: q.topic, level: q.level, count: 0, points: 0, images: 0 };
        row.count++;
        row.points += q.points;
        row.images += q.imageId ? 1 : 0;
        map.set(key, row);
    }
    return [...map.values()].sort((a, b) => `${a.topic}-${a.level}`.localeCompare(`${b.topic}-${b.level}`, "vi"));
}
export function makeExamVersions(questions, versions, seed) {
    if (!Number.isInteger(versions) || versions < 1 || versions > 8 || questions.length < 1 || questions.length > 40 || !seed.trim() || seed.length > 100)
        throw new Error("Mỗi lần tạo 1–8 mã đề, 1–40 câu; nhập mã lưu lượt đảo tối đa 100 kí tự.");
    const checked = questions.map(validateBankQuestion);
    if (new Set(checked.map(q => q.id)).size !== checked.length)
        throw new Error("Không dùng trùng mã câu hỏi trong một đề.");
    const signatures = new Set(), result = [];
    for (let v = 0; v < versions; v++) {
        let selected;
        for (let attempt = 0; attempt < 40; attempt++) {
            const rng = random(`${seed}:${v}:${attempt}`);
            const candidate = ["choice", "true_false", "numeric", "written"].flatMap(kind => shuffled(checked.filter(q => q.kind === kind), rng)).map(q => {
                if (q.kind !== "choice" || /(?:phương án|đáp án|lựa chọn)\s+[A-D]|[A-D]\s+và\s+[A-D]|tất cả các/i.test(q.options.join(" ")))
                    return { ...q };
                const order = shuffled([0, 1, 2, 3], rng);
                return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
            });
            const signature = JSON.stringify(candidate.map(q => [q.id, q.options]));
            if (!signatures.has(signature)) {
                signatures.add(signature);
                selected = candidate;
                break;
            }
        }
        if (!selected)
            throw new Error("Không đủ cách đảo khác nhau cho số mã đã chọn; giảm số mã hoặc thêm câu có thể đảo.");
        result.push({ code: String(101 + v), questions: selected });
    }
    return result;
}
export function selectExamQuestions(bank, recipe) {
    if (!EXAM_TYPES[recipe.type] || !recipe.title.trim() || recipe.title.length > 180 || recipe.topics.length < 1 || new Set(recipe.topics).size !== recipe.topics.length || !recipe.topics.every(t => ["B21", "B22", "B23", "B24", "B25"].includes(t)) || !Number.isInteger(recipe.count) || recipe.count < recipe.topics.length || recipe.count > 40)
        throw new Error("Chọn bài, tên đề và số câu 1–40; mỗi bài được chọn cần ít nhất một câu.");
    const rng = random(recipe.seed), pool = shuffled(bank.filter(q => recipe.topics.includes(q.topic) && (!recipe.withImages || q.imageId)), rng), selected = [];
    for (let i = 0; selected.length < recipe.count; i++) {
        const topic = recipe.topics[i % recipe.topics.length];
        const candidates = pool.filter(q => q.topic === topic && !selected.some(s => s.id === q.id));
        const q = !selected.some(s => s.topic === topic) && !recipe.withImages ? candidates.find(q => q.imageId) ?? candidates[0] : candidates[0];
        if (!q)
            throw new Error(`Ngân hàng chưa đủ câu ${topic} cho yêu cầu này. Giảm số câu hoặc bỏ điều kiện chỉ câu có hình.`);
        selected.push(q);
    }
    // Quarter-point units sum to exactly ten; rubric weights retain their proportions.
    return selected.map((q, i) => {
        const points = (Math.floor(40 / selected.length) + (i < 40 % selected.length ? 1 : 0)) / 4;
        return { ...q, points, ...(q.rubric ? { rubric: q.rubric.map(r => ({ ...r, points: r.points / q.points * points })) } : {}) };
    });
}
export function parseImportedQuestions(text, topic) {
    if (text.length > 60000 || !["B21", "B22", "B23", "B24", "B25"].includes(topic))
        throw new Error("Văn bản tối đa 60.000 kí tự; chọn bài B21–B25.");
    const blocks = text.trim().split(/(?=^\s*Câu\s+\d+\s*[.:])/m).filter(s => /^\s*Câu\s+\d+\s*[.:]/.test(s));
    if (!blocks.length || blocks.length > 40)
        throw new Error("Chỉ đọc 1–40 câu dạng ‘Câu 1.’, bốn dòng A. B. C. D. và dòng ‘Đáp án: A’. Đề khác cần chuẩn hóa trước.");
    const warnings = [];
    const questions = blocks.map((block, i) => {
        const lines = block.split(/\n/).map(s => s.trim()).filter(Boolean), firstOption = lines.findIndex(s => /^A[.)]\s/.test(s));
        if (firstOption < 1)
            throw new Error(`Câu ${i + 1}: chưa nhận dạng đủ nội dung và phương án trên từng dòng.`);
        const choices = ["A", "B", "C", "D"].map(letter => {
            const line = lines.find(s => new RegExp(`^${letter}[.)]\\s`).test(s));
            if (!line)
                throw new Error(`Câu ${i + 1}: thiếu lựa chọn ${letter}.`);
            return line.replace(/^[A-D][.)]\s*/, "");
        });
        const answer = block.match(/(?:Đáp án|ĐA)\s*:\s*([A-D])\b/i);
        if (!answer)
            throw new Error(`Câu ${i + 1}: thiếu đáp án; bổ sung ‘Đáp án: A–D’ để đảo đúng khóa.`);
        if (lines.some(s => /^(?:a|b|c|d)[.)]/.test(s)))
            warnings.push(`Câu ${i + 1}: có ý phụ; kiểm tra cấu trúc trước khi đảo.`);
        return validateBankQuestion({ id: `import-${i + 1}`, kind: "choice", topic, level: "Giáo viên phân loại", prompt: lines.slice(0, firstOption).join(" ").replace(/^Câu\s+\d+\s*[.:]\s*/, ""), options: choices, answer: answer[1].toUpperCase().charCodeAt(0) - 65, explanation: block.match(/Giải thích:\s*([^\n]+)/i)?.[1] ?? "Giáo viên cần bổ sung hoặc kiểm tra lời giải.", points: 1, source: "Đề do giáo viên nhập; chưa được hệ thống thẩm định." });
    });
    return { questions, warnings };
}
