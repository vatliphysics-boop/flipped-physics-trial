#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const base = path.join(root, 'docs/codex-team');
const runs = path.join(base, 'runs');
fs.mkdirSync(runs, { recursive: true });
const cleanEnv = () => {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (['OPENAI_API_KEY', 'CODEX_API_KEY', 'CODEX_ACCESS_TOKEN'].includes(key) || key.startsWith('OPENAI_IDENTITY_')) delete env[key];
  return env;
};
const redact = s => s.replace(/(?:sk-[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/g, '[REDACTED]');
const write = (p, value) => { const temp = `${p}.tmp-${process.pid}`; fs.writeFileSync(temp, JSON.stringify(value, null, 2)); fs.renameSync(temp, p); };
function fingerprint() {
  const files = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' });
  if (files.status !== 0) throw Error('Cannot inventory workspace');
  return Object.fromEntries([...new Set(files.stdout.split('\0').filter(Boolean))].filter(p => !p.startsWith('docs/codex-team/') && !p.startsWith('tmp/')).sort().map(p => {
    const full = path.join(root, p);
    return [p, fs.existsSync(full) && fs.statSync(full).isFile() ? crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex') : null];
  }));
}
function auth(worker) {
  const env = cleanEnv(); env.CODEX_HOME = path.join(os.homedir(), `.codex-plus-${worker}`);
  const result = spawnSync('codex', ['-c', 'cli_auth_credentials_store="file"', 'login', 'status'], { env, cwd: root, encoding: 'utf8', timeout: 30000 });
  const ok = result.status === 0 && /Logged in using ChatGPT/.test(result.stdout + result.stderr);
  return { worker, codex_home: env.CODEX_HOME, ok, exit_code: result.status, status: ok ? 'Logged in using ChatGPT' : 'CHATGPT_LOGIN_NOT_CONFIRMED' };
}
function identitiesDistinct() {
  const ids = ["", "-plus-2", "-plus-3"].map(suffix => { try { return JSON.parse(fs.readFileSync(path.join(os.homedir(), `.codex${suffix}`, 'auth.json'), 'utf8')).tokens?.account_id; } catch { return null; } });
  return ids.every(Boolean) && new Set(ids).size === 3;
}
const [command, jobFile] = process.argv.slice(2);
if (command === 'preflight') {
  const status = { time: new Date().toISOString(), cwd: root, branch: spawnSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).stdout.trim(), cli: spawnSync('codex', ['--version'], { encoding: 'utf8' }).stdout.trim(), accounts: [auth(2), auth(3)], distinct_accounts: identitiesDistinct() };
  write(path.join(base, 'preflight.json'), status); console.log(JSON.stringify(status, null, 2)); process.exit(status.accounts.every(a => a.ok) && status.distinct_accounts ? 0 : 2);
}
if (command !== 'run' || !jobFile) throw Error('Usage: node scripts/codex-team/run.mjs preflight | run JOB.json');
const job = JSON.parse(fs.readFileSync(path.resolve(root, jobFile), 'utf8'));
if (![2, 3].includes(job.worker) || !['review', 'fix', 'article'].includes(job.mode) || !/^[a-zA-Z0-9_-]+$/.test(job.id)) throw Error('Invalid job');
if (!Number.isInteger(job.timeout_seconds) || job.timeout_seconds < 30 || job.timeout_seconds > 3600) throw Error('timeout_seconds must be 30..3600');
const recordedMedia = JSON.parse(fs.readFileSync(path.join(base, 'video-media-origins.json'), 'utf8'));
const publicVideoOrigins = new Set(['https://www.youtube.com','https://www.youtube-nocookie.com','https://i.ytimg.com', ...recordedMedia]);
if ((job.browser_origins || []).some(origin => !publicVideoOrigins.has(origin))) throw Error('Unknown browser origin; record observed public video hosts first');
if (job.mode === 'article' && job.worker !== 2) throw Error('Only Worker 2 edits the article');
const allowed = job.allowed_files || [];
if (job.mode !== 'review' && !allowed.length) throw Error('Write job requires exact allowed_files');
if (job.worker === 2 && allowed.some(p => p !== 'BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx')) throw Error('Worker 2 may only edit the article; reports have separate permissions');
if (job.worker === 3 && allowed.includes('BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx')) throw Error('Worker 3 may not edit the article');
if (allowed.some(p => path.isAbsolute(p) || p.split('/').includes('..') || ['hd.docx', 'ĐÃ SỬA - NCKH.docx', 'AGENTS.md'].includes(p))) throw Error('Invalid or protected allowed file');
const locks = path.join(base, 'locks'); fs.mkdirSync(locks, { recursive: true });
const acquired = [];
try {
  for (const key of [`worker-${job.worker}`, ...allowed.map(p => `file-${crypto.createHash('sha256').update(p).digest('hex')}`)].sort()) {
    const p = path.join(locks, key); const fd = fs.openSync(p, 'wx'); fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, job: job.id, started_at: new Date().toISOString() })); fs.closeSync(fd); acquired.push(p);
  }
} catch (err) { for (const p of acquired) fs.unlinkSync(p); throw Error(`Job overlaps an existing worker/file lock: ${err.message}`); }
const release = () => { for (const p of acquired) { try { fs.unlinkSync(p); } catch {} } };
process.on('exit', release);
const dir = path.join(runs, job.id); if (fs.existsSync(dir)) throw Error('Run IDs must be unique; prior evidence is retained'); fs.mkdirSync(dir);
const start = new Date().toISOString(); const before = fingerprint(); write(path.join(dir, 'before.json'), before);
const browserTemp = fs.mkdtempSync(path.join(os.tmpdir(), `ct-w${job.worker}-`));
const browserCache = path.join(browserTemp, 'cache');
const browserEvidence = path.join(browserTemp, 'evidence');
fs.mkdirSync(browserCache, { recursive: true }); fs.mkdirSync(browserEvidence, { recursive: true });
fs.writeFileSync(path.join(dir, 'git-status.txt'), spawnSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).stdout);
const sources = JSON.parse(fs.readFileSync(path.join(base, 'source-manifest.json'), 'utf8'));
const protectedSources = sources.filter(s => s.file !== 'BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx');
for (const source of sources) {
  const current = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, source.file))).digest('hex');
  if (current !== source.sha256) throw Error(`Source extraction is stale: ${source.file}; refresh manifest before dispatch`);
}

