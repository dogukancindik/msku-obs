import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { checkPassword, nameFromEmail, useApp } from '../lib/store';
import { Logo } from '../components/ui';
import { LangMenu } from '../components/Shell';
import { t } from '../lib/i18n';
import { EMAIL_DOMAIN } from '../data/msku';
import { cx } from '../lib/util';

const LAST_USER = 'msku.lastUser';
const EDEVLET_URL = 'https://giris.turkiye.gov.tr/Giris/gir';

export default function Login() {
  const { login } = useApp();
  const [user, setUser] = useState(() => {
    try { return localStorage.getItem(LAST_USER) ?? ''; } catch { return ''; }
  });
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [err, setErr] = useState<{ user?: string; pw?: string }>({});
  const [busy, setBusy] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const locked = lockUntil > now;
  useEffect(() => {
    if (!lockUntil) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [lockUntil]);

  const typedDomain = user.includes('@');
  const email = typedDomain ? user.trim().toLowerCase() : user.trim() ? `${user.trim().toLowerCase()}${EMAIL_DOMAIN}` : '';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!user.trim()) next.user = t('Kurumsal e-posta adresinizi veya kullanıcı adınızı yazın.');
    else if (typedDomain && !email.endsWith(EMAIL_DOMAIN)) next.user = t('Yalnızca {d} uzantılı kurumsal adresler kabul edilir. Kullanıcı adınızı yazmanız yeterli.', { d: EMAIL_DOMAIN });
    else if (!/^[a-z0-9._-]+$/i.test(email.replace(EMAIL_DOMAIN, ''))) next.user = t('Kullanıcı adı yalnızca harf, rakam, nokta ve tire içerebilir.');
    if (!pw) next.pw = t('Şifrenizi yazın.');
    if (locked) return;
    if (!Object.keys(next).length && !checkPassword(email, pw)) {
      const f = fails + 1;
      setFails(f);
      if (f >= 5) {
        setLockUntil(Date.now() + 30000);
        setNow(Date.now());
        setFails(0);
        next.pw = t('Çok fazla hatalı deneme. Güvenliğiniz için 30 saniye bekleyin.');
      } else next.pw = t('E-posta veya şifre hatalı. {n} deneme hakkınız kaldı.', { n: 5 - f });
    }
    setErr(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try { localStorage.setItem(LAST_USER, email.replace(EMAIL_DOMAIN, '')); } catch { /* ignore */ }
    setTimeout(() => {
      login(email, pw);
      window.location.hash = '#/dashboard';
    }, 650);
  };

  return (
    <div className="login">
      <section className="login-brand">
        <div className="lb-top">
          <Logo size={88} className="on-dark" />
          <div>
            <strong>{t('Muğla Sıtkı Koçman Üniversitesi')}</strong>
            <span>{t('Öğrenci Bilgi Sistemi')}</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-lang"><LangMenu variant="pill" /></div>
        <form className="login-form" onSubmit={submit} noValidate>
          <div className="lf-head">
            <h2>{t('Giriş yap')}</h2>
            <p className="muted">{t('Kurumsal e-posta adresin ve OBS şifrenle giriş yap.')}</p>
          </div>

          <label className="field">
            <span>{t('Kurumsal e-posta')}</span>
            <div className={cx('input-group', err.user && 'invalid')}>
              <Mail size={16} aria-hidden />
              <input
                autoFocus
                value={user}
                onChange={(e) => { setUser(e.target.value.replace(/\s/g, '')); setErr((x) => ({ ...x, user: undefined })); }}
                placeholder={t('ad.soyad')}
                autoComplete="username"
                inputMode="email"
                aria-invalid={!!err.user}
                aria-describedby="user-help"
              />
              {!typedDomain && <span className="suffix">{EMAIL_DOMAIN}</span>}
            </div>
            {err.user ? (
              <span className="field-error" id="user-help"><AlertCircle size={13} /> {err.user}</span>
            ) : (
              <span className="field-hint" id="user-help">{email && <>{t('Giriş adresi:')} <strong>{email}</strong> · {t('Hoş geldin,')} <strong>{nameFromEmail(email)}</strong></>}</span>
            )}
          </label>

          <label className="field">
            <span>{t('Şifre')}</span>
            <div className={cx('input-group', err.pw && 'invalid')}>
              <Lock size={16} aria-hidden />
              <input
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setErr((x) => ({ ...x, pw: undefined })); }}
                onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') ?? false)}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!err.pw}
              />
              <button type="button" className="icon-btn sm" onClick={() => setShow(!show)} aria-label={show ? t('Şifreyi gizle') : t('Şifreyi göster')} aria-pressed={show}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {err.pw && <span className="field-error"><AlertCircle size={13} /> {err.pw}</span>}
            {caps && <span className="field-warn"><KeyRound size={13} /> {t('Caps Lock açık.')}</span>}
          </label>

          <button className="btn btn-primary btn-lg" type="submit" disabled={busy || locked}>
            {busy ? <><Loader2 size={18} className="spin" /> {t('Giriş yapılıyor…')}</> : locked ? <>{t('Tekrar deneyin: {n} sn', { n: Math.ceil((lockUntil - now) / 1000) })}</> : <>{t('Giriş yap')} <ArrowRight size={18} className="dir-icon" /></>}
          </button>

          <div className="login-or" aria-hidden><span>{t('veya')}</span></div>
          {/* Yalnızca e-Devlet giriş sayfasına yönlendirir; kimlik bilgisi alınmaz. */}
          <a className="btn btn-lg btn-edevlet" href={EDEVLET_URL} rel="noopener noreferrer">
            <ShieldCheck size={18} aria-hidden /> {t('e-Devlet ile Giriş')}
          </a>
        </form>
      </section>
    </div>
  );
}
