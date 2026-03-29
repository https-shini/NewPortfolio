import React from 'react';
import './Footer.css';
import { useLang } from '@/shared/hooks/useLang';
import { scrollToSection } from '@/shared/lib/smoothScroll';
import { GITHUB_URL, LINKEDIN_URL } from '@/shared/config/constants';
import { IconGitHub, IconLinkedIn, IconHeart } from '@/shared/ui/Icons';

const NAV_LINKS = [
  { href: 'hero',     key: 'nav.home'     as const },
  { href: 'about',    key: 'nav.about'    as const },
  { href: 'timeline', key: 'nav.career'   as const },
  { href: 'work',     key: 'nav.work'     as const },
  { href: 'contact',  key: 'nav.contact'  as const },
];

const PROJECT_LINKS = [
  { href: '#featured',                                label: 'HomeMade Gourmet', external: false },
  { href: 'https://chat-frontend-g42t.onrender.com', label: 'Web Chat',         external: true  },
  { href: 'https://financas-reactjs.vercel.app',     label: 'Controle Financeiro', external: true },
  { href: GITHUB_URL,                                label: 'Ver no GitHub',    external: true  },
];

export const Footer: React.FC = () => {
  const { t } = useLang();
  const year  = new Date().getFullYear();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__brand-logo">
              <div className="footer__brand-mark" aria-hidden="true">GC</div>
              <span className="footer__brand-name">Guilherme Cruz</span>
            </div>
            <p className="footer__brand-desc">{t('footer.tagline')}</p>
            <div className="footer__brand-social">
              <a
                href={GITHUB_URL}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <IconGitHub width={16} height={16} />
              </a>
              <a
                href={LINKEDIN_URL}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <IconLinkedIn width={16} height={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="footer__col-title">{t('footer.nav')}</h3>
            <nav aria-label="Links de navegação do rodapé">
              <ul className="footer__links">
                {NAV_LINKS.map(({ href, key }) => (
                  <li key={href}>
                    <a
                      href={`#${href}`}
                      className="footer__link"
                      onClick={e => handleNavClick(e, href)}
                    >
                      {t(key)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Projects */}
          <div>
            <h3 className="footer__col-title">{t('footer.projects')}</h3>
            <ul className="footer__links">
              {PROJECT_LINKS.map(link => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="footer__link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <a
                      href={link.href}
                      className="footer__link"
                      onClick={e => handleNavClick(e, 'featured')}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="footer__col-title">{t('footer.contact')}</h3>
            <ul className="footer__links">
              <li>
                <a href="mailto:contato.guilhermescruz@gmail.com" className="footer__link">
                  E-mail
                </a>
              </li>
              <li>
                <a href={LINKEDIN_URL} className="footer__link" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <span className="footer__text">{t('footer.location')}</span>
              </li>
              <li>
                <a href="/curriculo.pdf" className="footer__link" target="_blank" rel="noopener noreferrer">
                  Download CV
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <p>
            &copy; {year} Guilherme Cruz. {t('footer.rights')}
          </p>
          <p className="footer__made">
            {t('footer.made')}
            <IconHeart className="footer__heart" />
            {t('footer.coffee')}
          </p>
        </div>
      </div>
    </footer>
  );
};
