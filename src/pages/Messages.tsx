import { useEffect, useRef, useState } from 'react';
import { Inbox, Mail, MailOpen, MailWarning, PenSquare, Send, AlertCircle, Trash2 } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { CURRENT, CURRICULUM, FALL_POOL, student, type Message } from '../data/msku';
import { cx, fmtDate, fmtTime } from '../lib/util';
import { Button, Card, Chip, PageHeader, Tabs } from '../components/ui';

type Tab = 'inbox' | 'sent' | 'compose';

export default function Messages() {
  const { route, inbox, sent, markRead, setRead, deleteMessage, restoreMessage, toast } = useApp();
  const q = route.query;
  const [tab, setTab] = useState<Tab>(q.get('tab') === 'compose' ? 'compose' : q.get('tab') === 'sent' ? 'sent' : 'inbox');
  const [sel, setSel] = useState<string | null>(q.get('id') ?? inbox[0]?.id ?? null);
  const unread = inbox.filter((m) => !m.read).length;
  const list = tab === 'inbox' ? inbox : sent;
  const current = sel === 'none' ? undefined : list.find((m) => m.id === sel) ?? list[0];

  // Opening a message marks it read once; "okunmadı" stays until the user opens it again.
  const opened = useRef<string | null>(null);
  useEffect(() => {
    if (tab !== 'inbox' || !current || opened.current === current.id) return;
    opened.current = current.id;
    if (!current.read) markRead(current.id);
  }, [tab, current, markRead]);

  const box = tab === 'sent' ? 'sent' : 'inbox';
  const remove = (m: Message) => {
    const index = list.findIndex((x) => x.id === m.id);
    const nextSel = list[index + 1]?.id ?? list[index - 1]?.id ?? null;
    deleteMessage(box, m.id);
    setSel(nextSel);
    toast({ text: 'Mesaj silindi.', action: { label: 'Geri al', run: () => { restoreMessage(box, m, index); setSel(m.id); } } });
  };
  const markUnread = (m: Message) => {
    setRead(m.id, false);
    opened.current = null;
    setSel('none');
    toast({ text: 'Mesaj okunmadı olarak işaretlendi.', action: { label: 'Geri al', run: () => setRead(m.id, true) } });
  };

  return (
    <>
      <PageHeader title="Mesajlar" sub="Danışmanınız ve ders hocalarınızla yazışmalar"
        actions={<Button variant="primary" onClick={() => setTab('compose')}><PenSquare size={16} /> Yeni Mesaj Yaz</Button>} />
      <div className="">
        <Tabs<Tab> label="Mesaj kutuları" value={tab} onChange={(t) => { setTab(t); setSel(null); }}
          tabs={[{ value: 'inbox', label: <><Inbox size={15} /> Gelen Kutusu</>, count: unread || undefined }, { value: 'sent', label: <><Send size={15} /> Gönderilenler</> }, { value: 'compose', label: <><PenSquare size={15} /> Yeni Mesaj Yaz</> }]} />
      </div>
      {tab === 'compose' ? <Compose onSent={() => { setTab('sent'); setSel(null); }} /> : (
        <div className="mail">
          <ul className="mail-list" role="listbox" aria-label={tab === 'inbox' ? 'Gelen kutusu' : 'Gönderilenler'}>
            {list.map((m) => (
              <li key={m.id}>
                <button className={cx('mail-item', current?.id === m.id && 'on', tab === 'inbox' && !m.read && 'unread')} onClick={() => { opened.current = null; setSel(m.id); }} role="option" aria-selected={current?.id === m.id}>
                  <span className="mi-top">
                    <strong>{tab === 'inbox' ? m.from : m.to}</strong>
                    <span className="muted small">{fmtDate(m.date, { day: 'numeric', month: 'short' })}</span>
                  </span>
                  <span className="mi-subj">{m.subject}</span>
                  <span className="mi-meta">
                    <Chip tone={m.kind === 'Danışman' ? 'brand' : m.kind === 'Ders' ? 'info' : 'neutral'}>{m.course ?? m.kind}</Chip>
                  </span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="muted small" style={{ padding: 16 }}>Bu kutuda mesaj yok.</li>}
          </ul>
          {current ? <Reader m={current} incoming={tab === 'inbox'} onDelete={() => remove(current)} onUnread={() => markUnread(current)} /> : <Card className="mail-read empty"><MailOpen size={28} /><p className="muted">Okumak için bir mesaj seçin.</p></Card>}
        </div>
      )}
    </>
  );
}

function Reader({ m, incoming, onDelete, onUnread }: { m: Message; incoming: boolean; onDelete: () => void; onUnread: () => void }) {
  return (
    <Card className="mail-read">
      <div className="mr-head">
        <div className="mr-title">
          <h2>{m.subject}</h2>
          <div className="mr-actions">
            {incoming && <Button size="sm" variant="secondary" onClick={onUnread}><MailWarning size={15} /> Okunmadı olarak işaretle</Button>}
            <Button size="sm" variant="danger" onClick={onDelete}><Trash2 size={15} /> Sil</Button>
          </div>
        </div>
        <div className="mr-meta small">
          <span><Mail size={13} /> {incoming ? <>Kimden: <strong>{m.from}</strong></> : <>Kime: <strong>{m.to}</strong></>}</span>
          <span className="muted">{fmtDate(m.date, { day: 'numeric', month: 'long', year: 'numeric' })} · {fmtTime(m.date)}</span>
          {m.course && <Chip tone="info">{m.course}</Chip>}
        </div>
      </div>
      <div className="mr-body">{m.body.split('\n').map((p, i) => <p key={i}>{p || ' '}</p>)}</div>
    </Card>
  );
}

function Compose({ onSent }: { onSent: () => void }) {
  const D = useData();
  const { sendMessage, toast } = useApp();
  // Tüm öğretim üyeleri (unvanlarıyla), soyadına göre sıralı; danışman ve bu dönem derse girenler üstte
  const surname = (n: string) => n.split(' ').pop() ?? n;
  const all = Array.from(new Set([...CURRICULUM, ...FALL_POOL].map((c) => c.instructor).filter((n): n is string => !!n && /(Dr\.|Öğr\.|Prof\.|Doç\.)/.test(n))));
  const current = new Set(D.current.map((c) => c.instructor));
  const coursesOf = (n: string) => D.current.filter((c) => c.instructor === n).map((c) => c.code);
  const groups = [
    { label: 'Danışmanınız', list: [D.advisor.name] },
    { label: 'Bu dönem derslerinize girenler', list: all.filter((n) => current.has(n) && n !== D.advisor.name).sort((a, b) => surname(a).localeCompare(surname(b), 'tr')) },
    { label: 'Diğer öğretim üyeleri', list: all.filter((n) => !current.has(n) && n !== D.advisor.name).sort((a, b) => surname(a).localeCompare(surname(b), 'tr')) },
  ];
  const recipients = groups.flatMap((g) => g.list.map((n) => ({ value: n, to: n })));
  const [rcp, setRcp] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tried, setTried] = useState(false);
  const r = recipients.find((x) => x.value === rcp);
  const errors = { rcp: !rcp, subject: !subject.trim(), body: body.trim().length < 10 };
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.rcp || errors.subject || errors.body) return;
    sendMessage({ to: r!.to, subject: subject.trim(), body: body.trim(), kind: r!.to === D.advisor.name ? 'Danışman' : 'Ders' });
    toast({ text: `Mesajınız ${r!.to} adlı öğretim üyesine gönderildi.`, tone: 'success' });
    onSent();
  };
  return (
    <Card className="compose">
      <form className="stack" onSubmit={send} noValidate>
        <label className="field">
          <span>Alıcı (öğretim üyesi)</span>
          <select className={cx('input', tried && errors.rcp && 'invalid')} value={rcp} onChange={(e) => setRcp(e.target.value)}>
            <option value="">Öğretim üyesi seçin…</option>
            {groups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.list.map((n) => <option key={n} value={n}>{n}{n === D.advisor.name ? ' (Danışman)' : ''}</option>)}
              </optgroup>
            ))}
          </select>
          {r ? <span className="field-hint">{r.to === D.advisor.name ? 'Danışmanınız' : coursesOf(r.to).length ? `Bu dönem aldığınız ders: ${coursesOf(r.to).join(', ')}` : 'Bölüm öğretim üyesi'}</span>
            : tried && errors.rcp && <span className="field-error"><AlertCircle size={13} /> Mesaj göndereceğiniz öğretim üyesini seçin.</span>}
        </label>
        <label className="field">
          <span>Konu</span>
          <input className={cx('input', tried && errors.subject && 'invalid')} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="Örn. Laboratuvar telafisi hakkında" />
          {tried && errors.subject && <span className="field-error"><AlertCircle size={13} /> Konu yazın.</span>}
        </label>
        <label className="field">
          <span>Mesaj</span>
          <textarea className={cx('input textarea', tried && errors.body && 'invalid')} value={body} onChange={(e) => setBody(e.target.value)} rows={8} maxLength={2000} placeholder="Hocam merhaba, …" />
          <span className={cx('field-hint', tried && errors.body && 'txt-danger')}>{body.length}/2000 {tried && errors.body && '· En az 10 karakter yazın.'}</span>
        </label>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary"><Send size={16} /> Gönder</Button>
        </div>
      </form>
    </Card>
  );
}