const state = { id: job.id, worker: job.worker, mode: job.mode, start, status: 'PREFLIGHT', session_ids: [], exit_code: null, allowed_files: allowed, timeout_seconds: job.timeout_seconds || 1200, auth: auth(job.worker) };
const save = () => write(path.join(dir, 'status.json'), state); save();
if (!state.auth.ok || !identitiesDistinct()) { state.status = 'BLOCKED_AUTH'; save(); console.log(state.status); process.exit(2); }
for (const p of allowed) if (fs.existsSync(path.join(root, p))) { const copy = path.join(dir, 'backup', /\.(ts|tsx|js|jsx)$/.test(p) ? `${p}.bak` : p); fs.mkdirSync(path.dirname(copy), { recursive: true }); fs.copyFileSync(path.join(root, p), copy); }
const contextPaths = ['AGENTS.md', 'docs/codex-team/TEAM.md', 'docs/codex-team/acceptance.md', 'docs/codex-team/regulations.md', ...(job.context_files || [])];
const context = contextPaths.filter(p => fs.existsSync(path.join(root, p))).map(p => `\n--- ${p} ---\n${fs.readFileSync(path.join(root, p), 'utf8')}`).join('');
const previous = (job.previous_runs || []).map(id => {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw Error('Invalid previous run ID');
  const p = path.join(runs, id, 'report.md');
  if (!fs.existsSync(p)) {
    state.status = 'BLOCKED_SETUP'; state.exit_code = 1; state.end = new Date().toISOString();
    state.setup_error = `Previous report missing: ${id}`; save();
    fs.writeFileSync(path.join(dir, 'stderr.log'), `${state.setup_error}\n`);
    console.error(state.setup_error); process.exit(1);
  }
  return `\n--- Previous ${id} ---\n${fs.readFileSync(p, 'utf8')}`;
}).join('');
const prompt = `Bạn là Worker ${job.worker}. Vai trò cố định: ${job.worker === 2 ? 'AI đóng vai giáo viên khó tính với chuẩn đánh giá tương đương 50 năm kinh nghiệm; phản biện sư phạm, dùng thử thực tế và duy nhất sửa bài báo. Không phải người tham gia nghiên cứu thật.' : 'Giao diện, UX và trình bày/tương tác 3D. Không thay mô hình khoa học do trưởng nhóm phụ trách.'}\nWorkspace ${root}. Web http://localhost:3001. Mode ${job.mode}. Quyền sửa CHỈ các file chính xác: ${JSON.stringify(allowed)}. Không sửa file chung, không commit, không reset/clean, không reset DB/migration, không dùng production. Review tuyệt đối không sửa workspace. Không đọc/in auth, secrets, env values. Đọc TOÀN BỘ ba tài liệu đã trích xuất sau và AGENTS/hướng dẫn liên quan, trước khi thực hiện. Nếu không có công cụ trình duyệt hoặc tài khoản thử, ghi CHƯA KIỂM CHỨNG; không dùng đọc code thay bằng chứng thao tác. Mỗi vấn đề: ID, severity, trang, steps, evidence, source paragraph, tác động dạy/học, acceptance. Cuối báo cáo nêu actual tests và giới hạn.\n${sources.map(s => `\n--- ${s.file} (sha256 ${s.sha256}) ---\n${fs.readFileSync(path.join(root, s.text), 'utf8')}`).join('')}\n${context}\n${previous}\nNHIỆM VỤ VÒNG NÀY:\n${job.task}`;
const fullPrompt = `${prompt}\nBrowser bundled module: /Users/vodoandangkhoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs. Node bundled: /Users/vodoandangkhoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Thư mục tạm browser được phép ghi: ${browserTemp}; TMPDIR/TMP/TEMP đã trỏ vào đó. Khi review, workspace vẫn chỉ đọc; lưu ảnh/bằng chứng dưới thư mục evidence tuyệt đối ${browserEvidence}, trưởng nhóm sẽ thu hồi sau. Tên filename khi chụp/ghi snapshot phải là đường dẫn TUYỆT ĐỐI trong evidence. Không ghi ảnh/snapshot tại root workspace. Chỉ truy cập web phát triển và nguồn cần kiểm chứng.\n`;
fs.writeFileSync(path.join(dir, 'prompt.txt'), fullPrompt);
const env = cleanEnv(); env.CODEX_HOME = path.join(os.homedir(), `.codex-plus-${job.worker}`);
env.TMPDIR = browserCache; env.TMP = browserCache; env.TEMP = browserCache;
const filesystem = { [browserTemp]: 'write', [path.join(dir, 'report.md')]: 'write', ...Object.fromEntries(allowed.map(p => [path.join(root, p), 'write'])) };
const inlineTable = object => `{${Object.entries(object).map(([key, value]) => `${JSON.stringify(key)}=${JSON.stringify(value)}`).join(',')}}`;
const domains = { localhost: 'allow', '127.0.0.1': 'allow', ...(job.allowed_domains ? Object.fromEntries(job.allowed_domains.map(d => [d, 'allow'])) : {}) };
const permissions = ['-c', 'default_permissions="team-scoped"', '-c', 'permissions.team-scoped.extends=":read-only"', '-c', 'permissions.team-scoped.network.enabled=true', '-c', 'permissions.team-scoped.network.mode="limited"', '-c', `permissions.team-scoped.network.domains=${inlineTable(domains)}`, '-c', 'features.network_proxy=true', '-c', `permissions.team-scoped.filesystem=${inlineTable(filesystem)}`];
const args = ['exec', '--ignore-user-config', '--strict-config', '-C', root, '-c', 'cli_auth_credentials_store="file"', '-c', 'approval_policy="on-request"', '-c', 'approvals_reviewer="auto_review"', '-c', 'model_provider="openai"', ...permissions, '--color', 'never', '--json', '-o', path.join(dir, 'report.md'), '-'];
if (job.browser_mcp) {
  const runtime = '/Users/vodoandangkhoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node';
  const mcp = { command: `${runtime}/bin/node`, args: [`${runtime}/node_modules/playwright/cli.js`, 'mcp', '--headless', '--browser', 'chrome', '--isolated', '--output-dir', browserEvidence, '--viewport-size', '1280x900', '--save-session', '--allowed-origins', ['http://localhost:3001','http://127.0.0.1:3001',...(job.browser_origins || [])].join(';')], cwd: root, startup_timeout_sec: 30, tool_timeout_sec: 90 };
  const enabledTools = ['browser_navigate', 'browser_snapshot', 'browser_click', 'browser_type', 'browser_select_option', 'browser_press_key', 'browser_resize', 'browser_take_screenshot', 'browser_console_messages', 'browser_network_requests', 'browser_close', 'browser_wait_for', 'browser_tabs', 'browser_evaluate'];
  const toml = `{command=${JSON.stringify(mcp.command)},args=${JSON.stringify(mcp.args)},cwd=${JSON.stringify(browserEvidence)},env=${inlineTable({TMPDIR:browserCache,TMP:browserCache,TEMP:browserCache,PWTEST_SOCKETS_DIR:browserCache})},enabled_tools=${JSON.stringify(enabledTools)},startup_timeout_sec=30,tool_timeout_sec=90,default_tools_approval_mode="auto"}`;
  args.splice(args.length - 1, 0, '-c', `mcp_servers.team_browser=${toml}`);
}
write(path.join(dir, 'command.json'), { executable: 'codex', args, CODEX_HOME: env.CODEX_HOME });
state.effective_permissions = { profile: 'team-scoped', extends: ':read-only', filesystem, network: { proxy: true, mode: 'limited', domains }, browser_mcp: Boolean(job.browser_mcp), browser_temp: browserTemp, browser_cache: browserCache, browser_evidence: browserEvidence };
state.status = 'RUNNING'; save();
const child = spawn('codex', args, { cwd: root, env, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
state.pid = child.pid; save();
let eventBuffer = ''; let stopped = false;
const stop = () => { if (stopped) return; stopped = true; try { process.kill(-child.pid, 'SIGTERM'); } catch {} setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }, 5000).unref(); };
process.on('SIGINT', () => { state.status = 'INTERRUPTED'; stop(); }); process.on('SIGTERM', () => { state.status = 'INTERRUPTED'; stop(); });
const timer = setTimeout(() => { state.status = 'TIMED_OUT'; save(); stop(); }, state.timeout_seconds * 1000);
child.stdout.on('data', data => {
  const safe = redact(data.toString()); fs.appendFileSync(path.join(dir, 'events.jsonl'), safe); eventBuffer += safe;
  const lines = eventBuffer.split('\n'); eventBuffer = lines.pop();
  for (const line of lines) { try { const event = JSON.parse(line); if (event.type === 'thread.started' && event.thread_id) { state.session_ids.push(event.thread_id); save(); } } catch {} }
});
child.stderr.on('data', data => fs.appendFileSync(path.join(dir, 'stderr.log'), redact(data.toString())));
child.stdin.on('error', err => { state.stdin_error = redact(err.message); save(); });
child.stdin.end(fullPrompt);
child.on('error', err => { state.error = redact(err.message); });
child.on('close', (code, signal) => {
  clearTimeout(timer); state.exit_code = code; state.signal = signal; state.end = new Date().toISOString();
  state.browser_temp = browserTemp;
  const evidence = path.join(dir, 'browser-evidence'); fs.cpSync(browserEvidence, evidence, { recursive: true });
  const after = fingerprint(); write(path.join(dir, 'after.json'), after);
  state.changed_files = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(p => before[p] !== after[p]);
  // Scoped CLI filesystem profile enforces assigned paths. Audit includes concurrent lead changes.
  state.unexpected_changes = state.changed_files.filter(p => !allowed.includes(p));
  state.protected_sources_unchanged = protectedSources.every(s => fs.existsSync(path.join(root, s.file)) && crypto.createHash('sha256').update(fs.readFileSync(path.join(root, s.file))).digest('hex') === s.sha256);
  const reportPath = path.join(dir, 'report.md'); if (fs.existsSync(reportPath)) fs.writeFileSync(reportPath, redact(fs.readFileSync(reportPath, 'utf8')));
  if (state.status === 'RUNNING') state.status = code === 0 ? 'COMPLETED_PENDING_LEAD_REVIEW' : 'BLOCKED_PROCESS';
  if (!state.protected_sources_unchanged) state.status = 'SOURCE_INTEGRITY_FAILED';
  save(); release(); console.log(JSON.stringify(state, null, 2)); process.exitCode = code === 0 && state.protected_sources_unchanged ? 0 : (code || 2);
});
