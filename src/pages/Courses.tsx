import { useState } from 'react';
import { AlertTriangle, BookOpenText, CalendarSearch, CheckCircle2, Clock, Info, MapPin, RotateCcw, User } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { REG, student, typeLabel, type Course } from '../data/msku';
import { DAYS } from '../lib/util';
import { Button, Card, Chip, Drawer, PageHeader, Progress, Tabs } from '../components/ui';
import SpringReg from './SpringReg';
import { slotsOf } from '../data/timetable';
import { springTermOf } from '../lib/registration';


export default function Courses() {
  const D = useData();
  const ECTS_LIMIT = REG.ectsLimit(D.agno);
  const { go, term, route } = useApp();
  const tab = route.query.get('tab') === 'spring' ? 'spring' : 'fall';
  const spring = springTermOf(D);
  const [open, setOpen] = useState<Course | null>(null);
  const ects = D.current.reduce((s, c) => s + c.ects, 0);

  if (term !== student.term) return <PastTerm />;

  return (
    <>
      <PageHeader title="Alınan Dersler & Ders Kayıt" sub={`${student.term} · ${D.current.length} ders · Danışman: ${D.advisor.name}`} />
      <Tabs<'fall' | 'spring'> label="Dönem" value={tab} onChange={(t) => go('courses', t === 'spring' ? { tab: 'spring' } : undefined)}
        tabs={[{ value: 'fall', label: `${student.term} · Alınan Dersler` }, { value: 'spring', label: `${spring.name} · Ders Kaydı` }]} />
      {tab === 'spring' ? <SpringReg /> : <>

      <Card className="reg-summary">
        <div className="reg-badges">
          <div className="reg-badge ok"><CheckCircle2 size={18} /><span><small>Öğrenci kesinleştirme</small><strong>Kesinleştirildi</strong></span></div>
          <div className="reg-badge ok"><CheckCircle2 size={18} /><span><small>Danışman onayı</small><strong>Onaylandı</strong></span></div>
          <div className="reg-ects">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small"><strong>Toplam AKTS</strong></span>
              <span className="small mono"><strong>{ects}</strong> / {ECTS_LIMIT} üst sınır</span>
            </div>
            <Progress value={ects} max={ECTS_LIMIT} tone="success" label="Toplam AKTS" />
            <span className="muted small">AGNO {D.agno.toFixed(2)} olduğu için dönemlik üst sınırınız {ECTS_LIMIT} AKTS (AGNO 2.00 altı: 30 · 2.00–2.99: 36 · 3.00 ve üstü: 40).</span>
          </div>
        </div>
        {D.deferred.length > 0 && (
          <p className="reg-note small"><AlertTriangle size={14} style={{ color: 'var(--warning)' }} /> Ertelenen müfredat dersleri: {D.deferred.map((c) => `${c.code} (${c.deferReason === 'clash' ? 'saat çakışması' : 'AKTS sınırı'})`).join(', ')}. Bu dersler açıldıkları ilk dönemde alınmalıdır.</p>
        )}
        <p className="reg-note small"><Info size={14} /> Güz dönemi ders kaydı 11.09.2026’da tamamlandı. Bahar dönemi ders kaydı Ocak ayında; taslağınızı şimdiden hazırlayabilirsiniz.</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}><Button size="sm" variant="secondary" onClick={() => go('courses', { tab: 'spring' })}>Bahar kaydı taslağını hazırla →</Button></div>
      </Card>

      <div className="table-card">
        <table className="atable courses-table">
          <thead>
            <tr>
              <th>Ders</th>
              <th>Tür</th>
              <th className="num" title="Haftalık Teori + Uygulama saati">T+U</th>
              <th className="num">AKTS</th>
              <th>Öğretim üyesi</th>
              <th className="sr-only-th"><span className="sr-only">İşlemler</span></th>
            </tr>
          </thead>
          <tbody>
            {D.current.map((c, i) => (
              <tr key={c.code}>
                <td>
                  <span className="mono small muted">{c.code} · Şube {D.info[c.code].section}</span>
                  <strong className="block">{c.name}</strong>
                </td>
                <td className={i === 0 ? '' : undefined}>
                  
                  <span className="chip-stack">
                    <Chip tone={c.type === 'Zorunlu' ? 'brand' : 'info'}>{typeLabel(c.type)}</Chip>
                    {(c.attempt ?? 1) > 1 && <Chip tone="warning" icon={<RotateCcw size={12} />}>Alttan · {c.attempt}. alış</Chip>}
                  </span>
                  {(c.attempt ?? 1) > 1 && <span className="att-note">{c.waived ? 'Devam zorunluluğu yok' : 'Devam zorunlu (önceki alış TT)'}</span>}
                </td>
                <td className="num mono">{c.t}+{c.u}</td>
                <td className="num mono">{c.ects}</td>
                <td className="small">{c.instructor}</td>
                <td className={i === 0 ? 'row-actions' : 'row-actions'}>
                  
                  <Button size="sm" variant="secondary" onClick={() => setOpen(c)}><BookOpenText size={15} /> Ders İçeriği</Button>
                  <Button size="sm" variant="ghost" onClick={() => go('schedule', { course: c.code })} disabled={!D.schedule.some((s) => s.code === c.code)}
                    title={D.schedule.some((s) => s.code === c.code) ? undefined : c.clash ? 'Başka bir dersle çakışıyor; devam zorunluluğu olmadığı için programa yerleştirilmedi' : 'Bu dersin haftalık saati yok'}>
                    <CalendarSearch size={15} /> Programda Gör
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={2}>Toplam</td><td className="num mono">{D.current.reduce((s, c) => s + c.t + c.u, 0)} saat</td><td className="num mono">{ects}</td><td colSpan={2} /></tr>
          </tfoot>
        </table>
      </div>

      </>}
      <Drawer open={!!open} onClose={() => setOpen(null)} title="Ders İçeriği"
        footer={open && D.schedule.some((s) => s.code === open.code) ? <Button variant="primary" onClick={() => go('schedule', { course: open.code })}><CalendarSearch size={16} /> Programda Gör</Button> : undefined}>
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
        <div><dt>Şube</dt><dd>{info.section}</dd></div>
        <div><dt>T+U saati</dt><dd>{c.t} + {c.u} = {c.t + c.u} saat/hafta</dd></div>
        <div><dt>AKTS</dt><dd>{c.ects}</dd></div>
        <div><dt>Ders türü</dt><dd>{typeLabel(c.type)}</dd></div>
        {(c.attempt ?? 1) > 1 && <div className="wide"><dt>Alış durumu</dt><dd><RotateCcw size={14} /> Alttan ({c.attempt}. alış) · {c.waived ? 'önceki alışta devam şartı sağlandı, devam zorunluluğu yok' : 'devamsızlıktan kalındığı için devam zorunlu'}</dd></div>}
        <div className="wide"><dt>Öğretim üyesi</dt><dd><User size={14} /> {c.instructor}</dd></div>
        <div className="wide"><dt>Derslik</dt><dd><MapPin size={14} /> {info.room}</dd></div>
      </dl>
      <div>
        <span className="eyebrow">Dersin amacı</span>
        <p className="aim">{info.aim}</p>
      </div>
      <div>
        <span className="eyebrow">Haftalık saatler</span>
        {slots.length ? (
          <ul className="slot-list">
            {slots.map((s) => <li key={s.day + s.start}><Clock size={14} /> <strong>{DAYS[s.day]}</strong> <span className="mono">{s.start} – {s.end}</span> <Chip tone="neutral">{s.kind}</Chip></li>)}
          </ul>
        ) : <p className="muted small">Bu dersin haftalık ders saati yoktur (staj).</p>}
        {c.clash && <p className="small txt-warning mt12">Bu şubenin saatleri başka bir dersinizle çakışıyor. Devam zorunluluğunuz olmadığı için ders programınıza eklenmedi; yalnızca sınavlarına girersiniz.</p>}
      </div>
    </div>
  );
}

export function PastTerm() {
  const { term, setTerm, go } = useApp();
  return (
    <div className="card empty">
      <h2>{term} dönemi tamamlandı</h2>
      <p className="muted">Bu sayfa aktif dönemi gösterir. Geçmiş dönemin dersleri ve harf notları transkriptte yer alır.</p>
      <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <Button variant="primary" onClick={() => go('transcript')}>Transkripte git</Button>
        <Button variant="secondary" onClick={() => setTerm(student.term)}>{student.term} dönemine dön</Button>
      </div>
    </div>
  );
}
