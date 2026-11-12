import L from "./lines.json";

export const LINES = L;
export const EMERGENCY = "9999";
const S = (n) => `/scenes/${n}.webp`;
const INK = { navy: "#1b3a6b", red: "#9e1b32", green: "#0e6b45" };

export const CHARS = {
  hero: { name: "سفيرة السلامة", img: { idle: "/chars/hero-idle.webp", think: "/chars/hero-think.webp", cheer: "/chars/hero-cheer.webp", sad: "/chars/hero-sad.webp", run: "/chars/hero-run.webp" } },
  mentor: { name: "الأستاذة سلمى", role: "مشرفة الأمن والسلامة", img: { idle: "/chars/mentor.webp" } },
};

export const INTRO = [
  { img: S("morning"), fx: "rain", amb: "rain", line: "intro-1", kicker: "سلطنة عُمان · صباحٌ استثنائي" },
  { img: S("elnino"), fx: "storm", amb: "wind", line: "intro-2", kicker: "تحذير الأرصاد · ظاهرة النينو" },
  { img: S("keyart"), fx: "rain", amb: "rain", line: "intro-3", kicker: "تعرّفي على فريقكِ", speaker: "mentor" },
  { img: S("ceremony"), fx: "sparkle", amb: "calm", line: "mission", kicker: "المهمة" },
];

export const COLLECTIBLES = {
  1: { name: "قفازات عازلة", icon: "Hand", x: 84, y: 30 },
  2: { name: "صفّارة الطوارئ", icon: "Megaphone", x: 66, y: 48 },
  3: { name: "عاكسة ضوئية", icon: "TriangleAlert", x: 88, y: 18 },
  4: { name: "قارورة ماء", icon: "GlassWater", x: 12, y: 62 },
  5: { name: "كمّامة واقية", icon: "Shield", x: 80, y: 22 },
  6: { name: "بطانية الحريق", icon: "Flame", x: 18, y: 30 },
  7: { name: "حذاء مانع للانزلاق", icon: "Footprints", x: 70, y: 70 },
  8: { name: "مصباح يدوي", icon: "Flashlight", x: 86, y: 40 },
};

const choice = (prompt, options) => ({ kind: "choice", prompt, options });

