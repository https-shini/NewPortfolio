import { FORM_ENDPOINT, AUTHOR_EMAIL } from '@/shared/config/constants';

export interface ContactPayload {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

function isConfigured(): boolean {
  return !FORM_ENDPOINT.includes('CONFIGURE');
}

export async function sendContactForm(payload: ContactPayload): Promise<void> {
  if (!isConfigured()) {
    // Dev fallback: open mailto
    const subject = encodeURIComponent(payload.subject || 'Mensagem do portfólio');
    const body    = encodeURIComponent(
      `Nome: ${payload.name}\nE-mail: ${payload.email}\n\n${payload.message}`,
    );
    window.open(`mailto:${AUTHOR_EMAIL}?subject=${subject}&body=${body}`, '_blank');
    return;
  }

  const response = await fetch(FORM_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? `HTTP ${response.status}`);
  }
}
