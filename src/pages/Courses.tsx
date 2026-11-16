import { useState } from 'react';
import { AlertTriangle, BookOpenText, CalendarSearch, CheckCircle2, Clock, Info, MapPin, RotateCcw, User } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { REG, student, typeLabel, type Course } from '../data/msku';
import { DAYS } from '../lib/util';
import { Button, Card, Chip, Drawer, PageHeader, Progress, Tabs } from '../components/ui';
import SpringReg from './SpringReg';
import { slotsOf } from '../data/timetable';
import { springTermOf } from '../lib/registration';
import { t, tOpt, term as termLabel } from '../lib/i18n';
import { COURSE_INFO } from '../data/msku';

/** Dersin amacı: kayıtlı özel metin varsa onun çevirisi, yoksa genel şablon */
export const aimOf = (c: Course) => COURSE_INFO[c.code]?.aim ? t(COURSE_INFO[c.code].aim)
  : c.t + c.u === 0 ? t('Yaz döneminde yapılan stajın raporlanması ve değerlendirilmesi; öğrencinin yazılım geliştirme sürecini gerçek bir kurumda gözlemlemesi.')
    : t('{name} dersinin temel kavramlarını, yöntemlerini ve uygulamalarını öğretmek; öğrencinin bu alandaki problemleri analiz edip çözüm geliştirebilmesini sağlamak.', { name: c.name });


