import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Clock, Lock, RotateCcw, Send, Undo2, XCircle } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { typeLabel } from '../data/msku';
import { sectionCount, slotText, slotsOf } from '../data/timetable';
import { assignSections, defaultDraft, sectionClashesWith, loadDraft, saveDraft, springCandidates, springLimit, springTermOf, validateDraft, type Draft, type RegItem, type RegKind } from '../lib/registration';
import { DAYS, DAYS_SHORT, cx, toMin } from '../lib/util';
import type { Slot } from '../data/msku';
import { Button, Card, CardHead, Chip, Progress } from '../components/ui';
import { t, tOpt, term as termLabel } from '../lib/i18n';

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
  const { sections, clashes } = assignSections(items, draft.sections, draft.pinned);
  const clashOf = (code: string) => clashes.find((c) => c.code === code);

  const toggle = (it: RegItem) => {
    if (it.locked || locked) return;
    setDraft((d) => {
      const codes = d.codes.includes(it.course.code) ? d.codes.filter((c) => c !== it.course.code) : [...d.codes, it.course.code];
      return { ...d, codes, updated: new Date().toISOString() };
    });
  };
  // öğrencinin seçtiği şube sabitlenir: sistem artık bu dersin şubesini kendiliğinden değiştirmez
  const setSection = (code: string, sec: number) => setDraft((d) => ({ ...d, sections: { ...sections, [code]: sec }, pinned: [...new Set([...(d.pinned ?? []), code])], updated: new Date().toISOString() }));
  const submit = () => {
    if (errors.length) return;
    setDraft((d) => ({ ...d, sections, status: 'submitted', updated: new Date().toISOString() }));
    toast({ text: t('{x} ders kaydı taslağınız danışmanınıza gönderildi.', { x: termLabel(term.name) }), tone: 'success' });
  };

  return (
    <div className="stack">
      <Card className="reg-summary">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="eyebrow">{termLabel(term.name)} · {t('{n}. yarıyıl', { n: term.semester })}</span>
            <h2 style={{ marginTop: 4 }}>{t('Bahar Dönemi Ders Kaydı')}</h2>
            <p className="muted small">{t('Taslağınızı şimdi hazırlayın; danışman ön onayından sonra kayıt haftasında (Ocak 2027) kesinleşir.')}</p>
          </div>
          <ol className="stepper small-stepper">
            <li className={locked ? 'done' : 'current'}><span className="st-dot">{locked ? <Check size={12} /> : 1}</span><span><strong>{t('Taslak')}</strong></span></li>
            <li className={locked ? 'current' : ''}><span className="st-dot">2</span><span><strong>{t('Danışman ön onayı')}</strong></span></li>
            <li><span className="st-dot">3</span><span><strong>{t('Kayıt haftası')}</strong></span></li>
          </ol>
        </div>
        <div className="reg-ects mt12">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small"><strong>{t('Seçilen: {n} ders', { n: items.length })}</strong></span>
            <span className={cx('small mono', ects > limit && 'txt-danger')}><strong>{ects}</strong> / {limit} {t('AKTS üst sınır')}</span>
          </div>
          <Progress value={Math.min(ects, limit)} max={limit} tone={ects > limit ? 'danger' : 'success'} label={t('Bahar AKTS')} />
          <span className="muted small">{t('Sınır şu anki AGNO’nuza ({g}) göre hesaplandı; güz notları kesinleşince güncellenir.', { g: D.agno.toFixed(2) })}{gradReq && ' ' + t('Mezuniyet kredisi talebiniz (+{a} AKTS) onaylanırsa sınırınız {b} AKTS olur.', { a: gradReq.extra, b: limit + gradReq.extra })}</span>
        </div>
        <div className="stack mt12" style={{ gap: 8 }}>
          {issues.length === 0 && <div className="alert info"><CheckCircle2 size={18} /><div><strong>{t('Taslağınız kurallara uygun.')}</strong><p className="small">{t('AKTS sınırı, alttan dersler ve ders saatleri kontrol edildi.')}</p></div></div>}
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
              <Chip tone="warning">{t('Danışman incelemesinde')}</Chip>
              <Button variant="secondary" onClick={() => setDraft((d) => ({ ...d, status: 'draft' }))}><Undo2 size={15} /> {t('Geri çek ve düzenle')}</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setDraft(defaultDraft(D))} title={t('Seçimleri ve sabitlediğiniz şubeleri sıfırlar')}><RotateCcw size={15} /> {t('Önerilen taslağa dön')}</Button>
              <Button variant="primary" disabled={errors.length > 0} title={errors.length ? t('Önce kırmızı hataları giderin') : undefined} onClick={submit}><Send size={15} /> {t('Danışmana gönder')}</Button>
            </>
          )}
        </div>
      </Card>

      {GROUPS.map((g) => {
        const list = cands.filter((c) => c.kind === g.kind);
        if (!list.length) return null;
        return (
          <div key={g.kind} className="table-card">
            <div style={{ padding: '14px 16px 4px' }}><h2>{t(g.title)}</h2><p className="muted small">{t(g.sub)}</p></div>
            <table className="atable courses-table">
              <thead><tr><th style={{ width: 44 }}><span className="sr-only">{t('Seç')}</span></th><th>{t('Ders')}</th><th>{t('Tür')}</th><th className="num">{t('AKTS')}</th><th>{t('Şube · Saat')}</th><th>{t('Durum')}</th></tr></thead>
              <tbody>
                {list.map((it) => {
                  const on = draft.codes.includes(it.course.code);
                  const cl = on ? clashOf(it.course.code) : undefined;
                  const n = sectionCount(it.course.code);
                  const sec = sections[it.course.code] ?? draft.sections[it.course.code] ?? 1;
                  return (
                    <tr key={it.course.code} className={cx(on && 'row-mine')}>
                      <td>
                        {it.locked ? <Lock size={16} aria-label={t('Zorunlu, çıkarılamaz')} /> :
                          <input type="checkbox" checked={on} disabled={locked} onChange={() => toggle(it)} aria-label={t('{code} seç', { code: it.course.code })} />}
                      </td>
                      <td>
                        <span className="mono small muted">{it.course.code} · {t('{n}. yy', { n: it.course.semester })} · {t('T+U')} {it.course.t}+{it.course.u}</span>
                        <strong className="block">{it.course.name}</strong>
                        {it.reason && <span className="att-note">{it.reason}</span>}
                        <span className="att-note">{tOpt(it.course.instructor ?? '')}</span>
                      </td>
                      <td><span className="chip-stack"><Chip tone={it.course.type === 'Zorunlu' ? 'brand' : 'info'}>{typeLabel(it.course.type)}</Chip>{it.kind === 'retake' && <Chip tone="warning" icon={<RotateCcw size={12} />}>{t('Alttan')}</Chip>}</span></td>
                      <td className="num mono">{it.course.ects}</td>
                      <td className="small">
                        {n > 1 ? (
                          <select className="input" style={{ padding: '4px 8px', minHeight: 0 }} value={sec} disabled={locked || !on} onChange={(e) => setSection(it.course.code, +e.target.value)} aria-label={t('{code} şube', { code: it.course.code })}>
                            {Array.from({ length: n }, (_, i) => i + 1).map((s) => {
                              const cw = on ? sectionClashesWith(items, sections, it.course.code, s) : [];
                              return <option key={s} value={s}>{t('Şube')} {s} · {slotText(slotsOf(it.course.code, s))}{cw.length ? ` · ⚠ ${t('{x} ile çakışıyor', { x: cw.join(', ') })}` : on ? ` · ✓ ${t('çakışma yok')}` : ''}</option>;
                            })}
                          </select>
                        ) : <span>{t('Şube')} 1 · {slotText(slotsOf(it.course.code, 1))}</span>}
                      </td>
                      <td>
                        {!on ? <Chip tone="neutral">{t('Seçilmedi')}</Chip>
                          : cl ? <Chip tone={it.waived ? 'warning' : 'danger'} icon={<AlertTriangle size={12} />}>{t('{x} ile çakışıyor', { x: cl.with.join(', ') })}</Chip>
                            : locked ? <Chip tone="info" icon={<Clock size={12} />}>{t('Danışman onayında')}</Chip>
                              : <Chip tone="success" icon={<CheckCircle2 size={12} />}>{t('Taslakta')}</Chip>}
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
        <CardHead title={t('Haftalık program önizlemesi')} sub={t('Seçtiğiniz derslere ve şubelere göre Bahar dönemi ders saatleriniz; şubeyi değiştirdiğinizde takvim güncellenir')} />
        <WeekGrid blocks={items.flatMap((it) => slotsOf(it.course.code, sections[it.course.code] ?? 1).map((s) => ({ s, code: it.course.code, name: it.course.name, sec: sections[it.course.code] ?? 1 })))} />
        {items.some((it) => it.course.t + it.course.u === 0) && <p className="muted small mt12">{t('Haftalık saati olmayan dersler (staj) takvimde gösterilmez.')}</p>}
      </Card>
    </div>
  );
}

/** Saat ızgaralı haftalık takvim; aynı saatteki (çakışan) dersler yan yana gösterilir */
function WeekGrid({ blocks }: { blocks: { s: Slot; code: string; name: string; sec: number }[] }) {
  const start = toMin('08:30'), end = toMin('17:15');
  const pct = (m: number) => ((m - start) / (end - start)) * 100;
  const hours = ['08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30'];
  const PAL = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
  const codes = [...new Set(blocks.map((b) => b.code))];
  return (
    <div className="reg-week-wrap"><div className="tt simple reg-week">
      <div className="tt-hours">{hours.map((h) => <span key={h} style={{ top: `${pct(toMin(h))}%` }}>{h}</span>)}</div>
      {[0, 1, 2, 3, 4].map((d) => {
        const day = blocks.filter((b) => b.s.day === d).sort((a, b) => toMin(a.s.start) - toMin(b.s.start));
        // çakışan blokları sütunlara ayır
        const lane = day.map(() => 0); const lanes = day.map(() => 1);
        day.forEach((b, i) => {
          const over = day.filter((o, j) => j < i && toMin(o.s.start) < toMin(b.s.end) && toMin(b.s.start) < toMin(o.s.end));
          while (over.some((o) => lane[day.indexOf(o)] === lane[i])) lane[i]++;
        });
        day.forEach((b, i) => {
          const group = day.filter((o) => toMin(o.s.start) < toMin(b.s.end) && toMin(b.s.start) < toMin(o.s.end));
          lanes[i] = Math.max(...group.map((o) => lane[day.indexOf(o)])) + 1;
        });
        return (
          <div key={d} className="tt-day">
            <div className="tt-dname"><span className="only-wide">{DAYS[d]}</span><span className="only-narrow">{DAYS_SHORT[d]}</span></div>
            <div className="tt-col">
              {hours.map((h) => <span key={h} className="tt-line" style={{ top: `${pct(toMin(h))}%` }} />)}
              {day.map((b, i) => {
                const hit = day.some((o) => o !== b && toMin(o.s.start) < toMin(b.s.end) && toMin(b.s.start) < toMin(o.s.end));
                return (
                <div key={b.code + b.s.start} className={cx('tt-block', PAL[codes.indexOf(b.code) % PAL.length], hit && 'clash')}
                  title={`${b.code} ${b.name} · ${t('Şube')} ${b.sec} · ${b.s.start}–${b.s.end}${hit ? ' · ' + t('Çakışma') : ''}`}
                  style={{ top: `${pct(toMin(b.s.start))}%`, height: `${pct(toMin(b.s.end)) - pct(toMin(b.s.start))}%`, insetInlineStart: `calc(${(lane[i] / lanes[i]) * 100}% + 3px)`, width: `calc(${100 / lanes[i]}% - 6px)` }}>
                  <span className="tb-code mono">{b.code}{hit && ' ⚠'}</span>
                  <span className="mono">{b.s.start}–{b.s.end}</span>
                  <span className="tb-kind">{t('Şube')} {b.sec} · {t(b.s.kind)}</span>
                </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div></div>
  );
}
