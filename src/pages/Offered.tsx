import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { student, typeLabel } from '../data/msku';
import { offeredIn, sectionCount, slotText, slotsOf } from '../data/timetable';
import { cx } from '../lib/util';
import { useApp, useData } from '../lib/store';
import { loadDraft, springTermOf } from '../lib/registration';
import { Card, Chip, PageHeader, Segmented } from '../components/ui';

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
      <PageHeader title="Açılan Bölüm Dersleri" sub={`${season === 'Güz' ? student.term : spring.name} · Yazılım Mühendisliği · ${all.length} ders · saatler bölüm ders programından`} />
      <Card className="">
        <div className="filter-bar">
          <Segmented<Season> label="Dönem" value={season} onChange={(s) => go('offered', s === 'Bahar' ? { season: 'Bahar' } : undefined)} options={[{ value: 'Güz', label: `${student.term}` }, { value: 'Bahar', label: `${spring.name}` }]} />
          <label className="input-icon">
            <Search size={16} aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ders kodu, adı veya öğretim üyesi ara" aria-label="Ders ara" />
          </label>
          <Segmented label="Sınıf" value={year} onChange={setYear} options={[{ value: 'all', label: 'Tüm sınıflar' }, { value: '1', label: '1. Sınıf' }, { value: '2', label: '2. Sınıf' }, { value: '3', label: '3. Sınıf' }, { value: '4', label: '4. Sınıf' }]} />
          <Segmented label="Tür" value={type} onChange={setType} options={[{ value: 'all', label: 'Tümü' }, { value: 'Zorunlu', label: 'Zorunlu' }, { value: 'Seçmeli', label: 'Teknik Seçmeli' }, { value: 'Diğer', label: 'Bölüm Dışı / Proje' }]} />
        </div>
        <p className="small muted mb12">{list.length} ders listeleniyor{season === 'Bahar' && <> · <button className="link-btn" onClick={() => go('courses', { tab: 'spring' })}>Bahar ders kaydı taslağına git →</button></>}</p>
        <div className="table-scroll">
          <table className="atable">
            <thead><tr><th>Kod</th><th>Ders adı</th><th className="num">Sınıf</th><th>Tür</th><th className="num" title="Haftalık Teori + Uygulama saati">T+U</th><th className="num">AKTS</th><th>Öğretim üyesi</th><th>Şube · Saat</th></tr></thead>
            <tbody>
              {list.map((c) => {
                const m = mine(c.code);
                const d = inDraft(c.code);
                return (
                  <tr key={c.code} className={cx((m || d) && 'row-mine')}>
                    <td className="mono small">{c.code}</td>
                    <td><strong>{c.name}</strong>{m && <Chip tone="success">Aldığınız ders · Şube {m.section}</Chip>}{d && <Chip tone="success">Kayıt taslağınızda</Chip>}</td>
                    <td className="num mono">{c.year}</td>
                    <td><Chip tone={c.type === 'Zorunlu' ? 'brand' : c.type === 'Seçmeli' ? 'info' : 'neutral'}>{typeLabel(c.type)}</Chip></td>
                    <td className="num mono">{c.t}+{c.u}</td>
                    <td className="num mono">{c.ects}</td>
                    <td className="small muted">{c.instructor ?? 'Henüz atanmadı'}</td>
                    <td className="small">{Array.from({ length: c.sections }, (_, i) => i + 1).map((s) => <span key={s} className="block">{c.sections > 1 && <strong>Şube {s}: </strong>}{slotText(slotsOf(c.code, s))}</span>)}</td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={8} className="center muted">Aramanızla eşleşen ders yok. Filtreleri temizlemeyi deneyin.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
