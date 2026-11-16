import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { student, typeLabel } from '../data/msku';
import { offeredIn, sectionCount, slotText, slotsOf } from '../data/timetable';
import { cx } from '../lib/util';
import { useApp, useData } from '../lib/store';
import { loadDraft, springTermOf } from '../lib/registration';
import { Card, Chip, PageHeader, Segmented } from '../components/ui';
import { t, tOpt, term as termLabel } from '../lib/i18n';

type Season = 'Güz' | 'Bahar';

export default function Offered() {
  const D = useData();
  const { me, route, go } = useApp();
  const season: Season = route.query.get('season') === 'Bahar' ? 'Bahar' : 'Güz';
  const spring = springTermOf(D);
  const draft = useMemo(() => (season === 'Bahar' ? loadDraft(D, me.email) : null), [season, D, me.email]);
  const [q, setQ] = useState('');
  const [year, setYear] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [type, setType] = useState<'all' | 'Zorunlu' | 'Seçmeli' | 'Diğer'>('all');
  const all = useMemo(() => offeredIn(season)
    .map((c) => ({ ...c, year: Math.ceil(c.semester / 2), sections: sectionCount(c.code) }))
    .sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code)), [season]);
  const n = q.trim().toLocaleLowerCase('tr');
  const list = all.filter((c) => (year === 'all' || c.year === +year)
    && (type === 'all' || (type === 'Diğer' ? c.type !== 'Zorunlu' && c.type !== 'Seçmeli' : c.type === type))
    && (!n || `${c.code} ${c.code.replace(' ', '')} ${c.name} ${c.instructor ?? ''}`.toLocaleLowerCase('tr').includes(n)));
  const mine = (code: string) => season === 'Güz' ? D.current.find((x) => x.code === code) : undefined;
  const inDraft = (code: string) => !!draft?.codes.includes(code);

  return (
    <>
      <PageHeader title={t('Açılan Bölüm Dersleri')} sub={`${termLabel(season === 'Güz' ? student.term : spring.name)} · ${t('Yazılım Mühendisliği')} · ${t('{n} ders', { n: all.length })} · ${t('saatler bölüm ders programından')}`} />
      <Card className="">
        <div className="filter-bar">
          <Segmented<Season> label={t('Dönem')} value={season} onChange={(s) => go('offered', s === 'Bahar' ? { season: 'Bahar' } : undefined)} options={[{ value: 'Güz', label: termLabel(student.term) }, { value: 'Bahar', label: termLabel(spring.name) }]} />
          <label className="input-icon">
            <Search size={16} aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Ders kodu, adı veya öğretim üyesi ara')} aria-label={t('Ders ara')} />
          </label>
          <Segmented label={t('Sınıf')} value={year} onChange={setYear} options={[{ value: 'all', label: t('Tüm sınıflar') }, ...(['1', '2', '3', '4'] as const).map((n) => ({ value: n, label: t('{n}. Sınıf', { n }) }))]} />
          <Segmented label={t('Tür')} value={type} onChange={setType} options={[{ value: 'all', label: t('Tümü') }, { value: 'Zorunlu', label: t('Zorunlu') }, { value: 'Seçmeli', label: t('Teknik Seçmeli') }, { value: 'Diğer', label: t('Bölüm Dışı / Proje') }]} />
        </div>
        <p className="small muted mb12">{t('{n} ders listeleniyor', { n: list.length })}{season === 'Bahar' && <> · <button className="link-btn" onClick={() => go('courses', { tab: 'spring' })}>{t('Bahar ders kaydı taslağına git')} <span className="dir-icon">→</span></button></>}</p>
        <div className="table-scroll">
          <table className="atable">
            <thead><tr><th>{t('Kod')}</th><th>{t('Ders adı')}</th><th className="num">{t('Sınıf')}</th><th>{t('Tür')}</th><th className="num" title={t('Haftalık Teori + Uygulama saati')}>{t('T+U')}</th><th className="num">{t('AKTS')}</th><th>{t('Öğretim üyesi')}</th><th>{t('Şube · Saat')}</th></tr></thead>
            <tbody>
              {list.map((c) => {
                const m = mine(c.code);
                const d = inDraft(c.code);
                return (
                  <tr key={c.code} className={cx((m || d) && 'row-mine')}>
                    <td className="mono small">{c.code}</td>
                    <td><strong>{c.name}</strong>{m && <Chip tone="success">{t('Aldığınız ders')} · {t('Şube')} {m.section}</Chip>}{d && <Chip tone={draft?.status === 'submitted' ? 'info' : 'success'}>{draft?.status === 'submitted' ? t('Danışman onayında') : t('Kayıt taslağınızda')}</Chip>}</td>
                    <td className="num mono">{c.year}</td>
                    <td><Chip tone={c.type === 'Zorunlu' ? 'brand' : c.type === 'Seçmeli' ? 'info' : 'neutral'}>{typeLabel(c.type)}</Chip></td>
                    <td className="num mono">{c.t}+{c.u}</td>
                    <td className="num mono">{c.ects}</td>
                    <td className="small muted">{c.instructor ? tOpt(c.instructor) : t('Henüz atanmadı')}</td>
                    <td className="small">{Array.from({ length: c.sections }, (_, i) => i + 1).map((s) => <span key={s} className="block">{c.sections > 1 && <strong>{t('Şube')} {s}: </strong>}{slotText(slotsOf(c.code, s))}</span>)}</td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={8} className="center muted">{t('Aramanızla eşleşen ders yok. Filtreleri temizlemeyi deneyin.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