export default function Courses() {
  const D = useData();
  const ECTS_LIMIT = REG.ectsLimit(D.agno);
  const { go, term, route } = useApp();
  const tab = route.query.get('tab') === 'spring' ? 'spring' : 'fall';
  const spring = springTermOf(D);
  const [open, setOpen] = useState<Course | null>(null);
  const ects = D.current.reduce((s, c) => s + c.ects, 0);

  if (term !== student.term) return <PastCourses term={term} />;

  return (
    <>
      <PageHeader title={t('Alınan Dersler & Ders Kayıt')} sub={`${termLabel(student.term)} · ${t('{n} ders', { n: D.current.length })} · ${t('Danışman:')} ${D.advisor.name}`} />
      <Tabs<'fall' | 'spring'> label={t('Dönem')} value={tab} onChange={(v) => go('courses', v === 'spring' ? { tab: 'spring' } : undefined)}
        tabs={[{ value: 'fall', label: `${termLabel(student.term)} · ${t('Alınan Dersler')}` }, { value: 'spring', label: `${termLabel(spring.name)} · ${t('Ders Kaydı')}` }]} />
      {tab === 'spring' ? <SpringReg /> : <>

      <Card className="reg-summary">
        <div className="reg-badges">
          <div className="reg-badge ok"><CheckCircle2 size={18} /><span><small>{t('Öğrenci kesinleştirme')}</small><strong>{t('Kesinleştirildi')}</strong></span></div>
          <div className="reg-badge ok"><CheckCircle2 size={18} /><span><small>{t('Danışman onayı')}</small><strong>{t('Onaylandı')}</strong></span></div>
          <div className="reg-ects">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small"><strong>{t('Toplam AKTS')}</strong></span>
              <span className="small mono"><strong>{ects}</strong> / {ECTS_LIMIT} {t('üst sınır')}</span>
            </div>
            <Progress value={ects} max={ECTS_LIMIT} tone="success" label={t('Toplam AKTS')} />
            <span className="muted small">{t('AGNO {g} olduğu için dönemlik üst sınırınız {n} AKTS (AGNO 2.00 altı: 30 · 2.00–2.99: 36 · 3.00 ve üstü: 40).', { g: D.agno.toFixed(2), n: ECTS_LIMIT })}</span>
          </div>
        </div>
        {D.deferred.length > 0 && (
          <p className="reg-note small"><AlertTriangle size={14} style={{ color: 'var(--warning)' }} /> {t('Ertelenen müfredat dersleri:')} {D.deferred.map((c) => `${c.code} (${c.deferReason === 'clash' ? t('saat çakışması') : t('AKTS sınırı')})`).join(', ')}. {t('Bu dersler açıldıkları ilk dönemde alınmalıdır.')}</p>
        )}
        <p className="reg-note small"><Info size={14} /> {t('Güz dönemi ders kaydı 11.09.2026’da tamamlandı. Bahar dönemi ders kaydı Ocak ayında; taslağınızı şimdiden hazırlayabilirsiniz.')}</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}><Button size="sm" variant="secondary" onClick={() => go('courses', { tab: 'spring' })}>{t('Bahar kaydı taslağını hazırla')} <span className="dir-icon">→</span></Button></div>
      </Card>

      <div className="table-card">
        <table className="atable courses-table">
          <thead>
            <tr>
              <th>{t('Ders')}</th>
              <th>{t('Tür')}</th>
              <th className="num" title={t('Haftalık Teori + Uygulama saati')}>{t('T+U')}</th>
              <th className="num">{t('AKTS')}</th>
              <th>{t('Öğretim üyesi')}</th>
              <th className="sr-only-th"><span className="sr-only">{t('İşlemler')}</span></th>
            </tr>
          </thead>
          <tbody>
            {D.current.map((c, i) => (
              <tr key={c.code}>
                <td>
                  <span className="mono small muted">{c.code} · {t('Şube')} {D.info[c.code].section}</span>
                  <strong className="block">{c.name}</strong>
                </td>
                <td className={i === 0 ? '' : undefined}>
                  
                  <span className="chip-stack">
                    <Chip tone={c.type === 'Zorunlu' ? 'brand' : 'info'}>{typeLabel(c.type)}</Chip>
                    {(c.attempt ?? 1) > 1 && <Chip tone="warning" icon={<RotateCcw size={12} />}>{t('Alttan · {n}. alış', { n: c.attempt ?? 1 })}</Chip>}
                  </span>
                  {(c.attempt ?? 1) > 1 && <span className="att-note">{c.waived ? t('Devam zorunluluğu yok') : t('Devam zorunlu (önceki alış TT)')}</span>}
                </td>
                <td className="num mono">{c.t}+{c.u}</td>
                <td className="num mono">{c.ects}</td>
                <td className="small">{tOpt(c.instructor ?? '')}</td>
                <td className={i === 0 ? 'row-actions' : 'row-actions'}>
                  
                  <Button size="sm" variant="secondary" onClick={() => setOpen(c)}><BookOpenText size={15} /> {t('Ders İçeriği')}</Button>
                  <Button size="sm" variant="ghost" onClick={() => go('schedule', { course: c.code })} disabled={!D.schedule.some((s) => s.code === c.code)}
                    title={D.schedule.some((s) => s.code === c.code) ? undefined : c.clash ? t('Başka bir dersle çakışıyor; devam zorunluluğu olmadığı için programa yerleştirilmedi') : t('Bu dersin haftalık saati yok')}>
                    <CalendarSearch size={15} /> {t('Programda Gör')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={2}>{t('Toplam')}</td><td className="num mono">{D.current.reduce((s, c) => s + c.t + c.u, 0)} {t('saat')}</td><td className="num mono">{ects}</td><td colSpan={2} /></tr>
          </tfoot>
        </table>
      </div>

      </>}
      <Drawer open={!!open} onClose={() => setOpen(null)} title={t('Ders İçeriği')}
        footer={open && D.schedule.some((s) => s.code === open.code) ? <Button variant="primary" onClick={() => go('schedule', { course: open.code })}><CalendarSearch size={16} /> {t('Programda Gör')}</Button> : undefined}>
        {open && <CourseDetail c={open} />}
      </Drawer>
    </>
  );
}

function CourseDetail({ c }: { c: Course }) {
  const D = useData();
  const info = D.info[c.code];
  const slots = c.clash ? slotsOf(c.code, info.section) : D.schedule.filter((s) => s.code === c.code);
  return (
    <div className="stack">
      <div>
        <span className="mono small muted">{c.code}</span>
        <h3 style={{ fontSize: '1.25rem', marginTop: 2 }}>{c.name}</h3>
      </div>
      <dl className="facts">
        <div><dt>{t('Şube')}</dt><dd>{info.section}</dd></div>
        <div><dt>{t('T+U saati')}</dt><dd>{c.t} + {c.u} = {c.t + c.u} {t('saat/hafta')}</dd></div>
        <div><dt>{t('AKTS')}</dt><dd>{c.ects}</dd></div>
        <div><dt>{t('Ders türü')}</dt><dd>{typeLabel(c.type)}</dd></div>
        {(c.attempt ?? 1) > 1 && <div className="wide"><dt>{t('Alış durumu')}</dt><dd><RotateCcw size={14} /> {t('Alttan ({n}. alış)', { n: c.attempt ?? 1 })} · {c.waived ? t('önceki alışta devam şartı sağlandı, devam zorunluluğu yok') : t('devamsızlıktan kalındığı için devam zorunlu')}</dd></div>}
        <div className="wide"><dt>{t('Öğretim üyesi')}</dt><dd><User size={14} /> {tOpt(c.instructor ?? '')}</dd></div>
        <div className="wide"><dt>{t('Derslik')}</dt><dd><MapPin size={14} /> {info.room}</dd></div>
      </dl>
      <div>
        <span className="eyebrow">{t('Dersin amacı')}</span>
        <p className="aim">{aimOf(c)}</p>
      </div>
      <div>
        <span className="eyebrow">{t('Haftalık saatler')}</span>
        {slots.length ? (
          <ul className="slot-list">
            {slots.map((s) => <li key={s.day + s.start}><Clock size={14} /> <strong>{DAYS[s.day]}</strong> <span className="mono">{s.start} – {s.end}</span> <Chip tone="neutral">{t(s.kind)}</Chip></li>)}
          </ul>
        ) : <p className="muted small">{t('Bu dersin haftalık ders saati yoktur (staj).')}</p>}
        {c.clash && <p className="small txt-warning mt12">{t('Bu şubenin saatleri başka bir dersinizle çakışıyor. Devam zorunluluğunuz olmadığı için ders programınıza eklenmedi; yalnızca sınavlarına girersiniz.')}</p>}
      </div>
    </div>
  );
}

export function PastTerm() {
  const { term, setTerm, go } = useApp();
  return (
    <div className="card empty">
      <h2>{t('{x} dönemi tamamlandı', { x: termLabel(term) })}</h2>
      <p className="muted">{t('Bu sayfa aktif dönemi gösterir. Geçmiş dönemin dersleri ve harf notları transkriptte yer alır.')}</p>
      <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <Button variant="primary" onClick={() => go('transcript')}>{t('Transkripte git')}</Button>
        <Button variant="secondary" onClick={() => setTerm(student.term)}>{t('{x} dönemine dön', { x: termLabel(student.term) })}</Button>
      </div>
    </div>
  );
}

/** Geçmiş dönemde alınan dersler (notlarıyla) */
function PastCourses({ term: name }: { term: string }) {
  const D = useData();
  const { go, setTerm } = useApp();
  const tm = D.terms.find((x) => x.name === name);
  const list = D.taken.filter((c) => c.semester === tm?.semester);
  return (
    <>
      <PageHeader title={t('Alınan Dersler & Ders Kayıt')} sub={`${termLabel(name)} · ${t('{n}. Yarıyıl', { n: tm?.semester ?? '' })} · ${t('{n} ders', { n: list.length })} · ${list.reduce((a, c) => a + c.ects, 0)} ${t('AKTS')}`} />
      <div className="table-card">
        <table className="atable courses-table">
          <thead><tr><th>{t('Ders')}</th><th>{t('Tür')}</th><th className="num">{t('T+U')}</th><th className="num">{t('AKTS')}</th><th>{t('Öğretim üyesi')}</th><th className="num">{t('Harf notu')}</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.code}>
                <td><span className="mono small muted">{c.code}</span><strong className="block">{c.name}</strong>
                  {(c.attempt ?? 1) > 1 && <Chip tone="warning" icon={<RotateCcw size={12} />}>{t('Alttan · {n}. alış', { n: c.attempt ?? 1 })}</Chip>}</td>
                <td><Chip tone={c.type === 'Zorunlu' ? 'brand' : 'info'}>{typeLabel(c.type)}</Chip></td>
                <td className="num mono">{c.t}+{c.u}</td>
                <td className="num mono">{c.ects}</td>
                <td className="small">{tOpt(c.instructor ?? '')}</td>
                <td className="num mono"><strong className={['FF', 'TT'].includes(c.grade ?? '') ? 'txt-danger' : ''}>{c.grade ?? '—'}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row mt12" style={{ gap: 8 }}>
        <Button variant="secondary" onClick={() => go('grades')}>{t('Not Listesi')}</Button>
        <Button variant="ghost" onClick={() => setTerm(student.term)}>{t('{x} dönemine dön', { x: termLabel(student.term) })}</Button>
      </div>
    </>
  );
}
