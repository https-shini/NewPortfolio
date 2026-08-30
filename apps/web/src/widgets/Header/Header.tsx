import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import "./Header.css";
import { useTheme } from "@/shared/hooks/useTheme";
import { useLang } from "@/shared/hooks/useLang";
import { Logo } from "@/shared/ui/Logo/Logo";
import { useScrollLock } from "@/shared/hooks/useScrollLock";
import { useFocusTrap } from "@/shared/hooks/useFocusTrap";
import { useInertBackground } from "@/shared/hooks/useInertBackground";
import { useRoute } from "@/shared/hooks/useRoute";
import { scrollToSection } from "@/shared/lib/smoothScroll";
import { IconSun, IconMoon, IconTranslate, IconClose } from "@/shared/ui/Icons";
import { SECTION_IDS, ROUTES } from "@/shared/config/constants";

const NAV_LINKS = [
    { href: SECTION_IDS.HOME, key: "nav.home" as const },
    { href: SECTION_IDS.ABOUT, key: "nav.about" as const },
    { href: SECTION_IDS.CAREER, key: "nav.career" as const },
    { href: SECTION_IDS.EDUCATION, key: "nav.education" as const },
    { href: SECTION_IDS.FEATURED, key: "nav.featured" as const },
    { href: SECTION_IDS.WORK, key: "nav.work" as const },
    { href: SECTION_IDS.RECOMMENDATIONS, key: "nav.recommendations" as const },
    { href: SECTION_IDS.CONTACT, key: "nav.contact" as const },
];

const LANG_META = {
    pt: { flag: "🇧🇷", label: "PT", switchLabel: "Switch to English" },
    en: { flag: "🇺🇸", label: "EN", switchLabel: "Mudar para Português" },
} as const;

