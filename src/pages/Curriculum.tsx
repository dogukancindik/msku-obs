import { useEffect, useRef, useState } from 'react';
import { useApp, useData } from '../lib/store';
import { CheckCircle2, CircleDashed, Clock, Info, PauseCircle, RotateCcw, XCircle } from 'lucide-react';
import { CURRICULUM, ECTS_TOTAL, ELECTIVES_REQUIRED, FALL_POOL, LETTER_INFO, REG, isFail, student, typeLabel, type Course } from '../data/msku';
import { cx, latestAttempts } from '../lib/util';
import { Card, Chip, PageHeader, Progress, Segmented } from '../components/ui';

type Status = 'all' | 'done' | 'taking' | 'failed' | 'notyet';

export default function Curriculum() {
  const D = useData();
  const [sem, setSem] = useState(D.semester);
  const { route } = useApp();
  const latest = latestAttempts(D.taken);
  const takenOf = (code: string) => latest.find((x) => x.code === code);
  const isCurrent = (code: string) => D.current.some((x) => x.code === code);
  const statusOf = (c: { code: string }): Exclude<Status, 'all'> => {
    if (isCurrent(c.code)) return 'taking';
    const t = takenOf(c.code);
    return t ? (isFail(t.grade) ? 'failed' : 'done') : 'notyet';
  };
  const retakeRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (route.query.get('focus') === 'retake') retakeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [route.query]);
  const curEcts = D.current.reduce((a, c) => a + c.ects, 0);
  const [st, setSt] = useState<Status>('all');

  const G = REG.graduation;
  // tamamlanan = son alışı başarılı olan dersler; alınıyor = bu dönem (alttan dahil)
  const passed = latest.filter((c) => !isFail(c.grade) && !isCurrent(c.code));
  const sumP = (type: string) => passed.filter((c) => c.type === type).reduce((a, c) => a + c.ects, 0);
  const sumT = (type: string) => D.current.filter((c) => c.type === type).reduce((a, c) => a + c.ects, 0);
  const cats = [
    { key: 'mandatory', label: 'Zorunlu Dersler', target: G.mandatory, done: sumP('Zorunlu'), taking: sumT('Zorunlu') },
    { key: 'technical', label: 'Bölüm İçi Teknik Seçmeli', target: G.technical, done: sumP('Seçmeli'), taking: sumT('Seçmeli') },
    { key: 'nonDept', label: 'Bölüm Dışı Seçmeli', target: G.nonDept, done: sumP('Üniversite Seçmeli'), taking: sumT('Üniversite Seçmeli') },
    { key: 'inter', label: 'Disiplinlerarası Proje', target: G.interdisciplinary, done: sumP('Disiplinlerarası Proje'), taking: sumT('Disiplinlerarası Proje') },
  ];
  const sp = ['SE 3001', 'SE 4001'].map((code) => ({ code, st: statusOf({ code }) }));
  const spDone = sp.filter((x) => x.st === 'done').length;
  const spTaking = sp.filter((x) => x.st === 'taking').length;
  const termOf = (n?: number) => D.terms.find((t) => t.semester === n)?.name ?? `${n}. yarıyıl`;
  const pct = Math.round((D.ectsDone / ECTS_TOTAL) * 100);

  // Yarıyıl sekmesi: geçmiş/aktif yarıyıllarda öğrencinin O yarıyıldaki GERÇEK kaydı (alttan alınan dersler dahil)
  // + o yarıyılın müfredat dersleri içinden o yarıyılda alınmamış olanlar. Gelecek yarıyıllarda müfredat planı.
  type RowSt = Exclude<Status, 'all'> | 'deferred' | 'later';
  type Row = { key: string; c: Course; st: RowSt; label: string; note?: string; repeat?: boolean };
  const nextOffered = (planned: number) => { let n = D.semester + 1; while (n % 2 !== planned % 2) n++; return n; };
  const rowsFor = (k: number): Row[] => {
    const plan = [...CURRICULUM, ...FALL_POOL].filter((c) => c.semester === k).filter((c, i, a) => a.findIndex((x) => x.code === c.code) === i);
    if (k > D.semester) {
      return plan.map((c) => {
        const t = takenOf(c.code);
        return t && !isFail(t.grade)
          ? { key: c.code, c, st: 'done', label: `Tamamlandı · ${t.grade}` }
          : { key: c.code, c, st: 'notyet', label: 'Alınmadı' };
      });
    }
    const rows: Row[] = D.taken.filter((x) => x.semester === k).map((c) => {
      const repeat = (c.attempt ?? 1) > 1;
      const origin = repeat ? `${c.planned}. yarıyıl dersi · ${c.attempt}. alış` : undefined;
      if (!c.grade) return { key: c.code + k, c, st: 'taking', repeat, label: repeat ? 'Alttan alınıyor' : 'Alınıyor', note: origin };
      if (isFail(c.grade)) {
        const later = D.taken.find((x) => x.code === c.code && x.semester === c.retakenIn);
        const note = later
          ? later.grade ? `${termOf(later.semester)} (${later.semester}. yy) alttan alındı → ${later.grade}` : `${termOf(later.semester)} (${later.semester}. yy) alttan alınıyor`
          : `${nextOffered(c.planned ?? k)}. yarıyılda (${(c.planned ?? k) % 2 ? 'Güz' : 'Bahar'}) alttan alınacak`;
        return { key: c.code + k, c, st: 'failed', repeat, label: `Başarısız · ${c.grade}`, note: [origin, note].filter(Boolean).join(' · ') };
      }
      return { key: c.code + k, c, st: 'done', repeat, label: `Tamamlandı · ${c.grade}`, note: origin };
    });
    for (const c of plan) {
      if (rows.some((r) => r.c.code === c.code)) continue;
      const t = D.taken.filter((x) => x.code === c.code).sort((a, b) => a.semester - b.semester)[0];
      if (t) rows.push({ key: c.code, c, st: 'later', label: `${t.semester}. yarıyılda alındı`, note: 'Önceki dönemde ertelenmişti' });
      else if (D.deferred.some((x) => x.code === c.code)) rows.push({ key: c.code, c, st: 'deferred', label: 'Ertelendi', note: `${D.deferred.find((x) => x.code === c.code)?.deferReason === 'clash' ? 'Ders saati çakıştığı için' : 'AKTS sınırı nedeniyle'} alınamadı · ${nextOffered(k)}. yarıyılda alınmalı` });
      else if (c.type === 'Seçmeli') rows.push({ key: c.code, c, st: 'notyet', label: 'Seçilmedi' });
      else rows.push({ key: c.code, c, st: 'notyet', label: 'Alınmadı' });
    }
    return rows;
  };
  const allRows = rowsFor(sem);
  const list = allRows.filter((r) => st === 'all' || r.st === st || (st === 'notyet' && (r.st === 'deferred' || r.st === 'later')));
  const termName = D.terms.find((t) => t.semester === sem)?.name;

  return (
    <>
      <PageHeader title="Müfredat & Mezuniyet Durumu" sub={`${student.curriculum} · ${D.prep}`} />

      <div className="grad-grid">
        <Card className="grad-card grad-total">
          <span className="eyebrow">Toplam AKTS</span>
          <strong className="grad-num mono">{D.ectsDone}<small> / {ECTS_TOTAL}</small></strong>
          <StackBar done={D.ectsDone} taking={curEcts} total={ECTS_TOTAL} />
          <span className="muted small">%{pct} tamamlandı · bu dönem +{curEcts} AKTS alınıyor · mezuniyet için {ECTS_TOTAL} AKTS gerekli</span>
        </Card>
        {cats.map((c) => (
          <Card key={c.key} className="grad-card">
            <span className="eyebrow">{c.label}</span>
            <strong className="grad-num mono">{c.done}<small> / {c.target} AKTS</small></strong>
            <StackBar done={c.done} taking={c.taking} total={c.target} />
            <span className="muted small">{c.taking ? `${c.taking} AKTS bu dönem alınıyor · ` : ''}{Math.max(c.target - c.done - c.taking, 0)} AKTS kaldı</span>
          </Card>
        ))}
        <Card className="grad-card">
          <span className="eyebrow">Staj Durumu</span>
          <strong className="grad-num mono">{spDone}<small> / 2 staj</small></strong>
          <StackBar done={spDone} taking={spTaking} total={2} />
          <span className="muted small">{sp.map((x, i) => `Summer Practice ${i ? 'II' : 'I'}: ${x.st === 'done' ? 'tamamlandı (YT)' : x.st === 'taking' ? 'raporu değerlendirmede' : x.st === 'failed' ? 'yetersiz, tekrar edilecek' : `${i ? 7 : 5}. yarıyılda`}`).join(' · ')}</span>
        </Card>
      </div>
      {(D.failed.length > 0 || D.deferred.length > 0) && (
        <div ref={retakeRef} className="card mb12" style={{ scrollMarginTop: 80 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h2><RotateCcw size={17} style={{ verticalAlign: '-3px' }} /> Tekrar Alınması Gereken Dersler</h2>
            <span className="small muted">Son alınan not geçerlidir · başarısız ders, açıldığı dönemde öncelikli alınır</span>
          </div>
          <ul className="retake-list">
            {D.failed.map((f) => (
              <li key={f.course.code}>
                <span className="grow"><span className="mono small muted">{f.course.code} · {f.course.ects} AKTS · {typeLabel(f.course.type)}</span>
                  <strong className="block">{f.course.name}</strong>
                  <span className="att-note">{termOf(f.course.semester)} · {f.course.planned}. yarıyıl dersi · {f.reason === 'TT' ? 'devamsızlıktan kaldı; tekrar alışta devam zorunlu' : 'sınav notu yetersiz; tekrar alışta devam şartı aranmaz'}{!f.retaking && f.blocked && ` · bu dönem ${f.blocked === 'clash' ? 'ders saati çakıştığı' : 'AKTS sınırı dolduğu'} için alınamadı`}{!f.retaking && ` · ${nextOffered(f.course.planned ?? 1)}. yarıyılda alınmalı`}</span></span>
                <Chip tone="danger" icon={<XCircle size={12} />}>{f.reason} · {LETTER_INFO[f.reason]}</Chip>
                {f.retaking ? <Chip tone="info" icon={<Clock size={12} />}>Bu dönem alttan alınıyor</Chip> : <Chip tone="warning" icon={<RotateCcw size={12} />}>{f.offered} döneminde açılır</Chip>}
              </li>
            ))}
            {D.deferred.map((c) => (
              <li key={c.code}>
                <span className="grow"><span className="mono small muted">{c.code} · {c.ects} AKTS · {typeLabel(c.type)}</span>
                  <strong className="block">{c.name}</strong>
                  <span className="att-note">{c.semester}. yarıyıl dersi · {c.deferReason === 'clash' ? 'ders saati çakıştığı için' : 'dönemlik AKTS sınırı nedeniyle'} henüz alınamadı · {nextOffered(c.semester)}. yarıyılda alınmalı</span></span>
                <Chip tone="neutral" icon={<PauseCircle size={12} />}>Ertelendi</Chip>
                <Chip tone="warning">{c.semester % 2 ? 'Güz' : 'Bahar'} döneminde açılır</Chip>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="muted small mb12">Mezuniyet şartı: {G.mandatory} zorunlu + {G.technical} bölüm içi teknik seçmeli + {G.nonDept} bölüm dışı seçmeli + {G.interdisciplinary} disiplinlerarası proje = {G.mandatory + G.technical + G.nonDept + G.interdisciplinary} AKTS ve AGNO ≥ 2.00.</p>
      <div className="legend small muted mb12">
        <span><span className="lg-swatch done" /> Tamamlandı</span><span><span className="lg-swatch taking" /> Alınıyor</span><span><span className="lg-swatch rest" /> Kalan</span>
      </div>

      <Card className="">
        <div className="curr-tools">
          <div className="sem-tabs" role="tablist" aria-label="Yarıyıl">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button key={n} role="tab" aria-selected={sem === n} className={cx(sem === n && 'on', n < D.semester && 'past', n === D.semester && 'now')} onClick={() => setSem(n)}>
                {n}<small>yy</small>
              </button>
            ))}
          </div>
          <Segmented<Status> label="Durum filtresi" value={st} onChange={setSt} options={[
            { value: 'all', label: 'Tümü' }, { value: 'done', label: 'Tamamlandı' }, { value: 'taking', label: 'Alınıyor' }, { value: 'failed', label: 'Başarısız' }, { value: 'notyet', label: 'Alınmadı' },
          ]} />
        </div>
        <div className="row" style={{ justifyContent: 'space-between', margin: '6px 0 10px' }}>
          <h2>{sem}. Yarıyıl {termName && <span className="muted small">· {termName}</span>}</h2>
          {ELECTIVES_REQUIRED[sem] && <span className="small muted"><Info size={13} /> Bu yarıyılda {ELECTIVES_REQUIRED[sem]} bölüm içi teknik seçmeli ders ({ELECTIVES_REQUIRED[sem] * 6} AKTS) alınmalı.</span>}
        </div>
        <table className="atable">
          <thead><tr><th>Kod</th><th>Ders adı</th><th>Tür</th><th className="num">AKTS</th><th>Öğretim üyesi</th><th>Durum</th></tr></thead>
          <tbody>
            {list.map(({ key, c, st: rs, label, note, repeat }) => (
              <tr key={key}>
                <td className="mono small">{c.code}</td>
                <td><strong>{c.name}</strong>{repeat && <> <Chip tone="warning" icon={<RotateCcw size={12} />}>Alttan</Chip></>}{note && <span className="att-note">{note}</span>}</td>
                <td><Chip tone={c.type === 'Zorunlu' ? 'brand' : c.type === 'Seçmeli' ? 'info' : c.type === 'Disiplinlerarası Proje' ? 'new' : 'neutral'}>{typeLabel(c.type)}</Chip></td>
                <td className="num mono">{c.ects}</td>
                <td className="small muted">{c.instructor ?? 'Henüz atanmadı'}</td>
                <td>
                  <Chip tone={rs === 'done' ? 'success' : rs === 'taking' ? 'info' : rs === 'failed' ? 'danger' : rs === 'deferred' ? 'warning' : 'neutral'}
                    icon={rs === 'done' ? <CheckCircle2 size={12} /> : rs === 'taking' ? <Clock size={12} /> : rs === 'failed' ? <XCircle size={12} /> : rs === 'deferred' ? <PauseCircle size={12} /> : <CircleDashed size={12} />}
                    title={rs === 'failed' ? LETTER_INFO[c.grade!] : undefined}>{label}</Chip>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="muted center">Bu filtreye uyan ders yok.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function StackBar({ done, taking, total }: { done: number; taking: number; total: number }) {
  return (
    <div className="stackbar" role="img" aria-label={`${done} tamamlandı, ${taking} alınıyor, toplam ${total}`}>
      <span className="sb-done" style={{ width: `${(done / total) * 100}%` }} />
      <span className="sb-taking" style={{ width: `${(taking / total) * 100}%` }} />
    </div>
  );
}
