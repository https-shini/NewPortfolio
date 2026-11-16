from pathlib import Path
import re,json
root=Path('apps/web/src')
old=(root/'pages/Services/index.tsx').read_text(encoding='utf-8')
(Path('artifacts/services-strategy')/'original-page.tsx').write_text(old,encoding='utf-8')
q=root/'pages/Quote'; q.mkdir(exist_ok=True)
for name in ['QuoteForm.tsx','Estimate.tsx','selectionSummary.ts','contact.ts']:
    p=root/'pages/Services'/name
    s=p.read_text(encoding='utf-8').replace('"./content"','"@/shared/config/servicesContent"')
    (q/name).write_text(s,encoding='utf-8'); p.unlink()
p=root/'pages/Services/content.ts'
(root/'shared/config/servicesContent.ts').write_text(p.read_text(encoding='utf-8').replace('Sob orçamento','Sob consulta'),encoding='utf-8')
p.write_text('export { COPY, FAQ_ITEMS, PROJECT_COPY } from "@/shared/config/servicesContent";\n',encoding='utf-8')
shared=root/'shared/ui/Commercial';shared.mkdir(exist_ok=True)
p=root/'pages/Services/Services.css'
(shared/'Commercial.css').write_text(p.read_text(encoding='utf-8'),encoding='utf-8')
p.write_text('',encoding='utf-8')
p=root/'shared/config/serviceCatalog.ts';s=p.read_text(encoding='utf-8')
idx=s.index('    offer(',s.index('export const CUSTOM_SERVICES'))
s=s[:idx]+'''    offer("bespoke-website", "service", "web", "Criação de Sites Personalizados", "Custom Website Development", undefined, "quote",
        "Site personalizado: necessidades, referências e viabilidade avaliadas por e-mail; escopo, prazo e investimento definidos na proposta",
        "Custom website: requirements, references and feasibility assessed by email; scope, timeline and investment defined in the proposal", [], []),
    offer("custom-it", "service", "support", "Serviço Personalizado de TI", "Custom IT Service", undefined, "quote",
        "Demanda técnica fora do catálogo, sujeita a análise de viabilidade e negociação individual por e-mail",
        "Technical request outside the catalog, subject to feasibility assessment and individual discussion by email", [], []),
'''+s[idx:];p.write_text(s,encoding='utf-8')
p=root/'shared/config/routes.ts';s=p.read_text(encoding='utf-8').replace('SERVICES: "/servicos",','SERVICES: "/servicos",\n    QUOTE: "/orcamento",');p.write_text(s,encoding='utf-8')
p=root/'shared/config/links.ts';s=p.read_text(encoding='utf-8').replace('.includes(href);','.includes(href.split(/[?#]/)[0].replace(/\\/$/, "") || "/");');p.write_text(s,encoding='utf-8')
p=root/'app/RouterContext.tsx';s=p.read_text(encoding='utf-8').replace('    path: string;','    path: string;\n    search: string;')
s=s.replace('    /* Botões voltar', '    const [search, setSearch] = useState(() => window.location.search);\n\n    /* Botões voltar')
s=s.replace('const handlePopState = () =>\n            setPath(normalize(window.location.pathname));','const handlePopState = () => {\n            setPath(normalize(window.location.pathname));\n            setSearch(window.location.search);\n        };')
s=s.replace('        const next = normalize(to);\n        if (normalize(window.location.pathname) === next) return;','        const destination = new URL(to, window.location.origin);\n        if (destination.origin !== window.location.origin) return;\n        const next = normalize(destination.pathname);')
s=s.replace('        const destination = new URL(next, window.location.origin);\n        if (lang) destination.searchParams.set(LANG_PARAM, lang);','        if (lang && !destination.searchParams.has(LANG_PARAM)) destination.searchParams.set(LANG_PARAM, lang);\n        if (next === normalize(window.location.pathname) && destination.search === window.location.search && destination.hash === window.location.hash) return;')
s=s.replace('destination.pathname + destination.search,','next + destination.search + destination.hash,').replace('        setPath(next);','        setPath(next);\n        setSearch(destination.search);').replace('value={{ path, navigate,','value={{ path, search, navigate,');p.write_text(s,encoding='utf-8')
p=root/'app/routes.tsx';s=p.read_text(encoding='utf-8').replace('const ContactPage = lazy','const QuotePage = lazy(() => import("@/pages/Quote").then(m => ({default: m.QuotePage})));\nconst ContactPage = lazy').replace('const { path } = useRoute();','const { path, search } = useRoute();').replace(') : path === ROUTES.CONTACT ? (',') : path === ROUTES.QUOTE ? (\n                <Suspense fallback={null}><QuotePage key={search} /></Suspense>\n            ) : path === ROUTES.CONTACT ? (');p.write_text(s,encoding='utf-8')
# Keep established clauses verbatim while rebuilding the page composition.
sections={}
for id in ['indicacoes','experiencia','avulsos','empresas','duvidas']:
    start=old.index('                <section\n                    id="'+id+'"')
    end=old.index('                </section>',start)+len('                </section>')
    sections[id]=old[start:end]
for id in sections:
    s=sections[id]
    s=re.sub(r'href="#simulador"\s+onClick=\{\(\) => choose\(s.id\)\}', 'href={quoteUrl({offerId: s.id}, lang)} onClick={follow}',s)
    s=s.replace('onSelect={() => choose(p.id)}','')
    s=s.replace('href="#orcamento"','href={quoteUrl({interest: "referral"}, lang)}',1).replace('onClick={() => setInterest("referral")}','onClick={follow}')
    s=s.replace('href="#orcamento"','href={quoteUrl({interest: "partner"}, lang)}').replace('onClick={() => setInterest("partner")}','onClick={follow}')
    s=s.replace('                        defaultOpen\n','')
    sections[id]=s
Path('artifacts/services-strategy/sections.json').write_text(json.dumps(sections),encoding='utf-8')