export const LEVELS = [
  {
    id: 1, ordinal: "الأولى", title: "طوارئ المختبر المدرسي", sub: "التسرّب والتماس الكهربائي", place: "مختبر العلوم",
    scene: { img: S("lab-scene"), fx: "drip", amb: "rain", line: "s1-scene" },
    action: { img: S("lab-action"), fx: "dust", line: "s1-action" },
    mentor: "s1-mentor", objective: "اكتشفي مصادر الخطر، ثم اختاري التصرّف الآمن.", tip: "s1-tip",
    steps: [
      { kind: "hotspot", prompt: "s1-hot", img: S("lab-scene"), spots: [
        { x: 43, y: 8, r: 9, label: "تسرّب الماء من السقف", why: "الماء المتسرّب قد يصل إلى الأجهزة والكهرباء." },
        { x: 41, y: 51, r: 9, label: "وصلة كهرباء تطلق شرارة", why: "الشرارة تعني تماساً كهربائياً قد يسبب صعقة أو حريقاً." },
        { x: 60, y: 85, r: 9, label: "سلك مكشوف في بركة ماء", why: "سلك مكهرب داخل الماء يجعل الأرض كلها خطرة." },
      ] },
      { ...choice("n1-prompt", [
        { text: "أمسح الماء بمنديل بسرعة قبل أن يراه أحد", why: "الماء موصل للكهرباء؛ لمسه قرب وصلة مكهربة قد يسبب صعقة خطيرة." },
        { text: "أبتعد عن مصدر الخطر وأبلغ المعلمة فوراً دون لمس أي جهاز", ok: true, why: "الابتعاد والإبلاغ يحميكِ، والمعلمة تفصل الكهرباء من المصدر الرئيسي بأمان." },
        { text: "أفصل قابس الجهاز بيدي المبلولة", why: "اليد المبلولة تنقل التيار إلى جسمكِ مباشرة. لا تلمسي أي قابس أو سلك مبلول." },
      ]) },
    ],
    stamp: { title: "ختم مختبر العلوم", issuer: "فريق الأمن والسلامة", line: "s1-stamp", ink: INK.navy, tilt: -6 },
  },
  {
    id: 2, ordinal: "الثانية", title: "مواجهة الرياح القوية", sub: "غرف الصفوف والنوافذ الزجاجية", place: "الفصل الدراسي",
    scene: { img: S("wind-scene"), fx: "wind", amb: "wind", line: "s2-scene" },
    action: { img: S("wind-action"), fx: "dust", line: "s2-action" },
    mentor: "s2-mentor", objective: "اكتشفي الأخطار في الفصل، ثم اختاري مكان الاحتماء الآمن.", tip: "s2-tip",
    steps: [
      { kind: "hotspot", prompt: "s2-hot", img: S("hazard-class"), spots: [
        { x: 14, y: 21, r: 9, label: "صندوق ثقيل فوق الخزانة", why: "قد يسقط بفعل الاهتزاز ويصيب من تحته." },
        { x: 30, y: 40, r: 11, label: "زجاج نوافذ متشقّق ونافذة مفتوحة", why: "الزجاج المتشقق قد يتطاير مع الرياح." },
        { x: 50, y: 84, r: 9, label: "أسلاك متشابكة على الأرض", why: "تسبب التعثّر أثناء الإخلاء." },
        { x: 88, y: 81, r: 9, label: "حقيبة تسدّ باب الخروج", why: "يجب أن يبقى طريق الخروج خالياً دائماً." },
      ] },
      choice("s2-prompt", [
        { text: "قرب النافذة لمراقبة العاصفة من الزجاج", why: "الزجاج قد يتحطم بفعل الرياح أو الأجسام المتطايرة. النافذة أخطر مكان الآن." },
        { text: "تحت الطاولة في الجزء الداخلي الآمن من الفصل", ok: true, why: "الطاولة المتينة تحميكِ من الأجسام المتطايرة، والجزء الداخلي بعيد عن الزجاج." },
        { text: "في الممر الخارجي المكشوف للرياح", why: "الأماكن المكشوفة تعرّضكِ للأجسام المتطايرة. ابقي في الداخل بعيداً عن الزجاج." },
      ]),
    ],
    stamp: { title: "ختم الحماية الفصلية", issuer: "إدارة مدرسة رقية للبنات", line: "s2-stamp", ink: INK.navy, tilt: 5 },
  },
  {
    id: 3, ordinal: "الثالثة", title: "تحدّي أودية عُمان", sub: "طريق العودة للمنزل ورقم الطوارئ", place: "طريق الوادي",
    scene: { img: S("wadi-scene"), fx: "storm", amb: "flood", line: "s3-scene" },
    action: { img: S("wadi-action"), fx: "rain", line: "s3-action" },
    mentor: "s3-mentor", objective: "اتخذي القرار الصحيح أمام الوادي، ثم بلّغي الطوارئ.", tip: "s3-tip",
    steps: [
      choice("s3-prompt", [
        { text: "نعبر بسرعة قبل أن يرتفع منسوب المياه", why: "مياه الأودية أقوى مما تبدو، وقد تجرف الحافلة في ثوانٍ. لا عبور مهما بدا المنسوب منخفضاً." },
        { text: "نتوقّف ولا نعبر، ونبلّغ رقم الطوارئ وننتظر المختصين", ok: true, why: "التوقف بعيداً عن المجرى والإبلاغ ينقذ الأرواح؛ فالمياه قد تحمل صخوراً وتيارات قوية." },
        { text: "ننزل من الحافلة ونعبر الوادي مشياً", why: "التيار يجرف الأشخاص بسهولة حتى لو كان الماء ضحلاً. البقاء في مكان آمن هو الصواب." },
      ]),
      { kind: "dial", prompt: "say-dial" },
    ],
    stamp: { title: "ختم السلامة المرورية", issuer: "شرطة عُمان السلطانية", line: "s3-stamp", ink: INK.red, tilt: -4, official: true },
  },
  {
    id: 4, ordinal: "الرابعة", title: "صدمة الطقس الحار", sub: "الإجهاد الحراري والإسعافات الأولية", place: "ساحة الطابور",
    scene: { img: S("heat-scene"), fx: "heat", amb: "heat", line: "s4-scene" },
    action: { img: S("heat-action"), fx: "dust", line: "s4-action" },
    mentor: "s4-mentor", objective: "أسعفي زميلتكِ، وصِلي كل علامة بالإسعاف المناسب.", tip: "s4-tip",
    steps: [
      choice("s4-prompt", [
        { text: "أطلب منها إكمال الطابور حتى نهايته", why: "استمرار الوقوف تحت الشمس يزيد الإجهاد الحراري وقد ينتهي بالإغماء." },
        { text: "أنقلها إلى الظل، وأرطّبها بالماء، وأبلّغ المشرفة الصحية", ok: true, why: "الظل يخفّض حرارة الجسم، والماء يعوّض السوائل، والمشرفة تتابع حالتها." },
        { text: "أرشّ الماء المثلّج على وجهها دفعة واحدة", why: "الماء المثلّج المفاجئ ليس إسعافاً صحيحاً. المطلوب ظلّ وتهوية وترطيب تدريجي وإبلاغ المشرفة." },
      ]),
      { kind: "match", prompt: "s4-match", pairs: [
        { a: "دوار وشحوب في الوجه", b: "انقليها إلى مكان مظلل وأجلسيها" },
        { a: "عطش شديد وجفاف الفم", b: "قدّمي لها رشفات ماء تدريجية" },
        { a: "تعرّق غزير وسخونة الجسم", b: "خفّفي الملابس الضيقة وهوّي لها" },
        { a: "فقدان الوعي أو تشنّج", b: "اتصلي بالإسعاف 9999 وأبلغي المشرفة فوراً" },
      ] },
    ],
    stamp: { title: "ختم الرعاية الصحية", issuer: "القسم الصحي — مدرسة رقية", line: "s4-stamp", ink: INK.green, tilt: 7 },
  },
  {
    id: 5, ordinal: "الخامسة", title: "طوارئ الحريق وخريطة الإخلاء", sub: "نحو الملعب الرياضي — نقطة التجميع", place: "ممرات المدرسة",
    scene: { img: S("fire-scene"), fx: "smoke", amb: "alarm", line: "s5-scene" },
    action: { img: S("assembly"), fx: "dust", line: "s5-action" },
    mentor: "s5-mentor", objective: "اخرجي بأمان، واقرئي مخطط الإخلاء حتى نقطة التجميع.", tip: "s5-tip",
    steps: [
      choice("s5-prompt", [
        { text: "أجري واقفة بأقصى سرعة نحو المخرج", why: "الدخان الساخن يتجمع في الأعلى؛ الجري واقفةً يجعلكِ تستنشقينه، والتدافع يسبب السقوط." },
        { text: "أنخفض تحت طبقة الدخان وأتبع الأسهم الخضراء إلى الملعب", ok: true, why: "الهواء الأنظف قريب من الأرض، والأسهم الخضراء تقودكِ إلى مخرج آمن." },
        { text: "أعود إلى الفصل لإحضار حقيبتي", why: "لا عودة لأي غرض أثناء الإخلاء. سلامتكِ أهم من كل الحقائب." },
      ]),
      { kind: "map", prompt: "say-map", shot: S("evac-action") },
    ],
    stamp: { title: "ختم الإخلاء والطوارئ", issuer: "الدفاع المدني والإسعاف", line: "s5-stamp", ink: INK.red, tilt: -7, official: true },
  },
  {
    id: 6, ordinal: "السادسة", title: "تحدّي «صائد النيران»", sub: "مصدر الحريق وطفاية الحريق", place: "زاوية المختبر",
    scene: { img: S("bin-scene"), fx: "embers", amb: "fire", line: "s6-scene" },
    action: { img: S("bin-action"), fx: "mist", line: "s6-action" },
    mentor: "s6-mentor", objective: "حدّدي سبب الحريق، واختاري الطفاية، واستخدميها بالترتيب.", tip: "s6-tip",
    steps: [
      choice("s6-prompt", [
        { text: "مواد ورقية مشتعلة بجانب مصدر كهربائي", ok: true, why: "صحيح، الورق قابل للاشتعال ووجود الكهرباء بجانبه يحدّد نوع الطفاية المناسبة." },
        { text: "زيوت طبخ مشتعلة", why: "لا توجد زيوت هنا. المشتعل ورق في سلة المهملات، وبجواره مقبس كهربائي." },
        { text: "غاز متسرّب من أدوات المختبر", why: "لا يوجد تسرّب غاز. انظري جيداً: ورق مشتعل ملاصق لمصدر كهرباء." },
      ]),
      { kind: "ext", prompt: "say-ext" },
      { kind: "order", prompt: "say-order" },
    ],
    stamp: { title: "ختم مكافحة الحرائق", issuer: "فريق الأمن والسلامة", line: "s6-stamp", ink: INK.red, tilt: 4 },
  },
  {
    id: 7, ordinal: "السابعة", title: "الأرضيات الزلقة", sub: "تجمّع المياه في الممرات", place: "الممرات الأرضية",
    scene: { img: S("floor-scene"), fx: "rain", amb: "rain", line: "s7-scene" },
    action: { img: S("floor-action"), fx: "rain", line: "s7-action" },
    mentor: "s7-mentor", objective: "اعبري الممر بأمان، ثم اجتازي تحدّي الوقت.", tip: "s7-tip",
    steps: [
      choice("s7-prompt", [
        { text: "أركض لأعبر بسرعة قبل أن يزداد الماء", why: "الركض على أرضية مبلولة أسرع طريق للانزلاق والإصابة." },
        { text: "أمشي بهدوء وبخطوات ثابتة، وأنتبه للوحات التحذير، وأنبّه زميلاتي", ok: true, why: "الخطوات الثابتة تحفظ توازنكِ، وتنبيه زميلاتكِ يحمي الجميع." },
        { text: "أتزحلق على الماء مع زميلاتي للتسلية", why: "التزحلق قد ينتهي بكسر أو ارتطام. الأرضية المبلولة ليست ملعباً." },
      ]),
      { kind: "timed", prompt: "s7-timed", seconds: 30, cards: [
        { text: "أمسك الدرابزين عند نزول الدرج المبلول", safe: true, why: "الدرابزين يمنحكِ توازناً إضافياً." },
        { text: "أنظر إلى هاتفي وأنا أمشي في الممر المبلول", safe: false, why: "الانشغال بالهاتف يمنعكِ من رؤية الماء والتحذيرات." },
        { text: "أبلغ عامل النظافة عن بركة الماء", safe: true, why: "الإبلاغ يسرّع تجفيف المكان قبل أن يصاب أحد." },
        { text: "أدفع زميلتي مازحةً على الأرضية الزلقة", safe: false, why: "المزاح بالدفع قد يسبب سقوطاً وإصابة خطيرة." },
        { text: "أتجنّب المكان المحاط بلوحة التحذير الصفراء", safe: true, why: "اللوحة الصفراء تعني خطر الانزلاق؛ اختاري طريقاً آخر." },
        { text: "أحمل كومة كتب تحجب رؤيتي على الأرض المبلولة", safe: false, why: "يجب أن تري موضع قدميكِ، فقسّمي الحمل." },
      ] },
    ],
    stamp: { title: "ختم الوقاية الأرضية", issuer: "إدارة مدرسة رقية للبنات", line: "s7-stamp", ink: INK.navy, tilt: 6 },
  },
  {
    id: 8, ordinal: "الثامنة", title: "حقيبة الطوارئ والإسعافات", sub: "الجاهزية للظروف المناخية المتقلبة", place: "غرفة الإسعاف",
    scene: { img: S("kit-scene"), fx: "dust", amb: "calm", line: "s8-scene" },
    action: { img: S("kit-action"), fx: "sparkle", line: "s8-action" },
    mentor: "s8-mentor", objective: "اسحبي الأغراض الخمسة الضرورية إلى حقيبة الطوارئ.", tip: "s8-tip",
    steps: [{ kind: "kit", prompt: "say-kit" }],
    stamp: { title: "ختم الجاهزية والاستعداد", issuer: "إدارة مدرسة رقية للبنات", line: "s8-stamp", ink: INK.navy, tilt: -5 },
  },
];

