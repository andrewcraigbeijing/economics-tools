#!/usr/bin/env python3
"""Index supplied compilations privately; publish only references and suggested tags."""
import argparse,collections,hashlib,json,re,subprocess
from pathlib import Path
CODE=r'(?:\d{2}[MN]|SPM)\.[123]\.(?:HL|SL)\.TZ\d+\.\d+'
HEADER=re.compile(r'(?m)(?:^|(?<=\f))[ \t]*(\d+)\.[ \t]*\[Maximum mark:[ \t]*(\d+)\][ \t\n]*('+CODE+r')')
PART=re.compile(r'(?m)(?:^|(?<=\f))[ \t]*\(([a-z](?:\.[ivx]+)?)\)[ \t]*')
TOPICS=[
 (1,'Scarcity and opportunity cost',r'scarcity|opportunity cost|production possibilities|\bppc\b|\bppf\b'),
 (2,'Demand and supply',r'demand and supply|supply and demand|competitive market|market equilibrium'),
 (2,'Price controls',r'price ceiling|price floor|maximum price|minimum price|minimum wage|rent control'),
 (2,'Elasticity',r'elasticity|\bped\b|\bpes\b|\byed\b'),
 (2,'Indirect taxes and subsidies',r'indirect tax|subsid|ad valorem|specific tax'),
 (2,'Externalities and market failure',r'externalit|market failure|socially optim|social optimum|social cost|social benefit'),
 (2,'Public goods and common resources',r'public goods|common pool|common access|common-pool|non.exclud|overfish'),
 (2,'Market power and firms',r'monopol|oligopol|perfect competition|market power|profit maxim|marginal cost|marginal revenue|average cost|\bfirm\b'),
 (2,'Behavioural economics',r'bounded rationality|rational consumer|nudge|utility|maximi.ing behaviour'),
 (2,'Asymmetric information',r'asymmetric information|moral hazard|adverse selection'),
 (3,'AD and AS',r'\bad/as\b|aggregate demand|aggregate supply|\blras\b|\bsras\b'),
 (3,'Inflation and price stability',r'inflation|deflation|price stability|consumer price index|\bcpi\b'),
 (3,'Unemployment',r'unemployment|labour force|labor force|unemployed'),
 (3,'Fiscal policy and public finances',r'fiscal|government spending|budget deficit|government debt|progressive tax|taxation|income tax|transfer payments'),
 (3,'Monetary policy and banking',r'monetary|interest rate|money supply|quantitative easing|commercial banks|create money'),
 (3,'Growth and national income',r'economic growth|gross domestic|real gdp|nominal gdp|national income|gross national|\bgni\b'),
 (3,'Inequality and poverty',r'inequality|poverty|gini|lorenz|income distribution'),
 (3,'Supply-side policy',r'supply.side|potential output|productive capacity|privati.ation|deregulation'),
 (4,'International trade',r'international trade|comparative advantage|absolute advantage|exports|export revenue|world price'),
 (4,'Trade protection',r'tariff|quota|protectionism|trade protection|trade barrier'),
 (4,'Economic integration',r'common market|customs union|trading bloc|monetary union|free trade agreement|economic integration'),
 (4,'Exchange rates',r'exchange rate|appreciat|depreciat|devaluat|currency|currencies'),
 (4,'Balance of payments',r'balance of payments|current account|financial account|capital account|balance of trade'),
 (4,'Economic development',r'development|human development|human capital|foreign aid|microcredit|microfinance|foreign direct investment|\bfdi\b'),
 (4,'Sustainability',r'sustainab|environment|carbon|climate|renewable')]
