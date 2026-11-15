import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Info, Plus, Printer, RotateCcw, Trash2 } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { CURRICULUM, FALL_POOL, LETTERS, POINTS, isFail, isGpaGrade, student, typeLabel, type Letter } from '../data/msku';
import { cumulativeGpa, cx, fmtGpa, gpa, latestAttempts } from '../lib/util';
import { Button, Card, Chip, Logo, Modal, PageHeader, Tabs } from '../components/ui';

type Tab = 'official' | 'scenario';

export default function Transcript() {
  const { route, go, track } = useApp();
  const [tab, setTab] = useState<Tab>(route.query.get('tab') === 'scenario' ? 'scenario' : 'official');

  const print = () => {
    setTab('official');
    track('transcript:print');
    setTimeout(() => window.print(), 80);
  };
  useEffect(() => {
    if (route.query.get('print')) {
      go('transcript');
      print();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader title="Transkript & Senaryo" sub="Resmi not dökümünüz ve 'ya şöyle olsaydı?' hesaplayıcısı"
        actions={tab === 'official' && <span className=""><Button variant="primary" onClick={print}><Printer size={16} /> PDF İndir / Yazdır</Button></span>} />
      <Tabs<Tab> label="Transkript sekmeleri" value={tab} onChange={setTab} tabs={[{ value: 'official', label: 'Resmi Transkript' }, { value: 'scenario', label: 'Transkript Senaryosu' }]} />
      {tab === 'official' ? <Official /> : <Scenario />}
    </>
  );
}

function Official() {
  const D = useData();
  const { me } = useApp();
  const stats = D.stats;
  const termOf = (n: number) => D.terms.find((t) => t.semester === n)?.name ?? `${n}. yarıyıl`;
  return (
    <div className="print-area">
      <div className="doc">
        <div className="doc-head">
          <Logo size={64} />
          <div className="doc-title">
            <span>T.C. Muğla Sıtkı Koçman Üniversitesi · Mühendislik Fakültesi</span>
            <strong>Transkript Belgesi</strong>
          </div>
          <span className="muted small">Düzenlenme: {new Date().toLocaleDateString('tr-TR')}</span>
        </div>
        <dl className="doc-meta">
          <div><dt>Ad Soyad</dt><dd>{me.name}</dd></div>
          <div><dt>Öğrenci No</dt><dd className="mono">{me.number}</dd></div>
          <div><dt>Bölüm / Program</dt><dd>{student.program}</dd></div>
          <div><dt>Hazırlık</dt><dd>{D.prep}</dd></div>
          <div><dt>AGNO</dt><dd className="mono"><strong>{fmtGpa(D.agno)}</strong> / 4.00</dd></div>
          <div><dt>Tamamlanan AKTS</dt><dd className="mono">{D.ectsDone}</dd></div>
        </dl>
        {stats.map((t) => {
          const list = D.taken.filter((c) => c.semester === t.semester);
          return (
            <section key={t.name} className="doc-term">
              <div className="doc-term-head">
                <strong>{t.name}</strong><span className="muted">{t.semester}. Yarıyıl</span>
                <span className="spacer" />
                {t.inProgress ? <Chip tone="info">Devam ediyor</Chip> : <span className="small">YANO <strong className="mono">{fmtGpa(t.yano!)}</strong> · AGNO <strong className="mono">{fmtGpa(t.agno!)}</strong></span>}
              </div>
              <table className="atable compact">
                <thead><tr><th>Kod</th><th>Ders adı</th><th>Tür</th><th className="num">T+U</th><th className="num">AKTS</th><th className="num">Harf</th><th className="num">Ağırlıklı puan</th><th>Açıklama</th></tr></thead>
                <tbody>
                  {list.map((c) => {
                    const fail = isFail(c.grade);
                    const counts = isGpaGrade(c.grade) && !c.superseded;
                    const note = [
                      (c.attempt ?? 1) > 1 ? `Tekrar (${c.attempt}. alış)` : '',
                      c.grade === 'TT' ? 'Devamsızlıktan başarısız' : c.grade === 'FF' ? 'Başarısız' : '',
                      c.retakenIn ? `${termOf(c.retakenIn)} döneminde tekrar ${c.superseded ? 'alındı*' : 'alınıyor'}` : '',
                      c.grade === 'YT' ? 'AGNO’ya katılmaz' : '',
                    ].filter(Boolean).join(' · ');
                    return (
                      <tr key={c.code} className={cx(c.superseded && 'row-superseded')}>
                        <td className="mono small">{c.code}</td><td>{c.name}</td><td className="small">{typeLabel(c.type)}</td>
                        <td className="num mono">{c.t}+{c.u}</td><td className="num mono">{c.ects}</td>
                        <td className="num">{c.grade ? <strong className={cx('mono', fail && 'grade-fail', c.superseded && 'grade-old')}>{c.grade}{c.superseded ? '*' : ''}</strong> : <span className="na">Alınıyor</span>}</td>
                        <td className="num mono">{c.grade && counts ? (POINTS[c.grade] * c.ects).toFixed(1) : '—'}</td>
                        <td className="small muted">{note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
        <p className="doc-foot muted small">
          <strong>Açıklamalar:</strong> FF: başarısız · TT: devamsızlıktan başarısız · YT/YZ: yeterli/yetersiz (staj, AGNO’ya katılmaz) ·
          * Tekrar alınan dersin eski notu: transkriptte görünür, AGNO’ya son alınan not katılır. YANO o dönem alınan tüm notlarla hesaplanır.
        </p>
        <p className="doc-foot muted small">Bu belge bilgi amaçlıdır. Islak imzalı/e-imzalı resmi transkript için Öğrenci İşleri Daire Başkanlığı’na başvurunuz. Kimlik numarası gizlilik nedeniyle gösterilmez.</p>
      </div>
    </div>
  );
}

type Row = { key: string; code: string; name: string; ects: number; semester: number; grade: Letter | ''; orig: Letter | ''; added?: 'elective' | 'retake'; attempt: number };

const signed = (n: number) => (Math.abs(n) < 0.005 ? '±0.00' : `${n > 0 ? '+' : ''}${n.toFixed(2)}`);

function Scenario() {
  const D = useData();
  const initial = useMemo<Row[]>(() => D.taken.map((c) => ({
    key: `${c.code}@${c.semester}`, code: c.code, name: c.name, ects: c.ects, semester: c.semester, grade: c.grade ?? '', orig: c.grade ?? '', attempt: c.attempt ?? 1,
  })), [D]);
  const [rows, setRows] = useState<Row[]>(initial);
  const [adding, setAdding] = useState(false);
  const newAgno = cumulativeGpa(rows);
  const totalEcts = latestAttempts(rows).filter((r) => isGpaGrade(r.grade || undefined)).reduce((a, r) => a + r.ects, 0);
  const cur = rows.filter((r) => r.semester === D.semester && r.grade);
  const yano = cur.some((r) => isGpaGrade(r.grade || undefined)) ? gpa(cur) : null;
  const diff = newAgno - D.agno;
  const changed = rows.length !== initial.length || rows.some((r) => r.grade !== r.orig);

  // Bir satırı tek başına değiştirmenin AGNO etkisi (diğer satırlar şimdiki haliyle)
  const effectOf = (key: string, g: Letter | '') => cumulativeGpa(rows.map((r) => (r.key === key ? { ...r, grade: g } : r))) - cumulativeGpa(rows.map((r) => (r.key === key ? { ...r, grade: r.orig } : r)));
  // Eski (sonradan tekrar alınıp notlanan) alışlar
  const supersededKeys = new Set(rows.filter((r) => r.grade && rows.some((x) => x.code === r.code && x.semester > r.semester && x.grade)).map((r) => r.key));

  const setGrade = (key: string, g: Letter | '') => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, grade: g } : r)));
  const addRow = (c: { code: string; name: string; ects: number }, kind: 'elective' | 'retake', grade: Letter) =>
    setRows((rs) => [...rs, { key: `${c.code}@${D.semester}+`, code: c.code, name: c.name, ects: c.ects, semester: D.semester, grade, orig: '', added: kind, attempt: rs.filter((x) => x.code === c.code).length + 1 }]);

  // Alttan alınabilecek dersler: son notu FF/TT olan ve bu dönem alınmayanlar + (not yükseltme) DD/DC
  const latestNow = latestAttempts(rows);
  const inTerm = (code: string) => rows.some((r) => r.code === code && r.semester === D.semester);
  const failedNow = latestNow.filter((r) => (r.grade === 'FF' || r.grade === 'TT') && !inTerm(r.code));
  const lowNow = latestNow.filter((r) => (r.grade === 'DD' || r.grade === 'DC') && !inTerm(r.code));
  const pool = [...FALL_POOL, ...CURRICULUM.filter((c) => c.semester >= D.semester && c.type === 'Seçmeli')].filter((c) => !rows.some((r) => r.code === c.code));

  // Etki analizi kartı: başarısız derslerin farklı notlarla geçilmesi
  const failedAll = latestAttempts(initial).filter((r) => r.grade === 'FF' || r.grade === 'TT');
  const projected = (code: string, g: Letter) => {
    const exists = rows.find((r) => r.code === code && r.semester === D.semester);
    const next = exists ? rows.map((r) => (r === exists ? { ...r, grade: g } : r)) : [...rows, { ...rows.find((r) => r.code === code)!, key: 'tmp', semester: D.semester, grade: g }];
    return cumulativeGpa(next);
  };
  const applyRetake = (code: string, g: Letter) => {
    const exists = rows.find((r) => r.code === code && r.semester === D.semester);
    if (exists) setGrade(exists.key, g);
    else { const r = rows.find((x) => x.code === code)!; addRow(r, 'retake', g); }
  };

  return (
    <>
      <div className="scenario-bar">
        <div className="sb-item"><span className="eyebrow">Mevcut AGNO</span><strong className="mono">{fmtGpa(D.agno)}</strong></div>
        <div className="sb-item hl"><span className="eyebrow">Yeni AGNO</span><strong className="mono">{fmtGpa(newAgno)}</strong></div>
        <div className="sb-item"><span className="eyebrow">AGNO değişimi</span>
          <strong className={cx('mono', Math.abs(diff) < 0.005 ? '' : diff > 0 ? 'txt-success' : 'txt-danger')}>
            {Math.abs(diff) < 0.005 ? <>±0.00</> : diff > 0 ? <><ArrowUpRight size={18} />+{diff.toFixed(2)}</> : <><ArrowDownRight size={18} />{diff.toFixed(2)}</>}
          </strong>
        </div>
        <div className="sb-item"><span className="eyebrow">YANO ({D.semester}. yarıyıl)</span><strong className="mono">{yano !== null ? fmtGpa(yano) : '—'}</strong>{yano === null && <small className="muted">Not seçin</small>}</div>
        <div className="sb-actions">
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}><Plus size={15} /> Ders Ekle</Button>
          <Button variant="ghost" size="sm" onClick={() => setRows(initial)} disabled={!changed}><RotateCcw size={15} /> Sıfırla</Button>
        </div>
      </div>
      <p className="muted small mb12">
        Harf notunu değiştirin: sonuçlar anında hesaplanır, gerçek kayıtlarınız değişmez. AGNO = Σ(not puanı × AKTS) / Σ AKTS ({totalEcts} AKTS);
        yani <strong>AKTS’si büyük dersler AGNO’yu daha çok etkiler</strong>. Tekrar alınan derste yalnızca son not hesaba katılır.
      </p>

      {failedAll.length > 0 && (
        <Card className="mb12">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h2>Alttan derslerin AGNO’ya etkisi</h2>
            <span className="small muted">Bir nota tıklayın: ders aktif döneme o notla eklenir</span>
          </div>
          <div className="impact-grid">
            {failedAll.map((f) => (
              <div key={f.code} className="impact">
                <span><span className="mono small muted">{f.code} · {f.ects} AKTS · şu an {f.grade}</span><strong className="block">{f.name}</strong></span>
                <div className="impact-opts">
                  {(['DD', 'CC', 'BB', 'AA'] as Letter[]).map((g) => {
                    const p = projected(f.code, g);
                    return (
                      <button key={g} onClick={() => applyRetake(f.code, g)} title={`${f.code} dersini ${g} ile geçersen AGNO ${fmtGpa(p)}`}>
                        <span className="small">{g} ile</span>
                        <strong>{fmtGpa(p)}</strong>
                        <small className={p - newAgno >= 0 ? 'txt-success' : 'txt-danger'}>{signed(p - newAgno)}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="scenario-terms">
        {[...D.terms].reverse().map((t) => {
          const list = rows.filter((r) => r.semester === t.semester);
          return (
            <Card key={t.name} className="sc-term">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <h2>{t.name} <span className="muted small">· {t.semester}. Yarıyıl</span></h2>
                {t.semester === D.semester && <Chip tone="info">Devam ediyor</Chip>}
              </div>
              <ul className="sc-list">
                {list.map((r) => {
                  const mod = !!r.added || r.grade !== r.orig;
                  const old = supersededKeys.has(r.key);
                  const eff = mod && !old ? effectOf(r.key, r.grade) : 0;
                  const staj = r.grade === 'YT' || r.grade === 'YZ' || (r.ects === 1 && /SE [34]001/.test(r.code));
                  return (
                    <li key={r.key} className={cx(mod && 'modified', old && 'superseded')} title={old ? 'Bu ders sonradan tekrar alındı: bu not AGNO’ya katılmaz.' : undefined}>
                      <span className="sc-name"><span className="mono small muted">{r.code}</span> {r.name}
                        {r.attempt > 1 && <> <Chip tone="warning">Alttan</Chip></>}
                        {old && <span className="att-note">Tekrar alındı — AGNO’ya katılmaz</span>}
                      </span>
                      <span className="mono small muted">{r.ects} AKTS</span>
                      {staj ? <span className="small muted">{r.grade || 'Rapor'} · staj</span> : (
                        <select value={r.grade} disabled={old} onChange={(e) => setGrade(r.key, e.target.value as Letter | '')} aria-label={`${r.code} harf notu`} className={cx('letter-sel', mod && 'mod')}>
                          {t.semester === D.semester && <option value="">Seçilmedi</option>}
                          {[...LETTERS, ...(r.orig === 'TT' ? ['TT' as Letter] : [])].map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      )}
                      {r.added ? (
                        <button className="icon-btn sm" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} aria-label={`${r.code} kaldır`}><Trash2 size={14} /></button>
                      ) : <span className={cx('sc-delta', eff > 0.004 ? 'txt-success' : eff < -0.004 ? 'txt-danger' : 'muted')} title="Bu değişikliğin AGNO’ya etkisi">{mod ? signed(eff) : ''}</span>}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Senaryoya ders ekle" width={580}>
        <p className="muted small"><Info size={13} style={{ verticalAlign: '-2px' }} /> Eklenen ders aktif döneme ({D.semester}. yarıyıl) eklenir. Alttan eklenen dersin yeni notu eski notun yerine geçer.</p>
        {failedNow.length > 0 && <>
          <span className="eyebrow">Başarısız dersi alttan al</span>
          <ul className="pick-list">
            {failedNow.map((c) => (
              <li key={c.key}>
                <button onClick={() => { addRow(c, 'retake', 'CC'); setAdding(false); }}>
                  <span><span className="mono small muted">{c.code}</span> {c.name}</span>
                  <span className="mono small muted">{c.ects} AKTS · şu an {c.grade} → CC ile AGNO {fmtGpa(projected(c.code, 'CC'))}</span>
                  <Plus size={16} />
                </button>
              </li>
            ))}
          </ul>
        </>}
        {lowNow.length > 0 && <>
          <span className="eyebrow">Not yükseltmek için tekrar al (DD / DC)</span>
          <ul className="pick-list">
            {lowNow.map((c) => (
              <li key={c.key}>
                <button onClick={() => { addRow(c, 'retake', 'BB'); setAdding(false); }}>
                  <span><span className="mono small muted">{c.code}</span> {c.name}</span>
                  <span className="mono small muted">{c.ects} AKTS · şu an {c.grade} → BB ile AGNO {fmtGpa(projected(c.code, 'BB'))}</span>
                  <Plus size={16} />
                </button>
              </li>
            ))}
          </ul>
        </>}
        <span className="eyebrow">Seçmeli ders ekle</span>
        <ul className="pick-list">
          {pool.map((c) => (
            <li key={c.code}>
              <button onClick={() => { addRow(c, 'elective', 'BB'); setAdding(false); }}>
                <span><span className="mono small muted">{c.code}</span> {c.name}</span>
                <span className="mono small muted">{c.ects} AKTS · {c.semester}. yy · BB ile</span>
                <Plus size={16} />
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
