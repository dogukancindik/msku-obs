import { useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Info, RotateCcw, ShieldAlert, XCircle } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { CURRENT, WEEKS, WEEKS_DONE, student } from '../data/msku';
import { attendance, cx } from '../lib/util';
import { Button, Card, Chip, Modal, PageHeader, Progress } from '../components/ui';
import { pct, t, term as termLabel } from '../lib/i18n';

const LEVEL = {
  ok: { tone: 'success' as const, text: 'Güvenli', icon: <CheckCircle2 size={13} /> },
  warn: { tone: 'warning' as const, text: 'Dikkat — Sınıra Yakın', icon: <AlertTriangle size={13} /> },
  danger: { tone: 'danger' as const, text: 'Kritik Sınır', icon: <ShieldAlert size={13} /> },
  over: { tone: 'danger' as const, text: 'Sınır aşıldı — TT', icon: <XCircle size={13} /> },
};

export default function Attendance() {
  const D = useData();
  const { term } = useApp();
  const [detail, setDetail] = useState<string | null>(null);
  if (term !== student.term) return <PastAttendance term={term} />;
  const rows = D.current.map((c) => ({ c, a: attendance(D, c.code) })).sort((p, q) => q.a.ratio - p.a.ratio);
  const d = detail ? rows.find((r) => r.c.code === detail)! : null;
  const overList = rows.filter((x) => x.a.failed);

  return (
    <>
      <PageHeader title={t('Devamsızlık Durumu')} sub={`${termLabel(student.term)} · ${t('{n}. hafta', { n: WEEKS_DONE })} / ${WEEKS} · ${t('Sınır: haftalık ders saatinin 14 haftalık toplamının %30’u')}`} />
      {overList.length > 0 && (
        <div className="alert danger mb12" role="alert">
          <XCircle size={18} />
          <div>
            <strong>{t('{x} dersinde devamsızlık sınırı aşıldı.', { x: overList.map((x) => x.c.code).join(', ') })}</strong>
            <p className="small">{t('Bu dersten devamsızlık nedeniyle başarısız sayılırsınız (TT): yarıyıl sonu ve bütünleme sınavlarına giremezsiniz. Ders, açıldığı ilk dönemde devam zorunluluğuyla tekrar alınmalıdır. Sağlık raporunuz varsa Öğrenci İşleri’ne başvurun.')}</p>
          </div>
        </div>
      )}
      <div className="att-list">
        {rows.map(({ c, a }, i) => {
          const lv = LEVEL[a.level];
          return (
            <Card key={c.code} className={cx('att-row', !a.required && 'muted-card', i === 0 && '')}>
              
              <div className="att-name">
                <span className="mono small muted">{c.code} · T+U {c.t}+{c.u}</span>
                <strong>{c.name}</strong>
              </div>
              {a.required ? (
                <>
                  <div className="att-bar">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="small"><strong className="mono">{a.absent} / {a.limit} {t('saat')}</strong> <span className="muted">({pct(a.pct)})</span></span>
                      <span className={cx('small', a.failed ? 'txt-danger' : 'muted')}>{a.failed ? t('Sınır {n} saat aşıldı', { n: a.absent - a.limit }) : t('{n} saat hakkın kaldı', { n: a.left })}</span>
                    </div>
                    <Progress value={Math.min(a.absent, a.limit)} max={a.limit} tone={a.level === 'ok' ? 'success' : a.level === 'warn' ? 'warning' : 'danger'} label={t('{code} devamsızlık', { code: c.code })} />
                  </div>
                  <Chip tone={lv.tone} icon={lv.icon}>{t(lv.text)}</Chip>
                  <Button size="sm" variant="secondary" onClick={() => setDetail(c.code)}><CalendarDays size={14} /> {t('Haftalık detay')}</Button>
                </>
              ) : a.waived ? (
                <p className="muted small att-na"><RotateCcw size={13} /> {t('Alttan alınan ders — önceki alışta devam şartını sağladığınız için devam zorunluluğu yoktur. Sınavlara girmeniz yeterli.')}</p>
              ) : (
                <p className="muted small att-na"><Info size={13} /> {t('Staj dersi — devam zorunluluğu yoktur.')}</p>
              )}
            </Card>
          );
        })}
      </div>
      <p className="muted small mt12">{t('Renkler: yeşil %60’ın altı · turuncu %60–85 · kırmızı %85 ve üstü; sınır aşılırsa ders TT (devamsızlıktan başarısız) olur. Her durum ayrıca ikon ve metinle belirtilir.')}</p>

      <Modal open={!!d} onClose={() => setDetail(null)} title={d ? `${d.c.code} · ${t('Haftalık devamsızlık')}` : ''} width={560}>
        {d && (
          <>
            <p className="muted small">{d.c.name} · {t('toplam {a} / {b} saat (%{p})', { a: d.a.absent, b: d.a.limit, p: d.a.pct })}</p>
            <div className="week-grid" role="list">
              {Array.from({ length: WEEKS }, (_, w) => {
                const h = d.a.weeks[w];
                const future = w >= WEEKS_DONE;
                return (
                  <div key={w} role="listitem" className={cx('week', future ? 'future' : h ? 'absent' : 'present')}>
                    <span className="wk">{t('{n}. hafta', { n: w + 1 })}</span>
                    <strong className="mono">{future ? '—' : h ? `${h} ${t('saat')}` : '0'}</strong>
                    <span className="small">{future ? t('Henüz yapılmadı') : h ? t('Devamsız') : t('Tam katılım')}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

/** Geçmiş dönem devamsızlığı: notlarla tutarlı (TT olan derste sınır aşılmış, diğerlerinde sınırın altında) */
function PastAttendance({ term }: { term: string }) {
  const D = useData();
  const { me, go } = useApp();
  const tm = D.terms.find((x) => x.name === term);
  const list = D.taken.filter((c) => c.semester === tm?.semester && c.t + c.u > 0);
  const h = (s: string) => { let x = 2166136261; for (const ch of s) x = Math.imul(x ^ ch.charCodeAt(0), 16777619) >>> 0; return x; };
  return (
    <>
      <PageHeader title={t('Devamsızlık Durumu')} sub={`${termLabel(term)} · ${t('{n}. Yarıyıl', { n: tm?.semester ?? '' })} · ${t('dönem tamamlandı; kesinleşmiş devamsızlık kayıtları')}`} />
      <Card>
        <table className="atable">
          <thead><tr><th>{t('Ders')}</th><th className="num">{t('T+U')}</th><th className="num">{t('Devamsızlık')}</th><th>{t('Durum')}</th><th>{t('Harf notu')}</th></tr></thead>
          <tbody>
            {list.map((c) => {
              const limit = Math.floor((c.t + c.u) * WEEKS * 0.3);
              const waived = !!c.waived;
              const r = h(`${me.email}|${c.code}|${c.semester}|att`);
              const absent = c.grade === 'TT' ? limit + 1 + (r % 3) : waived ? 0 : Math.round(((r % 1000) / 1000) * 0.7 * limit);
              const over = c.grade === 'TT';
              return (
                <tr key={c.code}>
                  <td><span className="mono small muted">{c.code}</span><strong className="block">{c.name}</strong></td>
                  <td className="num mono">{c.t}+{c.u}</td>
                  <td className="num mono">{waived ? '—' : `${absent} / ${limit} ${t('saat')}`}</td>
                  <td>{waived ? <Chip tone="neutral" icon={<RotateCcw size={12} />}>{t('Devam zorunluluğu yok')}</Chip>
                    : over ? <Chip tone="danger" icon={<XCircle size={12} />}>{t('Devamsızlıktan kaldı (TT)')}</Chip>
                      : <Chip tone="success" icon={<CheckCircle2 size={12} />}>{t('Devam şartı sağlandı')}</Chip>}</td>
                  <td className="mono"><strong className={cx(c.grade && ['FF', 'TT'].includes(c.grade) && 'txt-danger')}>{c.grade ?? '—'}</strong></td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={5} className="muted center">{t('Bu dönemde haftalık saati olan ders yok.')}</td></tr>}
          </tbody>
        </table>
      </Card>
      <p className="muted small mt12">{t('Sınır: haftalık ders saatinin 14 haftalık toplamının %30’u')} · <button className="link-btn" onClick={() => go('transcript')}>{t('Transkripte git')}</button></p>
    </>
  );
}
