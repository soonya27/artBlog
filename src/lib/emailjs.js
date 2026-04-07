const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
}

export function isEmailJsConfigured() {
  return Boolean(
    emailjsConfig.serviceId &&
    emailjsConfig.templateId &&
    emailjsConfig.publicKey
  )
}

export async function sendContactEmail(templateParams) {
  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: emailjsConfig.serviceId,
      template_id: emailjsConfig.templateId,
      user_id: emailjsConfig.publicKey,
      template_params: templateParams,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'EmailJS request failed')
  }

  return response.text()
}
