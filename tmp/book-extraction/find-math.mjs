import fs from 'node:fs';
import {mathSegments} from '../../src/lib/unified-question-bank.ts';
import {officeEquation} from '../../src/lib/office-equation.ts';
for(const q of JSON.parse(fs.readFileSync('src/data/unified-question-bank.json'))){for(const t of [q.prompt,...q.options||[],...q.statements?.map(s=>s.text)||[],q.explanation||'',q.answerText||''])for(const s of mathSegments(t))if(s.math)try{officeEquation(s.text)}catch(e){console.log(q.id,s.text,e.message);}}
