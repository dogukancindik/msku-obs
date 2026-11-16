import { useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Clock, Eye, Info, Pencil, Save, Send, Trash2, X, XCircle } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { REG } from '../data/msku';
import { springCandidates, springTermOf } from '../lib/registration';
import { CATALOG } from '../data/timetable';
import { t, term as termLabel } from '../lib/i18n';
import { cx, fmtDate } from '../lib/util';
import { Button, Card, CardHead, Chip, PageHeader } from '../components/ui';

type Request = { id: string; term: string; extra: number; course: string; reason: string; date: string; status: 'pending' | 'approved' };
const KEY = 'msku.gradRequests';
const load = (email: string): Request[] => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}')[email] ?? []; } catch { return []; }
};
const save = (email: string, list: Request[]) => {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    all[email] = list;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* ignore */ }
};

export default function GradCredit() {
  const D = useData();
  const { me, toast } = useApp();
  const GC = REG.gradCredit;
  const limit = REG.ectsLimit(D.agno);
  const extraMax = Math.max(GC.maxEcts - limit, 0);
  const checks = [
    { ok: D.year >= GC.minYear, label: t('{n}. sınıf öğrencisi olmak', { n: GC.minYear }), now: t('Şu an {y}. sınıf ({s}. yarıyıl)', { y: D.year, s: D.semester }) },
    { ok: D.ectsDone >= GC.minCompleted, label: t('En az {n} AKTS’yi başarıyla tamamlamış olmak', { n: GC.minCompleted }), now: t('Tamamlanan: {a} AKTS · {b} AKTS eksik', { a: D.ectsDone, b: Math.max(GC.minCompleted - D.ectsDone, 0) }) },
    { ok: D.agno >= GC.minAgno, label: t('AGNO’nun en az {n} olması', { n: GC.minAgno.toFixed(2) }), now: `AGNO: ${D.agno.toFixed(2)}` },
  ];
  const eligible = checks.every((c) => c.ok);
  const [preview, setPreview] = useState(false);
  const canFill = eligible || preview;
  const [list, setList] = useState<Request[]>(() => load(me.email));
  const [extra, setExtra] = useState(extraMax);
  const [editing, setEditing] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  // talep Bahar dönemi için: yalnızca Bahar'da açılan ve öğrencinin alabileceği dersler (kayıt kurallarıyla aynı liste)
  const spring = springTermOf(D);
  // öneriler: önce Bahar'da alabileceğiniz dersler, sonra müfredattaki diğer tüm dersler
  const pool = springCandidates(D).map((x) => x.course);
  const suggestions = [...pool, ...CATALOG.filter((c) => !pool.some((p) => p.code === c.code))];
  const byCodeLoose = (v: string) => CATALOG.find((c) => c.code.replace(/\s/g, '') === v.replace(/\s/g, ''));
  const match = byCodeLoose(code);
  const errors = { code: !/^[A-ZÇĞİÖŞÜ]{2,5}\s?\d{3,4}$/.test(code.trim()), name: name.trim().length < 3, reason: reason.trim().length < 20 };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!canFill || errors.code || errors.name || errors.reason || extra < 1) return;
    const course = `${match?.code ?? code.trim()} · ${name.trim()}`;
    const r: Request = { id: editing ?? String(Date.now()), term: spring.name, extra, course, reason: reason.trim(), date: new Date().toISOString(), status: 'pending' };
    const next = editing ? list.map((x) => (x.id === editing ? r : x)) : [r, ...list];
    setList(next);
    save(me.email, next);
    resetForm();
    toast({ text: editing ? t('Talebiniz güncellendi.') : t('Mezuniyet kredisi talebiniz danışmanınıza iletildi.'), tone: 'success' });
  };
  const resetForm = () => { setCode(''); setName(''); setReason(''); setTried(false); setEditing(null); };
  // talebi düzenle: forma geri yükle
  const edit = (r: Request) => {
    const [c, ...rest] = r.course.split(' · ');
    setEditing(r.id); setCode(c); setName(rest.join(' · ')); setReason(r.reason);
    setExtra(Math.min(Math.max(r.extra, 1), Math.max(extraMax, 1))); setTried(false);
    if (!eligible) setPreview(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };
  // talebi sil (geri alınabilir)
  const remove = (r: Request) => {
    const index = list.findIndex((x) => x.id === r.id);
    const next = list.filter((x) => x.id !== r.id);
    setList(next); save(me.email, next);
    if (editing === r.id) resetForm();
    toast({ text: t('Talep silindi.'), action: { label: t('Geri al'), run: () => setList((cur) => { const back = [...cur.slice(0, index), r, ...cur.slice(index)]; save(me.email, back); return back; }) } });
  };

  return (
    <>
      <PageHeader title={t('Mezuniyet Kredisi Talebi')}
        sub={t('4. sınıfta {a} AKTS’yi tamamlayan ve AGNO’su {b} üzeri olan öğrenciler dönemlik sınırın üzerinde {c} AKTS’ye kadar ders alabilir.', { a: GC.minCompleted, b: GC.minAgno.toFixed(2), c: GC.maxEcts })} />

      <div className="gc-grid">
        <Card>
          <CardHead title={t('Dönemlik AKTS sınırınız')} />
          <div className="gc-limits">
            <div><span className="eyebrow">{t('Şu anki sınır')}</span><strong className="mono">{limit}</strong><small>{t('AKTS')}</small></div>
            <div className="arrow dir-icon">→</div>
            <div className="hl"><span className="eyebrow">{t('Mezuniyet kredisiyle')}</span><strong className="mono">{GC.maxEcts}</strong><small>{t('AKTS')} (+{extraMax})</small></div>
          </div>
          <table className="atable compact gc-table">
            <thead><tr><th>{t('AGNO')}</th><th className="num">{t('Dönemlik sınır')}</th></tr></thead>
            <tbody>
              <tr className={cx(D.agno < 2 && 'row-mine')}><td>{t('2.00’ın altı')}</td><td className="num mono">30</td></tr>
              <tr className={cx(D.agno >= 2 && D.agno < 3 && 'row-mine')}><td>2.00 – 2.99</td><td className="num mono">36</td></tr>
              <tr className={cx(D.agno >= 3 && 'row-mine')}><td>{t('3.00 ve üstü')}</td><td className="num mono">40</td></tr>
              <tr><td>{t('Mezuniyet kredisi (4. sınıf, ≥ {n} AKTS)', { n: GC.minCompleted })}</td><td className="num mono">{GC.maxEcts}</td></tr>
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHead title={t('Başvuru şartları')} sub={eligible ? t('Tüm şartları sağlıyorsunuz.') : t('Şartlar sağlanınca talep oluşturabilirsiniz.')} />
          <ul className="gc-checks">
            {checks.map((c) => (
              <li key={c.label} className={cx(c.ok ? 'ok' : 'no')}>
                {c.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span><strong>{c.label}</strong><small>{c.now}</small></span>
              </li>
            ))}
          </ul>
          {!eligible && (
            <p className="gc-when small"><Info size={14} /> {t('En erken başvuru: 7. yarıyıl ({x}), {n} AKTS’yi tamamladığınızda.', { x: `${D.entryYear + 3}-${D.entryYear + 4} ${t('Güz')}`, n: GC.minCompleted })}</p>
          )}
        </Card>
      </div>

      <Card className="mt16">
        <CardHead title={t('Yeni talep')} sub={t('Talep danışmanınızın ve bölüm başkanlığının onayına gider.')}
          action={!eligible && <button className={cx('link-btn', preview && 'on')} onClick={() => setPreview(!preview)}><Eye size={14} /> {preview ? t('Önizlemeyi kapat') : t('Formu önizle')}</button>} />
        {!canFill ? (
          <div className="gc-locked">
            <AlertCircle size={18} />
            <span>{t('Şartları henüz sağlamadığınız için talep oluşturamazsınız. Eksik şartlar yukarıda kırmızıyla gösterildi.')}</span>
          </div>
        ) : (
          <form ref={formRef} className="stack" onSubmit={submit} noValidate style={{ scrollMarginTop: 90 }}>
            {editing && <p className="gc-preview small"><Pencil size={14} /> {t('Talebi düzenliyorsunuz. Kaydettiğinizde talep güncellenir.')}</p>}
            <div className="row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <label className="field" style={{ flex: '1 1 180px' }}>
                <span>{t('Dönem')}</span>
                <input className="input" value={termLabel(spring.name)} readOnly />
              </label>
              <label className="field" style={{ flex: '1 1 180px' }}>
                <span>{t('Ek AKTS')}</span>
                <select className="input" value={extra} onChange={(e) => setExtra(+e.target.value)}>
                  {Array.from({ length: extraMax }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{t('+{n} AKTS (toplam {m})', { n, m: limit + n })}</option>)}
                </select>
              </label>
            </div>
            {/* Ders kodu ve adı: müfredattaki derslerden öneri çıkar, istenirse elle yazılabilir. Listeden biri seçilince diğeri dolar. */}
            <div className="row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <label className="field" style={{ flex: '1 1 180px' }}>
                <span>{t('Dersin kodu')}</span>
                <input className={cx('input mono', tried && errors.code && 'invalid')} value={code} list="gc-codes" placeholder={t('Örn. SE 4502')} maxLength={12} autoComplete="off"
                  onChange={(e) => { const v = e.target.value.toLocaleUpperCase('tr'); setCode(v); const m = byCodeLoose(v); if (m) setName(m.name); }} />
                <datalist id="gc-codes">{suggestions.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</datalist>
                {tried && errors.code && <span className="field-error"><AlertCircle size={13} /> {t('Ders kodunu yazın (ör. SE 4502).')}</span>}
              </label>
              <label className="field" style={{ flex: '3 1 320px' }}>
                <span>{t('Dersin adı')}</span>
                <input className={cx('input', tried && errors.name && 'invalid')} value={name} list="gc-names" placeholder={t('Listeden seçin veya yazın')} maxLength={120} autoComplete="off"
                  onChange={(e) => { const v = e.target.value; setName(v); const m = suggestions.find((c) => c.name.toLocaleLowerCase('tr') === v.trim().toLocaleLowerCase('tr')); if (m) setCode(m.code); }} />
                <datalist id="gc-names">{suggestions.map((c) => <option key={c.code} value={c.name}>{c.code}</option>)}</datalist>
                {tried && errors.name ? <span className="field-error"><AlertCircle size={13} /> {t('Dersin adını yazın.')}</span>
                  : <span className="field-hint">{match
                    ? `${match.ects} ${t('AKTS')} · ${t('{n}. yy', { n: match.semester })} · ${match.semester % 2 === 0 ? t('Bahar döneminde açılır') : t('Bahar döneminde açılmaz')}`
                    : code || name ? t('Katalogda bulunamadı; elle girilen ders olarak gönderilir.') : t('Müfredattaki dersler öneri olarak listelenir; dilerseniz kendiniz yazabilirsiniz.')}</span>}
              </label>
            </div>
            <label className="field">
              <span>{t('Gerekçe')}</span>
              <textarea className={cx('input textarea', tried && errors.reason && 'invalid')} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={600}
                placeholder={t('Örn. Bu dönem mezun olabilmek için kalan teknik seçmeli dersimi almam gerekiyor.')} />
              <span className={cx('field-hint', tried && errors.reason && 'txt-danger')}>{reason.trim().length}/600 · {t('en az 20 karakter')}</span>
            </label>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              {editing && <Button type="button" variant="ghost" onClick={resetForm}><X size={16} /> {t('Vazgeç')}</Button>}
              <Button type="submit" variant="primary">{editing ? <><Save size={16} /> {t('Talebi güncelle')}</> : <><Send size={16} /> {t('Talebi gönder')}</>}</Button>
            </div>
          </form>
        )}
      </Card>

      {list.length > 0 && (
        <Card className="mt16">
          <CardHead title={t('Taleplerim')} />
          <ul className="gc-requests">
            {list.map((r) => (
              <li key={r.id}>
                <span>
                  <strong>{termLabel(r.term)} · +{r.extra} {t('AKTS')} · {r.course}</strong>
                  <small className="muted">{fmtDate(new Date(r.date), { day: 'numeric', month: 'long', year: 'numeric' })} · {r.reason}</small>
                </span>
                <ol className="stepper small-stepper">
                  <li className="done"><span className="st-dot"><Check size={12} /></span><span><strong>{t('Gönderildi')}</strong></span></li>
                  <li className="current"><span className="st-dot">2</span><span><strong>{t('Danışman onayı')}</strong></span></li>
                  <li><span className="st-dot">3</span><span><strong>{t('Bölüm onayı')}</strong></span></li>
                </ol>
                <span className="gc-req-actions">
                  <Chip tone="warning" icon={<Clock size={12} />}>{editing === r.id ? t('Düzenleniyor') : t('Bekliyor')}</Chip>
                  <Button size="sm" variant="secondary" onClick={() => edit(r)} aria-label={t('Talebi düzenle')}><Pencil size={14} /> {t('Düzenle')}</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(r)} aria-label={t('Talebi sil')}><Trash2 size={14} /> {t('Sil')}</Button>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
