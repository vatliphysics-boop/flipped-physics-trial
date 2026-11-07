"""Publish only source-checked book questions; keep OCR inventories private for review."""
import json,hashlib,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'data/book-bank'
books={b['id']:b for b in json.loads((OUT/'manifest.json').read_text())['books']}
# Verify that the three user-supplied books are the exact sources used for transcription.
for book in books.values():
 candidates=[p for p in (ROOT/'Sachgiaokhoavl12vlhn').glob('*.pdf') if hashlib.sha256(p.read_bytes()).hexdigest()==book['sha256']]
 if len(candidates)!=1:raise RuntimeError('Source book missing or ambiguous: '+book['id'])
 book['source']=str(candidates[0])
manifest=json.loads((OUT/'manifest.json').read_text());manifest['books']=list(books.values());(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False))
bank=[]
for name in ['sgk-nuclear-transcriptions.json','workbook-nuclear-transcriptions.json']:
 source=ROOT/'src/data'/name
 if source.exists():bank.extend(json.loads(source.read_text()))
# Never include generated exam examples or unverified OCR question groups in the published bank.
assert len(set(q['id'] for q in bank))==len(bank)
order={'sgk-kntt':0,'ctst':1,'sbt-kntt':2}
bank.sort(key=lambda q:(order[q['source']['bookId']],q['source']['sequence']))
checked=[q for q in bank if q['status']=='ready']
spec=importlib.util.spec_from_file_location('tf_split',ROOT/'scripts/split-source-true-false.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
ready,pending_statements=module.split_true_false(checked)
ready.sort(key=lambda q:(order[q['source']['bookId']],q['source']['sequence'],q['id']))
for q in ready:
 assert q['source']['bookId'] in books and q.get('bloom') and q['source']['pages']
 assert not q.get('figure') or q['figure'].get('origin')=='source_crop'
 assert q['kind']!='true_false' or len(q['statements'])==4
(OUT/'true-false-pending-statements.json').write_text(json.dumps(pending_statements,ensure_ascii=False,indent=2))
(OUT/'unified.json').write_text(json.dumps(ready,ensure_ascii=False))
(ROOT/'src/data/unified-question-bank.json').write_text(json.dumps(ready,ensure_ascii=False,indent=2))
(OUT/'curation-audit.json').write_text(json.dumps({'published':len(ready),'sourceTasks':len(bank),'checkedSourceTasks':len(checked),'pending':len(bank)-len(checked),'trueFalseQuestions':sum(q['kind']=='true_false' for q in ready),'trueFalsePendingStatements':len(pending_statements),'policy':'Only visually transcribed source questions; true/false questions have exactly four source statements, grouped within the same topic. Unpaired statements remain private.'},ensure_ascii=False,indent=2))
print(f'Published {len(ready)} questions; {len(bank)-len(checked)} source tasks pending; {len(pending_statements)} unpaired true/false statements')
