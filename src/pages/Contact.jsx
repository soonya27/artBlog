import { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import { defaultSiteSettings, fetchSiteSettings } from '../lib/siteSettings'
import { isEmailJsConfigured, sendContactEmail } from '../lib/emailjs'
import styles from './Contact.module.css'

export default function Contact() {
  const [settings, setSettings] = useState(defaultSiteSettings)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSiteSettings()
      setSettings(data)
      setLoading(false)
    }

    loadSettings()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitForm = async (event) => {
    event.preventDefault()

    if (!isEmailJsConfigured()) {
      setError('EmailJS 환경변수가 설정되지 않아 메일을 보낼 수 없습니다.')
      setSuccess('')
      return
    }

    setSending(true)
    setError('')
    setSuccess('')

    try {
      await sendContactEmail({
        name: form.name.trim(),
        email: form.email.trim(),
        title: form.subject.trim() || `${form.name.trim() || '방문자'}님의 문의`,
        message: form.message.trim(),
        submitted_at: new Date().toLocaleString('ko-KR'),
        contact_email: settings.contact_email,
      })

      setSuccess('문의 메일이 전송되었습니다.')
      setForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch (submitError) {
      setError('메일 전송에 실패했습니다. EmailJS 설정을 확인해주세요.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Contact</p>
            <h1 className={styles.title}>함께 이야기해봐요</h1>
            <p className={styles.subtitle}>{settings.contact_intro}</p>
          </div>
          <div className={styles.emailCard}>
            <span className={styles.emailLabel}>Delivery</span>
            {settings.contact_email ? (
              <p className={styles.emailLink}>{settings.contact_email}</p>
            ) : (
              <p className={styles.statusText}>문의 폼으로 메일이 전송됩니다.</p>
            )}
            <p className={styles.statusHint}>
              이 주소는 관리자 설정에서 변경할 수 있고, 메일 전송에도 같은 주소가 사용됩니다.
            </p>
          </div>
        </section>

        <section className={styles.formSection}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : (
            <form className={styles.form} onSubmit={submitForm}>
              <label className={styles.field}>
                <span className={styles.label}>이름</span>
                <input
                  className="input-base"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="이름 또는 브랜드명"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>이메일</span>
                <input
                  className="input-base"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="reply@example.com"
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>제목</span>
                <input
                  className="input-base"
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="문의 제목"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>메시지</span>
                <textarea
                  className={`input-base ${styles.textarea}`}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="문의 내용을 적어주세요."
                  required
                />
              </label>

              <button type="submit" className="btn-primary" disabled={sending}>
                {sending ? '전송 중...' : '이메일 보내기'}
              </button>

              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
