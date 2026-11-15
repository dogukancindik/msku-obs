import {
  BarChart3, BookOpen, FilePlus2, CalendarRange, FileText, GraduationCap, Home, Library, ListChecks, LogOut, Mail, UserCheck, UserCog,
} from 'lucide-react';

export type NavItem = { path: string; label: string; icon: any; short?: string; keywords?: string };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  { label: 'Genel', items: [{ path: 'dashboard', label: 'Ana Sayfa', short: 'Ana Sayfa', icon: Home, keywords: 'ana sayfa home dashboard özet' }] },
  {
    label: 'Akademik & Ders İşlemleri',
    items: [
      { path: 'courses', label: 'Alınan Dersler & Ders Kayıt', short: 'Dersler', icon: BookOpen, keywords: 'alınan dersler ders kayıt kesinleştirme danışman onayı' },
      { path: 'grades', label: 'Not Listesi', short: 'Notlar', icon: ListChecks, keywords: 'not vize final ödev proje sınıf ortalaması' },
      { path: 'transcript', label: 'Transkript & Senaryo', icon: FileText, keywords: 'transkript pdf senaryo what-if agno hesapla' },
      { path: 'curriculum', label: 'Müfredat & Mezuniyet Durumu', icon: GraduationCap, keywords: 'müfredat mezuniyet akts staj zorunlu seçmeli' },
      { path: 'averages', label: 'Dönem Ortalamaları', icon: BarChart3, keywords: 'yano agno ortalama grafik dönem' },
      { path: 'attendance', label: 'Devamsızlık Durumu', short: 'Devamsızlık', icon: UserCheck, keywords: 'devamsızlık yoklama' },
      { path: 'gradcredit', label: 'Mezuniyet Kredisi Talebi', icon: FilePlus2, keywords: 'mezuniyet kredisi ek akts kredi talebi 42' },
    ],
  },
  {
    label: 'Takvim & Katalog',
    items: [
      { path: 'schedule', label: 'Ders Programı & Sınav Takvimi', short: 'Program', icon: CalendarRange, keywords: 'ders programı haftalık sınav takvimi vize final bütünleme' },
      { path: 'offered', label: 'Açılan Bölüm Dersleri', icon: Library, keywords: 'açılan dersler katalog seçmeli' },
    ],
  },
];

export const BOTTOM_NAV: NavItem[] = [
  { path: 'messages', label: 'Mesajlar', icon: Mail, keywords: 'mesaj gelen kutusu gönderilen hoca danışman' },
  { path: 'account', label: 'Hesap & Kullanıcı İşlemleri', icon: UserCog, keywords: 'hesap şifre profil fotoğraf erişilebilirlik' },
];
export const LOGOUT_ICON = LogOut;

export const MOBILE_NAV: NavItem[] = [NAV[0].items[0], NAV[1].items[0], NAV[1].items[1], NAV[2].items[0]];
export const ALL_NAV: NavItem[] = [...NAV.flatMap((g) => g.items), ...BOTTOM_NAV];
export const navFor = (path: string) => ALL_NAV.find((n) => n.path === path);
export const groupFor = (path: string) => NAV.find((g) => g.items.some((i) => i.path === path))?.label ?? (BOTTOM_NAV.some((b) => b.path === path) ? 'İletişim & Hesap' : '');
