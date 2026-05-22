import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Header.css";
import { useTheme } from "@/shared/hooks/useTheme";
import { useLang } from "@/shared/hooks/useLang";
import { scrollToSection } from "@/shared/lib/smoothScroll";
import { IconSun, IconMoon, IconTranslate } from "@/shared/ui/Icons";
import { SECTION_IDS } from "@/shared/config/constants";

const NAV_LINKS = [
    { href: SECTION_IDS.HOME,            key: "nav.home" as const },
    { href: SECTION_IDS.ABOUT,           key: "nav.about" as const },
    { href: SECTION_IDS.CAREER,          key: "nav.career" as const },
    { href: SECTION_IDS.EDUCATION,       key: "nav.education" as const },
    { href: SECTION_IDS.FEATURED,        key: "nav.featured" as const },
    { href: SECTION_IDS.WORK,            key: "nav.work" as const },
    { href: SECTION_IDS.RECOMMENDATIONS, key: "nav.recommendations" as const },
    { href: SECTION_IDS.CONTACT,         key: "nav.contact" as const },
];

const LANG_META = {
    pt: { flag: "🇧🇷", label: "PT", switchLabel: "Switch to English" },
    en: { flag: "🇺🇸", label: "EN", switchLabel: "Mudar para Português" },
} as const;

export const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLang();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>(SECTION_IDS.HOME);
    const [langSwitching, setLangSwitching] = useState(false);

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
    useEffect(() => {
        const sections = document.querySelectorAll<HTMLElement>("section[id]");
        if (!sections.length) return;
        const margin = Math.round(window.innerHeight * 0.4);
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id);
                });
            },
            { rootMargin: `-${margin}px 0px -${margin}px 0px` },
        );
        sections.forEach((s) => obs.observe(s));
        return () => obs.disconnect();
    }, []);

    /* ── Body scroll lock ──────────────────────────────────────────── */
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    /* ── Focus trap ────────────────────────────────────────────────── */
    useEffect(() => {
        if (!isMenuOpen || !mobileNavRef.current) return;
        const FOCUSABLE =
            'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
        const els = [
            ...mobileNavRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        ];
        const first = els[0];
        const last = els[els.length - 1];
        setTimeout(() => first?.focus(), 80);

        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeMenu();
                return;
            }
            if (e.key !== "Tab") return;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
            }
        };
        document.addEventListener("keydown", onKeydown);
        return () => document.removeEventListener("keydown", onKeydown);
    }, [isMenuOpen]);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
        hamburgerRef.current?.focus();
    }, []);

    const handleNavClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        closeMenu();
        setTimeout(() => scrollToSection(id), isMenuOpen ? 300 : 0);
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

    return (
        <>
            <header
                id="site-header"
                className={`header${isScrolled ? " is-scrolled" : ""}`}
                role="banner"
            >
                <div className="header__inner">
                    {/* ── Logo tipográfico ──────────────────────────── */}
                    <a
                        href={`#${SECTION_IDS.HOME}`}
                        className="header__logo"
                        aria-label="Guilherme Cruz — voltar ao início"
                        onClick={(e) => handleNavClick(e, SECTION_IDS.HOME)}
                    >
                        <span className="header__logo-dot" aria-hidden="true" />
                        <span className="header__logo-name">
                            <span className="header__logo-prefix">GCruz</span>
                            <span className="header__logo-suffix">.dev</span>
                        </span>
                    </a>

                    {/* ── Nav desktop ───────────────────────────────── */}
                    <nav
                        className="header__nav"
                        aria-label="Navegação principal"
                    >
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
                            aria-label={
                                theme === "dark"
                                    ? "Alternar para modo claro"
                                    : "Alternar para modo escuro"
                            }
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
                            aria-label={
                                isMenuOpen ? "Fechar menu" : "Abrir menu"
                            }
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
            <nav
                ref={mobileNavRef}
                id="mobile-nav"
                className={`mobile-nav${isMenuOpen ? " is-open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navegação"
                aria-hidden={!isMenuOpen}
                onClick={(e) => {
                    if (e.target === mobileNavRef.current) closeMenu();
                }}
            >
                <div className="mobile-nav__logo" aria-hidden="true">
                    <span className="header__logo-dot" />
                </div>

                {NAV_LINKS.map(({ href, key }, i) => (
                    <a
                        key={href}
                        href={`#${href}`}
                        className={`mobile-nav__link${activeSection === href ? " is-active" : ""}`}
                        style={{ "--i": i } as React.CSSProperties}
                        onClick={(e) => handleNavClick(e, href)}
                    >
                        <span className="mobile-nav__link-num">0{i + 1}</span>
                        {t(key)}
                    </a>
                ))}

                <div className="mobile-nav__controls">
                    <button
                        className={`header__lang${langSwitching ? " is-switching" : ""}`}
                        type="button"
                        onClick={handleLangToggle}
                        aria-label={currentLang.switchLabel}
                    >
                        <span className="header__lang-flag" aria-hidden="true">
                            {currentLang.flag}
                        </span>
                        <span className="header__lang-code">
                            {currentLang.label}
                        </span>
                    </button>

                    <button
                        className="header__ctrl"
                        type="button"
                        onClick={toggleTheme}
                        aria-label={
                            theme === "dark"
                                ? "Alternar para modo claro"
                                : "Alternar para modo escuro"
                        }
                    >
                        {theme === "dark" ? <IconSun /> : <IconMoon />}
                    </button>
                </div>

                <a
                    href={`#${SECTION_IDS.CONTACT}`}
                    className="mobile-nav__cta"
                    onClick={(e) => handleNavClick(e, SECTION_IDS.CONTACT)}
                >
                    <span>{ctaLabel}</span>
                    <span aria-hidden="true">↗</span>
                </a>
            </nav>
        </>
    );
};
