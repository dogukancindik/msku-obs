import { useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Clock, Eye, Info, Send, XCircle } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { REG } from '../data/msku';
import { springCandidates, springTermOf } from '../lib/registration';
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
    { ok: D.year >= GC.minYear, label: `${GC.minYear}. sınıf öğrencisi olmak`, now: `Şu an ${D.year}. sınıf (${D.semester}. yarıyıl)` },
    { ok: D.ectsDone >= GC.minCompleted, label: `En az ${GC.minCompleted} AKTS’yi başarıyla tamamlamış olmak`, now: `Tamamlanan: ${D.ectsDone} AKTS · ${Math.max(GC.minCompleted - D.ectsDone, 0)} AKTS eksik` },
    { ok: D.agno >= GC.minAgno, label: `AGNO’nun en az ${GC.minAgno.toFixed(2)} olması`, now: `AGNO: ${D.agno.toFixed(2)}` },
  ];
  const eligible = checks.every((c) => c.ok);
  const [preview, setPreview] = useState(false);
  const canFill = eligible || preview;
  const [list, setList] = useState<Request[]>(() => load(me.email));
  const [extra, setExtra] = useState(extraMax);
  const [course, setCourse] = useState('');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  // talep Bahar dönemi için: yalnızca Bahar'da açılan ve öğrencinin alabileceği dersler (kayıt kurallarıyla aynı liste)
  const spring = springTermOf(D);
  const pool = springCandidates(D).map((x) => x.course);
  const errors = { course: !course, reason: reason.trim().length < 20 };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!canFill || errors.course || errors.reason || extra < 1) return;
    const r: Request = { id: String(Date.now()), term: spring.name, extra, course, reason: reason.trim(), date: new Date().toISOString(), status: 'pending' };
    const next = [r, ...list];
    setList(next);
    save(me.email, next);
    setCourse(''); setReason(''); setTried(false);
    toast({ text: 'Mezuniyet kredisi talebiniz danışmanınıza iletildi.', tone: 'success' });
  };

  return (
    <>
      <PageHeader title="Mezuniyet Kredisi Talebi"
        sub={`4. sınıfta ${GC.minCompleted} AKTS’yi tamamlayan ve AGNO’su ${GC.minAgno.toFixed(2)} üzeri olan öğrenciler dönemlik sınırın üzerinde ${GC.maxEcts} AKTS’ye kadar ders alabilir.`} />

      <div className="gc-grid">
        <Card>
          <CardHead title="Dönemlik AKTS sınırınız" />
          <div className="gc-limits">
            <div><span className="eyebrow">Şu anki sınır</span><strong className="mono">{limit}</strong><small>AKTS</small></div>
            <div className="arrow">→</div>
            <div className="hl"><span className="eyebrow">Mezuniyet kredisiyle</span><strong className="mono">{GC.maxEcts}</strong><small>AKTS (+{extraMax})</small></div>
          </div>
          <table className="atable compact gc-table">
            <thead><tr><th>AGNO</th><th className="num">Dönemlik sınır</th></tr></thead>
            <tbody>
              <tr className={cx(D.agno < 2 && 'row-mine')}><td>2.00’ın altı</td><td className="num mono">30</td></tr>
              <tr className={cx(D.agno >= 2 && D.agno < 3 && 'row-mine')}><td>2.00 – 2.99</td><td className="num mono">36</td></tr>
              <tr className={cx(D.agno >= 3 && 'row-mine')}><td>3.00 ve üstü</td><td className="num mono">40</td></tr>
              <tr><td>Mezuniyet kredisi (4. sınıf, ≥ {GC.minCompleted} AKTS)</td><td className="num mono">{GC.maxEcts}</td></tr>
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHead title="Başvuru şartları" sub={eligible ? 'Tüm şartları sağlıyorsunuz.' : 'Şartlar sağlanınca talep oluşturabilirsiniz.'} />
          <ul className="gc-checks">
            {checks.map((c) => (
              <li key={c.label} className={cx(c.ok ? 'ok' : 'no')}>
                {c.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span><strong>{c.label}</strong><small>{c.now}</small></span>
              </li>
            ))}
          </ul>
          {!eligible && (
            <p className="gc-when small"><Info size={14} /> En erken başvuru: <strong>7. yarıyıl ({D.entryYear + 3}-{D.entryYear + 4} Güz)</strong>, {GC.minCompleted} AKTS’yi tamamladığınızda.</p>
          )}
        </Card>
      </div>

      <Card className="mt16">
        <CardHead title="Yeni talep" sub="Talep danışmanınızın ve bölüm başkanlığının onayına gider."
          action={!eligible && <button className={cx('link-btn', preview && 'on')} onClick={() => setPreview(!preview)}><Eye size={14} /> {preview ? 'Önizlemeyi kapat' : 'Formu önizle'}</button>} />
        {!canFill ? (
          <div className="gc-locked">
            <AlertCircle size={18} />
            <span>Şartları henüz sağlamadığınız için talep oluşturamazsınız. Eksik şartlar yukarıda kırmızıyla gösterildi.</span>
          </div>
        ) : (
          <form className="stack" onSubmit={submit} noValidate>
            {preview && !eligible && <p className="gc-preview small"><Eye size={14} /> Önizleme: Şartları sağlayan bir öğrencinin göreceği form. Gönderilen talep yalnızca bu cihazda saklanır.</p>}
            <div className="row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <label className="field" style={{ flex: '1 1 180px' }}>
                <span>Dönem</span>
                <input className="input" value={spring.name} readOnly />
              </label>
              <label className="field" style={{ flex: '1 1 180px' }}>
                <span>Ek AKTS</span>
                <select className="input" value={extra} onChange={(e) => setExtra(+e.target.value)}>
                  {Array.from({ length: extraMax }, (_, i) => i + 1).map((n) => <option key={n} value={n}>+{n} AKTS (toplam {limit + n})</option>)}
                </select>
              </label>
              <label className="field" style={{ flex: '2 1 280px' }}>
                <span>Eklemek istediğiniz ders</span>
                <select className={cx('input', tried && errors.course && 'invalid')} value={course} onChange={(e) => setCourse(e.target.value)}>
                  <option value="">Ders seçin…</option>
                  {pool.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.name} ({c.ects} AKTS)</option>)}
                </select>
                {tried && errors.course && <span className="field-error"><AlertCircle size={13} /> Bir ders seçin.</span>}
              </label>
            </div>
            <label className="field">
              <span>Gerekçe</span>
              <textarea className={cx('input textarea', tried && errors.reason && 'invalid')} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={600}
                placeholder="Örn. Bu dönem mezun olabilmek için kalan teknik seçmeli dersimi almam gerekiyor." />
              <span className={cx('field-hint', tried && errors.reason && 'txt-danger')}>{reason.trim().length}/600 · en az 20 karakter</span>
            </label>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary"><Send size={16} /> Talebi gönder</Button>
            </div>
          </form>
        )}
      </Card>

      {list.length > 0 && (
        <Card className="mt16">
          <CardHead title="Taleplerim" />
          <ul className="gc-requests">
            {list.map((r) => (
              <li key={r.id}>
                <span>
                  <strong>{r.term} · +{r.extra} AKTS · {r.course}</strong>
                  <small className="muted">{fmtDate(new Date(r.date), { day: 'numeric', month: 'long', year: 'numeric' })} · {r.reason}</small>
                </span>
                <ol className="stepper small-stepper">
                  <li className="done"><span className="st-dot"><Check size={12} /></span><span><strong>Gönderildi</strong></span></li>
                  <li className="current"><span className="st-dot">2</span><span><strong>Danışman onayı</strong></span></li>
                  <li><span className="st-dot">3</span><span><strong>Bölüm onayı</strong></span></li>
                </ol>
                <Chip tone="warning" icon={<Clock size={12} />}>Bekliyor</Chip>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