export const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLang();
    const { isHome, navigate } = useRoute();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [observedSection, setObservedSection] = useState<string>(
        SECTION_IDS.HOME,
    );
    const [langSwitching, setLangSwitching] = useState(false);

    /* O drawer vai para um portal no <body>, e portal é coisa de navegador:
       na pré-renderização não há `document.body` para servir de destino.

       Guardar só por `typeof document` não basta e eu já errei assim: o
       servidor omitia o <nav> e o cliente o criava JÁ NO PRIMEIRO RENDER,
       então a hidratação procurava no HTML um nó que nunca fora gerado e
       falhava com "Expected server HTML to contain a matching <nav>" —
       derrubando a árvore inteira para render de cliente.

       Com o sinalizador de montagem os dois primeiros renders concordam
       (nenhum tem o portal) e o drawer entra logo depois, num efeito. Ele
       nasce fechado, então não há nada para ver nesse intervalo. */
    const montado = useSyncExternalStore(
        /* Nada muda depois de montar: a inscrição não precisa notificar. */
        () => () => {},
        () => true, // no navegador
        () => false, // na pré-renderização
    );

    const mobileNavRef = useRef<HTMLElement>(null);
    const hamburgerRef = useRef<HTMLButtonElement>(null);

    /* ── Scroll sentinel ───────────────────────────────────────────── */
    useEffect(() => {
        const sentinel = document.createElement("div");
        sentinel.style.cssText =
            "position:absolute;top:80px;left:0;width:1px;height:1px;pointer-events:none;";
        document.body.prepend(sentinel);
        const obs = new IntersectionObserver(([entry]) =>
            setIsScrolled(!entry.isIntersecting),
        );
        obs.observe(sentinel);
        return () => {
            obs.disconnect();
            sentinel.remove();
        };
    }, []);

    /* ── Active section ────────────────────────────────────────────── */
    /* O observer só existe na home: as demais rotas são páginas próprias,
       sem as seções que ele acompanha. Fora da home a seção ativa é
       derivada (nenhuma), não guardada em estado. */
    useEffect(() => {
        if (!isHome) return;

        const sections = document.querySelectorAll<HTMLElement>("section[id]");
        if (!sections.length) return;
        const margin = Math.round(window.innerHeight * 0.4);
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setObservedSection(e.target.id);
                });
            },
            { rootMargin: `-${margin}px 0px -${margin}px 0px` },
        );
        sections.forEach((s) => obs.observe(s));
        return () => obs.disconnect();
    }, [isHome]);

    const activeSection = isHome ? observedSection : "";

    const closeMenu = useCallback(() => setIsMenuOpen(false), []);

    /* O foco volta ao hambúrguer DEPOIS que o `inert` sai do #root.
       Fazer isso dentro do closeMenu não funcionava: naquele instante o
       header ainda está inerte, e `inert` bloqueia foco — a chamada era
       um no-op silencioso e o foco caía no body. Quem navega por teclado
       fechava o menu e perdia o lugar na página. Num efeito, roda depois
       do commit, com o atributo já removido. */
    const estavaAberto = useRef(false);
    useEffect(() => {
        if (estavaAberto.current && !isMenuOpen) hamburgerRef.current?.focus();
        estavaAberto.current = isMenuOpen;
    }, [isMenuOpen]);

    /* ── Drawer mobile — mesma mecânica do Modal base ──────────────── */
    useScrollLock(isMenuOpen);
    useInertBackground(mobileNavRef, isMenuOpen);
    useFocusTrap(mobileNavRef, {
        active: isMenuOpen,
        onEscape: closeMenu,
        /* O efeito acima devolve o foco, e sabe esperar o inert sair. */
        restoreFocus: false,
    });

    const handleNavClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        closeMenu();
        /* Espera a animação do drawer antes de rolar. */
        const delay = isMenuOpen ? 300 : 0;

        if (!isHome) {
            /* Fora da home a seção não existe no DOM: volta para ela e rola
               no frame seguinte, já com a página montada. */
            navigate(ROUTES.HOME);
            setTimeout(
                () => requestAnimationFrame(() => scrollToSection(id)),
                delay,
            );
            return;
        }

        setTimeout(() => scrollToSection(id), delay);
    };

    const handleLangToggle = () => {
        setLangSwitching(true);
        setTimeout(() => {
            toggleLang();
            setLangSwitching(false);
        }, 180);
    };

    const currentLang = LANG_META[lang as keyof typeof LANG_META];
    const ctaLabel = lang === "pt" ? "Fale comigo" : "Get in touch";
    const isPt = lang === "pt";
    const logoLabel = isPt
        ? "Guilherme Cruz — voltar ao início"
        : "Guilherme Cruz — back to top";
    const navMainLabel = isPt ? "Navegação principal" : "Main navigation";
    const navMenuLabel = isPt ? "Menu de navegação" : "Navigation menu";
    const menuLabel = isMenuOpen
        ? isPt
            ? "Fechar menu"
            : "Close menu"
        : isPt
          ? "Abrir menu"
          : "Open menu";
    const themeLabel =
        theme === "dark"
            ? isPt
                ? "Alternar para modo claro"
                : "Switch to light mode"
            : isPt
              ? "Alternar para modo escuro"
              : "Switch to dark mode";

    return (
        <>
            <header
                id="site-header"
                className={`header${isScrolled ? " is-scrolled" : ""}${isMenuOpen ? " is-menu-open" : ""}`}
                role="banner"
            >
                <div className="header__inner">
                    {/* ── Logo tipográfico ──────────────────────────── */}
                    <a
                        href={`#${SECTION_IDS.HOME}`}
                        className="header__logo"
                        aria-label={logoLabel}
                        onClick={(e) => handleNavClick(e, SECTION_IDS.HOME)}
                    >
                        <Logo />
                    </a>

                    {/* ── Nav desktop ───────────────────────────────── */}
                    <nav className="header__nav" aria-label={navMainLabel}>
                        {NAV_LINKS.map(({ href, key }) => (
                            <a
                                key={href}
                                href={`#${href}`}
                                className={`header__nav-link${activeSection === href ? " is-active" : ""}`}
                                onClick={(e) => handleNavClick(e, href)}
                            >
                                {t(key)}
                            </a>
                        ))}
                    </nav>

                    {/* ── Actions ───────────────────────────────────── */}
                    <div className="header__actions">
                        {/* Language pill */}
                        <button
                            className={`header__lang ${langSwitching ? "is-switching" : ""}`}
                            type="button"
                            onClick={handleLangToggle}
                            aria-label={currentLang.switchLabel}
                        >
                            <IconTranslate className="header__lang-icon" />

                            <span className="header__lang-code">
                                {currentLang.label}
                            </span>
                        </button>

                        {/* Theme toggle */}
                        <button
                            className="header__ctrl"
                            type="button"
                            onClick={toggleTheme}
                            aria-label={themeLabel}
                            aria-pressed={theme === "dark"}
                        >
                            {theme === "dark" ? <IconSun /> : <IconMoon />}
                        </button>

                        {/* Hamburger */}
                        <button
                            ref={hamburgerRef}
                            id="site-hamburger"
                            className="header__hamburger"
                            type="button"
                            aria-label={menuLabel}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-nav"
                            onClick={() => setIsMenuOpen((v) => !v)}
                        >
                            <span className="header__hamburger-bar" />
                            <span className="header__hamburger-bar" />
                            <span className="header__hamburger-bar" />
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile nav ──────────────────────────────────────── */}
            {/* Num portal para o <body>, como os demais overlays: o
                useInertBackground neutraliza os irmãos do overlay, e
                daqui de dentro do #root o drawer seria desligado junto
                com o resto da página. O CSS não sente a mudança — todo
                seletor dele é `.mobile-nav*` ou parte de `body`.

                Só depois de montado — ver a nota em `montado`, acima. */}
            {montado &&
                createPortal(
                    /* Clique no backdrop é afordância redundante de dismiss —
                   Escape e o botão hamburger cobrem teclado (focus trap ativo). */
                    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
                    <nav
                        ref={mobileNavRef}
                        id="mobile-nav"
                        className={`mobile-nav${isMenuOpen ? " is-open" : ""}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={navMenuLabel}
                        aria-hidden={!isMenuOpen}
                        onClick={(e) => {
                            if (e.target === mobileNavRef.current) closeMenu();
                        }}
                    >
                        {/* Barra própria do overlay, e não uma decoração.
                        Com o menu aberto o `useInertBackground` marca o
                        #root como inerte, e o header inteiro mora lá:
                        marca, idioma, tema e o próprio X ficavam
                        VISÍVEIS e mortos — o X não fechava o menu, só
                        Escape e o clique no fundo. Agora o header some e
                        estes controles, que estão dentro do overlay,
                        são os que respondem. */}
                        <div className="mobile-nav__topo">
                            <Logo />

                            <div className="mobile-nav__acoes">
                                <button
                                    className={`header__lang${langSwitching ? " is-switching" : ""}`}
                                    type="button"
                                    onClick={handleLangToggle}
                                    aria-label={currentLang.switchLabel}
                                >
                                    <IconTranslate className="header__lang-icon" />
                                    <span className="header__lang-code">
                                        {currentLang.label}
                                    </span>
                                </button>

                                <button
                                    className="header__ctrl"
                                    type="button"
                                    onClick={toggleTheme}
                                    aria-label={themeLabel}
                                    aria-pressed={theme === "dark"}
                                >
                                    {theme === "dark" ? (
                                        <IconSun />
                                    ) : (
                                        <IconMoon />
                                    )}
                                </button>

                                {/* O X que faltava. O do header está inerte
                                enquanto o menu existe. */}
                                <button
                                    className="header__ctrl mobile-nav__fechar"
                                    type="button"
                                    onClick={closeMenu}
                                    aria-label={menuLabel}
                                >
                                    <IconClose />
                                </button>
                            </div>
                        </div>

                        <div className="mobile-nav__links">
                            {NAV_LINKS.map(({ href, key }, i) => (
                                <a
                                    key={href}
                                    href={`#${href}`}
                                    className={`mobile-nav__link${activeSection === href ? " is-active" : ""}`}
                                    style={{ "--i": i } as React.CSSProperties}
                                    onClick={(e) => handleNavClick(e, href)}
                                >
                                    <span className="mobile-nav__link-num">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    {t(key)}
                                </a>
                            ))}
                        </div>

                        <a
                            href={`#${SECTION_IDS.CONTACT}`}
                            className="mobile-nav__cta"
                            onClick={(e) =>
                                handleNavClick(e, SECTION_IDS.CONTACT)
                            }
                        >
                            <span>{ctaLabel}</span>
                            <span aria-hidden="true">↗</span>
                        </a>
                    </nav>,
                    document.body,
                )}
        </>
    );
};
