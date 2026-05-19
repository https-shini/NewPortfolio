import React, { useRef } from 'react';
import { useContactForm, FieldId } from '@/features/contact/model/useContactForm';
import { useLang } from '@/shared/hooks/useLang';
import { IconSend, IconCheck } from '@/shared/ui/Icons';

export const ContactForm: React.FC = () => {
  const { t } = useLang();
  const honeypotRef = useRef<HTMLInputElement>(null);

  const {
    values, errors, validity, status, message,
    handleChange, handleBlur, handleSubmit,
  } = useContactForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(honeypotRef.current?.value ?? '');
  };

  const fieldClass = (id: FieldId) => {
    const base = 'form-field';
    if (errors[id])   return `${base} is-invalid`;
    if (validity[id]) return `${base} is-valid`;
    return base;
  };

  const isLoading = status === 'loading';
  const isSent    = status === 'sent';

  return (
    <form
      id="contact-form"
      className="contact__form"
      noValidate
      aria-label="Formulário de contato"
      onSubmit={onSubmit}
    >
      {/* Honeypot */}
      <div className="contact__honeypot" aria-hidden="true">
        <label htmlFor="hp-field">Website</label>
        <input
          type="text"
          id="hp-field"
          name="hp-field"
          ref={honeypotRef}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Row: Name + Email */}
      <div className="form-row">
        <div className={fieldClass('name')} id="wrap-name">
          <label className="form-label" htmlFor="f-name">
            Nome <span className="form-label__req" aria-hidden="true">*</span>
          </label>
          <input
            className="form-input"
            type="text"
            id="f-name"
            name="name"
            value={values.name}
            placeholder="Seu nome completo"
            autoComplete="name"
            required
            aria-required="true"
            aria-describedby="err-name"
            aria-invalid={!!errors.name}
            onChange={e => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
          />
          <span className="form-error" id="err-name" role="alert" aria-live="polite">
            {errors.name ?? ''}
          </span>
        </div>

        <div className={fieldClass('email')} id="wrap-email">
          <label className="form-label" htmlFor="f-email">
            E-mail <span className="form-label__req" aria-hidden="true">*</span>
          </label>
          <input
            className="form-input"
            type="email"
            id="f-email"
            name="email"
            value={values.email}
            placeholder="seu@email.com"
            autoComplete="email"
            required
            aria-required="true"
            aria-describedby="err-email"
            aria-invalid={!!errors.email}
            onChange={e => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
          />
          <span className="form-error" id="err-email" role="alert" aria-live="polite">
            {errors.email ?? ''}
          </span>
        </div>
      </div>

      {/* Subject */}
      <div className={fieldClass('subject')} id="wrap-subject">
        <label className="form-label" htmlFor="f-subject">
          Assunto <span className="form-label__req" aria-hidden="true">*</span>
        </label>
        <input
          className="form-input"
          type="text"
          id="f-subject"
          name="subject"
          value={values.subject}
          placeholder="Ex.: Proposta de trabalho, parceria, dúvida…"
          required
          aria-required="true"
          aria-describedby="err-subject"
          aria-invalid={!!errors.subject}
          onChange={e => handleChange('subject', e.target.value)}
          onBlur={() => handleBlur('subject')}
        />
        <span className="form-error" id="err-subject" role="alert" aria-live="polite">
          {errors.subject ?? ''}
        </span>
      </div>

      {/* Message */}
      <div className={fieldClass('message')} id="wrap-message">
        <label className="form-label" htmlFor="f-message">
          Mensagem <span className="form-label__req" aria-hidden="true">*</span>
        </label>
        <textarea
          className="form-input form-textarea"
          id="f-message"
          name="message"
          value={values.message}
          rows={5}
          placeholder="Descreva sua proposta, projeto ou dúvida…"
          required
          aria-required="true"
          aria-describedby="err-message"
          aria-invalid={!!errors.message}
          onChange={e => handleChange('message', e.target.value)}
          onBlur={() => handleBlur('message')}
        />
        <span className="form-error" id="err-message" role="alert" aria-live="polite">
          {errors.message ?? ''}
        </span>
      </div>

      {/* Submit row */}
      <div className="form-submit-row">
        <button
          type="submit"
          className="btn btn--primary btn--lg"
          id="contact-submit"
          data-state={status}
          disabled={isLoading || isSent}
          aria-describedby="contact-status"
        >
          {/* Idle */}
          {!isLoading && !isSent && (
            <span className="btn-state btn-state--idle">
              <IconSend />
              <span>{t('contact.send')}</span>
            </span>
          )}
          {/* Loading */}
          {isLoading && (
            <span className="btn-state btn-state--loading">
              <span className="spinner" aria-hidden="true" />
              <span>{t('contact.sending')}</span>
            </span>
          )}
          {/* Sent */}
          {isSent && (
            <span className="btn-state btn-state--sent">
              <IconCheck />
              <span>{t('contact.sent')}</span>
            </span>
          )}
        </button>

        {message && (
          <div
            id="contact-status"
            className={`form-status ${status === 'sent' ? 'is-success' : status === 'error' ? 'is-error' : ''}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {message}
          </div>
        )}
      </div>
    </form>
  );
};
