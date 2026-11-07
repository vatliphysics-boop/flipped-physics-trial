import { Math as OfficeMath, MathRun, MathFraction, MathSuperScript, MathSubScript, MathSubSuperScript, MathRadical, XmlComponent,createMathAccentCharacter,type MathComponent } from "docx";
class MathNode extends XmlComponent {
 constructor(name:string,children:XmlComponent[]){super(name);this.root.push(...children);}
}
const SYMBOLS: Record<string, string> = { alpha: "α", beta: "β", gamma: "γ", delta: "δ", Delta: "Δ", theta: "θ", lambda: "λ", mu: "μ", nu: "ν", pi: "π", rho: "ρ", sigma: "σ", tau: "τ", phi: "φ", varphi: "φ", Phi: "Φ", omega: "ω", Omega: "Ω", epsilon: "ε", varepsilon: "ε", eta: "η", kappa: "κ", times: "×", cdot: "·", pm: "±", approx: "≈", ne: "≠", le: "≤", ge: "≥", to: "→", rightarrow: "→", infty: "∞", degree: "°", circ: "°", sin: "sin", cos: "cos", tan: "tan", ln: "ln", log: "log", exp: "exp" };
/** Supported subset is deliberately strict: unsupported commands never silently turn into incorrect math. */
export function officeEquation(source: string) {
  const s = source.trim().replace(/^\$|\$$/g, "");
  if (!s || s.length > 1200) throw new Error("Nhập công thức tối đa 1.200 ký tự.");
  let i = 0;
  function group(): MathComponent[] {
    while(s[i]===" ")i++;
    if (s[i] === "{") { i++; const result = sequence("}"); if (s[i] !== "}") throw new Error("Công thức thiếu dấu }."); i++; return result; }
    return [atom()];
  }
  function atom(): MathComponent {
    if (i >= s.length) throw new Error("Công thức thiếu thành phần.");
    if (s[i] === "\\") {
      i++; const m = /^[a-zA-Z]+/.exec(s.slice(i));
      if (!m) { const c = s[i++]; if ([" ", ",", ";", "!"].includes(c)) return new MathRun(" "); if (["{", "}", "%", "_"].includes(c)) return new MathRun(c); throw new Error("Lệnh công thức chưa được hỗ trợ."); }
      const name = m[0]; i += name.length;
      if (name === "frac") return new MathFraction({ numerator: group(), denominator: group() });
      if (name === "sqrt") return new MathRadical({ children: group() });
      if (name === "bar" || name === "overline") return new MathNode("m:acc",[new MathNode("m:accPr",[createMathAccentCharacter({accent:"¯"})]),new MathNode("m:e",group())]);
      if (["mathrm", "text", "operatorname"].includes(name)) { if (s[i] !== "{") throw new Error("Lệnh cần nội dung trong { }."); const start = ++i; while (i < s.length && s[i] !== "}") i++; if (i >= s.length) throw new Error("Thiếu dấu }."); const value = s.slice(start, i++); if (/[\\{}]/.test(value)) throw new Error("Nội dung chữ không được chứa lệnh lồng nhau."); return new MathRun(value); }
      if (name === "left" || name === "right") return atom();
      if (name === "propto") return new MathRun("∝");
      if (SYMBOLS[name]) return new MathRun(SYMBOLS[name]);
      throw new Error(`Chưa hỗ trợ lệnh \\${name}; hãy kiểm tra lại công thức.`);
    }
    const c = s[i++]; if (c === "}" || c === "^" || c === "_") throw new Error("Chỉ số hoặc dấu ngoặc chưa có thành phần đi trước.");
    return new MathRun(c);
  }
  function sequence(end?: string): MathComponent[] {
    const result: MathComponent[] = [];
    while (i < s.length && s[i] !== end) {
      let base: MathComponent[];
      let emptyBase=false;
      if (!result.length && (s[i] === "^" || s[i] === "_")) {base = [];emptyBase=true;}
      else if (s[i] === "{") { base = group();emptyBase=!base.length; }
      else base = [atom()];
      let sub: MathComponent[] | undefined, sup: MathComponent[] | undefined;
      while (s[i] === "_" || s[i] === "^") { const op = s[i++]; if (op === "_") { if (sub) throw new Error("Chỉ số dưới bị lặp."); sub = group(); } else { if (sup) throw new Error("Số mũ bị lặp."); sup = group(); } }
      if(emptyBase && (sub || sup) && i<s.length && s[i]!==end){
        // Nuclear symbols use indices before the element, with no empty Equation placeholder.
        // OMML sPre requires sub, sup, then e (the library emits a different order).
        // A mass-only isotope also needs a real element base. A zero-width run
        // in the omitted index prevents Word/LibreOffice showing a vacant box.
        base=[new MathNode("m:sPre",[new MathNode("m:sPrePr",[]),new MathNode("m:sub",sub||[new MathRun("\u200B")]),new MathNode("m:sup",sup||[new MathRun("\u200B")]),new MathNode("m:e",group())])];
        sub=undefined;sup=undefined;
        while(s[i]==="_" || s[i]==="^"){const op=s[i++];if(op==="_"){if(sub)throw new Error("Chỉ số dưới bị lặp.");sub=group();}else{if(sup)throw new Error("Số mũ bị lặp.");sup=group();}}
      }
      if(!base.length)base=[new MathRun("")];
      result.push(sub && sup ? new MathSubSuperScript({ children: base, subScript: sub, superScript: sup }) : sub ? new MathSubScript({ children: base, subScript: sub }) : sup ? new MathSuperScript({ children: base, superScript: sup }) : base.length === 1 ? base[0] : new MathRun(""));
      if (!sub && !sup && base.length > 1) { result.pop(); result.push(...base); }
    }
    return result;
  }
  return new OfficeMath({ children: sequence() });
}