COMMANDS=['define','explain','evaluate','discuss','examine','analyse','analyze','calculate','determine','outline','distinguish','identify','state','suggest','recommend','sketch','draw','construct','justify','compare']
def compact(s):return ' '.join(s.split())
def build(paths,out,public_path):
 out.mkdir(parents=True,exist_ok=True);documents=[];questions=[]
 for path in paths:
  path=path.resolve();target=out/(path.stem+'.txt');subprocess.run(['pdftotext','-layout',str(path),str(target)],check=True,capture_output=True)
  text=target.read_text();pages=text.split('\f');pages=pages[:-1]if not pages[-1].strip()else pages
  source='past-paper-'+hashlib.sha256(path.name.encode()).hexdigest()[:10]
  document={'id':source,'file':path.name,'path':str(path),'text_path':str(target),'pages':len(pages),'characters':len(text),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'low_text_pages':[i+1 for i,p in enumerate(pages)if len(p.strip())<80]};documents.append(document)
  headers=list(HEADER.finditer(text));seen_codes=set()
  for i,h in enumerate(headers):
   ref=h[3];assert ref not in seen_codes,ref;seen_codes.add(ref)
   end=headers[i+1].start()if i+1<len(headers)else len(text);body=text[h.end():end];parts=[]
   for m in PART.finditer(body):
    if any(p['label']==m[1]for p in parts):continue
    tail=body[m.end():];mark=re.search(r'\[(\d{1,2})\]',tail)
    if not mark or mark.start()>3000:continue
    prompt=compact(tail[:mark.start()])
    if 'Markscheme'in prompt or 'Examiners report'in prompt:continue
    parts.append({'label':m[1],'prompt':prompt,'marks':int(mark[1]),'page':text.count('\f',0,h.end()+m.start())+1})
   session,paper,level,zone,number=ref.split('.');paper=int(paper);year=None if session=='SPM'else 2000+int(session[:2]);legacy=year is not None and year<2022
   prompt_text=' '.join(p['prompt']for p in parts);tags=[(unit,label)for unit,label,pat in TOPICS if re.search(pat,prompt_text,re.I)]
   if not tags:tags=[(0,'Topic needs review')]
   commands=[c for c in COMMANDS if re.search(r'\b'+c+r'\b',prompt_text,re.I)];part_sum=sum(p['marks']for p in parts);expected={1:25,2:40,3:30}[paper];flags=[]
   if not parts:flags.append('No question prompts extracted; use the PDF.')
   if part_sum!=int(h[2]):flags.append(f'Extracted subpart marks total {part_sum}, while the compilation header lists {h[2]}. Check the PDF for missing image-based parts or inconsistent totals.')
   if not legacy and int(h[2])!=expected:flags.append(f'Compilation header total {h[2]} differs from the current-format reference total {expected}. Do not use it unchecked in a mock.')
   if paper in [2,3]or re.search(r'using (?:the )?(?:table|figure)|shown (?:in|below)',prompt_text,re.I):flags.append('Source tables, diagrams or stimulus may contain image-only content. Use the PDF for complete practice.')
   if legacy:flags.append('Pre-2022 material: verify syllabus relevance and exam format before reuse.')
   q={'id':ref,'source':source,'sourceFile':path.name,'pageStart':text.count('\f',0,h.start())+1,'pageEnd':min(len(pages),text.count('\f',0,max(h.start(),end-1))+1),'paper':paper,'sourceLevel':level,'year':year,'session':'Specimen (undated)'if year is None else ('May 'if session[2]=='M'else'November ')+str(year),'zone':zone,'question':int(number),'headerMarks':int(h[2]),'extractedMarks':part_sum,'subparts':len(parts),'commands':commands,'topics':[t[1]for t in tags],'units':sorted({t[0]for t in tags if t[0]}),'legacy':legacy,'hasMarkscheme':'Markscheme'in body,'hasReport':'Examiners report'in body,'flags':flags,'parts':parts,'sourceText':body,'promptHash':hashlib.sha256(re.sub('[^a-z0-9]','',prompt_text.lower()).encode()).hexdigest()if parts else ref}
   questions.append(q)
 references=[q['id']for q in questions];assert len(references)==len(set(references)),'Duplicate reference code across files'
 groups=collections.defaultdict(list)
 for q in questions:groups[q['promptHash']].append(q['id'])
 for q in questions:q['matchingRefs']=[ref for ref in groups[q['promptHash']]if ref!=q['id']]
 private={'documents':documents,'questions':questions,'notes':['Full extracted text, markschemes and reports are private reference material.','Figures, tables and some questions are image-based; extracted text is not a complete replacement for the PDFs.','Topic and skill tags are automatic suggestions, not official syllabus classifications.','Matching-prompt groups are based only on extracted prompt text, not proof of identical stimulus/figures.']}
 (out/'question-index.json').write_text(json.dumps(private,ensure_ascii=False,indent=2));(out/'manifest.json').write_text(json.dumps(documents,indent=2))
 for q in questions:
  target=out/'questions'/f"{q['id']}.txt";target.parent.mkdir(exist_ok=True);target.write_text(f"Reference: {q['id']}\nSource: {q['sourceFile']}\nPDF pages: {q['pageStart']}–{q['pageEnd']}\n\n"+q['sourceText'])
 public=[{k:v for k,v in q.items()if k not in ['parts','sourceText','promptHash']}for q in questions]
 sources=[{'id':d['id'],'title':d['file'],'note':f"{d['pages']}-page past-paper compilation with questions and marking material. Full extracted text and PDFs are private; figures/tables may be image-based."}for d in documents]
 stats={'documents':len(documents),'pages':sum(d['pages']for d in documents),'references':len(questions),'matchingPromptGroups':len(groups),'matchedGroups':sum(len(v)>1 for v in groups.values()),'byPaper':dict(collections.Counter(q['paper']for q in questions)),'legacyReferences':sum(q['legacy']for q in questions),'flaggedReferences':sum(bool(q['flags'])for q in questions)}
 public_path.write_text('/* Source references and automatically suggested tags; no full exam text or markschemes. */\nKB.sources.push(...'+json.dumps(sources,ensure_ascii=False,indent=2)+');\nwindow.ECON_PAST_PAPERS='+json.dumps({'stats':stats,'questions':public},ensure_ascii=False,indent=2)+';\n')
 (out/'catalogue.json').write_text(json.dumps({'stats':stats,'questions':public},ensure_ascii=False,indent=2));print(json.dumps(stats,indent=2))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('pdfs',nargs='+',type=Path);p.add_argument('--output',type=Path,required=True);p.add_argument('--public-data',type=Path,required=True);a=p.parse_args();build(a.pdfs,a.output,a.public_data)
