import { useState } from 'react';
import { useData } from '../lib/store';
import { fmtGpa } from '../lib/util';
import { Card, CardHead, Chip, PageHeader } from '../components/ui';
import { BarChart3 } from 'lucide-react';
import { t, term } from '../lib/i18n';

export default function Averages() {
  const D = useData();
  const stats = D.stats;
  const done = stats.filter((s) => !s.inProgress);
  const [hover, setHover] = useState<number | null>(done.length - 1);

  const W = 760, H = 300, padL = 44, padR = 16, padT = 20, padB = 46;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = stats.length;
  const band = plotW / n;
  const y = (v: number) => padT + plotH - (v / 4) * plotH;
  const xc = (i: number) => padL + band * i + band / 2;
  const agnoPts = stats.map((s, i) => (s.agno !== null ? [xc(i), y(s.agno)] : null)).filter(Boolean) as number[][];

  return (
    <>
      <PageHeader title={t('Dönem Ortalamaları')} sub={`${t('Güncel AGNO')} ${fmtGpa(D.agno)} · ${t('Hazırlık yılı ortalamaya dahil değildir')}`} />

      <Card className="mb20">
        <table className="atable">
          <thead>
            <tr><th>{t('Dönem')}</th><th className="num">{t('Ders')}</th><th className="num">{t('Alınan AKTS')}</th><th className="num">{t('Başarılan AKTS')}</th><th className="num">{t('Dönem Ort.')}</th><th className="num">{t('AGNO')}</th></tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.name}>
                <td><strong>{term(s.name)}</strong> <span className="muted small">· {t('{n}. yy', { n: s.semester })}</span></td>
                <td className="num mono">{s.count}</td>
                <td className="num mono">{s.ects}</td>
                <td className="num mono">{s.inProgress ? '—' : s.passedEcts}</td>
                <td className="num">{s.inProgress ? <Chip tone="info">{t('Devam ediyor')}</Chip> : <strong className="mono">{fmtGpa(s.yano!)}</strong>}</td>
                <td className="num">{s.inProgress ? <span className="na">—</span> : <span className="mono">{fmtGpa(s.agno!)}</span>}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td>{t('Toplam')}</td><td className="num mono">{stats.reduce((a, s) => a + s.count, 0)}</td><td className="num mono">{stats.reduce((a, s) => a + s.ects, 0)}</td>
              <td className="num mono">{done.reduce((a, s) => a + s.passedEcts, 0)}</td><td /><td className="num mono"><strong>{fmtGpa(D.agno)}</strong></td></tr>
          </tfoot>
        </table>
      </Card>

      <Card className="">
        <CardHead icon={<BarChart3 size={18} />} title={t('Akademik performans')} sub={t('Çubuk: dönem ortalaması · Çizgi: genel ortalama (AGNO). Ayrıntı için bir döneme gelin.')} />
        <div className="chart-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={done.map((s) => `${term(s.name)}: ${t('dönem ortalaması')} ${fmtGpa(s.yano!)}, AGNO ${fmtGpa(s.agno!)}`).join('; ')}>
            {[0, 1, 2, 3, 4].map((v) => (
              <g key={v}>
                <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className="grid-line" />
                <text x={padL - 10} y={y(v) + 4} textAnchor="end" className="axis-label">{v.toFixed(2)}</text>
              </g>
            ))}
            {stats.map((s, i) => {
              const bw = Math.min(56, band * 0.5);
              const on = hover === i;
              return (
                <g key={s.name} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} className="bar-g">
                  <rect x={padL + band * i} y={padT} width={band} height={plotH} className={on ? 'hover-band on' : 'hover-band'} />
                  {s.inProgress ? (
                    <>
                      <rect x={xc(i) - bw / 2} y={y(4)} width={bw} height={plotH} rx={6} className="bar-pending" />
                      <text x={xc(i)} y={y(2)} textAnchor="middle" className="bar-pending-label">{t('Devam')}</text>
                    </>
                  ) : (
                    <rect x={xc(i) - bw / 2} y={y(s.yano!)} width={bw} height={y(0) - y(s.yano!)} rx={6} className={on ? 'bar-yano on' : 'bar-yano'} />
                  )}
                  <text x={xc(i)} y={H - padB + 20} textAnchor="middle" className="axis-label">{term(s.name.replace('-20', '–').replace(/^20/, ''))}</text>
                  <text x={xc(i)} y={H - padB + 35} textAnchor="middle" className="axis-sub">{t('{n}. yy', { n: s.semester })}</text>
                </g>
              );
            })}
            <polyline points={agnoPts.map((p) => p.join(',')).join(' ')} className="line-agno" />
            {agnoPts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 6 : 4.5} className="dot-agno" />)}
            {hover !== null && !stats[hover].inProgress && (() => {
              const s = stats[hover];
              const tx = Math.min(Math.max(xc(hover) - 80, padL), W - padR - 160);
              return (
                <g className="tip" pointerEvents="none">
                  <rect x={tx} y={padT + 2} width={160} height={62} rx={10} />
                  <text x={tx + 12} y={padT + 22} className="tip-title">{term(s.name)}</text>
                  <text x={tx + 12} y={padT + 40}>{t('Dönem ort.')} <tspan className="tip-strong">{fmtGpa(s.yano!)}</tspan></text>
                  <text x={tx + 12} y={padT + 56}>AGNO <tspan className="tip-strong">{fmtGpa(s.agno!)}</tspan></text>
                </g>
              );
            })()}
          </svg>
        </div>
        <div className="legend small muted">
          <span><span className="lg-swatch bar" /> {t('Dönem ortalaması')}</span><span><span className="lg-swatch line" /> {t('AGNO (genel)')}</span><span><span className="lg-swatch pend" /> {t('Devam eden dönem')}</span>
        </div>
      </Card>
    </>
  );
}
