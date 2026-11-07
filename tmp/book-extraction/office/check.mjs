import {officeEquation} from './office-equation.ts';
const eqs = ['E=mc^2',String.raw`\frac{\ln 2}{T}`,String.raw`{}^{235}_{92}\mathrm{U}`,String.raw`N_t=N_0 2^{-\frac{t}{T}}`];
for (const e of eqs) officeEquation(e);
console.log('Native equation construction succeeded');
