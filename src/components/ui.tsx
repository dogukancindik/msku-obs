import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cx } from '../lib/util';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'new' | 'brand';

export function Chip({ tone = 'neutral', icon, children, title }: { tone?: Tone; icon?: React.ReactNode; children: React.ReactNode; title?: string }) {
  return (
    <span className={cx('chip', `chip-${tone}`)} title={title}>
      {icon}
      {children}
    </span>
  );
}

export function Card({ children, className, as: As = 'section', ...rest }: React.HTMLAttributes<HTMLElement> & { as?: any }) {
  return (
    <As className={cx('card', className)} {...rest}>
      
      {children}
    </As>
  );
}

export function CardHead({ icon, title, action, sub }: { icon?: React.ReactNode; title: React.ReactNode; action?: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="card-head">
      <div className="card-title">
        {icon && <span className="card-icon">{icon}</span>}
        <div>
          <h2>{title}</h2>
          {sub && <p className="card-sub">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Button({ variant = 'secondary', size = 'md', className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' }) {
  return (
    <button className={cx('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', className)} {...rest}>
      {children}
    </button>
  );
}

export function Progress({ value, max = 100, tone = 'brand', label, markers }: { value: number; max?: number; tone?: Tone; label?: string; markers?: { at: number; label: string }[] }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div className={cx('progress-fill', `fill-${tone}`)} style={{ width: `${pct}%` }} />
      {markers?.map((m) => (
        <span key={m.label} className="progress-marker" style={{ left: `${(m.at / max) * 100}%` }} title={m.label} />
      ))}
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div className="page-title-row">
        <div>
          <h1>{title}</h1>
          {sub && <p className="page-sub">{sub}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, tabs, label }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: React.ReactNode; count?: number }[]; label: string }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.value} role="tab" aria-selected={value === t.value} className={cx(value === t.value && 'on')} onClick={() => onChange(t.value)}>
          {t.label}
          {t.count !== undefined && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat"><X size={18} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </aside>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; label: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} className={cx(value === o.value && 'on')} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, width = 520 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, [href], input, select')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={ref} style={{ maxWidth: width }}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <span className="muted">{children}</span>;
}

/** University logo from /public/msku-logo.png; falls back to a text mark if the file is missing. */
export function Logo({ size = 42, className }: { size?: number; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return <div className={cx('logo-mark', className)} style={{ width: size, height: size }} aria-hidden>MSKÜ</div>;
  return <img className={cx('logo-img', className)} src="msku-logo.png" alt="Muğla Sıtkı Koçman Üniversitesi logosu" width={size} height={size} onError={() => setFailed(true)} />;
}
