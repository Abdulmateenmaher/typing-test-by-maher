export interface LessonDef {
  id: number;
  stage: number;
  stageTitle: string;
  title: string;
  description: string;
  focusKeys: string[];
  targetWpm: number;
  targetAccuracy: number;
  content: string;
  instruction: string;
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  stars: number; // 1 to 5
  bestWpm: number;
  bestAccuracy: number;
  completedAt?: string;
}

export const LESSONS_STAGES = [
  { stage: 1, title: 'Home Row Foundation', color: 'from-cyan-500 to-blue-600', icon: '⌨️' },
  { stage: 2, title: 'Top Row & Vowels', color: 'from-emerald-500 to-teal-600', icon: '🚀' },
  { stage: 3, title: 'Bottom Row Descent', color: 'from-purple-500 to-indigo-600', icon: '🎯' },
  { stage: 4, title: 'Capitalization & Shift', color: 'from-amber-500 to-orange-600', icon: '⚡' },
  { stage: 5, title: 'Numbers & Symbols', color: 'from-rose-500 to-pink-600', icon: '🔢' },
  { stage: 6, title: 'Speed & Rhythm Cadence', color: 'from-yellow-400 to-amber-500', icon: '⏱️' },
  { stage: 7, title: 'Code & Syntax Mastery', color: 'from-blue-500 to-cyan-500', icon: '💻' },
  { stage: 8, title: 'Professional & Business', color: 'from-indigo-500 to-purple-500', icon: '💼' },
  { stage: 9, title: 'Literature & Philosophy', color: 'from-teal-500 to-emerald-500', icon: '📜' },
  { stage: 10, title: 'Grand Master Apex 120+', color: 'from-amber-400 to-rose-500', icon: '👑' },
];

