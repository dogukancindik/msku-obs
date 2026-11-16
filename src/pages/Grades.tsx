import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Calculator, Clock, Hourglass, Sparkles, TrendingUp, AlertTriangle, Minus, CheckCircle2, XCircle, Info, RotateCcw } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import type { StudentData } from '../lib/academic';
import { LETTER_INFO, POINTS, REG, byCode, isFail, student, type Assess, type GradeRow } from '../data/msku';
import { attendance, courseAverage, cx, isNew, relDays, gpa } from '../lib/util';
import { Button, Card, Chip, Modal, PageHeader, type Tone } from '../components/ui';
import { pct, t, term as termLabel } from '../lib/i18n';

function Score({ a, label }: { a: Assess; label: string }) {
  if (a.weight === 0) return <span className="na">—</span>;
  if (a.score === undefined) return <span className="pending"><Hourglass size={12} /> {t('Bekleniyor')}</span>;
  const d = a.avg !== undefined ? a.score - a.avg : 0;
  return (
    <span className="score-cell" aria-label={t('{label} {score}, sınıf ortalaması {avg}', { label, score: a.score, avg: a.avg ?? '—' })}>
      <strong className="mono">{a.score}</strong>
      {isNew(a.announced) && <Chip tone="new">{t('Yeni')}</Chip>}
      {a.avg !== undefined && (
        <small className={cx('delta', d >= 0 ? 'up' : 'down')}>
          {d > 0 ? <ArrowUpRight size={12} /> : d < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
          {t('ort.')} {a.avg.toFixed(1)}
        </small>
      )}
      {a.announced !== undefined && <small className="muted">{pct(a.weight)} · {relDays(a.announced)}</small>}
    </span>
  );
}

function status(D: StudentData, code: string, passFail?: boolean): { tone: Tone; icon: JSX.Element; text: string } {
  if (passFail) return { tone: 'neutral', icon: <Clock size={12} />, text: t('Rapor bekleniyor') };
  if (attendance(D, code).failed) return { tone: 'danger', icon: <XCircle size={12} />, text: t('Devamsızlıktan kaldı (TT)') };
  const avg = courseAverage(D.grades, code);
  if (avg === undefined) return { tone: 'neutral', icon: <Hourglass size={12} />, text: t('Not bekleniyor') };
  if (avg >= 75) return { tone: 'success', icon: <TrendingUp size={12} />, text: t('İyi gidiyor') };
  if (avg >= 60) return { tone: 'info', icon: <Minus size={12} />, text: t('Ortalama') };
  return { tone: 'warning', icon: <AlertTriangle size={12} />, text: t('Dikkat') };
}

export default function Grades() {
  const D = useData();
  const { term } = useApp();
  const [calc, setCalc] = useState<string | null>(null);
  if (term !== student.term) return <PastGrades term={term} />;
  const dz = (code: string) => attendance(D, code).failed;
  const calcable = D.grades.filter((g) => !g.passFail && !dz(g.code));
  const newCount = D.grades.reduce((s, g) => s + [g.vize, g.odev].filter((a) => isNew(a.announced)).length, 0);

  return (
    <>
      <PageHeader title={t('Not Listesi')} sub={`${termLabel(student.term)} · ${t('{n}. Yarıyıl', { n: D.semester })} · ${t('Yarıyıl içi %{a} (vize + ödev/proje) · Final %{b} · Geçme notu {c}', { a: REG.weights.midterm, b: REG.weights.final, c: REG.passMin })}`}
        actions={<>
          {newCount > 0 && <Chip tone="new" icon={<Sparkles size={12} />}>{t('{n} yeni not', { n: newCount })}</Chip>}
          <Button variant="primary" disabled={!calcable.length} onClick={() => setCalc(calcable[0].code)}><Calculator size={16} /> {t('Final Hesaplayıcı')}</Button>
        </>} />

      {D.current.filter((c) => dz(c.code)).map((c) => (
        <div key={c.code} className="alert danger mb12" role="alert">
          <XCircle size={18} />
          <div>
            <strong>{c.code} {c.name}: {t('devamsızlıktan kaldınız (TT)')}</strong>
            <p className="small">{t('Devamsızlık sınırı aşıldığı için yarıyıl sonu ve bütünleme sınavlarına giremezsiniz; dönem sonunda harf notunuz TT olarak işlenir. Ders, açıldığı ilk dönemde devam zorunluluğuyla tekrar alınmalıdır.')}</p>
          </div>
        </div>
      ))}
      <div className="table-card">
        <table className="atable grades-table">
          <thead>
            <tr>
              <th>{t('Ders')}</th>
              <th className="num">{t('Vize')}</th>
              <th className="num">{t('Ödev / Proje')}</th>
              <th className="num">{t('Final')}</th>
              <th className="num">{t('Şu anki ort.')}</th>
              <th>{t('Durum')}</th>
              <th><span className="sr-only">{t('İşlem')}</span></th>
            </tr>
          </thead>
          <tbody>
            {D.grades.map((g) => {
              const c = D.current.find((x) => x.code === g.code) ?? byCode(g.code)!;
              const isDz = dz(g.code);
              const st = status(D, g.code, g.passFail);
              const avg = courseAverage(D.grades, g.code);
              return (
                <tr key={g.code} className={cx(isDz && 'row-tt')}>
                  <td><span className="mono small muted">{c.code}</span><strong className="block">{c.name}</strong>
                    {(c.attempt ?? 1) > 1 && <Chip tone="warning" icon={<RotateCcw size={12} />}>{t('Alttan · {n}. alış', { n: c.attempt ?? 1 })}</Chip>}</td>
                  <td className="num"><Score a={g.vize} label={t('Vize')} /></td>
                  <td className="num"><Score a={g.odev} label={t('Ödev/Proje')} /></td>
                  <td className="num">{g.passFail ? <span className="pending"><Hourglass size={12} /> {t('Staj raporu')}</span> : isDz ? <span className="small txt-danger">{t('Giremez')}</span> : <Score a={g.final} label={t('Final')} />}</td>
                  <td className="num">{isDz ? <strong className="mono big-num txt-danger">TT</strong> : avg !== undefined ? <strong className="mono big-num">{avg.toFixed(1)}</strong> : <span className="na">—</span>}</td>
                  <td><Chip tone={st.tone} icon={st.icon}>{st.text}</Chip></td>
                  <td className="row-actions">{!g.passFail && !isDz && <Button size="sm" variant="secondary" onClick={() => setCalc(g.code)}><Calculator size={14} /> {t('Final hesapla')}</Button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted small mt12">{t('"Şu anki ort." yalnızca açıklanan notların ağırlıklı ortalamasıdır; harf notu final sonrası kesinleşir. Yeşil ok sınıf ortalamasının üstünü, turuncu ok altını gösterir. Alttan alınan derste son alınan not geçerlidir ve eski notun yerine AGNO’ya girer.')}</p>
      {calc && <FinalCalc code={calc} onCode={setCalc} onClose={() => setCalc(null)} />}
    </>
  );
}

function PastGrades({ term }: { term: string }) {
  const D = useData();
  const tm = D.terms.find((x) => x.name === term)!;
  const list = D.taken.filter((c) => c.semester === tm.semester && c.grade);
  const tmStat = D.stats.find((x) => x.semester === tm.semester);
  return (
    <>
      <PageHeader title={t('Not Listesi')} sub={`${termLabel(term)} · ${t('{n}. Yarıyıl', { n: tm.semester })} · ${t('kesinleşmiş notlar')} · ${t('ders ortalaması 100 üzerinden, harf notu ve 4’lük sistemdeki karşılığı')}`} />
      <Card>
        <table className="atable">
          <thead><tr><th>{t('Ders')}</th><th className="num">{t('AKTS')}</th><th className="num">{t('Ders ortalaması')}</th><th className="num">{t('Harf notu')}</th><th className="num">{t('Ağırlıklı puan')}</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.code}>
                <td><span className="mono small muted">{c.code}</span><strong className="block">{c.name}</strong>
                  {(c.attempt ?? 1) > 1 && <Chip tone="warning" icon={<RotateCcw size={12} />}>{t('Alttan · {n}. alış', { n: c.attempt ?? 1 })}</Chip>}
                  {c.retakenIn && <span className="att-note">{c.superseded ? t('{x} döneminde tekrar alındı — bu not AGNO’ya katılmaz', { x: termLabel(D.terms.find((x) => x.semester === c.retakenIn)?.name ?? '') }) : t('{x} döneminde tekrar alınıyor', { x: termLabel(D.terms.find((x) => x.semester === c.retakenIn)?.name ?? '') })}</span>}
                </td>
                <td className="num mono">{c.ects}</td>
                <td className="num mono">{c.score !== undefined ? <strong>{c.score}</strong> : c.grade === 'TT' ? <span className="small txt-danger">{t('Devamsızlık')}</span> : '—'}</td>
                <td className="num"><Chip tone={isFail(c.grade) ? 'danger' : c.grade === 'YT' ? 'neutral' : 'success'} title={LETTER_INFO[c.grade!] && t(LETTER_INFO[c.grade!]!)}>{c.grade}</Chip>{LETTER_INFO[c.grade!] && <span className="att-note">{t(LETTER_INFO[c.grade!]!)}</span>}</td>
                <td className="num mono">{c.grade && c.grade !== 'YT' && c.grade !== 'YZ' && !c.superseded ? (POINTS[c.grade] * c.ects).toFixed(1) : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><td>{t('Dönem ortalaması')}</td><td className="num mono">{list.reduce((s, c) => s + c.ects, 0)}</td><td /><td className="num mono"><strong>{gpa(list).toFixed(2)}</strong> / 4.00</td><td className="num mono">{t('AGNO')} {(tmStat?.agno ?? 0).toFixed(2)}</td></tr></tfoot>
        </table>
      </Card>
    </>
  );
}

// ------------------------------------------------------------------ Final hesaplayıcı
const SCALE = REG.scale;
const FINAL_MIN = REG.finalMin;
/** Ders ortalaması ekranda gösterildiği gibi bir ondalığa yuvarlanır; harf notu bu yuvarlanmış değerden verilir. */
const round1 = (x: number) => Math.round(x * 10 + 1e-9) / 10;
const letterOf = (avg: number, final: number) => (final < FINAL_MIN || avg < REG.passMin ? 'FF' : SCALE.find((x) => avg >= x.min)!.l);

function ScoreInput({ label, a, value, onChange }: { label: string; a: Assess; value: number; onChange: (v: number) => void }) {
  const known = a.score !== undefined;
  return (
    <div className={cx('calc-in', !known && 'assumed')}>
      <span className="small"><strong>{label}</strong> · {pct(a.weight)}</span>
      {known ? (
        <span className="calc-known-val"><strong className="mono">{a.score}</strong><small className="muted">{t('açıklandı')}</small></span>
      ) : (
        <label className="calc-guess">
          <input type="number" min={0} max={100} value={value} onChange={(e) => onChange(Math.max(0, Math.min(100, +e.target.value || 0)))} aria-label={t('{label} tahmini', { label })} />
          <small className="muted">{t('tahmini (henüz açıklanmadı)')}</small>
        </label>
      )}
    </div>
  );
}

function FinalCalc({ code, onCode, onClose }: { code: string; onCode: (c: string) => void; onClose: () => void }) {
  const D = useData();
  const g = D.grades.find((x) => x.code === code) as GradeRow;
  const c = byCode(code)!;
  const [vize, setVize] = useState(g.vize.score ?? Math.round(g.vize.avg ?? 70));
  const [odev, setOdev] = useState(g.odev.score ?? Math.round(g.odev.avg ?? 70));
  const [final, setFinal] = useState(70);
  const v = g.vize.score ?? vize, o = g.odev.score ?? odev;
  const base = (v * g.vize.weight + o * g.odev.weight) / 100;
  const avg = round1(base + (final * g.final.weight) / 100);
  const letter = letterOf(avg, final);
  const pass = letter !== 'FF';
  const need = SCALE.filter((x) => x.min >= REG.passMin).map((x) => {
    // harfi veren en düşük tam sayı final notu (yuvarlanmış ortalamayla, ekrandakiyle aynı kural)
    let raw = 0;
    while (raw <= 100 && round1(base + (raw * g.final.weight) / 100) < x.min) raw++;
    const req = Math.max(raw, FINAL_MIN);
    return { ...x, req, possible: req <= 100, barrier: raw < FINAL_MIN };
  });

  return (
    <Modal open onClose={onClose} title={t('Final Hesaplayıcı')} width={640}>
      <label className="field">
        <span>{t('Ders')}</span>
        <select className="input" value={code} onChange={(e) => onCode(e.target.value)}>
          {D.grades.filter((g) => !g.passFail && !attendance(D, g.code).failed).map((r) => <option key={r.code} value={r.code}>{r.code} · {byCode(r.code)!.name}</option>)}
        </select>
      </label>
      <div className="calc-grid" key={code}>
        <ScoreInput label={t('Vize')} a={g.vize} value={vize} onChange={setVize} />
        {g.odev.weight > 0 && <ScoreInput label={t('Ödev / Proje')} a={g.odev} value={odev} onChange={setOdev} />}
      </div>

      <div className="calc-final">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <label htmlFor="final-range"><strong>{t('Finalden alacağın not')}</strong> <span className="muted small">· {pct(g.final.weight)}</span></label>
          <input className="calc-num mono" type="number" min={0} max={100} value={final} onChange={(e) => setFinal(Math.max(0, Math.min(100, +e.target.value || 0)))} aria-label={t('Final notu')} />
        </div>
        <input id="final-range" type="range" min={0} max={100} value={final} onChange={(e) => setFinal(+e.target.value)} />
        <div className="calc-out">
          <div><span className="eyebrow">{t('Ders ortalaması')}</span><strong className="mono">{avg.toFixed(1)}</strong></div>
          <div className={cx('calc-letter', pass ? 'ok' : 'bad')}>
            <span className="eyebrow">{t('Harf notu')}</span>
            <strong>{letter}</strong>
          </div>
          <div className="calc-msg">
            {final < FINAL_MIN ? <><XCircle size={16} /> {t('Finalden en az {n} alınmalı: bu notla ortalama ne olursa olsun FF.', { n: FINAL_MIN })}</>
              : pass ? <><CheckCircle2 size={16} /> {t('Bu final notuyla dersi {l} ile geçersin.', { l: letter })}</>
                : <><XCircle size={16} /> {t('Bu final notuyla ders geçilemez.')}</>}
          </div>
        </div>
      </div>

      <div>
        <span className="eyebrow">{t('Hedef harf için gereken en düşük final notu')}</span>
        <div className="need-grid">
          {need.map((x) => (
            <button key={x.l} className={cx('need', !x.possible && 'no', x.l === letter && 'cur')} disabled={!x.possible} onClick={() => setFinal(x.req)}
              title={x.possible ? t('Finali {n} olarak ayarla', { n: x.req }) : t('Bu harf artık mümkün değil')}>
              <strong>{x.l}</strong>
              <span className="mono">{x.possible ? x.req : '—'}</span>
              <small>{x.possible ? (x.barrier ? `${t('final')} ≥ ${FINAL_MIN}` : `${t('ort.')} ≥ ${x.min}`) : t('mümkün değil')}</small>
            </button>
          ))}
        </div>
      </div>
      <p className="muted small"><Info size={13} style={{ verticalAlign: '-2px' }} /> {t('Ağırlıklar:')} {t('Vize')} {pct(g.vize.weight)}{g.odev.weight ? <> · {t('Ödev/Proje')} {pct(g.odev.weight)}</> : null} · {t('Final')} {pct(g.final.weight)}. {t('Geçmek için ders ortalaması ve final notu en az {n} olmalı.', { n: REG.passMin })} {t('Harf aralıkları:')} {SCALE.filter((x) => x.l !== 'FF').map((x) => `${x.l} ≥ ${x.min}`).join(' · ')}. {t('Çan eğrisi uygulanan derslerde sonuç farklı olabilir.')}</p>
    </Modal>
  );
}