export const ACHIEVEMENTS = [
  { id: "first", title: "الخطوة الأولى", desc: "أكملي المرحلة الأولى", icon: "Footprints" },
  { id: "eagle", title: "عين الصقر", desc: "اكتشفي كل الأخطار دون أي لمسة خاطئة", icon: "Eye" },
  { id: "wadi", title: "حارسة الوادي", desc: "أتقني مرحلة الوادي دون أخطاء", icon: "Waves" },
  { id: "fire", title: "صائدة النيران", desc: "أتقني مرحلة الطفاية دون أخطاء", icon: "Flame" },
  { id: "clock", title: "سيدة الوقت", desc: "اجتازي تحدّي الوقت من المحاولة الأولى", icon: "Timer" },
  { id: "learner", title: "المتعلّمة المثابرة", desc: "تعلّمي من خطأ وأكملي المرحلة", icon: "BookOpen" },
  { id: "collector", title: "جامعة الأدوات", desc: "اجمعي أدوات السلامة المخفية الثماني", icon: "Gem" },
  { id: "perfect", title: "الأداء المثالي", desc: "اجمعي ٣ نجوم في ثلاث مراحل", icon: "Sparkles" },
  { id: "gold", title: "النجمة الذهبية", desc: "اجمعي ٢٤ نجمة كاملة", icon: "Star" },
  { id: "ambassador", title: "شارة سفيرة السلامة", desc: "أكملي المراحل الثماني", icon: "ShieldCheck" },
];

export const starsFor = (mistakes) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1);
