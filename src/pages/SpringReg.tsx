import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Lock, RotateCcw, Send, Undo2, XCircle } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { typeLabel } from '../data/msku';
import { sectionCount, slotText, slotsOf } from '../data/timetable';
import { assignSections, defaultDraft, loadDraft, saveDraft, springCandidates, springLimit, springTermOf, validateDraft, type Draft, type RegItem, type RegKind } from '../lib/registration';
import { DAYS, cx, toMin } from '../lib/util';
import { Button, Card, CardHead, Chip, Progress } from '../components/ui';

const GROUPS: { kind: RegKind; title: string; sub: string }[] = [
  { kind: 'retake', title: 'Alttan alınacak dersler', sub: 'Başarısız olduğunuz Bahar dersleri önceliklidir; zorunlu olanlar kayıttan çıkarılamaz.' },
  { kind: 'deferred', title: 'Ertelenmiş dersler', sub: 'Önceki dönemlerde alamadığınız dersler. Alınmazsa bir sonraki Bahar’a kalır.' },
  { kind: 'mandatory', title: 'Yarıyıl dersleri', sub: 'Müfredatınızdaki yeni yarıyılın zorunlu ve bölüm dışı dersleri.' },
  { kind: 'elective', title: 'Teknik seçmeli havuzu', sub: 'Bahar döneminde açılan, henüz geçmediğiniz bölüm içi seçmeliler.' },
];

