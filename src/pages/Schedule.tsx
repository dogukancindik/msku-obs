import { useMemo, useState } from 'react';
import { CalendarClock, Clock, MapPin, Printer, User, X } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { byCode, student, type ExamType } from '../data/msku';
import { DAYS, DAYS_SHORT, cx, daysUntil, fmtDate, fmtTime, inDays, toMin, weekday } from '../lib/util';
import { Button, Chip, PageHeader, Segmented, Tabs } from '../components/ui';
import { today } from '../data/msku';
import { PastTerm } from './Courses';
import { t, tOpt, term as termLabel } from '../lib/i18n';

type Tab = 'program' | 'exams';
const PALETTE = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
const colorOf = (D: { current: { code: string }[] }, code: string) => PALETTE[Math.max(0, D.current.findIndex((c) => c.code === code)) % PALETTE.length];

export default function Schedule() {
  const D = useData();
  const { route, go, term } = useApp();
  const [tab, setTab] = useState<Tab>(route.query.get('tab') === 'exams' ? 'exams' : 'program');
  if (term !== student.term) return <PastTerm />;
  const highlight = route.query.get('course');
  return (
    <>
      <PageHeader title={t('Ders Programı & Sınav Takvimi')} sub={`${termLabel(student.term)} · ${t('{n} ders', { n: D.current.length })}`} />
      <Tabs<Tab> label={t('Program sekmeleri')} value={tab} onChange={(v) => { setTab(v); if (highlight) go('schedule', v === 'exams' ? { tab: 'exams' } : undefined); }}
        tabs={[{ value: 'program', label: t('Haftalık Ders Programı') }, { value: 'exams', label: t('Sınav Takvimi'), count: D.exams.filter((e) => daysUntil(e.date) >= 0).length }]} />
      {tab === 'program' ? <Program highlight={highlight} /> : <Exams />}
    </>
  );
}

