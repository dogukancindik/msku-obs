import { useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Info, RotateCcw, ShieldAlert, XCircle } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { CURRENT, WEEKS, WEEKS_DONE, student } from '../data/msku';
import { attendance, cx } from '../lib/util';
import { Button, Card, Chip, Modal, PageHeader, Progress } from '../components/ui';
import { PastTerm } from './Courses';

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
  if (term !== student.term) return <PastTerm />;
  const rows = D.current.map((c) => ({ c, a: attendance(D, c.code) })).sort((p, q) => q.a.ratio - p.a.ratio);
  const d = detail ? rows.find((r) => r.c.code === detail)! : null;
  const overList = rows.filter((x) => x.a.failed);

  return (
    <>
      <PageHeader title="Devamsızlık Durumu" sub={`${student.term} · ${WEEKS_DONE}. hafta / ${WEEKS} · Sınır: haftalık ders saatinin 14 haftalık toplamının %30’u`} />
      {overList.length > 0 && (
        <div className="alert danger mb12" role="alert">
          <XCircle size={18} />
          <div>
            <strong>{overList.map((x) => x.c.code).join(', ')} dersinde devamsızlık sınırı aşıldı.</strong>
            <p className="small">Bu dersten devamsızlık nedeniyle başarısız sayılırsınız (TT): yarıyıl sonu ve bütünleme sınavlarına giremezsiniz. Ders, açıldığı ilk dönemde devam zorunluluğuyla tekrar alınmalıdır. Sağlık raporunuz varsa Öğrenci İşleri’ne başvurun.</p>
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
                      <span className="small"><strong className="mono">{a.absent} / {a.limit} Saat</strong> <span className="muted">(%{a.pct})</span></span>
                      <span className={cx('small', a.failed ? 'txt-danger' : 'muted')}>{a.failed ? `Sınır ${a.absent - a.limit} saat aşıldı` : `${a.left} saat hakkın kaldı`}</span>
                    </div>
                    <Progress value={Math.min(a.absent, a.limit)} max={a.limit} tone={a.level === 'ok' ? 'success' : a.level === 'warn' ? 'warning' : 'danger'} label={`${c.code} devamsızlık`} />
                  </div>
                  <Chip tone={lv.tone} icon={lv.icon}>{lv.text}</Chip>
                  <Button size="sm" variant="secondary" onClick={() => setDetail(c.code)}><CalendarDays size={14} /> Haftalık detay</Button>
                </>
              ) : a.waived ? (
                <p className="muted small att-na"><RotateCcw size={13} /> Alttan alınan ders — önceki alışta devam şartını sağladığınız için devam zorunluluğu yoktur. Sınavlara girmeniz yeterli.</p>
              ) : (
                <p className="muted small att-na"><Info size={13} /> Staj dersi — devam zorunluluğu yoktur.</p>
              )}
            </Card>
          );
        })}
      </div>
      <p className="muted small mt12">Renkler: yeşil %60’ın altı · turuncu %60–85 · kırmızı %85 ve üstü; sınır aşılırsa ders TT (devamsızlıktan başarısız) olur. Her durum ayrıca ikon ve metinle belirtilir.</p>

      <Modal open={!!d} onClose={() => setDetail(null)} title={d ? `${d.c.code} · Haftalık devamsızlık` : ''} width={560}>
        {d && (
          <>
            <p className="muted small">{d.c.name} · toplam {d.a.absent} / {d.a.limit} saat (%{d.a.pct})</p>
            <div className="week-grid" role="list">
              {Array.from({ length: WEEKS }, (_, w) => {
                const h = d.a.weeks[w];
                const future = w >= WEEKS_DONE;
                return (
                  <div key={w} role="listitem" className={cx('week', future ? 'future' : h ? 'absent' : 'present')}>
                    <span className="wk">{w + 1}. hafta</span>
                    <strong className="mono">{future ? '—' : h ? `${h} saat` : '0'}</strong>
                    <span className="small">{future ? 'Henüz yapılmadı' : h ? 'Devamsız' : 'Tam katılım'}</span>
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
