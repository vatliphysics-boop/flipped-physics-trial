from pathlib import Path
import json, re

# Rewrite specific expressions in the checked transcriptions, preserving the numbers,
# statements and answer keys. Use the same changes for both generated views.
pairs = r"""
t=5,3×ln(1/0,93)/ln2≈0,555 năm≈6,66 tháng|$t=5{,}3\,\frac{\ln(1/0{,}93)}{\ln 2}\approx0{,}555$ năm, tức khoảng $6{,}66$ tháng
H=4 Bq; N=H×T/ln2≈1,043×10¹² hạt|$H=4\,\mathrm{Bq}$, $N=\frac{HT}{\ln 2}\approx1{,}043\times10^{12}$ hạt
N₀≈(25/12)N_A/10¹²≈1,255×10¹² hạt|$N_0\approx\frac{25N_A}{12\times10^{12}}\approx1{,}255\times10^{12}$ hạt
Q=Pđiện×t/0,36≈1,2264×10¹⁷ J|$Q=\frac{P_{\text{điện}}t}{0{,}36}\approx1{,}2264\times10^{17}\,\mathrm{J}$
U-235≈1,494×10³ kg|khối lượng uranium-235 khoảng $1{,}494\times10^3\,\mathrm{kg}$
mthan=Pđiện×t/(ηthan×30×10⁶)|$m_{\text{than}}=\frac{P_{\text{điện}}t}{\eta_{\text{than}}\times30\times10^6}$
ηthan=0,36 thì≈4,088×10⁹ kg|$\eta_{\text{than}}=0{,}36$ thì $m_{\text{than}}\approx4{,}088\times10^9\,\mathrm{kg}$
tỉ lệ 1/H|tỉ lệ $\frac{1}{H}$
thời gian≈150×2^(29/(12×5,3))≈205,8 phút|thời gian khoảng $150\times2^{\frac{29}{12\times5{,}3}}\approx205{,}8$ phút
K=(3,6−2,2356)/2=0,6822 MeV|$K=\frac{3{,}6-2{,}2356}{2}=0{,}6822\,\mathrm{MeV}$
50/4=12,5 mol|$\frac{50}{4}=12{,}5\,\mathrm{mol}$
là ln2/T|là $\frac{\ln 2}{T}$
H=5800×3,7×10¹⁰ Bq|$H=5800\times3{,}7\times10^{10}\,\mathrm{Bq}$
Po≈1,433×10¹⁹, I≈3,806×10²⁰|Po khoảng $1{,}433\times10^{19}$, I khoảng $3{,}806\times10^{20}$
28,8/4=7,20 MeV/nucleon|$\frac{28{,}8}{4}=7{,}20$ MeV/nucleon
25%=1/4|$25\%=\frac14$
là 502/60 Bq|là $\frac{502}{60}\,\mathrm{Bq}$
E_{lk}/A|\frac{E_{lk}}{A}
(1000/235)|\frac{1000}{235}
\ln2/T|\frac{\ln 2}{T}
\log_2(N_0/N)|\log_2\!\left(\frac{N_0}{N}\right)
H_0T/\ln2|\frac{H_0T}{\ln 2}
2^{60/110}|2^{\frac{60}{110}}
(207/27)|\left(\frac{207}{27}\right)
(17{,}5/238)|\frac{17{,}5}{238}
^{1/3}|^{\frac{1}{3}}
56/3|\frac{56}{3}
[Zm_p+(A-Z)m_n-m]931{,}5/A|\frac{[Zm_p+(A-Z)m_n-m]931{,}5}{A}
0{,}26920\times931{,}5/30|\frac{0{,}26920\times931{,}5}{30}
\sqrt{2mc^2K}/c|\frac{\sqrt{2mc^2K}}{c}
Pt\times235/(0{,}33\times200\times1{,}602\times10^{-13}N_A)|\frac{Pt\times235}{0{,}33\times200\times1{,}602\times10^{-13}N_A}
Q/(20\times10^6)|\frac{Q}{20\times10^6}
(4\times10^{33}/12)|\frac{4\times10^{33}}{12}
N\times7{,}275\times1{,}602\times10^{-13}/P|\frac{N\times7{,}275\times1{,}602\times10^{-13}}{P}
\ln2/\lambda|\frac{\ln 2}{\lambda}
(1-e^{-2\lambda})/(1-e^{-17\lambda})=3/15|\frac{1-e^{-2\lambda}}{1-e^{-17\lambda}}=\frac{3}{15}
3N_0/4|\frac{3N_0}{4}
N_0/4|\frac{N_0}{4}
^{-2000/5730}|^{-\frac{2000}{5730}}
\log_2(980/100)|\log_2\!\left(\frac{980}{100}\right)
HT/\ln2|\frac{HT}{\ln 2}
N_{Pb}/N_{Po}|\frac{N_{Pb}}{N_{Po}}
(m/M)|\frac{m}{M}
^{-1/T}|^{-\frac{1}{T}}
(220/12)|\frac{220}{12}
(\frac{\ln 2}{T})|\frac{\ln 2}{T}
\ln(H_0/0{,}52)/\ln2|\frac{\ln(H_0/0{,}52)}{\ln 2}
(3{,}5/14)|\frac{3{,}5}{14}
5N_A/(15{,}999+2\times1{,}0078)|\frac{5N_A}{15{,}999+2\times1{,}0078}
V_U/V_{He}|\frac{V_U}{V_{He}}
238/4|\frac{238}{4}
17\times7{,}75/931{,}5|\frac{17\times7{,}75}{931{,}5}
Q/(2{,}93\times10^7)|\frac{Q}{2{,}93\times10^7}
(1000/4)|\frac{1000}{4}
Q_{He}/Q_U|\frac{Q_{He}}{Q_U}
^{-t/T}|^{-\frac{t}{T}}
^{-\lambda/t}|^{-\frac{\lambda}{t}}
m_0/16|\frac{m_0}{16}
N_0/2^x|\frac{N_0}{2^x}
(10^{-3}/144)|\frac{10^{-3}}{144}
\ln2/\ln(N_0/N)|\frac{\ln 2}{\ln\!\left(\frac{N_0}{N}\right)}
2\times10^{-6}\times3{,}7\times10^{10}/\sqrt2|\frac{2\times10^{-6}\times3{,}7\times10^{10}}{\sqrt{2}}
^{d_1/d_0}|^{\frac{d_1}{d_0}}
H_1/H_0|\frac{H_1}{H_0}
^{1-d_1/6}|^{1-\frac{d_1}{6}}
R_1/R_2|\frac{R_1}{R_2}
(8/27)|\left(\frac{8}{27}\right)
4\pi R^3/3|\frac{4\pi R^3}{3}
(10^{-3}/22{,}4)|\frac{10^{-3}}{22{,}4}
(1{,}9\times365\times86400/55)|\frac{1{,}9\times365\times86400}{55}
\ln2/3465|\frac{\ln 2}{3465}
^{t(1/2-1/3)}|^{t\left(\frac{1}{2}-\frac{1}{3}\right)}
^{t/6}|^{\frac{t}{6}}
(23{,}15/206)/(46{,}97/238)|\frac{\frac{23{,}15}{206}}{\frac{46{,}97}{238}}
^{-6/15}|^{-\frac{6}{15}}
(25000/235)|\frac{25000}{235}
0{,}25(58{,}75/235)N_A\times200\times1{,}6\times10^{-13}/86400|\frac{0{,}25\times58{,}75\times N_A\times200\times1{,}6\times10^{-13}}{235\times86400}
(58{,}75/235)|\frac{58{,}75}{235}
$$|
""".strip().splitlines()
pairs.pop()
plain = dict(line.split('|',1) for line in pairs[:17])
tex = [tuple(line.split('|',1)) for line in pairs[17:]]
single = re.compile(r'(?<![\d,])(\d+)/(\d+)(?![\d,])')
def math(m):
 s=m.group(1)
 for a,b in tex: s=s.replace(a,b)
 s=s.replace('N_0/N',r'\frac{N_0}{N}').replace('H_0/0{,}52',r'\frac{H_0}{0{,}52}')
 s=single.sub(r'\\frac{\1}{\2}',s)
 return '$'+s+'$'
def update(s):
 s=re.sub(r'\$([^$\n]+)\$', math,s)
 for a,b in plain.items(): s=s.replace(a,b)
 return s
def transform(q):
 for k in ('prompt','explanation','answerText'):
  if k in q: q[k]=update(q[k])
 if 'options' in q: q['options']=[update(s) for s in q['options']]
 for k in ('statements','rubric'):
  for s in q.get(k,[]):
   for field in ('text','explanation'):
    if field in s: s[field]=update(s[field])
for f in ['src/data/sgk-nuclear-transcriptions.json','src/data/workbook-nuclear-transcriptions.json','src/data/unified-question-bank.json','data/book-bank/unified.json']:
 p=Path(f); old=p.read_text(); items=json.loads(old)
 for q in items: transform(q)
 p.write_text(json.dumps(items,ensure_ascii=False,indent=None if f.startswith('data/') else 2)+ ('\n' if old.endswith('\n') else ''))