export const LESSONS_DATA: LessonDef[] = [
  // STAGE 1: Home Row Foundation (1-10)
  {
    id: 1,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Anchor Keys: F and J',
    description: 'Feel the tactile bumps on F and J with your left and right index fingers.',
    focusKeys: ['f', 'j', ' '],
    targetWpm: 15,
    targetAccuracy: 95,
    content: 'f j f j ff jj fff jjj fj fj jf jf ff jj fjf jfj f j f j ff jj fj jf',
    instruction: 'Rest your left index finger on F and right index finger on J. Feel the bumps!'
  },
  {
    id: 2,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Middle Fingers: D and K',
    description: 'Extend your control with left middle finger on D and right middle on K.',
    focusKeys: ['d', 'k', ' '],
    targetWpm: 18,
    targetAccuracy: 95,
    content: 'd k d k dd kk ddd kkk dk kd dk kd df jk fd kj d k dd kk dk kd d k f j',
    instruction: 'Keep index fingers anchored on F and J while striking D and K.'
  },
  {
    id: 3,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Ring Fingers: S and L',
    description: 'Train ring fingers on S and L for fluid lateral reach.',
    focusKeys: ['s', 'l', ' '],
    targetWpm: 20,
    targetAccuracy: 95,
    content: 's l s l ss ll sss lll sl ls sl ls sd lk ds kl s l d k f j sl dk fj ls',
    instruction: 'Avoid lifting your palms off the desk; curl your ring fingers naturally.'
  },
  {
    id: 4,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Pinky Keys: A and Semicolon',
    description: 'Master left pinky on A and right pinky on Semicolon (;).',
    focusKeys: ['a', ';', ' '],
    targetWpm: 20,
    targetAccuracy: 95,
    content: 'a ; a ; aa ;; aaa ;;; a; ;a as ;l sa l; asdf ;lkj asdf ;lkj a ; s l d k',
    instruction: 'Pinkies require gentle touch; keep your wrists straight and relaxed.'
  },
  {
    id: 5,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Spacebar & Thumb Rhythm',
    description: 'Develop consistent spacebar timing using your dominant thumb.',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', ' '],
    targetWpm: 22,
    targetAccuracy: 96,
    content: 'f j d k s l a ; asdf jkl; asdf jkl; fad jak lad fas sal dad fad jak',
    instruction: 'Tap the spacebar gently with either thumb right after each key combination.'
  },
  {
    id: 6,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Left Hand Home Row Cluster',
    description: 'Seamlessly flow across A, S, D, and F with your left hand.',
    focusKeys: ['a', 's', 'd', 'f'],
    targetWpm: 24,
    targetAccuracy: 96,
    content: 'asdf fdsa asdf fdsa as df fa sd da fs asdf dad sad fad dad sad fad',
    instruction: 'Think in chunks: a-s-d-f. Keep your fingers hovering over their home keys.'
  },
  {
    id: 7,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Right Hand Home Row Cluster',
    description: 'Flow across J, K, L, and ; with your right hand.',
    focusKeys: ['j', 'k', 'l', ';'],
    targetWpm: 24,
    targetAccuracy: 96,
    content: 'jkl; ;lkj jkl; ;lkj jk l; ;l kj jkl; all fall flask lad salad alas',
    instruction: 'Maintain consistent rhythm between right hand letters.'
  },
  {
    id: 8,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Home Row Real Words',
    description: 'Type actual words built entirely from home row letters.',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    targetWpm: 25,
    targetAccuracy: 97,
    content: 'sad lad dad fall ask all salad flask salsa glad fall ask dad lad',
    instruction: 'Say the full word in your mind as your fingers execute the motor pattern.'
  },
  {
    id: 9,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Home Row Sentences',
    description: 'Form short sentences with home row vocabulary.',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    targetWpm: 28,
    targetAccuracy: 97,
    content: 'a sad lad ask all lads a glad dad ask a salad fall all ask dad',
    instruction: 'Focus on smooth cadence without pausing between words.'
  },
  {
    id: 10,
    stage: 1,
    stageTitle: 'Home Row Foundation',
    title: 'Stage 1 Milestone Exam',
    description: 'Demonstrate home row mastery to unlock the Top Row stage!',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    targetWpm: 30,
    targetAccuracy: 98,
    content: 'all lads ask a glad dad a flask of salad falls all lads fall glad',
    instruction: 'Exam condition: Maintain 30+ WPM with at least 98% accuracy to earn 5 stars!'
  },

  // STAGE 2: Top Row & Vowels (11-20)
  {
    id: 11,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Upward Reach: E and I',
    description: 'Reach up from D to E with left middle, and from K to I with right middle.',
    focusKeys: ['e', 'i', 'd', 'k'],
    targetWpm: 22,
    targetAccuracy: 95,
    content: 'd e d e k i k i de ki ed ik die kid did led lie side life like slide',
    instruction: 'Reach upward smoothly and return your fingers immediately to D and K.'
  },
  {
    id: 12,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Index Upward Reach: R and U',
    description: 'Reach from F to R with left index, and from J to U with right index.',
    focusKeys: ['r', 'u', 'f', 'j'],
    targetWpm: 24,
    targetAccuracy: 95,
    content: 'f r f r j u j u fr ju rf uj red run fur jar ride rule sure true rust',
    instruction: 'Do not twist your wrists; extend the index finger cleanly upwards.'
  },
  {
    id: 13,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Center Top Reach: T and Y',
    description: 'Stretch diagonally up to T with left index and Y with right index.',
    focusKeys: ['t', 'y', 'f', 'j'],
    targetWpm: 25,
    targetAccuracy: 95,
    content: 'f t f t j y j y ft jy tf yj yet try tea yes they stay year city lady',
    instruction: 'Return index fingers to F and J right after pressing T and Y.'
  },
  {
    id: 14,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Ring Upward Reach: W and O',
    description: 'Reach from S to W with left ring, and from L to O with right ring.',
    focusKeys: ['w', 'o', 's', 'l'],
    targetWpm: 26,
    targetAccuracy: 96,
    content: 's w s w l o l o sw lo ws ol owl low how flow slow word world work',
    instruction: 'Ring fingers need deliberate practice; maintain steady rhythm.'
  },
  {
    id: 15,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Pinky Upward Reach: Q and P',
    description: 'Reach from A to Q with left pinky, and from ; to P with right pinky.',
    focusKeys: ['q', 'p', 'a', ';'],
    targetWpm: 26,
    targetAccuracy: 96,
    content: 'a q a q ; p ; p aq ;p qa p; quit play pale drop quiet power peak',
    instruction: 'Use minimal wrist rotation when reaching for Q and P.'
  },
  {
    id: 16,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Vowel Fluency Drills',
    description: 'Master all five English vowels: A, E, I, O, and U.',
    focusKeys: ['a', 'e', 'i', 'o', 'u'],
    targetWpm: 28,
    targetAccuracy: 96,
    content: 'auto idea equal house audio ocean guide queue voice quiet youth',
    instruction: 'Notice how every English word relies on these core vowel keys.'
  },
  {
    id: 17,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Top Row Word Matrix',
    description: 'Type rich vocabulary integrating Home and Top row letters.',
    focusKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    targetWpm: 30,
    targetAccuracy: 97,
    content: 'water write tree power quiet yield upper route tower party story',
    instruction: 'Keep hand tension low. Breathe calmly and let your fingers flow.'
  },
  {
    id: 18,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Speed Transitions',
    description: 'Fast vertical leaps between Home row anchors and Top row letters.',
    focusKeys: ['all'],
    targetWpm: 32,
    targetAccuracy: 97,
    content: 'great skill speed quick flow light sweet proud trust faith dream',
    instruction: 'Transition between rows with fluid, effortless micro-movements.'
  },
  {
    id: 19,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Fluid Sentences',
    description: 'Type complete natural sentences utilizing top and home rows.',
    focusKeys: ['all'],
    targetWpm: 34,
    targetAccuracy: 97,
    content: 'the quiet writer yields sweet poetry for our weary souls to see',
    instruction: 'Read 2-3 words ahead to anticipate finger movements before striking.'
  },
  {
    id: 20,
    stage: 2,
    stageTitle: 'Top Row & Vowels',
    title: 'Stage 2 Milestone Exam',
    description: 'Prove your command of top row keys and vowels to unlock Bottom Row!',
    focusKeys: ['all'],
    targetWpm: 36,
    targetAccuracy: 98,
    content: 'true power yields from daily quiet effort with joy and deep pride',
    instruction: 'Target: 36+ WPM with 98% accuracy for a 5-Star Gold Badge.'
  },

  // STAGE 3: Bottom Row Descent (21-30)
  {
    id: 21,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Downward Sweep: V and M',
    description: 'Curl left index down to V, and right index down to M.',
    focusKeys: ['v', 'm', 'f', 'j'],
    targetWpm: 25,
    targetAccuracy: 95,
    content: 'f v f v j m j m fv jm vf mj view move move view love save move vivid',
    instruction: 'Curl the index finger directly downward without moving your whole hand.'
  },
  {
    id: 22,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Middle Downward: C and Comma',
    description: 'Curl left middle to C, and right middle to Comma (,).',
    focusKeys: ['c', ',', 'd', 'k'],
    targetWpm: 26,
    targetAccuracy: 95,
    content: 'd c d c k , k , dc k, cd ,k call, calm, cool, come, cloud, clock, pace,',
    instruction: 'After comma, tap spacebar smoothly with your thumb.'
  },
  {
    id: 23,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Ring Downward: X and Period',
    description: 'Curl left ring to X, and right ring to Period (.).',
    focusKeys: ['x', '.', 's', 'l'],
    targetWpm: 27,
    targetAccuracy: 95,
    content: 's x s x l . l . sx l. xs .l six. box. fox. mix. next. apex. flex. exit.',
    instruction: 'Keep ring finger curved as it reaches down to X and Period.'
  },
  {
    id: 24,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Pinky Downward: Z and Slash',
    description: 'Curl left pinky to Z, and right pinky to Slash (/).',
    focusKeys: ['z', '/', 'a', ';'],
    targetWpm: 27,
    targetAccuracy: 95,
    content: 'a z a z ; / ; / az ;/ za /; zero zone maze zinc gaze buzz fizz/buzz',
    instruction: 'Pinkies handle outer perimeter; maintain a centered home row posture.'
  },
  {
    id: 25,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Center Bottom: B and N',
    description: 'Reach diagonally down to B with left index, and N with right index.',
    focusKeys: ['b', 'n', 'f', 'j'],
    targetWpm: 28,
    targetAccuracy: 96,
    content: 'f b f b j n j n fb jn bf nj barn bone bind band burn brave brown blend',
    instruction: 'B and N are center reaches; avoid over-stretching your index fingers.'
  },
  {
    id: 26,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Full Alphabet Pangram',
    description: 'Practice sentences that contain every single letter of the English alphabet.',
    focusKeys: ['all'],
    targetWpm: 32,
    targetAccuracy: 96,
    content: 'the quick brown fox jumps over the lazy dog and packs my box with five dozen jugs',
    instruction: 'Classic pangram: every letter A through Z is tested in this drill.'
  },
  {
    id: 27,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Complex Multi-Row Flow',
    description: 'Navigate words that cross all three tiers of the keyboard.',
    focusKeys: ['all'],
    targetWpm: 34,
    targetAccuracy: 97,
    content: 'vivid rhythm complex balance matrix maximum civilization benchmark',
    instruction: 'Notice the smooth vertical choreography between top, home, and bottom rows.'
  },
  {
    id: 28,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Continuous Text Paragraph',
    description: 'Type an extended natural narrative combining all 26 alphabet letters.',
    focusKeys: ['all'],
    targetWpm: 36,
    targetAccuracy: 97,
    content: 'every journey begins with a single bold step toward greatness and truth.',
    instruction: 'Maintain consistent tempo; treat errors as learning signals.'
  },
  {
    id: 29,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Speed Cadence Challenge',
    description: 'Push your raw speed across the entire alphabet.',
    focusKeys: ['all'],
    targetWpm: 38,
    targetAccuracy: 97,
    content: 'focus your mind and let fingers dance across keys with pure grace and fire.',
    instruction: 'Speed comes from relaxation, not from forceful hammering.'
  },
  {
    id: 30,
    stage: 3,
    stageTitle: 'Bottom Row Descent',
    title: 'Stage 3 Milestone Exam',
    description: 'Complete the full alphabet certification to unlock Capitalization!',
    focusKeys: ['all'],
    targetWpm: 40,
    targetAccuracy: 98,
    content: 'brave explorers navigate complex waves and find victory through knowledge.',
    instruction: 'Target: 40+ WPM with 98% accuracy to earn the Silver Feather award.'
  },

  // STAGE 4: Capitalization & Shift Mastery (31-40)
  {
    id: 31,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Left Shift Key (Right Hand Letters)',
    description: 'Hold Left Shift with left pinky while striking keys with your right hand.',
    focusKeys: ['Shift', 'J', 'K', 'L', 'U', 'I', 'O', 'P'],
    targetWpm: 30,
    targetAccuracy: 96,
    content: 'John Kate Leo Paul Mike Oliver Nina Lisa John Kate Leo Paul Mike',
    instruction: 'Rule: When capitalizing a right-hand letter, always press the LEFT Shift key.'
  },
  {
    id: 32,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Right Shift Key (Left Hand Letters)',
    description: 'Hold Right Shift with right pinky while striking keys with your left hand.',
    focusKeys: ['Shift', 'F', 'D', 'S', 'A', 'R', 'E', 'W', 'Q'],
    targetWpm: 30,
    targetAccuracy: 96,
    content: 'Frank David Sarah Alice Robert Emma William Grace Frank David Sarah',
    instruction: 'Rule: When capitalizing a left-hand letter, always press the RIGHT Shift key.'
  },
  {
    id: 33,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Global Cities & Geography',
    description: 'Type proper nouns alternating left and right shift keys.',
    focusKeys: ['all'],
    targetWpm: 33,
    targetAccuracy: 96,
    content: 'Kabul London Paris Tokyo Rome Berlin Madrid Cairo Toronto Sydney',
    instruction: 'Fluid shift coordination is the hallmark of professional typists.'
  },
  {
    id: 34,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Sentence Starters & Periods',
    description: 'Practice the standard sentence format: Capital letter + words + Period.',
    focusKeys: ['all'],
    targetWpm: 35,
    targetAccuracy: 97,
    content: 'Action cures fear. Knowledge is power. Practice creates excellence.',
    instruction: 'Capitalize, type smoothly, strike period, and spacebar for next sentence.'
  },
  {
    id: 35,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Dialogue & Quotation Marks',
    description: 'Master double quotes (") with Shift + Apostrophe.',
    focusKeys: ['"', "'"],
    targetWpm: 34,
    targetAccuracy: 96,
    content: '"Code is poetry," said Ada. "Simplicity is the soul of efficiency."',
    instruction: 'Hold shift while pressing apostrophe to generate double quotation marks.'
  },
  {
    id: 36,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Acronyms & All-Caps Bursts',
    description: 'Rapid capitalization sequences for technical acronyms.',
    focusKeys: ['Shift'],
    targetWpm: 36,
    targetAccuracy: 96,
    content: 'HTML CSS JS API CPU GPU RAM SSD NASA AI ML WPM W3C ISO IEEE',
    instruction: 'Release shift promptly between acronyms to resume lowercase flow.'
  },
  {
    id: 37,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Literary Prose',
    description: 'Type inspiring classical literary reflections.',
    focusKeys: ['all'],
    targetWpm: 38,
    targetAccuracy: 97,
    content: 'To be great, we must first dare to begin where we currently stand.',
    instruction: 'Maintain a calm mental rhythm regardless of sentence complexity.'
  },
  {
    id: 38,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Compound Sentences',
    description: 'Multi-clause sentences with commas and proper nouns.',
    focusKeys: ['all'],
    targetWpm: 40,
    targetAccuracy: 97,
    content: 'Although the storm raged across the valley, Maher persevered with hope.',
    instruction: 'Breathe evenly as you navigate punctuation pauses.'
  },
  {
    id: 39,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Speed Capitalization Run',
    description: 'High-cadence shifts across diverse sentence structures.',
    focusKeys: ['all'],
    targetWpm: 42,
    targetAccuracy: 98,
    content: 'Never underestimate the cumulative power of focused, daily deliberate practice.',
    instruction: 'Speed will surge as shifting becomes automatic muscle memory.'
  },
  {
    id: 40,
    stage: 4,
    stageTitle: 'Capitalization & Shift',
    title: 'Stage 4 Milestone Exam',
    description: 'Demonstrate shifting and proper punctuation mastery!',
    focusKeys: ['all'],
    targetWpm: 45,
    targetAccuracy: 98,
    content: 'Great minds discuss ideas; average minds discuss events; small minds discuss people.',
    instruction: 'Target: 45+ WPM with 98% accuracy to earn the Gold Shift Star!'
  },

  // STAGE 5: Numbers & Symbols (41-50)
  {
    id: 41,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Left Hand Numbers: 1, 2, 3, 4, 5',
    description: 'Reach to the top number row with your left hand.',
    focusKeys: ['1', '2', '3', '4', '5'],
    targetWpm: 28,
    targetAccuracy: 95,
    content: '1 2 3 4 5 12 34 45 135 24 51 32 41 123 451 234 512 345 12345',
    instruction: 'Reach upward from QWER without moving your wrist forward.'
  },
  {
    id: 42,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Right Hand Numbers: 6, 7, 8, 9, 0',
    description: 'Reach to the top number row with your right hand.',
    focusKeys: ['6', '7', '8', '9', '0'],
    targetWpm: 28,
    targetAccuracy: 95,
    content: '6 7 8 9 0 67 89 90 780 69 87 96 678 906 789 012 67890 2026',
    instruction: 'Keep thumb on spacebar and guide index, middle, ring, pinky upward.'
  },
  {
    id: 43,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Dates, Years & Statistics',
    description: 'Mix words and numbers in real-world contexts.',
    focusKeys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    targetWpm: 32,
    targetAccuracy: 96,
    content: 'In 2026, over 750 students typed 100 words per minute across 12 countries.',
    instruction: 'Keep hands balanced; return fingers immediately to home row.'
  },
  {
    id: 44,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Exclamation, At & Hash: !, @, #',
    description: 'Master Shift + 1, Shift + 2, and Shift + 3.',
    focusKeys: ['!', '@', '#'],
    targetWpm: 28,
    targetAccuracy: 95,
    content: 'user@domain.com #awesome Level! Alert! #1 Ranking! #Code2026!',
    instruction: 'Hold Right Shift with pinky and strike numbers 1, 2, 3 with left hand.'
  },
  {
    id: 45,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Currency & Math: $, %, &, *',
    description: 'Type financial figures and mathematical operators.',
    focusKeys: ['$', '%', '&', '*'],
    targetWpm: 30,
    targetAccuracy: 95,
    content: '$99.50 + 15% tax & 5% tip * 2 guests = $238.05 total amount saved',
    instruction: 'Financial figures demand absolute accuracy; prioritize precision.'
  },
  {
    id: 46,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Parentheses & Brackets: (), []',
    description: 'Code-friendly symbols used in mathematics and software development.',
    focusKeys: ['(', ')', '[', ']'],
    targetWpm: 32,
    targetAccuracy: 96,
    content: 'const items = [1, 2, 3]; function calculate(x, y) { return (x + y); }',
    instruction: 'Shift + 9 for (, Shift + 0 for ). Unshifted keys for [ and ].'
  },
  {
    id: 47,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Secure Passwords & Complex Mix',
    description: 'Type dense mixtures of upper, lower, numbers, and special symbols.',
    focusKeys: ['all'],
    targetWpm: 32,
    targetAccuracy: 96,
    content: 'Maher#2026! Cyber_Key$99 Delta@Alpha*42 Quantum^77 [Secure#1]',
    instruction: 'Zero-hesitation code typing comes from repeated deliberate practice.'
  },
  {
    id: 48,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Technical Specs & Measurement',
    description: 'Real technical parameters with units, degrees, and ratios.',
    focusKeys: ['all'],
    targetWpm: 34,
    targetAccuracy: 96,
    content: 'CPU clock 4.8 GHz at 65W, 32GB DDR5 RAM, 100% test coverage @ 120 FPS.',
    instruction: 'Keep rhythm steady across punctuation marks.'
  },
  {
    id: 49,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'High-Density Symbol Sprint',
    description: 'Sprint across symbols without slowing your pace.',
    focusKeys: ['all'],
    targetWpm: 36,
    targetAccuracy: 97,
    content: 'Formula: (a + b)^2 = a^2 + 2*a*b + b^2; check balance: $1,450.75 (98.5%).',
    instruction: 'Treat symbols as natural keys, not speed obstacles.'
  },
  {
    id: 50,
    stage: 5,
    stageTitle: 'Numbers & Symbols',
    title: 'Stage 5 Milestone Exam',
    description: 'Complete the Technical Numerics Exam to unlock Grand Master stage!',
    focusKeys: ['all'],
    targetWpm: 40,
    targetAccuracy: 98,
    content: 'In 2026, 95% of top engineers wrote 50+ lines of clean, secure code daily.',
    instruction: 'Target: 40+ WPM with 98% accuracy to earn the Diamond Cipher Badge!'
  },

  // STAGE 6: Speed & Grand Master (51-60)
  {
    id: 51,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'High-Frequency N-Grams',
    description: 'Train the most common word endings in English: -tion, -ment, -ing, -ness.',
    focusKeys: ['all'],
    targetWpm: 45,
    targetAccuracy: 97,
    content: 'action celebration movement development thinking walking brightness kindness',
    instruction: 'Type suffixes as single unified motor strokes rather than individual letters.'
  },
  {
    id: 52,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'Root Prefixes',
    description: 'Master fast execution of common prefixes: pre-, dis-, con-, un-, re-.',
    focusKeys: ['all'],
    targetWpm: 48,
    targetAccuracy: 97,
    content: 'predict preview discover disconnect connect construct unlock unable return revive',
    instruction: 'Prefix chunking dramatically elevates your words-per-minute ceiling.'
  },
  {
    id: 53,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'Technology & Computing Flow',
    description: 'Type fluid prose about artificial intelligence, cloud, and engineering.',
    focusKeys: ['all'],
    targetWpm: 50,
    targetAccuracy: 97,
    content: 'Distributed architectures deliver unprecedented resilience, low latency, and infinite scale.',
    instruction: 'Maintain uninterrupted forward momentum through complex multisyllabic terms.'
  },
  {
    id: 54,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'Speed Cadence: 55+ WPM Sprint',
    description: 'Accelerate beyond ordinary typing into high-cadence touch typing.',
    focusKeys: ['all'],
    targetWpm: 55,
    targetAccuracy: 98,
    content: 'Discipline is the bridge between goals and accomplishment in every human endeavor.',
    instruction: 'Let your subconscious mind drive the keys; do not look down at the board.'
  },
  {
    id: 55,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'Endurance Marathon Drill',
    description: 'Sustain velocity over a full multi-sentence paragraph.',
    focusKeys: ['all'],
    targetWpm: 58,
    targetAccuracy: 98,
    content: 'The master has failed more times than the beginner has even tried. Embrace every obstacle as a direct invitation to refine your inner craft.',
    instruction: 'Focus on breathing and ergonomic hand posture to prevent muscle fatigue.'
  },
  {
    id: 56,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'Speed Cadence: 65+ WPM Sprint',
    description: 'Push into top-tier typist speed territory.',
    focusKeys: ['all'],
    targetWpm: 65,
    targetAccuracy: 98,
    content: 'Speed is merely a natural byproduct of flawless technique, consistent rhythm, and unwavering concentration.',
    instruction: 'Relax your shoulders and let your fingers skim smoothly across the keys.'
  },
  {
    id: 57,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'Hyper Speed: 75+ WPM Blitz',
    description: 'High-octane sprint for elite touch typists.',
    focusKeys: ['all'],
    targetWpm: 75,
    targetAccuracy: 98,
    content: 'When preparation meets relentless opportunity, extraordinary breakthroughs inevitably happen every single day.',
    instruction: 'Anticipate entire phrases before your hands even touch the first letter.'
  },
  {
    id: 58,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'Elite Cadence: 85+ WPM Challenge',
    description: 'Test your reaction time and finger coordination under high speed.',
    focusKeys: ['all'],
    targetWpm: 85,
    targetAccuracy: 98,
    content: 'True mastery transcends conscious thought; your fingers become a direct extension of your creative mind.',
    instruction: 'Eliminate hesitation. Maintain a continuous flow from first key to last.'
  },
  {
    id: 59,
    stage: 6,
    stageTitle: 'Speed & Grand Master',
    title: 'Grand Master Final Rehearsal',
    description: 'The ultimate rehearsal combining numbers, quotes, shifting, and vocabulary.',
    focusKeys: ['all'],
    targetWpm: 90,
    targetAccuracy: 98,
    content: 'In 2026, Maher declared: "Excellence is not an accident; it is the habit of champions who refuse to yield!"',
    instruction: 'Execute every character with surgical precision and electrifying velocity.'
  },
  {
    id: 60,
    stage: 6,
    stageTitle: 'Speed & Rhythm Cadence',
    title: 'Typing Academy Graduation Exam',
    description: 'The definitive touch-typing master certification. Graduate with highest honors!',
    focusKeys: ['all'],
    targetWpm: 75,
    targetAccuracy: 98,
    content: 'We are what we repeatedly do. Excellence, then, is not an act, but a lifelong habit of dedicated masters who shape the digital universe.',
    instruction: 'Graduation criteria: Maintain steady rhythm and zero hesitation across every sentence.'
  },

  // STAGE 7: Code & Syntax Mastery (61-70)
  {
    id: 61,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'Curly Brackets & Scopes: { and }',
    description: 'Master code block delimiters used in JavaScript, C++, Python, and Rust.',
    focusKeys: ['{', '}', ' '],
    targetWpm: 28,
    targetAccuracy: 95,
    content: '{ item } { data } { return true; } { key: value } { a: 1, b: 2 } { x, y } { done }',
    instruction: 'Reach right pinky with Shift to strike { and } effortlessly.'
  },
  {
    id: 62,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'Square Brackets & Arrays: [ and ]',
    description: 'Handle array index access and list structures without looking down.',
    focusKeys: ['[', ']', ' '],
    targetWpm: 30,
    targetAccuracy: 95,
    content: '[0] [1] [i] [index] [item] [first, second] [10, 20, 30] arr[0] = 5; list[x]',
    instruction: 'Use right pinky finger for bracket keys just below the backspace row.'
  },
  {
    id: 63,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'Arrow Functions & Strict Equality: => and ===',
    description: 'Modern developer syntax for callback expressions and strict type checking.',
    focusKeys: ['=', '>', '!', ' '],
    targetWpm: 32,
    targetAccuracy: 96,
    content: 'const add = (a, b) => a + b; if (status === 200) { valid = true; } else if (count !== 0)',
    instruction: 'Combine equal and angle bracket with right pinky and left ring finger.'
  },
  {
    id: 64,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'Boolean Logic & Nullish: && and ||',
    description: 'Essential boolean logic operators and coalesce operators in modern software.',
    focusKeys: ['&', '|', '?', ' '],
    targetWpm: 32,
    targetAccuracy: 96,
    content: 'if (isValid && isReady) { run(); } const val = user?.name || "Guest"; flag && render();',
    instruction: 'Shift-7 with right index for & and Shift-backslash for pipe |.'
  },
  {
    id: 65,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'Core Declarations: const, let & return',
    description: 'The foundation of modern modular scripts and pure functional components.',
    focusKeys: ['const', 'let', 'return'],
    targetWpm: 36,
    targetAccuracy: 96,
    content: 'const score = 100; let active = true; function calculate() { return score * 2; }',
    instruction: 'Flow naturally between common programming keywords and variable assignments.'
  },
  {
    id: 66,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'HTML & JSX Tags: <div /> and <span>',
    description: 'Type markup tags, element boundaries, and JSX structure with rapid fluidity.',
    focusKeys: ['<', '>', '/', ' '],
    targetWpm: 35,
    targetAccuracy: 96,
    content: '<div className="hero"><h1 className="title">Maher</h1><p>Fast</p></div>',
    instruction: 'Coordinate right index and pinky fingers for angle brackets < and >.'
  },
  {
    id: 67,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'CSS Properties & Colons: display: flex;',
    description: 'Style rules, hex colors, and semicolon endings typed with precision.',
    focusKeys: [':', ';', '#', ' '],
    targetWpm: 35,
    targetAccuracy: 96,
    content: 'display: flex; justify-content: center; color: #06b6d4; padding: 12px 24px;',
    instruction: 'Semicolons are on the home row; colons use Shift + semicolon.'
  },
  {
    id: 68,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'Asynchronous Programming: async & await',
    description: 'Modern asynchronous workflows, promises, and error handling try/catch blocks.',
    focusKeys: ['async', 'await', 'try', 'catch'],
    targetWpm: 38,
    targetAccuracy: 97,
    content: 'async function fetchData() { try { const res = await api.get(); } catch (err) { log(err); } }',
    instruction: 'Keep rhythmic cadence as you switch between parentheses, braces, and dots.'
  },
  {
    id: 69,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'JSON Structures & Key-Value Pairs',
    description: 'Structured configuration, REST API payloads, and serialized JSON documents.',
    focusKeys: ['"', '{', '}', ':', ','],
    targetWpm: 35,
    targetAccuracy: 97,
    content: '{ "id": 101, "name": "Speedway Pro", "verified": true, "tags": ["turbo", "fast"] }',
    instruction: 'Double quotes and colons require disciplined pinky finger coordination.'
  },
  {
    id: 70,
    stage: 7,
    stageTitle: 'Code & Syntax Mastery',
    title: 'Developer Full-Stack Sprint Challenge',
    description: 'Synthesize all programmer symbols in a full-fledged functional module.',
    focusKeys: ['all-code'],
    targetWpm: 45,
    targetAccuracy: 97,
    content: 'export const useEngine = (rpm: number) => { const [nitro, setNitro] = useState(false); return { nitro }; };',
    instruction: 'Developer milestone: Clean syntax typing without pausing to locate symbols.'
  },

  // STAGE 8: Professional & Business Communication (71-80)
  {
    id: 71,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Executive Email Openers & Salutations',
    description: 'Polished introductions for professional correspondence and leadership communications.',
    focusKeys: ['business-intro'],
    targetWpm: 40,
    targetAccuracy: 97,
    content: 'Dear Colleagues, I hope this update finds you well. Regarding our upcoming strategic milestone launch:',
    instruction: 'Type formal prose with consistent capitalization and sentence punctuation.'
  },
  {
    id: 72,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Financial Figures, Percentages & Currencies',
    description: 'Draft quarterly revenue forecasts, currency signs, and statistical percentages.',
    focusKeys: ['$', '%', ',', '.'],
    targetWpm: 38,
    targetAccuracy: 97,
    content: 'Total revenue grew by 24.5% to $1,450,000 in Q3, outperforming our baseline forecast of $1,200,000.',
    instruction: 'Coordinate number row Shift keys ($ and %) with standard numeric punctuation.'
  },
  {
    id: 73,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Meeting Scheduling & Calendar Logistics',
    description: 'Coordinate time zones, boardroom sessions, and formal invites without typos.',
    focusKeys: ['calendar'],
    targetWpm: 42,
    targetAccuracy: 97,
    content: 'Please join us on Thursday, October 15th at 09:30 AM EST in Conference Room 4B for the quarterly review.',
    instruction: 'Accurately type dates, times, ordinal suffixes (th, st), and capitalized months.'
  },
  {
    id: 74,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Executive Briefings & Action Items',
    description: 'Clear, concise executive summaries outlining deliverables and assignees.',
    focusKeys: ['action-items'],
    targetWpm: 44,
    targetAccuracy: 97,
    content: 'Action Item 1: Finalize UI architecture by Friday. Action Item 2: Deploy database indexes to production.',
    instruction: 'Maintain forward momentum through numbers, colons, and structured sentences.'
  },
  {
    id: 75,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Customer Relations & Client Inquiries',
    description: 'Empathetic, clear, and professional customer engagement messaging.',
    focusKeys: ['client-support'],
    targetWpm: 45,
    targetAccuracy: 97,
    content: 'Thank you for reaching out to our customer success team. We have resolved your inquiry with highest priority.',
    instruction: 'Express courtesy smoothly without breaking your natural typing speed.'
  },
  {
    id: 76,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'KPI Analytics & Performance Reviews',
    description: 'Describe key performance indicators, conversion metrics, and user retention benchmarks.',
    focusKeys: ['analytics'],
    targetWpm: 46,
    targetAccuracy: 97,
    content: 'Our conversion rate improved from 3.2% to 4.8%, while average customer lifetime value reached $890.',
    instruction: 'Smoothly transition between decimal points and percentages.'
  },
  {
    id: 77,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Project Roadmaps & Agile Milestones',
    description: 'Agile sprints, backlog grooming terminology, and release schedule dates.',
    focusKeys: ['agile'],
    targetWpm: 48,
    targetAccuracy: 97,
    content: 'Sprint 14 focuses on mobile responsiveness, accessibility standards, and cloud persistence optimization.',
    instruction: 'Anticipate multi-syllable tech-business vocabulary.'
  },
  {
    id: 78,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Formal Agreements & Confidentiality Terms',
    description: 'Standard contractual phrases, nondisclosure agreements, and statutory compliance.',
    focusKeys: ['legal'],
    targetWpm: 48,
    targetAccuracy: 98,
    content: 'All proprietary software, intellectual property, and trade secrets shall remain strictly confidential.',
    instruction: 'Legal terms require careful spelling; avoid skipping ahead prematurely.'
  },
  {
    id: 79,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Venture Pitch & Innovation Statement',
    description: 'Persuasive executive presentation statements delivering high-impact clarity.',
    focusKeys: ['venture'],
    targetWpm: 50,
    targetAccuracy: 98,
    content: 'By uniting state-of-the-art engineering with intuitive design, we empower millions of users globally.',
    instruction: 'Confidence in every keystroke translates to high velocity.'
  },
  {
    id: 80,
    stage: 8,
    stageTitle: 'Professional & Business',
    title: 'Corporate Master Communicator Benchmark',
    description: 'Comprehensive business correspondence benchmark test at 55+ WPM.',
    focusKeys: ['business-master'],
    targetWpm: 55,
    targetAccuracy: 98,
    content: 'We are pleased to report that the comprehensive product rollout concluded ahead of schedule and under budget, exceeding our stakeholder objectives.',
    instruction: 'Benchmark: Complete this executive statement with 98%+ precision.'
  },

  // STAGE 9: Literature & Philosophical Wisdom (81-90)
  {
    id: 81,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Meditations of Marcus Aurelius',
    description: 'Stoic discipline, mental fortitude, and morning clarity.',
    focusKeys: ['stoic'],
    targetWpm: 50,
    targetAccuracy: 98,
    content: 'When you arise in the morning, think of what a precious privilege it is to be alive: to breathe, to think, to enjoy, to love.',
    instruction: 'Breathe evenly and let each word flow in calm, steady rhythm.'
  },
  {
    id: 82,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Ada Lovelace on Analytical Computing',
    description: 'Words from the worlds very first computer programmer and visionary mathematician.',
    focusKeys: ['lovelace'],
    targetWpm: 52,
    targetAccuracy: 98,
    content: 'The Analytical Engine weaves algebraical patterns just as the Jacquard loom weaves flowers and leaves.',
    instruction: 'Admire the historical elegance of mathematical computation.'
  },
  {
    id: 83,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Alan Turing on Machine Cognition',
    description: 'Foundational insights from the father of modern computer science and artificial intelligence.',
    focusKeys: ['turing'],
    targetWpm: 54,
    targetAccuracy: 98,
    content: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
    instruction: 'Keep eyes focused two words ahead of your active fingers.'
  },
  {
    id: 84,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'The Crazy Ones - Creative Nonconformity',
    description: 'Celebrating thinkers, innovators, and inventors who push humanity forward.',
    focusKeys: ['jobs'],
    targetWpm: 55,
    targetAccuracy: 98,
    content: 'The people who are crazy enough to think they can change the world are the ones who do.',
    instruction: 'Deliver punchy, memorable cadence without hesitation.'
  },
  {
    id: 85,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Still I Rise - Resilience & Courage',
    description: 'Inspiring poetic verse on human determination and unbreakable spirit.',
    focusKeys: ['angelou'],
    targetWpm: 56,
    targetAccuracy: 98,
    content: 'You may write me down in history with your bitter, twisted lies, but still, like dust, I will rise.',
    instruction: 'Rhythmic punctuation: Comma taps should blend seamlessly into the text.'
  },
  {
    id: 86,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Albert Einstein on Inquisitive Wonder',
    description: 'The essence of intellectual curiosity and genuine scientific passion.',
    focusKeys: ['einstein'],
    targetWpm: 58,
    targetAccuracy: 98,
    content: 'I have no special talents. I am only passionately curious. The important thing is not to stop questioning.',
    instruction: 'Short, clean sentences designed for consistent cadence.'
  },
  {
    id: 87,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Aristotle on Character & Virtue',
    description: 'Classical philosophy on habits, repeated action, and human flourishing.',
    focusKeys: ['aristotle'],
    targetWpm: 60,
    targetAccuracy: 98,
    content: 'Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.',
    instruction: 'Transition between complex words with steady fingertip control.'
  },
  {
    id: 88,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Leonardo da Vinci on Ultimate Simplicity',
    description: 'Renaissance wisdom on elegance, clarity, and mastery of form.',
    focusKeys: ['davinci'],
    targetWpm: 62,
    targetAccuracy: 98,
    content: 'Simplicity is the ultimate sophistication. Learning never exhausts the mind, for wisdom is the daughter of experience.',
    instruction: 'Elegance in posture: keep wrists floating above the desk.'
  },
  {
    id: 89,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Carl Sagan on The Pale Blue Dot',
    description: 'A humbling, cosmic perspective on our shared home in the infinite universe.',
    focusKeys: ['sagan'],
    targetWpm: 64,
    targetAccuracy: 98,
    content: 'Look again at that dot. That is here. That is home. That is us. On it everyone you love, everyone you know, has lived their lives.',
    instruction: 'Cosmic balance: zero typos, seamless cadence.'
  },
  {
    id: 90,
    stage: 9,
    stageTitle: 'Literature & Philosophy',
    title: 'Philosophical Laureate Grand Trial',
    description: 'The literary summit: Test your speed across timeless philosophical prose.',
    focusKeys: ['laureate'],
    targetWpm: 70,
    targetAccuracy: 99,
    content: 'Those who master their own minds inevitably master their destiny, turning discipline into art and patience into enduring triumph.',
    instruction: 'Laureate status requires 70+ WPM with 99% accuracy.'
  },

  // STAGE 10: Grand Master Apex 120+ Championship (91-100)
  {
    id: 91,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Supersonic Ignition: 75+ WPM Sprint',
    description: 'Accelerate your fingertips beyond conversational speech rates.',
    focusKeys: ['apex-1'],
    targetWpm: 75,
    targetAccuracy: 98,
    content: 'Rapid reflexes and unbroken concentration combine to create effortless speed across every key on your board.',
    instruction: 'Sprint threshold unlocked! Do not look down.'
  },
  {
    id: 92,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Kinetic Cadence: 80+ WPM Burst',
    description: 'Eliminate micro-pauses between words through anticipatory muscle memory.',
    focusKeys: ['apex-2'],
    targetWpm: 80,
    targetAccuracy: 98,
    content: 'Smooth typing is fast typing. When rhythm stays steady, velocity naturally climbs to extraordinary levels.',
    instruction: 'Feel the rhythm like playing a grand piano.'
  },
  {
    id: 93,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Punctuation Storm: 85+ WPM Precision',
    description: 'Maintain high velocity even when punctuation marks and capitals are introduced.',
    focusKeys: ['apex-3'],
    targetWpm: 85,
    targetAccuracy: 98,
    content: 'Speed is meaningless without precision: champions build their legend through unwavering, flawless accuracy!',
    instruction: 'Shift keys must be struck instantaneously with the opposite hand.'
  },
  {
    id: 94,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Complex Chains: 90+ WPM Endurance',
    description: 'Multi-syllabic vocabulary combinations typed with explosive cadence.',
    focusKeys: ['apex-4'],
    targetWpm: 90,
    targetAccuracy: 98,
    content: 'Extraordinary dexterity requires relentless dedication, perpetual repetition, and absolute confidence in every keystroke.',
    instruction: 'Think in complete words rather than individual letters.'
  },
  {
    id: 95,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Ultrasonic Velocity: 95+ WPM Sprint',
    description: 'Pushing into the upper 1% of global typists worldwide.',
    focusKeys: ['apex-5'],
    targetWpm: 95,
    targetAccuracy: 98,
    content: 'Your mind envisions the phrase, your fingers respond in microseconds, and the text materializes on screen like lightning.',
    instruction: 'Relax your forearms and shoulders to maintain maximum speed.'
  },
  {
    id: 96,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Century Milestone: 100+ WPM Mastery',
    description: 'The coveted 100 Words Per Minute barrier. Elite performance achieved.',
    focusKeys: ['apex-6'],
    targetWpm: 100,
    targetAccuracy: 99,
    content: 'Reaching one hundred words per minute is a triumph of human neuroplasticity and disciplined muscle memory.',
    instruction: 'Maintain 99% accuracy while crossing the 100 WPM milestone.'
  },
  {
    id: 97,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Hyperspace Cadence: 105+ WPM Challenge',
    description: 'True competitive esports speedway velocity.',
    focusKeys: ['apex-7'],
    targetWpm: 105,
    targetAccuracy: 99,
    content: 'At this velocity, typing ceases to be mechanical effort and transforms into a pure flow state of digital expression.',
    instruction: 'Breathe smoothly, lock your eyes on the screen, and fly.'
  },
  {
    id: 98,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Apex Grand Marathon: 110+ WPM Trial',
    description: 'Sustain explosive speed across an extended technical and literary passage.',
    focusKeys: ['apex-8'],
    targetWpm: 110,
    targetAccuracy: 99,
    content: 'Mastery is not a static destination, but an ongoing quest to surpass your former limits with every challenge you undertake.',
    instruction: 'Total immersion. No hesitations, no misfires.'
  },
  {
    id: 99,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'Supreme Overdrive: 115+ WPM Showdown',
    description: 'The penultimate challenge before universal championship graduation.',
    focusKeys: ['apex-9'],
    targetWpm: 115,
    targetAccuracy: 99,
    content: 'Only the most devoted typists unlock this level of synchrony, where speed, accuracy, and endurance align in perfect harmony.',
    instruction: 'Penultimate trial. Unleash your full potential.'
  },
  {
    id: 100,
    stage: 10,
    stageTitle: 'Grand Master Apex 120+',
    title: 'The Apex Grand Master of Maher Typing Academy',
    description: 'The 100th and definitive final exam. Claim your permanent 5-Star Grand Master Crown!',
    focusKeys: ['apex-100-grand-champion'],
    targetWpm: 120,
    targetAccuracy: 99,
    content: 'Congratulations, Grand Master! You have conquered all one hundred lessons of Maher Typing Academy with supreme speed, surgical accuracy, and relentless championship spirit.',
    instruction: 'The Supreme Apex Milestone: 120+ WPM with 99%+ Accuracy. Graduate as the Ultimate Touch-Typing Legend!'
  }
];

export function isLessonUnlocked(lessonId: number, progressMap: Record<number, LessonProgress>): boolean {
  if (lessonId <= 1) return true;
  // A lesson is unlocked if the previous lesson has been completed
  return Boolean(progressMap[lessonId - 1]?.completed);
}

export function getStoredLessonsProgress(): Record<number, LessonProgress> {
  try {
    const raw = localStorage.getItem('maher_typing_lessons_progress');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function saveStoredLessonProgress(lessonId: number, progress: LessonProgress) {
  try {
    const current = getStoredLessonsProgress();
    current[lessonId] = progress;
    localStorage.setItem('maher_typing_lessons_progress', JSON.stringify(current));
  } catch {
    // fallback
  }
}
