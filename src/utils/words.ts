import { CodeLanguage, CodeSnippet, QuoteItem, SupportedLanguage } from '../types';

export interface LanguageMeta {
  id: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { id: 'english', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { id: 'pashto', name: 'Pashto', nativeName: 'پښتو', dir: 'rtl', flag: '🇦🇫' },
  { id: 'dari', name: 'Dari / Persian', nativeName: 'دری', dir: 'rtl', flag: '🇦🇫' },
  { id: 'arabic', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { id: 'urdu', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰' },
  { id: 'spanish', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { id: 'french', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { id: 'german', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  { id: 'italian', name: 'Italian', nativeName: 'Italiano', dir: 'ltr', flag: '🇮🇹' },
  { id: 'turkish', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
  { id: 'russian', name: 'Russian', nativeName: 'Русский', dir: 'ltr', flag: '🇷🇺' },
  { id: 'hindi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' }
];

export const PASHTO_WORDS = [
  'سلام', 'مننه', 'ښه', 'کور', 'هېواد', 'ملګری', 'ژوند', 'مینه', 'کتاب', 'ښوونځی',
  'کار', 'لار', 'لمر', 'باران', 'علم', 'هڅه', 'بریالیتوب', 'سوله', 'افغان', 'رڼا',
  'ښکلی', 'ورور', 'خور', 'مور', 'پلار', 'خوښي', 'هیله', 'زړه', 'ستوری', 'اسمان',
  'ځمکه', 'اوبه', 'غر', 'باغ', 'ګل', 'ښار', 'کلي', 'خلک', 'پوهه', 'قلم',
  'سبا', 'نن', 'وخت', 'صداقت', 'احترام', 'بریالی', 'هدف', 'روښانه', 'آزادي', 'ولس',
  'ځوان', 'تکل', 'نړۍ', 'قدرت', 'پسرلی', 'شعر', 'هنر', 'درناوی', 'صبر', 'همت'
];

export const DARI_WORDS = [
  'سلام', 'تشکر', 'دوست', 'مهربان', 'زندگی', 'وطن', 'کتاب', 'بهار', 'خورشید', 'باران',
  'دانش', 'کار', 'تلاش', 'پیروزی', 'صلح', 'روشنایی', 'زیبا', 'دریا', 'ستاره', 'آسمان',
  'مادر', 'پدر', 'امید', 'دل', 'گل', 'شهر', 'مردم', 'زمان', 'قلم', 'امروز',
  'فردا', 'خوشبختی', 'آزادی', 'محبت', 'آرامش', 'لبخند', 'رویا', 'جهان', 'آفتاب', 'همدلی',
  'آینده', 'پیمان', 'شادی', 'نیکی', 'فرهنگ', 'صداقت', 'اندیشه', 'یار', 'نور', 'روشنی',
  'وفا', 'هنر', 'همبستگی', 'آوا', 'کوشش', 'سرسبز', 'شوق', 'صفا', 'پرواز', 'صمیمیت'
];

export const ARABIC_WORDS = [
  'سلام', 'شكرا', 'مرحبا', 'أمل', 'نجاح', 'كتاب', 'علم', 'عمل', 'شمس', 'قمر',
  'حياة', 'سماء', 'بحر', 'نور', 'عالم', 'مدينة', 'إنسان', 'فكرة', 'هدف', 'إبداع',
  'صديق', 'محبة', 'قلب', 'زهرة', 'وطن', 'خير', 'سعادة', 'قوة', 'مستقبل', 'صبر',
  'سلامة', 'طريق', 'حلم', 'حكمة', 'جمال', 'كلمة', 'فرح', 'صدق', 'همة', 'وفاء',
  'ثقة', 'نصر', 'نجم', 'أرض', 'ماء', 'شجاعة', 'كرامة', 'طيبة', 'ريادة', 'تطور'
];

export const URDU_WORDS = [
  'سلام', 'شکریہ', 'دوست', 'زندگی', 'کتاب', 'محنت', 'کامیابی', 'روشنی', 'سورج', 'چاند',
  'وطن', 'محبت', 'علم', 'خواب', 'سفر', 'خوبصورت', 'وقت', 'دنیا', 'انسان', 'سکون',
  'امید', 'دل', 'پھول', 'شہر', 'لوگ', 'آسمان', 'زمین', 'پانی', 'قلم', 'آج',
  'کل', 'خوشی', 'آزادی', 'پیار', 'مسکراہٹ', 'ستارہ', 'بہار', 'منزل', 'ہمت', 'سچائی',
  'شرافت', 'خوشبو', 'احساس', 'قدرت', 'ترقی', 'ہمسفر', 'یاد', 'جذبہ', 'روشنی', 'شوق'
];

export const SPANISH_WORDS = [
  'tiempo', 'vida', 'mundo', 'casa', 'trabajo', 'amigo', 'libro', 'fuerza', 'nuevo', 'camino',
  'saber', 'cielo', 'sol', 'agua', 'noche', 'pueblo', 'palabra', 'amor', 'verdad', 'siempre',
  'viaje', 'luz', 'tierra', 'familia', 'sueno', 'futuro', 'mente', 'alma', 'corazon', 'estrella',
  'esperanza', 'libertad', 'alegria', 'fuego', 'paz', 'exito', 'destino', 'pasion', 'historia', 'memoria',
  'mar', 'viento', 'silencio', 'claridad', 'valor', 'bosque', 'sonrisa', 'energia', 'campeon', 'sabiduria'
];

export const FRENCH_WORDS = [
  'temps', 'monde', 'vie', 'travail', 'ami', 'livre', 'maison', 'nouveau', 'force', 'savoir',
  'ciel', 'soleil', 'eau', 'nuit', 'ville', 'mot', 'amour', 'verite', 'toujours', 'esprit',
  'voyage', 'lumiere', 'terre', 'famille', 'reve', 'futur', 'coeur', 'etoile', 'espoir', 'liberte',
  'joie', 'paix', 'succes', 'destin', 'passion', 'histoire', 'memoire', 'mer', 'vent', 'silence',
  'courage', 'bonheur', 'harmonie', 'energie', 'horizon', 'plume', 'nature', 'sourire', 'pensée', 'creativite'
];

export const GERMAN_WORDS = [
  'zeit', 'leben', 'welt', 'arbeit', 'freund', 'buch', 'haus', 'kraft', 'wissen', 'himmel',
  'sonne', 'wasser', 'nacht', 'stadt', 'wort', 'liebe', 'wahrheit', 'immer', 'reise', 'freiheit',
  'licht', 'erde', 'familie', 'traum', 'zukunft', 'herz', 'stern', 'hoffnung', 'freude', 'frieden',
  'erfolg', 'schicksal', 'leidenschaft', 'geschichte', 'mut', 'gluck', 'klarheit', 'energie', 'harmonie', 'gedanke',
  'natur', 'weisheit', 'stille', 'vertrauen', 'blick', 'wege', 'sommer', 'blume', 'klang', 'bruecke'
];

export const ITALIAN_WORDS = [
  'tempo', 'vita', 'mondo', 'lavoro', 'amico', 'libro', 'casa', 'forza', 'sapere', 'cielo',
  'sole', 'acqua', 'notte', 'citta', 'parola', 'amore', 'verita', 'sempre', 'viaggio', 'bellezza',
  'luce', 'terra', 'famiglia', 'sogno', 'futuro', 'cuore', 'stella', 'speranza', 'liberta', 'gioia',
  'pace', 'successo', 'destino', 'passione', 'storia', 'memoria', 'mare', 'vento', 'silenzio', 'coraggio',
  'felicita', 'armonia', 'energia', 'canzone', 'orizzonte', 'pensiero', 'natura', 'sorriso', 'fede', 'creazione'
];

export const TURKISH_WORDS = [
  'zaman', 'hayat', 'dunya', 'calisma', 'dost', 'kitap', 'ev', 'guc', 'bilgi', 'gokyuzu',
  'gunes', 'su', 'gece', 'sehir', 'kelime', 'sevgi', 'dogru', 'daima', 'yolculuk', 'ozgurluk',
  'isik', 'toprak', 'aile', 'ruya', 'gelecek', 'kalp', 'yildiz', 'umut', 'baris', 'basari',
  'kader', 'tutku', 'tarih', 'deniz', 'ruzgar', 'sessizlik', 'cesaret', 'mutluluk', 'denge', 'guven',
  'dogus', 'bahar', 'cicek', 'sevincli', 'yagmur', 'aydinlik', 'sabir', 'vuslat', 'dusunce', 'yurek'
];

export const RUSSIAN_WORDS = [
  'время', 'жизнь', 'мир', 'работа', 'друг', 'книга', 'дом', 'сила', 'знание', 'небо',
  'солнце', 'вода', 'ночь', 'город', 'слово', 'любовь', 'правда', 'всегда', 'путь', 'свобода',
  'свет', 'земля', 'семья', 'мечта', 'будущее', 'сердце', 'звезда', 'надежда', 'радость', 'успех',
  'судьба', 'страсть', 'история', 'память', 'море', 'ветер', 'тишина', 'мужество', 'счастье', 'покой',
  'мысль', 'улыбка', 'природа', 'песня', 'горизонт', 'огонь', 'весна', 'цветок', 'верность', 'добро'
];

export const HINDI_WORDS = [
  'समय', 'जीवन', 'दुनिया', 'काम', 'मित्र', 'पुस्तक', 'घर', 'शक्ति', 'ज्ञान', 'आकाश',
  'सूर्य', 'जल', 'रात', 'शहर', 'शब्द', 'प्रेम', 'सत्य', 'सदैव', 'यात्रा', 'शांति',
  'प्रकाश', 'धरती', 'परिवार', 'सपना', 'भविष्य', 'हृदय', 'तारा', 'आशा', 'आनंद', 'सफलता',
  'भाग्य', 'उमंग', 'इतिहास', 'स्मृति', 'सागर', 'हवा', 'मौन', 'साहस', 'सुख', 'विश्वास',
  'विचार', 'मुस्कान', 'प्रकृति', 'गीत', 'दिशा', 'अग्नि', 'वसंत', 'फूल', 'निष्ठा', 'कल्याण'
];

export const ENGLISH_200 = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'I', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his', 'from', 'they', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need', 'large', 'under', 'water', 'around', 'every', 'place', 'such', 'world', 'here', 'take', 'why', 'help', 'put', 'different', 'away', 'again', 'off', 'went', 'old', 'number', 'great', 'tell', 'men', 'say', 'small', 'every', 'found', 'still', 'between', 'name', 'should', 'home', 'big', 'give', 'air', 'line', 'set', 'own', 'under', 'read', 'last', 'never', 'us', 'left', 'end', 'along', 'while', 'might', 'next', 'sound', 'below', 'saw', 'something', 'thought', 'both', 'few', 'those', 'always', 'show', 'large', 'often', 'together', 'asked', 'house', 'world', 'going', 'want', 'school', 'important', 'until', 'form', 'food', 'keep', 'children', 'feet', 'land', 'side', 'without', 'boy', 'once', 'animal', 'life', 'enough', 'took', 'four', 'head', 'above', 'kind', 'began', 'almost', 'live', 'page', 'got', 'earth', 'need', 'far', 'hand', 'high', 'year', 'mother', 'light', 'country', 'father', 'let', 'night', 'picture', 'being', 'study', 'second', 'soon', 'story', 'since', 'white', 'ever', 'paper', 'hard', 'near', 'sentence', 'better', 'best', 'across', 'during', 'today', 'however', 'sure', 'knew', 'it'
];

export const ENGLISH_1000_EXTRA = [
  'ability', 'able', 'abroad', 'absence', 'absolute', 'abstract', 'academic', 'accept', 'access', 'accident',
  'accompany', 'accomplish', 'according', 'account', 'accurate', 'achieve', 'acquire', 'action', 'active', 'activity',
  'actual', 'adapt', 'addition', 'address', 'adequate', 'adjust', 'advance', 'advantage', 'adventure', 'advice',
  'afford', 'afraid', 'agency', 'agenda', 'agree', 'agreement', 'ahead', 'airline', 'airport', 'alarm',
  'alcohol', 'alive', 'alliance', 'allocate', 'allow', 'almost', 'already', 'alter', 'alternative', 'altogether',
  'amazing', 'ambition', 'amend', 'amount', 'analysis', 'analyze', 'anchor', 'ancient', 'anger', 'angle',
  'announce', 'annual', 'another', 'anticipate', 'anxiety', 'anybody', 'anyway', 'anywhere', 'apartment', 'apparent',
  'appeal', 'appear', 'appearance', 'application', 'apply', 'appoint', 'appreciate', 'approach', 'appropriate', 'approval',
  'approve', 'approximate', 'arbitrary', 'architect', 'argument', 'arise', 'arrange', 'arrangement', 'arrest', 'arrival',
  'arrive', 'article', 'artificial', 'artist', 'aspect', 'assembly', 'assert', 'assess', 'asset', 'assign',
  'assist', 'assistance', 'associate', 'association', 'assume', 'assumption', 'assure', 'athlete', 'atmosphere', 'attach',
  'attack', 'attempt', 'attend', 'attention', 'attitude', 'attract', 'attractive', 'attribute', 'audience', 'authentic',
  'author', 'authority', 'automate', 'available', 'average', 'avoid', 'await', 'balance', 'barrier', 'baseline',
  'battery', 'battle', 'beauty', 'becoming', 'behavior', 'belief', 'belong', 'benefit', 'billion', 'biology',
  'blanket', 'blueprint', 'breathe', 'brief', 'bright', 'brilliant', 'broad', 'broadcast', 'browser', 'budget',
  'builder', 'bulletin', 'business', 'cabinet', 'calculate', 'calendar', 'campaign', 'candidate', 'capacity', 'capital',
  'captain', 'capture', 'careful', 'carrier', 'category', 'cautious', 'celebrate', 'cellular', 'central', 'century'
];

export const ENGLISH_5000_EXTRA = [
  'aberration', 'benevolent', 'capitulate', 'deleterious', 'ephemeral', 'fortuitous', 'garrulous', 'heterogeneous',
  'idiosyncratic', 'juxtaposition', 'kaleidoscope', 'lugubrious', 'magnanimous', 'nefarious', 'obfuscate',
  'paradigmatic', 'quintessential', 'recalcitrant', 'serendipity', 'trepidation', 'ubiquitous', 'vicarious',
  'whimsical', 'xenophobia', 'yielded', 'zealous', 'ambiguity', 'anachronism', 'belligerent', 'cacophony',
  'circumspect', 'conundrum', 'discombobulate', 'effervescent', 'fastidious', 'grandiloquent', 'hyperbole',
  'impetuous', 'luminous', 'misanthrope', 'nostalgia', 'panacea', 'perspicacity', 'proclivity', 'resilience',
  'scrupulous', 'tenacious', 'veracity', 'vulnerability', 'solitude', 'melancholy', 'paradox', 'labyrinth',
  'clandestine', 'luminescence', 'sonorous', 'petrichor', 'soliloquy', 'mellifluous', 'inscrutable', 'ineffable'
];

export const QUOTES: QuoteItem[] = [
  {
    id: 'q1',
    length: 'short',
    author: 'Steve Jobs',
    source: 'Stanford Address',
    text: 'Stay hungry, stay foolish. Never let the noise of others opinions drown out your own inner voice.'
  },
  {
    id: 'q2',
    length: 'short',
    author: 'Albert Einstein',
    text: 'Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.'
  },
  {
    id: 'q3',
    length: 'medium',
    author: 'Alan Turing',
    source: 'Computing Machinery and Intelligence',
    text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done. A computer would deserve to be called intelligent if it could deceive a human into believing that it was human.'
  },
  {
    id: 'q4',
    length: 'medium',
    author: 'Marcus Aurelius',
    source: 'Meditations',
    text: 'You have power over your mind - not outside events. Realize this, and you will find strength. The happiness of your life depends upon the quality of your thoughts.'
  },
  {
    id: 'q5',
    length: 'long',
    author: 'Carl Sagan',
    source: 'Pale Blue Dot',
    text: 'Look again at that dot. That is here. That is home. That is us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines, every hunter and forager, every hero and coward, every creator and destroyer of civilization.'
  },
  {
    id: 'q6',
    length: 'long',
    author: 'Richard Feynman',
    source: 'The Pleasure of Finding Things Out',
    text: 'I can live with doubt, and uncertainty, and not knowing. I think it is much more interesting to live not knowing than to have answers that might be wrong. I have approximate answers and possible beliefs and different degrees of certainty about different things, but I am not absolutely sure of anything.'
  }
];

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'js-1',
    language: 'javascript',
    title: 'Array Reduce & Pipeline',
    code: 'const calculateTotal = (items, taxRate = 0.08) => {\n  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);\n  return Number((subtotal * (1 + taxRate)).toFixed(2));\n};'
  },
  {
    id: 'js-2',
    language: 'javascript',
    title: 'Debounce Function',
    code: 'function debounce(fn, delayMs = 300) {\n  let timerId = null;\n  return (...args) => {\n    if (timerId) clearTimeout(timerId);\n    timerId = setTimeout(() => fn(...args), delayMs);\n  };\n}'
  },
  {
    id: 'python-1',
    language: 'python',
    title: 'Fibonacci Generator',
    code: 'def fibonacci(limit: int):\n    a, b = 0, 1\n    while a < limit:\n        yield a\n        a, b = b, a + b\n\nnumbers = [x for x in fibonacci(100) if x % 2 == 0]'
  },
  {
    id: 'python-2',
    language: 'python',
    title: 'Binary Search Implementation',
    code: 'def binary_search(arr: list[int], target: int) -> int:\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1'
  },
  {
    id: 'html-1',
    language: 'html',
    title: 'Modern Flexbox Card',
    code: '<div class="card flex flex-col p-6 rounded-xl shadow-lg border border-neutral-700 bg-neutral-900">\n  <h2 class="text-xl font-bold tracking-tight text-white">Typing Test by Maher</h2>\n  <p class="text-neutral-400 mt-2 text-sm leading-relaxed">High precision real-time typing analytics.</p>\n  <button class="mt-4 px-4 py-2 bg-cyan-500 font-semibold rounded-lg text-black">Start Now</button>\n</div>'
  },
  {
    id: 'rust-1',
    language: 'rust',
    title: 'Rust Struct & Result Pattern',
    code: 'pub struct Typist {\n    pub username: String,\n    pub personal_best: u32,\n    pub accuracy: f32,\n}\n\nimpl Typist {\n    pub fn record_test(&mut self, wpm: u32, acc: f32) -> Result<(), &str> {\n        if acc < 0.0 || acc > 100.0 { return Err("Invalid accuracy"); }\n        if wpm > self.personal_best { self.personal_best = wpm; }\n        Ok(())\n    }\n}'
  }
];

export const SPECIAL_DRILLS: Record<string, { title: string; words: string[] }> = {
  'tongue-twisters': {
    title: 'Tongue Twisters & Motor Dexterity',
    words: [
      'she', 'sells', 'seashells', 'by', 'the', 'seashore', 'the', 'shells', 'she', 'sells', 'are', 'seashells', 'I', 'am', 'sure',
      'peter', 'piper', 'picked', 'a', 'peck', 'of', 'pickled', 'peppers', 'where', 'is', 'the', 'peck', 'of', 'pickled', 'peppers',
      'how', 'much', 'wood', 'would', 'a', 'woodchuck', 'chuck', 'if', 'a', 'woodchuck', 'could', 'chuck', 'wood'
    ]
  },
  'digraphs': {
    title: 'Common Digraphs (th, ch, sh, ph, wh, qu)',
    words: [
      'think', 'which', 'shape', 'phase', 'wheel', 'quick', 'those', 'check', 'shift', 'phone', 'white', 'quote',
      'third', 'chain', 'shore', 'photo', 'whole', 'quiet', 'their', 'chief', 'sharp', 'physics', 'wheat', 'queen'
    ]
  },
  'tech-buzzwords': {
    title: 'Technology & Engineering Terms',
    words: [
      'algorithm', 'latency', 'bandwidth', 'concurrency', 'asynchronous', 'kubernetes', 'typescript', 'neural',
      'microservice', 'distributed', 'pipeline', 'deployment', 'interface', 'polymorphism', 'throughput', 'encryption',
      'telemetry', 'vector', 'database', 'middleware', 'optimization', 'refactoring', 'scalable', 'architecture'
    ]
  },
  'medical-terms': {
    title: 'Medical & Scientific Terminology',
    words: [
      'cardiovascular', 'neurological', 'homeostasis', 'metabolism', 'respiration', 'pathogen', 'chromosome',
      'mitochondria', 'antibodies', 'circulatory', 'neurotransmitter', 'endothelial', 'gastrointestinal', 'pharmacology'
    ]
  }
};

/**
 * Helper to determine if a language is Right-to-Left (Pashto, Dari, Arabic, Urdu)
 */
export function isRtlLanguage(language: SupportedLanguage): boolean {
  return language === 'pashto' || language === 'dari' || language === 'arabic' || language === 'urdu';
}

/**
 * Get word bank pool for a specific language
 */
export function getWordsForLanguage(language: SupportedLanguage, vocabulary: 'english-200' | 'english-1k' | 'english-5k' = 'english-200'): string[] {
  switch (language) {
    case 'pashto':
      return PASHTO_WORDS;
    case 'dari':
      return DARI_WORDS;
    case 'arabic':
      return ARABIC_WORDS;
    case 'urdu':
      return URDU_WORDS;
    case 'spanish':
      return SPANISH_WORDS;
    case 'french':
      return FRENCH_WORDS;
    case 'german':
      return GERMAN_WORDS;
    case 'italian':
      return ITALIAN_WORDS;
    case 'turkish':
      return TURKISH_WORDS;
    case 'russian':
      return RUSSIAN_WORDS;
    case 'hindi':
      return HINDI_WORDS;
    case 'english':
    default:
      if (vocabulary === 'english-1k') {
        return [...ENGLISH_200, ...ENGLISH_1000_EXTRA];
      } else if (vocabulary === 'english-5k') {
        return [...ENGLISH_200, ...ENGLISH_1000_EXTRA, ...ENGLISH_5000_EXTRA];
      }
      return [...ENGLISH_200];
  }
}

/**
 * Generate randomized word sequence based on language, vocabulary and count
 */
export function generateWordSequence(
  count: number,
  vocabulary: 'english-200' | 'english-1k' | 'english-5k' = 'english-200',
  includePunctuation = false,
  includeNumbers = false,
  language: SupportedLanguage = 'english'
): string[] {
  const pool = getWordsForLanguage(language, vocabulary);
  const result: string[] = [];
  const punctuationMarks = isRtlLanguage(language)
    ? ['،', '؟', '!', '.', '؛']
    : ['.', ',', '!', '?', ';', ':', '-', '"'];

  for (let i = 0; i < count; i++) {
    // Occasionally insert a number if enabled
    if (includeNumbers && Math.random() < 0.12 && i > 0 && i < count - 1) {
      const num = Math.floor(Math.random() * 999) + 1;
      result.push(num.toString());
      continue;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    let word = pool[randomIndex];

    // Capitalize occasionally or after punctuation (for Latin/Cyrillic scripts)
    const prevWord = result[result.length - 1];
    const prevHadTerminator = prevWord && (prevWord.endsWith('.') || prevWord.endsWith('!') || prevWord.endsWith('?'));

    if (includePunctuation) {
      if (!isRtlLanguage(language) && language !== 'hindi') {
        if (i === 0 || prevHadTerminator || Math.random() < 0.15) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
      }

      if (Math.random() < 0.25 && i < count - 1) {
        const p = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
        if (p === '"') {
          word = `"${word}"`;
        } else {
          word = `${word}${p}`;
        }
      }
    }

    result.push(word);
  }

  return result;
}

/**
 * Generate adaptive drill targeting specific weak keys identified during previous tests
 */
export function generateWeakKeyDrill(weakKeys: string[], count = 30): string[] {
  if (!weakKeys || weakKeys.length === 0) {
    return generateWordSequence(count, 'english-200', false, false);
  }

  const lowerWeakKeys = weakKeys.map((k) => k.toLowerCase());
  const allWords = [...ENGLISH_200, ...ENGLISH_1000_EXTRA];

  // Filter words that contain at least one of the weak keys
  const matchingWords = allWords.filter((word) =>
    lowerWeakKeys.some((char) => word.toLowerCase().includes(char))
  );

  const pool = matchingWords.length >= 10 ? matchingWords : allWords;
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    const word = pool[Math.floor(Math.random() * pool.length)];
    result.push(word);
  }

  return result;
}
