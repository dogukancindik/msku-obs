import React from 'react';
import { ArrowUpRight, BookOpen, CalendarClock, Clock, GraduationCap, Mail, MapPin, Megaphone, ShieldAlert, ShieldCheck, TrendingUp, AlertTriangle, RotateCcw } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { ANNOUNCEMENTS, CURRENT, ECTS_TOTAL, EXAMS, SCHEDULE, byCode, student, today } from '../data/msku';
import { attendance, cx, DAYS, daysUntil, fmtDate, fmtGpa, fmtTime, inDays, weekday } from '../lib/util';
import { Chip, Progress } from '../components/ui';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar';
};

function ActionCard({ to, query, label, icon, children, first }: { to: string; query?: Record<string, string>; label: string; icon: React.ReactNode; children: React.ReactNode; first?: boolean }) {
  const { go } = useApp();
  return (
    <button className={cx('stat-card', first && '')} onClick={() => go(to, query)} aria-label={`${label} — ayrıntılar`}>
      
      <span className="stat-top">
        <span className="stat-ic">{icon}</span>
        <span className="stat-label">{label}</span>
        <ArrowUpRight size={18} className="stat-go" aria-hidden />
      </span>
      {children}
    </button>
  );
}

export default function Dashboard() {
  const D = useData();
  const { go, inbox, me } = useApp();
  const ects = D.current.reduce((s, c) => s + c.ects, 0);
  const pct = Math.round((D.ectsDone / ECTS_TOTAL) * 100);
  const att = D.current.map((c) => ({ c, a: attendance(D, c.code) })).filter((x) => x.a.required);
  const over = att.filter((x) => x.a.level === 'over');
  const critical = att.filter((x) => x.a.level === 'danger' || x.a.level === 'over');
  const repeats = D.current.filter((c) => (c.attempt ?? 1) > 1);
  const pendingFails = D.failed.filter((f) => !f.retaking);
  const warn = att.filter((x) => x.a.level === 'warn');

  // today or next teaching day
  const wd = weekday(today);
  let day = wd;
  let list = D.schedule.filter((s) => s.day === wd);
  if (!list.length) for (let i = 1; i <= 7; i++) { const d = (wd + i) % 7; const l = D.schedule.filter((s) => s.day === d); if (l.length) { day = d; list = l; break; } }
  list = [...list].sort((a, b) => a.start.localeCompare(b.start));
  const nextExams = D.exams.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => +a.date - +b.date).slice(0, 3);
  const msgs = inbox.slice(0, 3);
  // duyurular: sınav salonu duyurusu öğrencinin kendi yaklaşan ara sınavından (salon = ortak programdaki derslik)
  const nextMid = D.exams.filter((e) => e.type === 'Ara Sınav' && daysUntil(e.date) >= 0).sort((a, b) => +a.date - +b.date)[0];
  const announcements = [
    ...(nextMid ? [{ id: 'a-exam', title: 'Ara sınav salon bilgisi', body: `${nextMid.code} ara sınavı ${fmtDate(nextMid.date, { day: 'numeric', month: 'long' })} ${fmtTime(nextMid.date)}’da ${nextMid.room} salonunda yapılacaktır.` }] : []),
    ...ANNOUNCEMENTS.filter((a) => a.id !== 'a1'),
  ];

  return (
    <div className="dash">
      <div className="dash-hello">
        <p className="muted">{fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <h1>{greeting()}, {me.firstName}</h1>
        <p className="muted">{student.programShort} · {D.year}. Sınıf · {D.semester}. Yarıyıl</p>
      </div>

      <section className="stat-grid" aria-label="Özet">
        <ActionCard to="averages" label="Genel Ortalama (AGNO)" icon={<TrendingUp size={18} />} first>
          <span className="stat-value"><span className="mono">{fmtGpa(D.agno)}</span><small>/ 4.00</small></span>
          <span className="stat-sub">{D.agno < 2
            ? <Chip tone="warning" icon={<AlertTriangle size={12} />}>2.00 altında · dönem sınırı 30 AKTS</Chip>
            : <Chip tone="success">Son dönem YANO {fmtGpa(D.lastYano)}</Chip>}</span>
        </ActionCard>
        <ActionCard to="courses" label="Aktif Dönem" icon={<BookOpen size={18} />}>
          <span className="stat-value"><span className="mono">{D.current.length}</span><small>Ders</small><span className="stat-sep">/</span><span className="mono">{ects}</span><small>AKTS</small></span>
          <span className="stat-sub muted">{student.term} · Danışman onaylı{repeats.length ? ` · ${repeats.length} ders alttan` : ''}</span>
        </ActionCard>
        <ActionCard to="curriculum" label="Mezuniyet İlerlemesi" icon={<GraduationCap size={18} />}>
          <span className="stat-value"><span className="mono">{D.ectsDone}</span><small>/ {ECTS_TOTAL} AKTS</small><span className="stat-pct">%{pct}</span></span>
          <Progress value={D.ectsDone} max={ECTS_TOTAL} label="Mezuniyet ilerlemesi" />
        </ActionCard>
        <ActionCard to="attendance" label="Devamsızlık Özeti" icon={critical.length ? <ShieldAlert size={18} /> : warn.length ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}>
          {critical.length ? (
            <>
              <span className="stat-value text txt-danger">{over.length ? `${over.length} derste sınır aşıldı (TT)` : `${critical.length} derste kritik sınır`}</span>
              <span className="stat-sub muted">{critical.map((x) => `${x.c.code} ${x.a.absent}/${x.a.limit} saat`).join(' · ')}</span>
            </>
          ) : warn.length ? (
            <>
              <span className="stat-value text txt-warning">{warn.length} derste sınıra yakın</span>
              <span className="att-warn-list">
                {warn.map((x) => (
                  <span key={x.c.code} className="att-warn-item">
                    <strong>{x.c.code}</strong> {x.c.name}
                    <span className="mono">{x.a.absent}/{x.a.limit} saat · {x.a.left} saat hakkın kaldı</span>
                  </span>
                ))}
              </span>
            </>
          ) : (
            <>
              <span className="stat-value text txt-success">Tüm dersler güvenli</span>
              <span className="stat-sub muted">Hiçbir derste devamsızlık sınırına yaklaşmadınız</span>
            </>
          )}
        </ActionCard>
      </section>

      {D.failed.length > 0 && (
        <div className="alert warning" role="status">
          <RotateCcw size={18} />
          <div>
            <strong>{D.failed.length} dersi tekrar (alttan) alman gerekiyor</strong>
            <p className="small">
              {D.failed.map((f) => `${f.course.code} (${f.reason}${f.retaking ? ', bu dönem alınıyor' : `, ${f.offered} döneminde açılır`})`).join(' · ')}
              {pendingFails.length > 0 && ' · Ders kaydında alttan dersler önceliklidir.'}
            </p>
          </div>
          <span className="row link-btn" style={{ gap: 8 }}>
            {D.failed.some((f) => f.offered === 'Bahar') && <button className="btn btn-primary btn-sm" onClick={() => go('courses', { tab: 'spring' })}>Bahar kaydı</button>}
            <button className="btn btn-secondary btn-sm" onClick={() => go('curriculum', { focus: 'retake' })}>Ayrıntılar</button>
          </span>
        </div>
      )}

      <div className="dash-row">
        <button className="panel-card" onClick={() => go('schedule')}>
          <span className="panel-head">
            <span className="card-title"><span className="card-icon"><Clock size={18} /></span><span><h2>{day === wd ? 'Bugünkü Dersler' : 'Sıradaki Dersler'}</h2>
              <span className="card-sub">{day === wd ? DAYS[wd] : `Bugün ders yok · ${DAYS[day]}`}</span></span></span>
            <ArrowUpRight size={18} className="stat-go" aria-hidden />
          </span>
          <ul className="tl">
            {list.map((s) => {
              const c = byCode(s.code)!;
              return (
                <li key={s.code + s.start}>
                  <span className="tl-time mono">{s.start}<small>{s.end}</small></span>
                  <span className="tl-body">
                    <strong>{c.name}</strong>
                    <span className="muted small"><MapPin size={12} /> {s.room} · {s.code} · {s.kind}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </button>

        <button className="panel-card" onClick={() => go('schedule', { tab: 'exams' })}>
          <span className="panel-head">
            <span className="card-title"><span className="card-icon"><CalendarClock size={18} /></span><span><h2>Yaklaşan Sınavlar</h2><span className="card-sub">Ara sınav haftası</span></span></span>
            <ArrowUpRight size={18} className="stat-go" aria-hidden />
          </span>
          <ul className="exam-mini">
            {nextExams.map((e, i) => (
              <li key={e.code + e.type} className={cx(i === 0 && 'first')}>
                <span className="em-date"><strong>{e.date.getDate()}</strong><small>{fmtDate(e.date, { month: 'short' })}</small></span>
                <span className="em-body">
                  <strong>{byCode(e.code)!.name}</strong>
                  <span className="muted small">{e.type} · {fmtTime(e.date)} · {e.room}</span>
                </span>
                <Chip tone={daysUntil(e.date) <= 4 ? 'warning' : 'neutral'}>{inDays(e.date)}</Chip>
              </li>
            ))}
          </ul>
        </button>

        <div className="panel-card static">
          <span className="panel-head">
            <span className="card-title"><span className="card-icon"><Megaphone size={18} /></span><span><h2>Duyurular & Hoca Mesajları</h2><span className="card-sub">{inbox.filter((m) => !m.read).length} okunmamış mesaj</span></span></span>
          </span>
          <ul className="ann">
            {msgs.map((m) => (
              <li key={m.id}>
                <button className="ann-item" onClick={() => go('messages', { id: m.id })}>
                  <span className={cx('ann-dot', !m.read && 'unread')} aria-hidden />
                  <span>
                    <strong>{m.subject}</strong>
                    <span className="muted small"><Mail size={12} /> {m.from} · {fmtDate(m.date, { day: 'numeric', month: 'short' })}</span>
                  </span>
                </button>
              </li>
            ))}
            {announcements.map((a) => (
              <li key={a.id}>
                <div className="ann-item static">
                  <span className="ann-dot info" aria-hidden />
                  <span><strong>{a.title}</strong><span className="muted small">Duyuru · {a.body}</span></span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
