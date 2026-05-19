@echo off
REM ════════════════════════════════════════════════════════════════
REM  Script para commitar todas as mudanças da sessão e abrir o PR
REM  Branch: claude/pensive-goldwasser  →  main
REM
REM  Cobre toda a sessão: rebuild Carreira/Formações/Featured/
REM  Recomendações + Lightbox + audit performance/a11y/UX.
REM ════════════════════════════════════════════════════════════════

cd /d "C:\Users\Guilherme\Documents\GitHub\NewPortfolio\.claude\worktrees\adoring-nobel-8b7b91"

echo.
echo [1/4] Stage de arquivos do frontend...
git add frontend/src/ frontend/index.html

if errorlevel 1 (
    echo ERRO ao adicionar arquivos.
    pause
    exit /b 1
)

echo.
echo [2/4] Criando commit...
git commit ^
    -m "feat: portfolio overhaul - sections rebuild + lightbox + perf/a11y polish" ^
    -m "Featured (AuthService):" ^
    -m "- Replace HomeMade Gourmet with AuthService (FastAPI/JWT/Docker/Python)" ^
    -m "- Browser-mockup gallery with real screenshots and ambient backdrop blur" ^
    -m "- Images respect original proportions (object-fit: contain)" ^
    -m "- New FeaturedLightbox: full-screen modal with sidebar description," ^
    -m "  carousel navigation (arrows + dots + thumbnails), keyboard nav," ^
    -m "  touch swipe, focus trap, preload of adjacent images" ^
    -m "- Tech profile with LIVE/MIT/Docker/FastAPI/Python badges, stack chips," ^
    -m "  terminal-style API endpoints with method-colored pills, CTAs" ^
    -m "- 3 architecture cards (Layered, Security, Deploy)" ^
    -m "" ^
    -m "Recomendacoes:" ^
    -m "- Grid 2-col on desktop, auto-switches to carousel on mobile (<880px)" ^
    -m "- Premium cards with gradient quote mark, glow, tags, CTA pill" ^
    -m "- LinkedIn source badge in stats bar" ^
    -m "" ^
    -m "Carreira (Timeline):" ^
    -m "- Vertical spine timeline with company nodes (logo/initials + glow)" ^
    -m "- Refined marker with radial gradient + pulse animation for active" ^
    -m "- Accent strip on open/active position cards" ^
    -m "- Inline accordion expansion (no modal) with smooth ResizeObserver-based height" ^
    -m "" ^
    -m "Formacoes:" ^
    -m "- Filter pills (Tudo/Academico/Certificacoes)" ^
    -m "- Achievement-style cards with progress bar + shimmer for in-progress" ^
    -m "- 'Ver mais' button (4 items initially when filter='Todos') with smooth scroll back on collapse" ^
    -m "" ^
    -m "Performance:" ^
    -m "- Preconnect to skillicons.dev + dns-prefetch raw.githubusercontent.com" ^
    -m "- decoding=async on all external imgs" ^
    -m "- width/height on RecommendationCard avatar and Lightbox thumbnails (less CLS)" ^
    -m "" ^
    -m "Accessibility:" ^
    -m "- @media prefers-reduced-motion in About.css, Work.css, Header.css" ^
    -m "- Skip-link is now bilingual (PT/EN)" ^
    -m "- IconProps aria-hidden accepts boolean OR string for JSX-literal compat" ^
    -m "- Back-to-top has aria-hidden when offscreen, tabIndex=-1" ^
    -m "" ^
    -m "UX additions:" ^
    -m "- Scroll progress bar at the top (rAF-driven, no React churn)" ^
    -m "- Back-to-top button after 720px (lift + glow on hover)" ^
    -m "- Dynamic theme-color meta (mobile browser bar follows dark/light)" ^
    -m "" ^
    -m "Infrastructure:" ^
    -m "- LangContext (React Context) sharing i18n state across all widgets" ^
    -m "- Fix React fetchPriority warning by removing unsupported prop" ^
    -m "- New IconShield, IconLock, ScrollUtils components" ^
    -m "- ~40 new i18n keys covering both languages" ^
    -m "- Modality enum stabilized (replaces TimelineModality reference)" ^
    -m "- Career data uses stable tokens (CLT/INTERNSHIP/ON_SITE) instead of localized strings"

if errorlevel 1 (
    echo ERRO ao criar commit. Verifique se ha mudancas para commitar.
    pause
    exit /b 1
)

echo.
echo [3/4] Push para origin/claude/pensive-goldwasser...
git push -u origin claude/pensive-goldwasser

