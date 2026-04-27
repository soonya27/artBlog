import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import Header from "../components/common/Header";
import { defaultSiteSettings, fetchSiteSettings } from "../lib/siteSettings";
import { isEmailJsConfigured, sendContactEmail } from "../lib/emailjs";
import styles from "./Contact.module.css";

export default function Contact() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSiteSettings();
      setSettings(data);
      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("이름, 이메일, 메시지를 모두 입력해 주세요.");
      setSuccess("");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("올바른 이메일 주소를 입력해 주세요.");
      setSuccess("");
      return;
    }

    if (!isEmailJsConfigured()) {
      setError("EmailJS 환경변수가 설정되지 않아 메일을 보낼 수 없습니다.");
      setSuccess("");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      await sendContactEmail({
        name: form.name.trim(),
        email: form.email.trim(),
        title: form.subject.trim() || `${form.name.trim() || "방문자"}님의 문의`,
        message: form.message.trim(),
        submitted_at: new Date().toLocaleString("ko-KR"),
        contact_email: settings.contact_email,
      });

      setSuccess("편지가 전송되었습니다 ✉");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (submitError) {
      setError("메일 전송에 실패했습니다. EmailJS 설정을 확인해주세요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          {/* <div className={styles.eyebrow}>contact</div> */}
          <h1 className={styles.title}>Contact Me</h1>
          <p className={styles.subtitle}>{settings.contact_intro}</p>
          {settings.contact_email && (
            <div className={styles.recipient}>
              <span className={styles.recipientLabel}>to</span>
              <span className={styles.recipientValue}>{settings.contact_email}</span>
            </div>
          )}
        </section>

        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : (
          <form className={styles.form} onSubmit={submitForm}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>이름</label>
                <input className="input-base" type="text" name="name" value={form.name} onChange={handleChange} placeholder="이름 또는 브랜드명" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>이메일</label>
                <input className="input-base" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>제목</label>
              <input className="input-base" type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="제목을 작성해주세요." />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>메시지</label>
              <textarea className={`input-base ${styles.textarea}`} name="message" value={form.message} onChange={handleChange} placeholder="하고 싶은 말을 편하게 적어주세요." required />
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.submitRow}>
              {/* <span className={styles.privacy}>이메일은 답장 외에는 사용되지 않습니다.</span> */}
              <button type="submit" disabled={sending} className={`btn-primary ${styles.submitBtn}`}>
                <Send size={14} />
                <span>{sending ? "전송 중..." : "편지 부치기"}</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
