import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Check, CheckCircle2, Contrast, Eye, EyeOff, KeyRound, Moon, Sparkles, Trash2, Type, X } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { student } from '../data/msku';
import { cx, passwordStrength } from '../lib/util';
import { Button, Card, CardHead, PageHeader } from '../components/ui';
import { Avatar } from '../components/Shell';

export default function Account() {
  const { route } = useApp();
  useEffect(() => {
    const s = route.query.get('section');
    if (s) setTimeout(() => document.getElementById(`sec-${s}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, [route.query]);
  return (
    <>
      <PageHeader title="Hesap & Kullanıcı İşlemleri" sub="Profil bilgileriniz, OBS şifreniz ve görünüm tercihleriniz" />
      <div className="acc-grid">
        <ProfileCard />
        <PasswordCard />
        <A11yCard />
      </div>
    </>
  );
}

function ProfileCard() {
  const D = useData();
  const { profile, setProfile, me, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState(profile.phone);
  const [first, setFirst] = useState(me.givenNames);
  const [last, setLast] = useState(me.lastName);
  const dirty = first.trim() !== me.givenNames || last.trim() !== me.lastName || phone !== profile.phone;
  const valid = !!first.trim() && !!last.trim();
  const [err, setErr] = useState('');

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return setErr('Lütfen bir görsel dosyası seçin (JPG, PNG, WEBP).');
    if (f.size > 2 * 1024 * 1024) return setErr('Fotoğraf en fazla 2 MB olabilir.');
    setErr('');
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      setPreview(canvas.toDataURL('image/jpeg', 0.85));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => setErr('Görsel okunamadı. Başka bir dosya deneyin.');
    img.src = url;
  };

  return (
    <Card id="sec-profile" className="acc-profile">
      <CardHead title="Profil bilgileri" sub="Kimlik bilgileri Öğrenci İşleri tarafından yönetilir" />
      <div className="photo-row">
        <div className="photo-wrap">
          {preview ? <img className="avatar img" src={preview} alt="Yeni profil fotoğrafı önizlemesi" style={{ width: 88, height: 88 }} /> : <Avatar size={88} />}
          {preview && <span className="photo-badge">Önizleme</span>}
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <strong>{me.name}</strong>
          <span className="muted small">{me.number} · {student.programShort}</span>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
          {preview ? (
            <div className="row">
              <Button size="sm" variant="primary" onClick={() => { setProfile({ avatar: preview }); setPreview(null); toast({ text: 'Profil fotoğrafınız güncellendi.', tone: 'success' }); }}><Check size={14} /> Fotoğrafı kaydet</Button>
              <Button size="sm" variant="ghost" onClick={() => setPreview(null)}><X size={14} /> Vazgeç</Button>
            </div>
          ) : (
            <div className="row">
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}><Camera size={14} /> Fotoğraf değiştir</Button>
              {profile.avatar && <Button size="sm" variant="ghost" onClick={() => setProfile({ avatar: undefined })}><Trash2 size={14} /> Kaldır</Button>}
            </div>
          )}
          {err ? <span className="field-error"><AlertCircle size={13} /> {err}</span> : <span className="field-hint">JPG/PNG, en fazla 2 MB · kare olarak kırpılır</span>}
        </div>
      </div>
      <dl className="facts">
        <div><dt>Ad</dt><dd>{me.givenNames}</dd></div>
        <div><dt>Soyad</dt><dd>{me.lastName || '—'}</dd></div>
        <div><dt>Öğrenci No</dt><dd className="mono">{me.number}</dd></div>
        <div><dt>Kurumsal e-posta</dt><dd>{me.email}</dd></div>
        <div className="wide"><dt>Fakülte / Bölüm</dt><dd>{student.faculty} — {student.program}</dd></div>
        <div><dt>Sınıf / Dönem</dt><dd>{D.year}. Sınıf / {D.semester}. Yarıyıl</dd></div>
        <div><dt>Durum</dt><dd>{student.status}</dd></div>
        <div className="wide"><dt>Danışman</dt><dd>{D.advisor.name} · {D.advisor.hours}</dd></div>
      </dl>
      <form className="phone-row stack" onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        setProfile({ firstName: first.trim(), lastName: last.trim(), name: undefined, phone });
        toast({ text: 'Profil bilgileriniz kaydedildi.', tone: 'success' });
      }}>
        <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <label className="field" style={{ flex: '1 1 180px' }}>
            <span>Ad</span>
            <input className={cx('input', !first.trim() && 'invalid')} value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" />
          </label>
          <label className="field" style={{ flex: '1 1 180px' }}>
            <span>Soyad</span>
            <input className={cx('input', !last.trim() && 'invalid')} value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
          </label>
          <label className="field" style={{ flex: '1 1 160px' }}>
            <span>Cep telefonu</span>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="05XX XXX XX XX" />
          </label>
        </div>
        <p className="field-hint">Ad ve soyad kurumsal e-postanızdan otomatik oluşturulur; Türkçe karakterler tanınır (kirgiz → Kırgız). Gerekirse buradan düzeltebilirsiniz.</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" disabled={!dirty || !valid}>Değişiklikleri kaydet</Button>
        </div>
      </form>
    </Card>
  );
}

function PwInput({ label, value, onChange, error, autoComplete }: { label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <div className={cx('input-group', error && 'invalid')}>
        <KeyRound size={16} aria-hidden />
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={!!error} />
        <button type="button" className="icon-btn sm" onClick={() => setShow(!show)} aria-label={show ? 'Gizle' : 'Göster'}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
      </div>
      {error && <span className="field-error"><AlertCircle size={13} /> {error}</span>}
    </label>
  );
}

function PasswordCard() {
  const { changePassword, toast, track } = useApp();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [rep, setRep] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const st = passwordStrength(next);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!cur) er.cur = 'Mevcut şifrenizi yazın.';
    if (st.score < 4) er.next = 'Şifre en az "İyi" seviyede olmalı: listedeki koşulları tamamlayın.';
    if (next && next === cur) er.next = 'Yeni şifre mevcut şifrenizden farklı olmalı.';
    if (rep !== next) er.rep = 'Şifreler eşleşmiyor.';
    if (!Object.keys(er).length && !changePassword(cur, next)) er.cur = 'Mevcut şifre hatalı. Giriş yaparken kullandığınız şifreyi yazın.';
    setErrs(er);
    if (Object.keys(er).length) return;
    setCur(''); setNext(''); setRep('');
    setDone(true);
    track('account:password');
    toast({ text: 'OBS şifreniz başarıyla güncellendi.', tone: 'success' });
  };

  return (
    <Card id="sec-password" className="">
      <CardHead icon={<KeyRound size={18} />} title="OBS şifre yenileme" sub="Bir sonraki girişte yeni şifrenizi kullanın" />
      {done && <div className="success-box" role="status"><CheckCircle2 size={18} /> Şifreniz güncellendi. Bir sonraki girişinizde yeni şifrenizi kullanın.</div>}
      <form className="stack" onSubmit={submit} noValidate>
        <PwInput label="Mevcut şifre" value={cur} onChange={(v) => { setCur(v); setDone(false); }} error={errs.cur} autoComplete="current-password" />
        <PwInput label="Yeni şifre" value={next} onChange={setNext} error={errs.next} autoComplete="new-password" />
        <div className="strength" aria-live="polite">
          <div className="strength-bars">{[1, 2, 3, 4, 5].map((i) => <span key={i} className={cx(next && i <= st.score && `on-${st.tone}`)} />)}</div>
          <span className={cx('small', next ? `txt-${st.tone}` : 'muted')}>{next ? `Şifre gücü: ${st.label}` : 'Şifre gücü'}</span>
          <ul className="checklist">
            {st.checks.map((c) => <li key={c.label} className={cx(c.ok && 'ok')}>{c.ok ? <Check size={13} /> : <span className="dot" />} {c.label}</li>)}
          </ul>
        </div>
        <PwInput label="Yeni şifre (tekrar)" value={rep} onChange={setRep} error={errs.rep ?? (rep && rep !== next ? 'Şifreler eşleşmiyor.' : undefined)} autoComplete="new-password" />
        <Button type="submit" variant="primary">Şifreyi güncelle</Button>
      </form>
    </Card>
  );
}

function A11yCard() {
  const { settings, set } = useApp();
  const Toggle = ({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) => (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={cx('switch', on && 'on')} onClick={onClick}><span /></button>
  );
  const Row = ({ icon, label, desc, children }: { icon: React.ReactNode; label: string; desc: string; children: React.ReactNode }) => (
    <div className="pref-row"><span className="pref-ic">{icon}</span><span className="pref-text"><strong>{label}</strong><small>{desc}</small></span>{children}</div>
  );
  return (
    <Card id="sec-a11y" className="">
      <CardHead title="Görünüm ve erişilebilirlik" sub="Tercihleriniz bu cihazda hatırlanır" />
      <Row icon={<Type size={17} />} label="Yazı boyutu" desc="Tüm sayfalardaki metni büyütür">
        <div className="segmented small">
          {([1, 1.125, 1.25] as const).map((s, i) => <button key={s} className={cx(settings.scale === s && 'on')} aria-pressed={settings.scale === s} onClick={() => set('scale', s)} style={{ fontSize: 12 + i * 2 }}>A</button>)}
        </div>
      </Row>
      <Row icon={<Contrast size={17} />} label="Yüksek kontrast" desc="Kenarlık ve metin kontrastını artırır"><Toggle on={settings.contrast === 'high'} label="Yüksek kontrast" onClick={() => set('contrast', settings.contrast === 'high' ? 'normal' : 'high')} /></Row>
      <Row icon={<Eye size={17} />} label="Renk körü dostu renkler" desc="Kırmızı/yeşil yerine mavi/turuncu kullanır"><Toggle on={settings.cbSafe} label="Renk körü dostu" onClick={() => set('cbSafe', !settings.cbSafe)} /></Row>
      <Row icon={<Sparkles size={17} />} label="Animasyonları azalt" desc="Geçiş ve hareket efektlerini kapatır"><Toggle on={settings.reduceMotion} label="Animasyonları azalt" onClick={() => set('reduceMotion', !settings.reduceMotion)} /></Row>
      <Row icon={<Moon size={17} />} label="Koyu tema" desc="Düşük ışıkta göz yorgunluğunu azaltır"><Toggle on={settings.theme === 'dark'} label="Koyu tema" onClick={() => set('theme', settings.theme === 'dark' ? 'light' : 'dark')} /></Row>
    </Card>
  );
}
