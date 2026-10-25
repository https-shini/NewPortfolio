import { lazy, Suspense, useState, type AnchorHTMLAttributes } from "react";
import { useLang } from "@/shared/hooks/useLang";
import {
    isOwnLinkedInProfile,
    linkedInNoticePath,
    LINKEDIN_NOTICE_COPY,
} from "@/shared/config/linkedin";

const LinkedInNotice = lazy(() =>
    import("./LinkedInNotice/LinkedInNotice").then((m) => ({
        default: m.LinkedInNotice,
    })),
);

type ProfileLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
};

/** Links comuns mantêm seu comportamento. O perfil do LinkedIn exige uma
 * confirmação e usa um destino interno também no menu de contexto/nova aba. */
export function ProfileLink({
    href,
    onClick,
    children,
    ...props
}: ProfileLinkProps) {
    const { lang } = useLang();
    const [open, setOpen] = useState(false);
    if (!isOwnLinkedInProfile(href))
        return (
            <a {...props} href={href} onClick={onClick}>
                {children}
            </a>
        );
    const copy = LINKEDIN_NOTICE_COPY[lang];

    return (
        <>
            <a
                {...props}
                href={linkedInNoticePath(href, lang)}
                aria-haspopup="dialog"
                aria-label={
                    props["aria-label"]
                        ? `${props["aria-label"]} — ${copy.linkHint}`
                        : undefined
                }
                onClick={(event) => {
                    onClick?.(event);
                    if (
                        event.defaultPrevented ||
                        event.button !== 0 ||
                        event.ctrlKey ||
                        event.metaKey ||
                        event.shiftKey ||
                        event.altKey
                    )
                        return;
                    event.preventDefault();
                    setOpen(true);
                }}
            >
                {children}
            </a>
            {open && (
                <Suspense fallback={null}>
                    <LinkedInNotice
                        destination={href}
                        onClose={() => setOpen(false)}
                    />
                </Suspense>
            )}
        </>
    );
}