export default function SpringReg() {
  const D = useData();
  const { me, toast } = useApp();
  const term = springTermOf(D);
  const limit = springLimit(D);
  const cands = useMemo(() => springCandidates(D), [D]);
  const [draft, setDraft] = useState<Draft>(() => loadDraft(D, me.email));
  useEffect(() => saveDraft(me.email, draft), [draft, me.email]);

  const locked = draft.status === 'submitted';
  const gradReq = useMemo(() => {
    try { return (JSON.parse(localStorage.getItem('msku.gradRequests') ?? '{}')[me.email] ?? []).find((r: { term: string }) => r.term === term.name) as { extra: number } | undefined; } catch { return undefined; }
  }, [me.email, term.name]);
  const items = cands.filter((c) => draft.codes.includes(c.course.code));
  const ects = items.reduce((a, x) => a + x.course.ects, 0);
  const issues = validateDraft(D, draft);
  const errors = issues.filter((i) => i.level === 'error');
  const { sections, clashes } = assignSections(items, draft.sections);
  const clashOf = (code: string) => clashes.find((c) => c.code === code);

  const toggle = (it: RegItem) => {
    if (it.locked || locked) return;
    setDraft((d) => {
      const codes = d.codes.includes(it.course.code) ? d.codes.filter((c) => c !== it.course.code) : [...d.codes, it.course.code];
      return { ...d, codes, updated: new Date().toISOString() };
    });
  };
  const setSection = (code: string, sec: number) => setDraft((d) => ({ ...d, sections: { ...d.sections, [code]: sec }, updated: new Date().toISOString() }));
  const submit = () => {
    if (errors.length) return;
    setDraft((d) => ({ ...d, sections, status: 'submitted', updated: new Date().toISOString() }));
    toast({ text: `${term.name} ders kaydı taslağınız danışmanınıza gönderildi.`, tone: 'success' });
  };

  // haftalık önizleme
  const week = [0, 1, 2, 3, 4].map((d) => ({
    d, blocks: items.flatMap((it) => slotsOf(it.course.code, sections[it.course.code] ?? 1).filter((s) => s.day === d).map((s) => ({ s, it })))
      .sort((a, b) => toMin(a.s.start) - toMin(b.s.start)),
  }));

  return (
    <div className="stack">
      <Card className="reg-summary">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="eyebrow">{term.name} · {term.semester}. yarıyıl</span>
            <h2 style={{ marginTop: 4 }}>Bahar Dönemi Ders Kaydı</h2>
            <p className="muted small">Taslağınızı şimdi hazırlayın; danışman ön onayından sonra kayıt haftasında (Ocak 2027) kesinleşir.</p>
          </div>
          <ol className="stepper small-stepper">
            <li className={locked ? 'done' : 'current'}><span className="st-dot">{locked ? <Check size={12} /> : 1}</span><span><strong>Taslak</strong></span></li>
            <li className={locked ? 'current' : ''}><span className="st-dot">2</span><span><strong>Danışman ön onayı</strong></span></li>
            <li><span className="st-dot">3</span><span><strong>Kayıt haftası</strong></span></li>
          </ol>
        </div>
        <div className="reg-ects mt12">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small"><strong>Seçilen: {items.length} ders</strong></span>
            <span className={cx('small mono', ects > limit && 'txt-danger')}><strong>{ects}</strong> / {limit} AKTS üst sınır</span>
          </div>
          <Progress value={Math.min(ects, limit)} max={limit} tone={ects > limit ? 'danger' : 'success'} label="Bahar AKTS" />
          <span className="muted small">Sınır şu anki AGNO’nuza ({D.agno.toFixed(2)}) göre hesaplandı; güz notları kesinleşince güncellenir.{gradReq && ` Mezuniyet kredisi talebiniz (+${gradReq.extra} AKTS) onaylanırsa sınırınız ${limit + gradReq.extra} AKTS olur.`}</span>
        </div>
        <div className="stack mt12" style={{ gap: 8 }}>
          {issues.length === 0 && <div className="alert info"><CheckCircle2 size={18} /><div><strong>Taslağınız kurallara uygun.</strong><p className="small">AKTS sınırı, alttan dersler ve ders saatleri kontrol edildi.</p></div></div>}
          {issues.map((i, n) => (
            <div key={n} className={cx('alert', i.level === 'error' ? 'danger' : 'warning')}>
              {i.level === 'error' ? <XCircle size={18} /> : <AlertTriangle size={18} />}
              <div><p className="small" style={{ margin: 0, color: 'var(--text)' }}>{i.text}</p></div>
            </div>
          ))}
        </div>
        <div className="row mt12" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {locked ? (
            <>
              <Chip tone="warning">Danışman incelemesinde</Chip>
              <Button variant="secondary" onClick={() => setDraft((d) => ({ ...d, status: 'draft' }))}><Undo2 size={15} /> Geri çek ve düzenle</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setDraft(defaultDraft(D))}><RotateCcw size={15} /> Önerilen taslağa dön</Button>
              <Button variant="primary" disabled={errors.length > 0} title={errors.length ? 'Önce kırmızı hataları giderin' : undefined} onClick={submit}><Send size={15} /> Danışmana gönder</Button>
            </>
          )}
        </div>
      </Card>

      {GROUPS.map((g) => {
        const list = cands.filter((c) => c.kind === g.kind);
        if (!list.length) return null;
        return (
          <div key={g.kind} className="table-card">
            <div style={{ padding: '14px 16px 4px' }}><h2>{g.title}</h2><p className="muted small">{g.sub}</p></div>
            <table className="atable courses-table">
              <thead><tr><th style={{ width: 44 }}><span className="sr-only">Seç</span></th><th>Ders</th><th>Tür</th><th className="num">AKTS</th><th>Şube · Saat</th><th>Durum</th></tr></thead>
              <tbody>
                {list.map((it) => {
                  const on = draft.codes.includes(it.course.code);
                  const cl = on ? clashOf(it.course.code) : undefined;
                  const n = sectionCount(it.course.code);
                  const sec = sections[it.course.code] ?? draft.sections[it.course.code] ?? 1;
                  return (
                    <tr key={it.course.code} className={cx(on && 'row-mine')}>
                      <td>
                        {it.locked ? <Lock size={16} aria-label="Zorunlu, çıkarılamaz" /> :
                          <input type="checkbox" checked={on} disabled={locked} onChange={() => toggle(it)} aria-label={`${it.course.code} seç`} />}
                      </td>
                      <td>
                        <span className="mono small muted">{it.course.code} · {it.course.semester}. yy · T+U {it.course.t}+{it.course.u}</span>
                        <strong className="block">{it.course.name}</strong>
                        {it.reason && <span className="att-note">{it.reason}</span>}
                        <span className="att-note">{it.course.instructor}</span>
                      </td>
                      <td><span className="chip-stack"><Chip tone={it.course.type === 'Zorunlu' ? 'brand' : 'info'}>{typeLabel(it.course.type)}</Chip>{it.kind === 'retake' && <Chip tone="warning" icon={<RotateCcw size={12} />}>Alttan</Chip>}</span></td>
                      <td className="num mono">{it.course.ects}</td>
                      <td className="small">
                        {n > 1 ? (
                          <select className="input" style={{ padding: '4px 8px', minHeight: 0 }} value={sec} disabled={locked || !on} onChange={(e) => setSection(it.course.code, +e.target.value)} aria-label={`${it.course.code} şube`}>
                            {Array.from({ length: n }, (_, i) => i + 1).map((s) => <option key={s} value={s}>Şube {s} · {slotText(slotsOf(it.course.code, s))}</option>)}
                          </select>
                        ) : <span>Şube 1 · {slotText(slotsOf(it.course.code, 1))}</span>}
                      </td>
                      <td>
                        {!on ? <Chip tone="neutral">Seçilmedi</Chip>
                          : cl ? <Chip tone={it.waived ? 'warning' : 'danger'} icon={<AlertTriangle size={12} />}>{cl.with.join(', ')} ile çakışıyor</Chip>
                            : <Chip tone="success" icon={<CheckCircle2 size={12} />}>Taslakta</Chip>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      <Card>
        <CardHead title="Haftalık program önizlemesi" sub="Seçtiğiniz şubelere göre Bahar dönemi ders saatleriniz" />
        <div className="week-preview">
          {week.map(({ d, blocks }) => (
            <div key={d} className="wp-day">
              <strong className="small">{DAYS[d]}</strong>
              {blocks.length === 0 ? <span className="muted small">Ders yok</span> : blocks.map(({ s, it }) => (
                <span key={it.course.code + s.start} className={cx('wp-block small', clashOf(it.course.code) && 'clash')}>
                  <span className="mono">{s.start}–{s.end}</span> {it.course.code} <span className="muted">· {s.kind}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
