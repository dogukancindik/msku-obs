// E-posta adresleri Türkçe karakter içeremediği için (ı, ğ, ü, ş, ö, ç) adları doğru yazımına çeviren sözlük.
// Ayrıca "mertdemir" gibi birleşik kullanıcı adlarını ad + soyad olarak ayırmak için kullanılır.

const FIRST = `
ahmet mehmet mustafa ali hüseyin hasan ibrahim ismail osman yusuf murat ömer ramazan halil süleyman abdullah mahmut recep salih
fatih kadir emre hakan burak serkan onur uğur özgür gökhan oğuz oğuzhan doğan doğukan doğuhan tuğrul buğra çağrı çağlar çağatay
barış berk berkay batuhan ertuğrul alperen eren arda kaan kerem efe emir yiğit çınar göktuğ ilker mert can cem cenk deniz
ege egemen enes erkan erdem eray ersin furkan gökay halit hamza harun ilhan ilyas kemal kenan levent mete metin nihat okan
orhan ozan polat rıza sami selim semih serdar sinan tarık taner tolga tuna umut volkan yasin yavuz yunus zafer selçuk sercan
taha talha yağız alp alper anıl atakan aykut baran bora berkan cihan cihat doruk ercan erkut ferhat fikret görkem kutay
ayşe fatma emine hatice zeynep elif özlem şule şeyma büşra gül gülşen gülay gülsüm gülşah sevgi derya dilara dilek ebru esra
eda ece selin sıla şeyda şebnem merve melike melis meltem nur nurcan pınar seda sena sinem simge tuğba tuğçe yasemin zehra
ceren cansu damla duygu ezgi gizem hande irem ipek aslı aylin beyza burcu çiğdem defne derin ela elçin ilayda kübra lale
`;

const LAST = `
yılmaz kaya demir şahin çelik yıldız yıldırım öztürk aydın özdemir arslan doğan kılıç aslan çetin kara koç kurt özkan şimşek
polat özer korkmaz erdoğan güneş yavuz uçar akın aksoy bulut güler kaplan avcı türk tekin acar ateş erdem keskin tunç
kırgız kırmızı karaca kocabaş akgül bozkurt çakır çiftçi çoban çolak çınar ışık ılgaz ırmak kılınç gündüz günay gürsoy güven
işçi kurtuluş özkaya şen şentürk tekeli toprak türkmen uysal yüksel yücel yalçın yağmur sönmez sürmeli süzek tülay dinçer
erkarslan öğe gümüş gökçe göksu gökdemir küçük büyük köse kösem cındık demirci doğru erdoğmuş akbulut aktaş altun altıntaş
balcı başaran bayram bilgin bilgiç cömert duman eren ergün eroğlu esen genç gök gönül gül güneş ince işık kahraman karakaya
karataş kartal kaşıkçı kocaman metin oral özbek öz özgür pala sarı saygı sezer soylu sezgin şener taş taşkın temiz tok
ünal üstün yaman yaşar yazıcı yeşil yiğit zengin çetinkaya ön ilhan karanfil özer aykaç kocaman erdoğan şahin balta
`;

const fold = (w: string) => w.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');

const build = (txt: string) => {
  const m: Record<string, string> = {};
  for (const w of txt.split(/\s+/).filter(Boolean)) if (!m[fold(w)]) m[fold(w)] = w;
  return m;
};
const FIRST_MAP = build(FIRST);
const LAST_MAP = build(LAST);
const ALL_MAP = { ...LAST_MAP, ...FIRST_MAP };

const cap = (w: string) => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1);

/** Single ASCII word → Turkish spelling. Handles the "-oğlu" surname suffix (koseoglu → Köseoğlu). */
export const turkishWord = (ascii: string): string => {
  const k = fold(ascii);
  if (ALL_MAP[k]) return cap(ALL_MAP[k]);
  if (k.length > 5 && k.endsWith('oglu')) {
    const stem = k.slice(0, -4);
    return cap((ALL_MAP[stem] ?? stem) + 'oğlu');
  }
  return cap(ascii.toLocaleLowerCase('tr'));
};

const isKnownLast = (k: string) => !!LAST_MAP[k] || !!FIRST_MAP[k] || (k.length > 5 && k.endsWith('oglu'));

/** "mertdemir" → ["mert", "demir"]; "ahmetkoseoglu" → ["ahmet", "koseoglu"]; unknown → ["xyz"] */
export function splitJoined(local: string): string[] {
  const k = fold(local);
  let best: { parts: string[]; score: number } | null = null;
  for (let i = 2; i <= k.length - 2; i++) {
    const a = k.slice(0, i), b = k.slice(i);
    let score = 0;
    if (FIRST_MAP[a]) score += 2 + a.length / 10;
    if (isKnownLast(b)) score += 2 + b.length / 10;
    // two given names + surname, e.g. "alirizakirgiz"
    if (FIRST_MAP[a] && !isKnownLast(b)) {
      for (let j = 2; j <= b.length - 2; j++) {
        const b1 = b.slice(0, j), b2 = b.slice(j);
        if (FIRST_MAP[b1] && isKnownLast(b2)) {
          const s = 5 + (a.length + b1.length + b2.length) / 10;
          if (!best || s > best.score) best = { parts: [a, b1, b2], score: s };
        }
      }
    }
    if (FIRST_MAP[a] && score >= 2 && (!best || score > best.score)) best = { parts: [a, b], score };
  }
  return best && best.score >= 4 ? best.parts : best && best.score >= 2 && best.parts[1].length >= 3 ? best.parts : [k];
}