function Program({ highlight }: { highlight: string | null }) {
  const D = useData();
  const { go, me } = useApp();
  const [mode, setMode] = useState<'detail' | 'simple'>('detail');
  const start = toMin('08:30'), end = toMin('17:15');
  const pct = (m: number) => ((m - start) / (end - start)) * 100;
  const hours = ['08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30'];
  const wd = weekday(today);
  const hc = highlight ? byCode(highlight) : null;

  return (
    <>
      <div className="sched-tools">
        {hc ? (
          <div className="hl-banner" role="status">
            <span className={cx('hl-sw', colorOf(D, hc.code))} />
            <span><strong>{hc.code} {hc.name}</strong> {t('vurgulanıyor')} · {D.schedule.filter((s) => s.code === hc.code).map((s) => `${DAYS[s.day]} ${s.start}–${s.end}`).join(', ')}</span>
            <button className="icon-btn sm" onClick={() => go('schedule')} aria-label={t('Vurguyu kaldır')}><X size={14} /></button>
          </div>
        ) : <span className="muted small">{t('Ardışık ders saatleri tek blok olarak gösterilir.')}</span>}
        <div className="row">
          <Segmented<'detail' | 'simple'> label={t('Görünüm')} value={mode} onChange={setMode} options={[{ value: 'detail', label: t('Detaylı Görünüm') }, { value: 'simple', label: t('Sade Görünüm') }]} />
          <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer size={15} /> {t('Programı Yazdır')}</Button>
        </div>
      </div>

      <div className="tt-card card print-area">
        <div className="print-only print-head"><strong>MSKÜ · {me.name} · {termLabel(student.term)} {t('Haftalık Ders Programı')}</strong></div>
        <div className={cx('tt', mode)}>
          <div className="tt-hours">
            {hours.map((h) => <span key={h} style={{ top: `${pct(toMin(h))}%` }}>{h}</span>)}
          </div>
          {[0, 1, 2, 3, 4].map((d) => (
            <div key={d} className={cx('tt-day', d === wd && 'today')}>
              <div className="tt-dname">
                <span className="only-wide">{DAYS[d]}</span><span className="only-narrow">{DAYS_SHORT[d]}</span>
                {d === wd && <span className="today-pill">{t('Bugün')}</span>}
              </div>
              <div className="tt-col">
                {hours.map((h) => <span key={h} className="tt-line" style={{ top: `${pct(toMin(h))}%` }} />)}
                {D.schedule.filter((s) => s.day === d).map((s) => {
                  const c = byCode(s.code)!;
                  const dim = highlight && highlight !== s.code;
                  return (
                    <div key={s.code + s.start} className={cx('tt-block', colorOf(D, s.code), highlight === s.code && 'hl', dim && 'dim')}
                      style={{ top: `${pct(toMin(s.start))}%`, height: `${pct(toMin(s.end)) - pct(toMin(s.start))}%` }}>
                      <span className="tb-code mono">{s.code}</span>
                      <strong>{c.name}</strong>
                      <span className="mono">{s.start} – {s.end}</span>
                      {mode === 'detail' && <>
                        <span><MapPin size={11} /> {s.room}</span>
                        <span><User size={11} /> {tOpt(c.instructor ?? '')}</span>
                        <span className="tb-kind">{t(s.kind)}</span>
                      </>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {D.current.filter((c) => c.t + c.u === 0).map((c) => <p key={c.code} className="muted small mt12">{t('{x} dersinin haftalık saati yoktur.', { x: `${c.code} ${c.name}` })}</p>)}
      {D.current.filter((c) => c.clash).map((c) => <p key={c.code} className="small txt-warning mt12">{t('{x} (alttan, devam zorunluluğu yok) şube {n} saatleri başka bir dersinizle çakıştığı için programa eklenmedi; yalnızca sınavlarına girersiniz.', { x: `${c.code} ${c.name}`, n: c.section ?? 1 })}</p>)}
    </>
  );
}

type F = 'all' | ExamType;
function Exams() {
  const D = useData();
  const [f, setF] = useState<F>('all');
  const [past, setPast] = useState(false);
  const list = useMemo(() => D.exams.filter((e) => (f === 'all' || e.type === f) && (past || daysUntil(e.date) >= 0)).sort((a, b) => +a.date - +b.date), [f, past]);
  let month = '';
  return (
    <>
      <div className="sched-tools">
        <Segmented<F> label={t('Sınav tipi')} value={f} onChange={setF} options={[{ value: 'all', label: t('Tümü') }, { value: 'Ara Sınav', label: t('Ara Sınav') }, { value: 'Yarıyıl Sonu', label: t('Yarıyıl Sonu') }, { value: 'Bütünleme', label: t('Bütünleme') }]} />
        <label className="check"><input type="checkbox" checked={past} onChange={(e) => setPast(e.target.checked)} /> {t('Geçmiş sınavları göster')}</label>
      </div>
      <div className="exam-list">
        {list.map((e) => {
          const d = daysUntil(e.date);
          const m = fmtDate(e.date, { month: 'long', year: 'numeric' });
          const head = m !== month ? ((month = m), <h2 key={'h' + m} className="month-h">{m}</h2>) : null;
          const c = byCode(e.code)!;
          return (
            <div key={e.code + e.type}>
              {head}
              <article className={cx('exam-row', d >= 0 && d <= 4 && 'soon', d < 0 && 'past')}>
                <div className="er-date"><span className="er-dow">{fmtDate(e.date, { weekday: 'short' })}</span><strong>{e.date.getDate()}</strong></div>
                <div className="er-body">
                  <div className="row" style={{ flexWrap: 'wrap' }}>
                    <span className="mono small muted">{e.code}</span>
                    <Chip tone={e.type === 'Ara Sınav' ? 'info' : e.type === 'Yarıyıl Sonu' ? 'brand' : 'neutral'}>{t(e.type)}</Chip>
                  </div>
                  <strong className="er-name">{c.name}</strong>
                  <div className="er-facts small muted">
                    <span><Clock size={13} /> {fmtTime(e.date)} · {t('{n} dk', { n: e.durationMin })}</span>
                    <span><MapPin size={13} /> {e.room}</span>
                  </div>
                </div>
                {d < 0 ? <Chip tone="neutral">{t('Yapıldı')}</Chip> : <Chip tone={d <= 4 ? 'warning' : 'neutral'} icon={<CalendarClock size={12} />}>{inDays(e.date)}</Chip>}
              </article>
            </div>
          );
        })}
        {list.length === 0 && <p className="muted">{t('Bu filtreye uyan sınav yok.')}</p>}
      </div>
    </>
  );
}
