import { useId } from "react";
import { Modal } from "@/shared/ui/Modal/Modal";
import {
    IconClose,
    IconLinkedIn,
    IconEmail,
    IconExternalLink,
} from "@/shared/ui/Icons";
import { useLang } from "@/shared/hooks/useLang";
import { PROFILE } from "@/shared/config/profile";
import { LINKEDIN_NOTICE_COPY } from "@/shared/config/linkedin";
import "./LinkedInNotice.css";

export function LinkedInNotice({
    destination,
    onClose,
}: {
    destination: string;
    onClose: () => void;
}) {
    const { lang } = useLang();
    const copy = LINKEDIN_NOTICE_COPY[lang];
    const id = useId();

    return (
        <Modal
            isOpen
            onClose={onClose}
            labelledBy={`${id}-title`}
            describedBy={`${id}-body`}
            className="linkedin-notice"
        >
            <button
                type="button"
                className="linkedin-notice__close"
                onClick={onClose}
                aria-label={copy.close}
            >
                <IconClose aria-hidden="true" />
            </button>
            <div className="linkedin-notice__body">
                <span className="linkedin-notice__icon" aria-hidden="true">
                    <IconLinkedIn width={26} height={26} />
                </span>
                <p className="linkedin-notice__eyebrow">{copy.eyebrow}</p>
                <h2 id={`${id}-title`}>{copy.title}</h2>
                <div id={`${id}-body`} className="linkedin-notice__description">
                    <p>{copy.body}</p>
                    <p>{copy.detail}</p>
                </div>
                <div className="linkedin-notice__actions">
                    <a
                        className="btn btn--primary"
                        href={`mailto:${PROFILE.email}`}
                    >
                        <IconEmail aria-hidden="true" />
                        {copy.email}
                    </a>
                    <button
                        type="button"
                        className="btn btn--outline"
                        onClick={onClose}
                    >
                        {copy.stay}
                    </button>
                </div>
                <a
                    className="linkedin-notice__continue"
                    href={destination}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                >
                    {copy.continue}
                    <IconExternalLink aria-hidden="true" />
                    <span className="sr-only"> ({copy.continueHint})</span>
                </a>
            </div>
        </Modal>
    );
}
