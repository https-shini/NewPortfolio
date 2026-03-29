import { useState, useCallback } from 'react';
import { sendContactForm, ContactPayload } from '@/services/api';

export type FieldId = 'name' | 'email' | 'subject' | 'message';
export type SubmitState = 'idle' | 'loading' | 'sent' | 'error';

type FieldErrors = Partial<Record<FieldId, string>>;
type FieldValidity = Partial<Record<FieldId, boolean>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATORS: Record<FieldId, (v: string) => string> = {
  name:    v => v.trim().length < 2    ? 'Informe seu nome completo (mínimo 2 caracteres).' : '',
  email:   v => !EMAIL_RE.test(v.trim()) ? 'Informe um e-mail válido (ex: nome@dominio.com).' : '',
  subject: v => v.trim().length < 3    ? 'O assunto deve ter pelo menos 3 caracteres.' : '',
  message: v => v.trim().length < 10   ? 'A mensagem deve ter pelo menos 10 caracteres.' : '',
};

const INITIAL_VALUES: Record<FieldId, string> = {
  name: '', email: '', subject: '', message: '',
};

export function useContactForm() {
  const [values,    setValues]    = useState<Record<FieldId, string>>(INITIAL_VALUES);
  const [errors,    setErrors]    = useState<FieldErrors>({});
  const [validity,  setValidity]  = useState<FieldValidity>({});
  const [status,    setStatus]    = useState<SubmitState>('idle');
  const [message,   setMessage]   = useState('');

  const validateField = useCallback((id: FieldId, value: string): boolean => {
    const err = VALIDATORS[id](value);
    setErrors(prev => ({ ...prev, [id]: err }));
    setValidity(prev => ({ ...prev, [id]: !err && value.trim() !== '' }));
    return !err;
  }, []);

  const handleChange = useCallback((id: FieldId, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }));
    // Re-validate reactively only if field was already invalid
    if (errors[id]) validateField(id, value);
  }, [errors, validateField]);

  const handleBlur = useCallback((id: FieldId) => {
    validateField(id, values[id]);
  }, [values, validateField]);

  const validateAll = useCallback((): boolean => {
    const results = (Object.keys(VALIDATORS) as FieldId[]).map(id => {
      const err = VALIDATORS[id](values[id]);
      setErrors(prev => ({ ...prev, [id]: err }));
      setValidity(prev => ({ ...prev, [id]: !err && values[id].trim() !== '' }));
      return !err;
    });
    return results.every(Boolean);
  }, [values]);

  const handleSubmit = useCallback(async (honeypot: string) => {
    if (!validateAll()) return;
    // Honeypot check — silent abort
    if (honeypot) {
      setStatus('sent');
      setMessage('✓ Mensagem enviada com sucesso!');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const payload: ContactPayload = {
        name:    values.name,
        email:   values.email,
        subject: values.subject,
        message: values.message,
      };
      await sendContactForm(payload);
      setStatus('sent');
      setMessage('✓ Mensagem enviada com sucesso! Responderei em até 24 horas.');
      setValues(INITIAL_VALUES);
      setErrors({});
      setValidity({});
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('[contact]', err);
      setStatus('error');
      setMessage('✗ Não foi possível enviar. Escreva diretamente para contato.guilhermescruz@gmail.com');
      setStatus('idle');
    }
  }, [values, validateAll]);

  return {
    values, errors, validity, status, message,
    handleChange, handleBlur, handleSubmit,
  };
}
