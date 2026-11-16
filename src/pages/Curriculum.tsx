import { useEffect, useRef, useState } from 'react';
import { useApp, useData } from '../lib/store';
import { CheckCircle2, CircleDashed, Clock, Info, PauseCircle, RotateCcw, XCircle } from 'lucide-react';
import { CURRICULUM, ECTS_TOTAL, ELECTIVES_REQUIRED, FALL_POOL, LETTER_INFO, REG, isFail, student, typeLabel, type Course } from '../data/msku';
import { cx, latestAttempts } from '../lib/util';
import { t as tr, tOpt, term as termLabel } from '../lib/i18n';
import { prepLabel } from './Transcript';
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
  // teknik seçmeli şartı AKTS ile: plandaki kalan seçmeli sayısı (6 AKTS) yetmiyorsa uyar (ör. 5 AKTS'lik SE 3007 alındıysa)
  const techCat = cats.find((c) => c.key === 'technical')!;
  const techSlots = Object.entries(ELECTIVES_REQUIRED).filter(([k]) => +k > D.semester).reduce((a, [, v]) => a + v, 0);
  const techShort = Math.max(techCat.target - techCat.done - techCat.taking - techSlots * 6, 0);
  const sp = ['SE 3001', 'SE 4001'].map((code) => ({ code, st: statusOf({ code }) }));
  const spDone = sp.filter((x) => x.st === 'done').length;
  const spTaking = sp.filter((x) => x.st === 'taking').length;
  const termOf = (n?: number) => termLabel(D.terms.find((x) => x.semester === n)?.name ?? tr('{n}. yarıyıl', { n: n ?? '' }));
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
          ? { key: c.code, c, st: 'done', label: `${tr('Tamamlandı')} · ${t.grade}` }
          : { key: c.code, c, st: 'notyet', label: tr('Alınmadı') };
      });
    }
    const rows: Row[] = D.taken.filter((x) => x.semester === k).map((c) => {
      const repeat = (c.attempt ?? 1) > 1;
      const origin = repeat ? `${tr('{n}. yarıyıl dersi', { n: c.planned ?? k })} · ${tr('{n}. alış', { n: c.attempt ?? 1 })}` : undefined;
      if (!c.grade) return { key: c.code + k, c, st: 'taking', repeat, label: repeat ? tr('Alttan alınıyor') : tr('Alınıyor'), note: origin };
      if (isFail(c.grade)) {
        const later = D.taken.find((x) => x.code === c.code && x.semester === c.retakenIn);
        const note = later
          ? later.grade ? tr('{x} ({n}. yy) alttan alındı → {g}', { x: termOf(later.semester), n: later.semester, g: later.grade }) : tr('{x} ({n}. yy) alttan alınıyor', { x: termOf(later.semester), n: later.semester })
          : tr('{n}. yarıyılda ({s}) alttan alınacak', { n: nextOffered(c.planned ?? k), s: tr((c.planned ?? k) % 2 ? 'Güz' : 'Bahar') });
        return { key: c.code + k, c, st: 'failed', repeat, label: `${tr('Başarısız')} · ${c.grade}`, note: [origin, note].filter(Boolean).join(' · ') };
      }
      return { key: c.code + k, c, st: 'done', repeat, label: `${tr('Tamamlandı')} · ${c.grade}`, note: origin };
    });
    for (const c of plan) {
      if (rows.some((r) => r.c.code === c.code)) continue;
      const t = D.taken.filter((x) => x.code === c.code).sort((a, b) => a.semester - b.semester)[0];
      if (t) rows.push({ key: c.code, c, st: 'later', label: tr('{n}. yarıyılda alındı', { n: t.semester }), note: tr('Önceki dönemde ertelenmişti') });
      else if (D.deferred.some((x) => x.code === c.code)) rows.push({ key: c.code, c, st: 'deferred', label: tr('Ertelendi'), note: `${D.deferred.find((x) => x.code === c.code)?.deferReason === 'clash' ? tr('Ders saati çakıştığı için alınamadı') : tr('AKTS sınırı nedeniyle alınamadı')} · ${tr('{n}. yarıyılda alınmalı', { n: nextOffered(k) })}` });
      else if (c.type === 'Seçmeli') rows.push({ key: c.code, c, st: 'notyet', label: tr('Seçilmedi') });
      else rows.push({ key: c.code, c, st: 'notyet', label: tr('Alınmadı') });
    }
    return rows;
  };
  const allRows = rowsFor(sem);
  const list = allRows.filter((r) => st === 'all' || r.st === st || (st === 'notyet' && (r.st === 'deferred' || r.st === 'later')));
  const termName = D.terms.find((x) => x.semester === sem)?.name;

  return (
    <>
      <PageHeader title={tr('Müfredat & Mezuniyet Durumu')} sub={`${tr(student.curriculum)} · ${prepLabel(D.prep)}`} />

      <div className="grad-grid">
        <Card className="grad-card grad-total">
          <span className="eyebrow">{tr('Toplam AKTS')}</span>
          <strong className="grad-num mono">{D.ectsDone}<small> / {ECTS_TOTAL}</small></strong>
          <StackBar done={D.ectsDone} taking={curEcts} total={ECTS_TOTAL} />
          <span className="muted small">{tr('%{p} tamamlandı · bu dönem +{a} AKTS alınıyor · mezuniyet için {b} AKTS gerekli', { p: pct, a: curEcts, b: ECTS_TOTAL })}</span>
        </Card>
        {cats.map((c) => (
          <Card key={c.key} className="grad-card">
            <span className="eyebrow">{tr(c.label)}</span>
            <strong className="grad-num mono">{c.done}<small> / {c.target} {tr('AKTS')}</small></strong>
            <StackBar done={c.done} taking={c.taking} total={c.target} />
            <span className="muted small">{c.taking ? `${tr('{n} AKTS bu dönem alınıyor', { n: c.taking })} · ` : ''}{tr('{n} AKTS kaldı', { n: Math.max(c.target - c.done - c.taking, 0) })}</span>
            {(() => {
              const type = c.key === 'mandatory' ? 'Zorunlu' : c.key === 'technical' ? 'Seçmeli' : c.key === 'nonDept' ? 'Üniversite Seçmeli' : 'Disiplinlerarası Proje';
              if (type === 'Zorunlu') return null;
              const done = passed.filter((x) => x.type === type).map((x) => `${x.code} (${x.grade})`);
              const now = D.current.filter((x) => x.type === type).map((x) => x.code);
              return <span className="small cat-courses">{done.length ? `${tr('Tamamlandı')}: ${done.join(', ')}` : ''}{done.length && now.length ? ' · ' : ''}{now.length ? `${tr('Alınıyor')}: ${now.join(', ')}` : ''}{!done.length && !now.length ? (c.key === 'inter' ? tr('ENG 3500 Interdisciplinary Engineering Project henüz alınmadı (7. yarıyıl).') : tr('Henüz ders alınmadı.')) : ''}</span>;
            })()}
            {c.key === 'technical' && techShort > 0 && <span className="small txt-warning">{tr('Müfredattaki kalan {a} seçmeli (6’şar AKTS) ile {b} AKTS eksik kalır; fazladan bir teknik seçmeli almanız gerekir.', { a: techSlots, b: techShort })}</span>}
          </Card>
        ))}
        <Card className="grad-card">
          <span className="eyebrow">{tr('Staj Durumu')}</span>
          <strong className="grad-num mono">{spDone}<small> / 2 {tr('staj')}</small></strong>
          <StackBar done={spDone} taking={spTaking} total={2} />
          <span className="muted small">{sp.map((x, i) => `Summer Practice ${i ? 'II' : 'I'}: ${x.st === 'done' ? tr('tamamlandı (YT)') : x.st === 'taking' ? tr('raporu değerlendirmede') : x.st === 'failed' ? tr('yetersiz, tekrar edilecek') : tr('{n}. yarıyılda', { n: i ? 7 : 5 })}`).join(' · ')}</span>
        </Card>
      </div>
      {(D.failed.length > 0 || D.deferred.length > 0) && (
        <div ref={retakeRef} className="card mb12" style={{ scrollMarginTop: 80 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h2><RotateCcw size={17} style={{ verticalAlign: '-3px' }} /> {tr('Tekrar Alınması Gereken Dersler')}</h2>
            <span className="small muted">{tr('Son alınan not geçerlidir · başarısız ders, açıldığı dönemde öncelikli alınır')}</span>
          </div>
          <ul className="retake-list">
            {D.failed.map((f) => (
              <li key={f.course.code}>
                <span className="grow"><span className="mono small muted">{f.course.code} · {f.course.ects} {tr('AKTS')} · {typeLabel(f.course.type)}</span>
                  <strong className="block">{f.course.name}</strong>
                  <span className="att-note">{termOf(f.course.semester)} · {tr('{n}. yarıyıl dersi', { n: f.course.planned ?? f.course.semester })} · {f.reason === 'TT' ? tr('devamsızlıktan kaldı; tekrar alışta devam zorunlu') : tr('sınav notu yetersiz; tekrar alışta devam şartı aranmaz')}{!f.retaking && f.blocked && ` · ${f.blocked === 'clash' ? tr('bu dönem ders saati çakıştığı için alınamadı') : tr('bu dönem AKTS sınırı dolduğu için alınamadı')}`}{!f.retaking && ` · ${tr('{n}. yarıyılda alınmalı', { n: nextOffered(f.course.planned ?? 1) })}`}</span></span>
                <Chip tone="danger" icon={<XCircle size={12} />}>{f.reason} · {tr(LETTER_INFO[f.reason]!)}</Chip>
                {f.retaking ? <Chip tone="info" icon={<Clock size={12} />}>{tr('Bu dönem alttan alınıyor')}</Chip> : <Chip tone="warning" icon={<RotateCcw size={12} />}>{tr('{s} döneminde açılır', { s: tr(f.offered) })}</Chip>}
              </li>
            ))}
            {D.deferred.map((c) => (
              <li key={c.code}>
                <span className="grow"><span className="mono small muted">{c.code} · {c.ects} {tr('AKTS')} · {typeLabel(c.type)}</span>
                  <strong className="block">{c.name}</strong>
                  <span className="att-note">{tr('{n}. yarıyıl dersi', { n: c.semester })} · {c.deferReason === 'clash' ? tr('ders saati çakıştığı için henüz alınamadı') : tr('dönemlik AKTS sınırı nedeniyle henüz alınamadı')} · {tr('{n}. yarıyılda alınmalı', { n: nextOffered(c.semester) })}</span></span>
                <Chip tone="neutral" icon={<PauseCircle size={12} />}>{tr('Ertelendi')}</Chip>
                <Chip tone="warning">{tr('{s} döneminde açılır', { s: tr(c.semester % 2 ? 'Güz' : 'Bahar') })}</Chip>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="muted small mb12">{tr('Mezuniyet şartı: {a} zorunlu + {b} bölüm içi teknik seçmeli + {c} bölüm dışı seçmeli + {d} disiplinlerarası proje = {e} AKTS ve AGNO ≥ 2.00.', { a: G.mandatory, b: G.technical, c: G.nonDept, d: G.interdisciplinary, e: G.mandatory + G.technical + G.nonDept + G.interdisciplinary })}</p>
      <div className="legend small muted mb12">
        <span><span className="lg-swatch done" /> {tr('Tamamlandı')}</span><span><span className="lg-swatch taking" /> {tr('Alınıyor')}</span><span><span className="lg-swatch rest" /> {tr('Kalan')}</span>
      </div>

      <Card className="">
        <div className="curr-tools">
          <div className="sem-tabs" role="tablist" aria-label={tr('Yarıyıl')}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button key={n} role="tab" aria-selected={sem === n} className={cx(sem === n && 'on', n < D.semester && 'past', n === D.semester && 'now')} onClick={() => setSem(n)}>
                {n}<small>{tr('yy')}</small>
              </button>
            ))}
          </div>
          <Segmented<Status> label={tr('Durum filtresi')} value={st} onChange={setSt} options={[
            { value: 'all', label: tr('Tümü') }, { value: 'done', label: tr('Tamamlandı') }, { value: 'taking', label: tr('Alınıyor') }, { value: 'failed', label: tr('Başarısız') }, { value: 'notyet', label: tr('Alınmadı') },
          ]} />
        </div>
        <div className="row" style={{ justifyContent: 'space-between', margin: '6px 0 10px' }}>
          <h2>{tr('{n}. Yarıyıl', { n: sem })} {termName && <span className="muted small">· {termLabel(termName)}</span>}</h2>
          {ELECTIVES_REQUIRED[sem] && <span className="small muted"><Info size={13} /> {tr('Müfredat planında bu yarıyılda {n} bölüm içi teknik seçmeli ders var; şart ders sayısı değil, toplam {m} AKTS’dir.', { n: ELECTIVES_REQUIRED[sem], m: REG.graduation.technical })}</span>}
        </div>
        <table className="atable">
          <thead><tr><th>{tr('Kod')}</th><th>{tr('Ders adı')}</th><th>{tr('Tür')}</th><th className="num">{tr('AKTS')}</th><th>{tr('Öğretim üyesi')}</th><th>{tr('Durum')}</th></tr></thead>
          <tbody>
            {list.map(({ key, c, st: rs, label, note, repeat }) => (
              <tr key={key}>
                <td className="mono small">{c.code}</td>
                <td><strong>{c.name}</strong>{repeat && <> <Chip tone="warning" icon={<RotateCcw size={12} />}>{tr('Alttan')}</Chip></>}{note && <span className="att-note">{note}</span>}</td>
                <td><Chip tone={c.type === 'Zorunlu' ? 'brand' : c.type === 'Seçmeli' ? 'info' : c.type === 'Disiplinlerarası Proje' ? 'new' : 'neutral'}>{typeLabel(c.type)}</Chip></td>
                <td className="num mono">{c.ects}</td>
                <td className="small muted">{c.instructor ? tOpt(c.instructor) : tr('Henüz atanmadı')}</td>
                <td>
                  <Chip tone={rs === 'done' ? 'success' : rs === 'taking' ? 'info' : rs === 'failed' ? 'danger' : rs === 'deferred' ? 'warning' : 'neutral'}
                    icon={rs === 'done' ? <CheckCircle2 size={12} /> : rs === 'taking' ? <Clock size={12} /> : rs === 'failed' ? <XCircle size={12} /> : rs === 'deferred' ? <PauseCircle size={12} /> : <CircleDashed size={12} />}
                    title={rs === 'failed' && LETTER_INFO[c.grade!] ? tr(LETTER_INFO[c.grade!]!) : undefined}>{label}</Chip>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="muted center">{tr('Bu filtreye uyan ders yok.')}</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function StackBar({ done, taking, total }: { done: number; taking: number; total: number }) {
  return (
    <div className="stackbar" role="img" aria-label={tr('{a} tamamlandı, {b} alınıyor, toplam {c}', { a: done, b: taking, c: total })}>
      <span className="sb-done" style={{ width: `${(done / total) * 100}%` }} />
      <span className="sb-taking" style={{ width: `${(taking / total) * 100}%` }} />
    </div>
  );
}