if errorlevel 1 (
    echo ERRO ao fazer push.
    pause
    exit /b 1
)

echo.
echo [4/4] Criando PR no GitHub...
where gh >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================================
    echo  gh CLI nao encontrado.
    echo  Abra este link para criar o PR manualmente:
    echo.
    echo  https://github.com/https-shini/NewPortfolio/compare/main...claude/pensive-goldwasser?expand=1
    echo ============================================================
    echo.
    start "" "https://github.com/https-shini/NewPortfolio/compare/main...claude/pensive-goldwasser?expand=1"
    pause
    exit /b 0
)

gh pr create --draft --base main --head claude/pensive-goldwasser ^
    --title "feat: portfolio overhaul - sections rebuild + lightbox + perf/a11y polish" ^
    --body "## Summary^

Comprehensive overhaul of the portfolio: rebuilt **Featured (Projeto em Destaque)**, **Recomendacoes**, **Carreira** and **Formacoes** sections from scratch, added a full-screen image **lightbox**, plus a global performance / accessibility / UX pass.^
^
### Featured (AuthService)^
- Replaced HomeMade Gourmet with **AuthService** (FastAPI / JWT / bcrypt / Docker / Python)^
- **Browser-mockup gallery** with real screenshots and ambient backdrop blur^
- Images respect original proportions (`object-fit: contain`)^
- **NEW FeaturedLightbox**: full-screen modal with sidebar description, carousel nav (arrows + dots + thumbnails), keyboard (Arrow/Esc/Home/End), touch swipe, focus trap, image preload^
- Tech profile with badges (LIVE/MIT/Docker/FastAPI/Python 3.11), stack chips, terminal-style API endpoints, CTAs^
- 3 architecture cards (Layered / Security / Deploy)^
^
### Recomendacoes^
- **Grid 2-col on desktop**, auto-switches to carousel on mobile (<880px)^
- Premium cards with gradient quote mark, glow, tags, CTA pill^
- LinkedIn source badge in stats bar^
^
### Carreira (Timeline)^
- **Vertical spine timeline** with company nodes (logo/initials + glow + pulse for active)^
- Accent strip on open/active position cards^
- **Inline accordion** expansion (no modal) with ResizeObserver-based smooth height^
^
### Formacoes^
- Filter pills (Tudo/Academico/Certificacoes)^
- Achievement-style cards with progress bar + shimmer for in-progress education^
- **Ver mais** button (4 items initially when filter='Todos') with smooth scroll-back on collapse^
^
### Performance^
- Preconnect to skillicons.dev + dns-prefetch raw.githubusercontent.com^
- `decoding=async` on all external imgs^
- width/height on RecommendationCard avatar and Lightbox thumbnails (less CLS)^
^
### Accessibility^
- `@media (prefers-reduced-motion: reduce)` in About.css, Work.css, Header.css^
- Skip-link is now bilingual (PT/EN)^
- IconProps aria-hidden accepts boolean OR string (JSX-literal compat)^
- Back-to-top: aria-hidden when offscreen, tabIndex=-1^
^
### UX additions^
- **Scroll progress bar** at top (rAF-driven, no React churn)^
- **Back-to-top** button after 720px (lift + glow on hover)^
- **Dynamic theme-color** meta (mobile browser bar follows dark/light)^
^
### Infrastructure^
- **LangContext** (React Context) sharing i18n state across all widgets^
- Fix React `fetchPriority` warning by removing unsupported prop^
- New `IconShield`, `IconLock`, `ScrollUtils` components^
- ~40 new i18n keys covering both languages^
- `Modality` enum stabilized (replaces `TimelineModality` reference)^
- Career data uses stable tokens (CLT/INTERNSHIP/ON_SITE) instead of localized strings^
^
## Test plan^
- [ ] Run `npm run dev` and verify all sections render in PT and EN^
- [ ] Click any Featured image to open lightbox; navigate with arrows / dots / thumbnails / keyboard / touch swipe^
- [ ] Resize browser to <880px: Recomendacoes switches to carousel; Formacoes grid collapses^
- [ ] Click position card in Carreira: accordion expands smoothly^
- [ ] Filter Formacoes (Tudo/Academico/Certificacoes); 'Ver mais' shows extra items^
- [ ] Toggle theme: browser bar color updates on mobile (dark <-> light)^
- [ ] Scroll: progress bar at top fills; back-to-top button appears after 720px^
- [ ] Enable 'Reduce motion' in OS: animations stop^
- [ ] `npx tsc --noEmit` returns 0 errors"

echo.
echo PR criado com sucesso!
pause
