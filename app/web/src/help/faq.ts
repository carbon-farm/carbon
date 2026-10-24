import type { Audience } from '../tour/steps';
import type { HelpText } from './content';

// Questions people actually ask, with short answers in English then Telugu. They feed two
// places: the Help page ("Questions people ask") and the help assistant (HelpChat), which
// matches a typed question against `keywords`. Keep answers short and in step with the app:
// change a screen, change its entry here.
//
// `keywords` are lower-case words or phrases a person might type — English, Telugu, and the
// way Telugu is commonly typed in English letters. Longer phrases score higher than single
// words, so list specific phrases first.

export interface FaqLink {
  to: string;
  label: HelpText;
}

export interface Faq {
  id: string;
  audience: Audience[] | 'ALL';
  // Shown as a suggestion chip for the audiences it applies to.
  popular?: boolean;
  q: HelpText;
  a: HelpText[];
  keywords: string[];
  link?: FaqLink;
}

const GUEST_MEMBER: Audience[] = ['GUEST', 'MEMBER'];
const MEMBER: Audience[] = ['MEMBER'];
const ADMIN: Audience[] = ['ADMINISTRATOR'];

export const FAQS: Faq[] = [
  // ---------------------------------------------------------------- everyone
  {
    id: 'what-is-this',
    audience: 'ALL',
    popular: true,
    q: { en: 'What can I do in this app?', te: 'ఈ యాప్‌లో నేను ఏమి చేయవచ్చు?' },
    a: [
      {
        en: 'Shop for farm inputs and natural foods, and (with a membership) ask experts about problems in your field, read advice articles, take courses and order soil tests. Everything is in English and Telugu.',
        te: 'వ్యవసాయ ఇన్‌పుట్లు, సహజ ఆహారాలు కొనవచ్చు, మరియు (సభ్యత్వంతో) మీ పొలంలోని సమస్యల గురించి నిపుణులను అడగవచ్చు, సలహా వ్యాసాలు చదవవచ్చు, కోర్సులు చేయవచ్చు, నేల పరీక్షలు ఆర్డర్ చేయవచ్చు. అంతా ఇంగ్లీష్, తెలుగులో ఉంటుంది.',
      },
    ],
    keywords: ['what is this app', 'what can i do', 'about this app', 'features', 'ఏమి చేయవచ్చు', 'ఈ యాప్', 'యాప్ ఏమిటి', 'emi chesukovachu'],
    link: { to: '/help', label: { en: 'Open the full Help', te: 'పూర్తి సహాయం తెరవండి' } },
  },
  {
    id: 'language',
    audience: 'ALL',
    q: { en: 'How do I change the language?', te: 'భాషను ఎలా మార్చాలి?' },
    a: [
      {
        en: 'You do not need to. Every screen shows English first with Telugu directly underneath, so both are always there.',
        te: 'అవసరం లేదు. ప్రతి స్క్రీన్ మొదట ఇంగ్లీష్, దాని కింద తెలుగు చూపిస్తుంది, కాబట్టి రెండూ ఎల్లప్పుడూ ఉంటాయి.',
      },
    ],
    keywords: ['language', 'telugu', 'english', 'translate', 'భాష', 'తెలుగు', 'ఇంగ్లీష్', 'bhasha', 'telugulo'],
  },
  {
    id: 'register',
    audience: ['GUEST'],
    popular: true,
    q: { en: 'How do I create an account?', te: 'ఖాతాను ఎలా సృష్టించాలి?' },
    a: [
      {
        en: 'Tap Register, enter your name, mobile number and a password (at least 8 characters), then type the 6-digit code shown on the screen. Everyone gets the same kind of account and a personal ID like HHC-0042.',
        te: 'నమోదు తాకి, మీ పేరు, మొబైల్ నంబర్, పాస్‌వర్డ్ (కనీసం 8 అక్షరాలు) నమోదు చేసి, స్క్రీన్‌పై కనిపించే 6 అంకెల కోడ్ టైప్ చేయండి. అందరికీ ఒకే రకమైన ఖాతా, HHC-0042 వంటి వ్యక్తిగత ID వస్తుంది.',
      },
    ],
    keywords: ['create an account', 'make an account', 'open an account', 'create account', 'register', 'sign up', 'signup', 'new account', 'join', 'ఖాతా సృష్టించ', 'నమోదు', 'కొత్త ఖాతా', 'account kavali', 'register cheyali'],
    link: { to: '/register', label: { en: 'Go to Register', te: 'నమోదుకు వెళ్ళండి' } },
  },
  {
    id: 'otp',
    audience: 'ALL',
    q: { en: 'I did not get an SMS code', te: 'నాకు SMS కోడ్ రాలేదు' },
    a: [
      {
        en: 'Sign-up codes are not texted yet. The 6-digit code appears on the screen itself, under a red “Temporary” banner. Type that in. (Resetting a forgotten password does not use a code — see “I forgot my password”.)',
        te: 'సైన్-అప్ కోడ్‌లు ఇంకా SMS ద్వారా రావు. 6 అంకెల కోడ్ ఎరుపు “తాత్కాలికం” బ్యానర్ కింద స్క్రీన్‌పైనే కనిపిస్తుంది. దాన్ని టైప్ చేయండి. (మర్చిపోయిన పాస్‌వర్డ్‌ను రీసెట్ చేయడానికి కోడ్ వాడరు — “నా పాస్‌వర్డ్ మర్చిపోయాను” చూడండి.)',
      },
    ],
    keywords: ['not received', 'did not get', 'didnt get', 'sms code', 'code not coming', 'sms', 'otp', 'code not', 'no code', 'verification code', 'six digit', '6 digit', 'code రాలేదు', 'కోడ్', 'ఓటీపీ', 'code radu', 'code ravatledu'],
  },
  {
    id: 'forgot-password',
    audience: 'ALL',
    popular: true,
    q: { en: 'I forgot my password', te: 'నా పాస్‌వర్డ్ మర్చిపోయాను' },
    a: [
      {
        en: 'For your safety only the store can reset a password. On the log-in screen choose “Forgot password” and enter your mobile number — the store’s Administrators are told. Contact the store and quote your ID (like HHC-0042). An Administrator checks it is really you and gives you a temporary password. Log in with it and you will be asked to choose your own password straight away.',
        te: 'మీ భద్రత కోసం పాస్‌వర్డ్‌ను స్టోర్ మాత్రమే రీసెట్ చేయగలదు. లాగిన్ స్క్రీన్‌లో “పాస్‌వర్డ్ మర్చిపోయారా” ఎంచుకుని మీ మొబైల్ నంబర్ నమోదు చేయండి — స్టోర్ అడ్మినిస్ట్రేటర్లకు తెలియజేయబడుతుంది. స్టోర్‌ను సంప్రదించి మీ ID (HHC-0042 లాగా) చెప్పండి. అది నిజంగా మీరేనని అడ్మినిస్ట్రేటర్ నిర్ధారించుకుని మీకు తాత్కాలిక పాస్‌వర్డ్ ఇస్తారు. దానితో లాగిన్ అయితే వెంటనే మీ స్వంత పాస్‌వర్డ్‌ను ఎంచుకోమని అడుగుతుంది.',
      },
    ],
    keywords: ['forgot password', 'forgot my password', 'reset password', 'lost password', 'cannot log in', 'cant login', "can't login", 'unable to login', 'పాస్‌వర్డ్ మర్చిపోయ', 'పాస్‌వర్డ్ మర్చి', 'password marchipoyanu', 'password marchipoya'],
    link: { to: '/forgot-password', label: { en: 'Ask the store to reset it', te: 'రీసెట్ చేయమని స్టోర్‌ను అడగండి' } },
  },
  {
    id: 'show-password',
    audience: 'ALL',
    q: { en: 'How do I see the password I am typing?', te: 'నేను టైప్ చేస్తున్న పాస్‌వర్డ్‌ను ఎలా చూడాలి?' },
    a: [
      {
        en: 'Every password box has an eye button at its right edge. Tap it to show what you typed, and tap again to hide it.',
        te: 'ప్రతి పాస్‌వర్డ్ బాక్స్ కుడి అంచున కన్ను బటన్ ఉంటుంది. మీరు టైప్ చేసినది చూడటానికి దాన్ని తాకండి, దాచడానికి మళ్ళీ తాకండి.',
      },
    ],
    keywords: ['see the password', 'see password', 'password typing', 'eye button', 'పాస్‌వర్డ్ ఎలా చూడ', 'టైప్ చేస్తున్న పాస్‌వర్డ్', 'show password', 'see password', 'eye', 'hide password', 'view password', 'పాస్‌వర్డ్ చూడ', 'కన్ను'],
  },
  {
    id: 'change-password',
    audience: ['MEMBER', 'ADMINISTRATOR', 'VENDOR', 'EXPERT', 'MODERATOR', 'SUPPORT_AGENT'],
    q: { en: 'How do I change my password?', te: 'నా పాస్‌వర్డ్‌ను ఎలా మార్చాలి?' },
    a: [
      {
        en: 'Open Account in the top bar, enter your current password and a new one. You will be logged out afterwards and sign in again with the new password. If an Administrator gave you a temporary password, this screen opens by itself after you log in and nothing else works until you have chosen your own.',
        te: 'పై బార్‌లో ఖాతా తెరిచి, మీ ప్రస్తుత పాస్‌వర్డ్, కొత్తది నమోదు చేయండి. ఆ తర్వాత మీరు లాగ్ అవుట్ అవుతారు; కొత్త పాస్‌వర్డ్‌తో మళ్ళీ సైన్ ఇన్ అవ్వండి. అడ్మినిస్ట్రేటర్ మీకు తాత్కాలిక పాస్‌వర్డ్ ఇచ్చి ఉంటే, లాగిన్ అయిన తర్వాత ఈ స్క్రీన్ దానంతట అదే తెరుచుకుంటుంది; మీ స్వంతదాన్ని ఎంచుకునే వరకు ఇంకేదీ పనిచేయదు.',
      },
    ],
    keywords: ['పాస్‌వర్డ్ మార్చ', 'పాస్‌వర్డ్‌ను మార్చ', 'change password', 'change my password', 'new password', 'update password', 'పాస్‌వర్డ్ మార్చ', 'password marchali'],
    link: { to: '/account/password', label: { en: 'Change password', te: 'పాస్‌వర్డ్ మార్చండి' } },
  },
  {
    id: 'install',
    audience: 'ALL',
    q: { en: 'Can I put this app on my phone?', te: 'ఈ యాప్‌ను నా ఫోన్‌లో పెట్టుకోవచ్చా?' },
    a: [
      {
        en: 'Yes. Open the site in your phone’s browser and choose “Add to Home screen” (or “Install app”) from the browser menu. It then opens like any other app.',
        te: 'అవును. మీ ఫోన్ బ్రౌజర్‌లో సైట్ తెరిచి, బ్రౌజర్ మెనూ నుండి “హోమ్ స్క్రీన్‌కు జోడించండి” (లేదా “యాప్ ఇన్‌స్టాల్ చేయండి”) ఎంచుకోండి. తర్వాత అది ఇతర యాప్‌ల లాగే తెరుచుకుంటుంది.',
      },
    ],
    keywords: ['app phone', 'put this app', 'on my phone', 'install', 'phone app', 'home screen', 'add to home', 'download app', 'play store', 'android', 'iphone', 'ఇన్‌స్టాల్', 'ఫోన్‌లో', 'హోమ్ స్క్రీన్'],
  },
  {
    id: 'tour',
    audience: 'ALL',
    q: { en: 'Can I see the guided tour again?', te: 'గైడెడ్ టూర్‌ను మళ్ళీ చూడవచ్చా?' },
    a: [
      {
        en: 'Yes. Open Help and tap “Take the tour”, or use the button below.',
        te: 'అవును. సహాయం తెరిచి “టూర్ చూడండి” తాకండి, లేదా కింద ఉన్న బటన్ వాడండి.',
      },
    ],
    keywords: ['tour', 'guided tour', 'walkthrough', 'show me around', 'tutorial', 'టూర్', 'గైడ్'],
  },
  {
    id: 'bell',
    audience: ['MEMBER', 'ADMINISTRATOR', 'VENDOR', 'EXPERT', 'MODERATOR', 'SUPPORT_AGENT'],
    q: { en: 'Where do I see notifications?', te: 'నోటిఫికేషన్లు ఎక్కడ చూడాలి?' },
    a: [
      {
        en: 'Tap the bell in the top bar. The red number is how many are new — for example a payment verified, an order shipped or an answer to your question.',
        te: 'పై బార్‌లోని గంటను తాకండి. ఎరుపు సంఖ్య కొత్తవి ఎన్నో చూపిస్తుంది — ఉదాహరణకు చెల్లింపు ధృవీకరణ, ఆర్డర్ పంపబడటం, మీ ప్రశ్నకు సమాధానం.',
      },
    ],
    keywords: ['notification', 'notifications', 'bell', 'alert', 'alerts', 'నోటిఫికేషన్', 'గంట'],
    link: { to: '/notifications', label: { en: 'Open notifications', te: 'నోటిఫికేషన్లు తెరవండి' } },
  },

  // ------------------------------------------------------------- shop / cart
  {
    id: 'browse',
    audience: GUEST_MEMBER,
    q: { en: 'Do I need an account to look at products?', te: 'ఉత్పత్తులను చూడటానికి ఖాతా కావాలా?' },
    a: [
      {
        en: 'No. Open Marketplace to browse everything and fill a cart without signing in. You only need an account (and a membership) to check out.',
        te: 'అవసరం లేదు. సైన్ ఇన్ లేకుండానే అన్నీ చూడటానికి, కార్ట్ నింపడానికి మార్కెట్‌ప్లేస్ తెరవండి. చెక్అవుట్‌కు మాత్రమే ఖాతా (మరియు సభ్యత్వం) అవసరం.',
      },
    ],
    keywords: ['ఉత్పత్తులను చూడటానికి ఖాతా', 'ఖాతా కావాలా', 'browse', 'look around', 'without account', 'without login', 'without signing', 'need account', 'need an account', 'ఖాతా లేకుండా', 'లాగిన్ లేకుండా'],
    link: { to: '/marketplace', label: { en: 'Open Marketplace', te: 'మార్కెట్‌ప్లేస్ తెరవండి' } },
  },
  {
    id: 'find-product',
    audience: GUEST_MEMBER,
    popular: true,
    q: { en: 'How do I find a product?', te: 'ఉత్పత్తిని ఎలా వెతకాలి?' },
    a: [
      {
        en: 'In Marketplace, narrow the list with Department, then Category, then Sub-category. You can also search by name and sort by price, name or newest.',
        te: 'మార్కెట్‌ప్లేస్‌లో విభాగం, తర్వాత వర్గం, తర్వాత ఉప-వర్గంతో జాబితాను తగ్గించండి. పేరుతో శోధించవచ్చు, ధర, పేరు లేదా కొత్తవి ప్రకారం క్రమబద్ధీకరించవచ్చు.',
      },
    ],
    keywords: ['find product', 'find a product', 'search product', 'find product', 'search', 'filter', 'category', 'department', 'sort', 'where is', 'looking for', 'వెతక', 'శోధ', 'వర్గం', 'విభాగం', 'vetakali'],
    link: { to: '/marketplace', label: { en: 'Open Marketplace', te: 'మార్కెట్‌ప్లేస్ తెరవండి' } },
  },
  {
    id: 'out-of-stock',
    audience: GUEST_MEMBER,
    q: { en: 'Why can I not add a product to my cart?', te: 'ఉత్పత్తిని కార్ట్‌కు ఎందుకు జోడించలేకపోతున్నాను?' },
    a: [
      {
        en: 'A product marked “Out of stock” cannot be added, and you cannot put more in your cart than is in stock — the screen tells you how many are left. Come back later or choose a smaller quantity.',
        te: '“స్టాక్ లేదు” అని ఉన్న ఉత్పత్తిని జోడించలేరు, అలాగే స్టాక్‌లో ఉన్నదానికంటే ఎక్కువ కార్ట్‌లో పెట్టలేరు — ఎన్ని మిగిలాయో స్క్రీన్ చెబుతుంది. తర్వాత రండి లేదా తక్కువ పరిమాణం ఎంచుకోండి.',
      },
    ],
    keywords: ['not add', 'cant add', 'add product cart', 'add to my cart', 'కార్ట్‌కు ఎందుకు జోడ', 'జోడించలేక', 'out of stock', 'cannot add', "can't add", 'add to cart', 'not enough stock', 'stock', 'unavailable', 'quantity', 'స్టాక్', 'కార్ట్‌కు జోడ', 'stock ledu'],
  },
  {
    id: 'guest-cart',
    audience: GUEST_MEMBER,
    q: { en: 'What happens to my cart when I log in?', te: 'నేను లాగిన్ అయినప్పుడు నా కార్ట్‌కు ఏమవుతుంది?' },
    a: [
      {
        en: 'If you added things before signing in, they are kept on this device and join your account when you log in or register. Nothing is lost.',
        te: 'సైన్ ఇన్ చేసే ముందు మీరు జోడించినవి ఈ పరికరంలో ఉంటాయి; లాగిన్ లేదా నమోదు చేసినప్పుడు మీ ఖాతాలో చేరతాయి. ఏదీ పోదు.',
      },
    ],
    keywords: ['లాగిన్ అయినప్పుడు కార్ట్', 'కార్ట్‌కు ఏమవుతుంది', 'cart lost', 'cart gone', 'cart disappeared', 'my cart', 'cart after login', 'cart empty', 'కార్ట్ ఖాళీ', 'కార్ట్ పోయింది'],
    link: { to: '/marketplace/cart', label: { en: 'Open my cart', te: 'నా కార్ట్ తెరవండి' } },
  },
  {
    id: 'hearts',
    audience: GUEST_MEMBER,
    q: { en: 'What is the heart on a product?', te: 'ఉత్పత్తిపై హృదయం గుర్తు ఏమిటి?' },
    a: [
      {
        en: 'The heart saves a product to your wishlist so you can find it again. It works before you log in too — your hearts move into your account when you sign in.',
        te: 'హృదయం గుర్తు ఉత్పత్తిని మీ విష్‌లిస్ట్‌లో సేవ్ చేస్తుంది, తర్వాత సులభంగా దొరుకుతుంది. లాగిన్ కాకముందే కూడా పనిచేస్తుంది — సైన్ ఇన్ చేసినప్పుడు మీ హృదయాలు మీ ఖాతాలోకి చేరతాయి.',
      },
    ],
    keywords: ['heart on', 'heart mean', 'what is the heart', 'హృదయం గుర్తు', 'heart', 'wishlist', 'wish list', 'favourite', 'favorite', 'save product', 'హృదయం', 'విష్‌లిస్ట్', 'ఇష్టమైన'],
  },
  {
    id: 'reviews',
    audience: GUEST_MEMBER,
    q: { en: 'How do I review a product?', te: 'ఉత్పత్తికి సమీక్ష ఎలా ఇవ్వాలి?' },
    a: [
      {
        en: 'Open the product and use the review box at the bottom: pick a star rating and write a few words. Reviews from other buyers are shown on the same page.',
        te: 'ఉత్పత్తిని తెరిచి, కింద ఉన్న సమీక్ష బాక్స్‌లో స్టార్ రేటింగ్ ఎంచుకుని కొన్ని మాటలు రాయండి. ఇతర కొనుగోలుదారుల సమీక్షలు అదే పేజీలో కనిపిస్తాయి.',
      },
    ],
    keywords: ['review', 'rating', 'rate', 'stars', 'feedback on product', 'సమీక్ష', 'రేటింగ్'],
  },

  // -------------------------------------------------------------- membership
  {
    id: 'why-locked',
    audience: GUEST_MEMBER,
    popular: true,
    q: { en: 'Why can I not check out or open My cases, Knowledge or Courses?', te: 'చెక్అవుట్ లేదా నా కేసులు, జ్ఞానం, కోర్సులు ఎందుకు తెరవలేకపోతున్నాను?' },
    a: [
      {
        en: 'Checkout and the farm-advice features (My cases, Knowledge, Courses, Soil Testing) need an active membership. Browsing and filling a cart are free for everyone. Pay on the My subscription page to unlock them.',
        te: 'చెక్అవుట్, వ్యవసాయ సలహా సౌకర్యాలకు (నా కేసులు, జ్ఞానం, కోర్సులు, నేల పరీక్ష) యాక్టివ్ సభ్యత్వం అవసరం. బ్రౌజ్ చేయడం, కార్ట్ నింపడం అందరికీ ఉచితం. వాటిని అన్‌లాక్ చేయడానికి నా సభ్యత్వం పేజీలో చెల్లించండి.',
      },
    ],
    keywords: ['not check out', 'cant checkout', 'cant check out', 'cannot checkout', 'why cant', 'చెక్అవుట్ ఎందుకు', 'తెరవలేక', 'members only', 'locked', 'cannot check out', "can't checkout", 'cannot checkout', 'membership required', 'need membership', 'unlock', 'why locked', 'సభ్యులకు మాత్రమే', 'లాక్', 'అన్‌లాక్', 'locked undi'],
    link: { to: '/hariharaa/subscription', label: { en: 'My subscription', te: 'నా సభ్యత్వం' } },
  },
  {
    id: 'how-to-pay-membership',
    audience: GUEST_MEMBER,
    popular: true,
    q: { en: 'How do I pay for my membership?', te: 'సభ్యత్వానికి ఎలా చెల్లించాలి?' },
    a: [
      {
        en: 'Open My subscription and tap Pay now. If there is more than one plan, pick one. Scan the QR with any UPI app (or use the payment link), pay the exact amount shown, then type the UTR / reference number from your UPI app and submit it.',
        te: 'నా సభ్యత్వం తెరిచి ఇప్పుడే చెల్లించండి తాకండి. ఒకటి కంటే ఎక్కువ ప్లాన్లు ఉంటే ఒకదాన్ని ఎంచుకోండి. ఏదైనా UPI యాప్‌తో QR స్కాన్ చేసి (లేదా చెల్లింపు లింక్ వాడి), చూపిన ఖచ్చితమైన మొత్తం చెల్లించి, మీ UPI యాప్‌లోని UTR / రిఫరెన్స్ నంబర్‌ను టైప్ చేసి సమర్పించండి.',
      },
    ],
    keywords: ['pay membership', 'pay for membership', 'member pay', 'pay for my membership', 'pay membership', 'membership payment', 'how to pay', 'pay now', 'subscribe', 'subscription', 'upi', 'qr', 'plan', 'price of membership', 'membership fee', 'సభ్యత్వానికి చెల్లి', 'సభ్యత్వ చెల్లింపు', 'ఎలా చెల్లించాలి', 'ప్లాన్', 'sabhyatvam', 'membership ela'],
    link: { to: '/hariharaa/subscription', label: { en: 'My subscription', te: 'నా సభ్యత్వం' } },
  },
  {
    id: 'utr',
    audience: GUEST_MEMBER,
    q: { en: 'What is the UTR and where do I find it?', te: 'UTR అంటే ఏమిటి, ఎక్కడ దొరుకుతుంది?' },
    a: [
      {
        en: 'The UTR (also called UPI reference or transaction ID) is the 12-digit number your UPI app shows after a payment — open the payment in your app’s history. Type it exactly. The same UTR cannot be used twice.',
        te: 'UTR (UPI రిఫరెన్స్ లేదా ట్రాన్సాక్షన్ ID అని కూడా అంటారు) అంటే చెల్లింపు తర్వాత మీ UPI యాప్ చూపించే 12 అంకెల నంబర్ — యాప్ హిస్టరీలో ఆ చెల్లింపును తెరవండి. దాన్ని ఖచ్చితంగా టైప్ చేయండి. ఒకే UTRని రెండుసార్లు వాడలేరు.',
      },
    ],
    keywords: ['what is utr', 'where utr', 'find utr', 'utr number', 'utr అంటే', 'utr', 'reference number', 'transaction id', 'transaction number', 'upi reference', 'ref no', 'రిఫరెన్స్', 'ట్రాన్సాక్షన్'],
  },
  {
    id: 'paid-but-locked',
    audience: GUEST_MEMBER,
    popular: true,
    q: { en: 'I paid but I am still locked', te: 'చెల్లించాను కానీ ఇంకా లాక్ అయి ఉంది' },
    a: [
      {
        en: 'Payments are checked by hand against the bank, so it can take a few hours. Check that you submitted the UTR after paying — until then it shows as unpaid. If it was rejected, the reason is on the My subscription page; pay again or correct the reference.',
        te: 'చెల్లింపులు బ్యాంకుతో చేతితో తనిఖీ చేయబడతాయి, కాబట్టి కొన్ని గంటలు పట్టవచ్చు. చెల్లించిన తర్వాత UTR సమర్పించారో లేదో చూసుకోండి — అప్పటి వరకు అది చెల్లించనిదిగా కనిపిస్తుంది. తిరస్కరించబడితే కారణం నా సభ్యత్వం పేజీలో ఉంటుంది; మళ్ళీ చెల్లించండి లేదా రిఫరెన్స్ సరిచేయండి.',
      },
    ],
    keywords: ['paid but', 'i paid', 'already paid', 'payment not showing', 'payment rejected', 'rejected', 'still locked', 'not unlocked', 'not verified', 'waiting for verification', 'pending verification', 'చెల్లించాను', 'తిరస్కరించ', 'ఇంకా లాక్', 'verify avvaledu', 'paid chesanu'],
    link: { to: '/hariharaa/subscription', label: { en: 'My subscription', te: 'నా సభ్యత్వం' } },
  },
  {
    id: 'renew',
    audience: MEMBER,
    q: { en: 'When does my membership end, and how do I renew?', te: 'నా సభ్యత్వం ఎప్పుడు ముగుస్తుంది, ఎలా పునరుద్ధరించాలి?' },
    a: [
      {
        en: 'My subscription shows the end date. In the last 3 days a strip under the top bar and a bell notification remind you once. Renew from the same page — early renewal is never wasted, because new days are added after the days you already have.',
        te: 'నా సభ్యత్వం ముగింపు తేదీని చూపిస్తుంది. చివరి 3 రోజుల్లో పై బార్ కింద ఒక స్ట్రిప్, బెల్ నోటిఫికేషన్ ఒకసారి గుర్తు చేస్తాయి. అదే పేజీ నుండి పునరుద్ధరించండి — ముందే పునరుద్ధరించినా వృధా కాదు, కొత్త రోజులు మీకు ఇప్పటికే ఉన్న రోజుల తర్వాత చేరతాయి.',
      },
    ],
    keywords: ['renew', 'renewal', 'expire', 'expiry', 'expires', 'expired', 'end date', 'how long', 'validity', 'ends in', 'గడువు', 'పునరుద్ధరణ', 'పునరుద్ధరించ', 'ముగుస్తుంది'],
    link: { to: '/hariharaa/subscription', label: { en: 'My subscription', te: 'నా సభ్యత్వం' } },
  },
  {
    id: 'free-access',
    audience: MEMBER,
    q: { en: 'What does “Free access until …” mean?', te: '“… వరకు ఉచిత ప్రాప్యత” అంటే ఏమిటి?' },
    a: [
      {
        en: 'An administrator has unlocked your account free of charge until that date. Everything works as for a paying member. When it ends you are locked again unless you have paid days left.',
        te: 'అడ్మినిస్ట్రేటర్ ఆ తేదీ వరకు మీ ఖాతాను ఉచితంగా అన్‌లాక్ చేశారు. చెల్లించే సభ్యునికి లాగే అన్నీ పనిచేస్తాయి. అది ముగిసినప్పుడు, చెల్లించిన రోజులు మిగిలి ఉంటే తప్ప, మళ్ళీ లాక్ అవుతుంది.',
      },
    ],
    keywords: ['free access', 'free membership', 'free trial', 'free', 'ఉచిత ప్రాప్యత', 'ఉచితం', 'ఉచిత'],
  },
  {
    id: 'my-id',
    audience: MEMBER,
    q: { en: 'What is my ID like HHC-0042?', te: 'HHC-0042 వంటి నా ID అంటే ఏమిటి?' },
    a: [
      {
        en: 'It is your personal ID, shown next to your name in the top bar. Give it when you contact the store or pay — it is how we recognise your payments.',
        te: 'ఇది మీ వ్యక్తిగత ID, పై బార్‌లో మీ పేరు పక్కన కనిపిస్తుంది. స్టోర్‌ను సంప్రదించినప్పుడు లేదా చెల్లించినప్పుడు ఇది చెప్పండి — మీ చెల్లింపులను గుర్తించడానికి ఇదే ఉపయోగపడుతుంది.',
      },
    ],
    keywords: ['hhc id', 'what is my id', 'id like hhc', 'hhc 0042', 'hhc', 'my id', 'user id', 'customer id', 'usercode', 'personal id', 'ఐడి', 'వ్యక్తిగత ID'],
  },

  // ---------------------------------------------------------------- checkout
  {
    id: 'checkout-steps',
    audience: MEMBER,
    popular: true,
    q: { en: 'How do I place an order?', te: 'ఆర్డర్ ఎలా చేయాలి?' },
    a: [
      {
        en: 'Open your cart and choose Proceed to checkout. Pick a saved address or add one (name, phone, house/street, town, state, 6-digit PIN), choose Cash on Delivery or UPI, and place the order.',
        te: 'మీ కార్ట్ తెరిచి చెక్అవుట్‌కు వెళ్ళండి ఎంచుకోండి. సేవ్ చేసిన చిరునామా ఎంచుకోండి లేదా కొత్తది చేర్చండి (పేరు, ఫోన్, ఇంటి నంబర్/వీధి, పట్టణం, రాష్ట్రం, 6 అంకెల పిన్), క్యాష్ ఆన్ డెలివరీ లేదా UPI ఎంచుకుని ఆర్డర్ చేయండి.',
      },
    ],
    keywords: ['place order', 'place an order', 'buy', 'purchase', 'checkout', 'check out', 'order cheyali', 'how to order', 'how do i order', 'ఆర్డర్ ఎలా', 'ఆర్డర్ చేయ', 'కొనడం', 'చెక్అవుట్'],
    link: { to: '/marketplace/cart', label: { en: 'Open my cart', te: 'నా కార్ట్ తెరవండి' } },
  },
  {
    id: 'address',
    audience: MEMBER,
    q: { en: 'Where do I manage my delivery addresses?', te: 'డెలివరీ చిరునామాలను ఎక్కడ నిర్వహించాలి?' },
    a: [
      {
        en: 'Under Shop → Addresses. You can add, edit, delete and choose a default. Changing a saved address never changes an order you have already placed.',
        te: 'షాప్ → చిరునామాలు లో. జోడించవచ్చు, సవరించవచ్చు, తొలగించవచ్చు, డిఫాల్ట్ ఎంచుకోవచ్చు. సేవ్ చేసిన చిరునామా మార్చినా, ఇప్పటికే చేసిన ఆర్డర్ మారదు.',
      },
    ],
    keywords: ['address', 'addresses', 'delivery address', 'pin code', 'pincode', 'change address', 'చిరునామా', 'పిన్', 'adress'],
    link: { to: '/account/addresses', label: { en: 'Open Addresses', te: 'చిరునామాలు తెరవండి' } },
  },
  {
    id: 'cod-or-upi',
    audience: MEMBER,
    q: { en: 'Cash on Delivery or UPI — which should I choose?', te: 'క్యాష్ ఆన్ డెలివరీ లేదా UPI — ఏది ఎంచుకోవాలి?' },
    a: [
      {
        en: 'Cash on Delivery: pay when the parcel arrives. UPI: open the order, tap Pay now, pay the exact total, and submit the UTR; we verify it before packing. Both give the same order.',
        te: 'క్యాష్ ఆన్ డెలివరీ: పార్సెల్ వచ్చినప్పుడు చెల్లించండి. UPI: ఆర్డర్ తెరిచి ఇప్పుడే చెల్లించండి తాకి, ఖచ్చితమైన మొత్తం చెల్లించి, UTR సమర్పించండి; ప్యాక్ చేసే ముందు మేము ధృవీకరిస్తాము. రెండింటికీ ఒకే ఆర్డర్ వస్తుంది.',
      },
    ],
    keywords: ['cod', 'cash on delivery', 'upi order', 'pay for order', 'pay my order', 'order payment', 'క్యాష్ ఆన్ డెలివరీ', 'ఆర్డర్‌కు చెల్లి'],
  },
  {
    id: 'order-status',
    audience: MEMBER,
    popular: true,
    q: { en: 'How do I track my order?', te: 'నా ఆర్డర్‌ను ఎలా ట్రాక్ చేయాలి?' },
    a: [
      {
        en: 'Open My orders and then the order. It moves Placed → Confirmed → Shipped → Delivered, and shows its payment status. Each item also shows Sent or Pending.',
        te: 'నా ఆర్డర్‌లు, తర్వాత ఆర్డర్ తెరవండి. ఇది చేయబడింది → నిర్ధారించబడింది → పంపబడింది → డెలివరీ అయింది గా మారుతుంది, చెల్లింపు స్థితిని కూడా చూపిస్తుంది. ప్రతి వస్తువు పంపబడింది లేదా పెండింగ్ అని కూడా చూపిస్తుంది.',
      },
    ],
    keywords: ['track', 'order status', 'where is my order', 'my order', 'my orders', 'shipped', 'delivered', 'delivery', 'dispatch', 'ఆర్డర్ ఎక్కడ', 'ఆర్డర్ స్థితి', 'నా ఆర్డర్', 'డెలివరీ'],
    link: { to: '/marketplace/orders', label: { en: 'My orders', te: 'నా ఆర్డర్‌లు' } },
  },
  {
    id: 'item-pending',
    audience: MEMBER,
    q: { en: 'Why does an item in my order say Pending?', te: 'నా ఆర్డర్‌లో వస్తువు పెండింగ్ అని ఎందుకు ఉంది?' },
    a: [
      {
        en: 'If some stock was short when we packed, we send what we have first. Pending items follow as soon as they are available.',
        te: 'ప్యాక్ చేసినప్పుడు కొంత స్టాక్ తక్కువగా ఉంటే, ఉన్నది మొదట పంపుతాము. పెండింగ్ వస్తువులు అందుబాటులోకి రాగానే వెంటనే వస్తాయి.',
      },
    ],
    keywords: ['pending', 'partial', 'not sent', 'sent or pending', 'missing item', 'పెండింగ్', 'పంపబడలేదు'],
  },
  {
    id: 'cancel-order',
    audience: MEMBER,
    q: { en: 'Can I cancel or change an order?', te: 'ఆర్డర్‌ను రద్దు చేయవచ్చా లేదా మార్చవచ్చా?' },
    a: [
      {
        en: 'Orders are cancelled by the store, not from your account. Contact the store with your ID and order number before it is shipped; a cancelled order returns its items to stock. A delivered order cannot be cancelled.',
        te: 'ఆర్డర్లను మీ ఖాతా నుండి కాకుండా స్టోర్ రద్దు చేస్తుంది. అది పంపబడే ముందు మీ ID, ఆర్డర్ నంబర్‌తో స్టోర్‌ను సంప్రదించండి; రద్దు చేసిన ఆర్డర్ వస్తువులు స్టాక్‌కు తిరిగి వెళ్తాయి. డెలివరీ అయిన ఆర్డర్‌ను రద్దు చేయలేరు.',
      },
    ],
    keywords: ['cancel my order', 'cancel order', 'cancel an order', 'cancel', 'cancel order', 'change order', 'wrong order', 'refund', 'return', 'రద్దు', 'రీఫండ్', 'తిరిగి ఇవ్వ'],
  },

  // ------------------------------------------------------------ farm advice
  {
    id: 'cases',
    audience: MEMBER,
    popular: true,
    q: { en: 'How do I ask an expert about a problem in my field?', te: 'నా పొలంలోని సమస్య గురించి నిపుణుడిని ఎలా అడగాలి?' },
    a: [
      {
        en: 'Open My cases → New case (or tap “Photo your problem” on the shop home). First take up to 6 photos, then tap the symptoms you see — or speak or type a few words — and choose your land, the category and the crop. A moderator passes it to the right expert. You get a bell notification when they answer, and you can reply if they need more detail.',
        te: 'నా కేసులు → కొత్త కేసు తెరవండి (లేదా షాప్ హోమ్‌లో “సమస్య ఫోటో తీయండి” తాకండి). మొదట 6 వరకు ఫోటోలు తీయండి, తర్వాత మీకు కనిపించే లక్షణాలను తాకండి — లేదా కొన్ని మాటలు మాట్లాడండి లేదా టైప్ చేయండి — మీ భూమి, వర్గం, పంటను ఎంచుకోండి. మోడరేటర్ దాన్ని సరైన నిపుణుడికి పంపుతారు. వారు సమాధానం ఇచ్చినప్పుడు బెల్ నోటిఫికేషన్ వస్తుంది; మరిన్ని వివరాలు అడిగితే మీరు బదులివ్వవచ్చు.',
      },
    ],
    keywords: ['నిపుణుడిని ఎలా అడగాలి', 'పొలంలోని సమస్య', 'case', 'cases', 'ask expert', 'ask an expert', 'crop problem', 'disease', 'pest', 'problem in my field', 'advice', 'photo', 'కేసు', 'నిపుణుడు', 'పంట సమస్య', 'తెగులు', 'సలహా', 'samasya'],
    link: { to: '/cases/new', label: { en: 'Start a new case', te: 'కొత్త కేసు ప్రారంభించండి' } },
  },
  {
    id: 'knowledge',
    audience: MEMBER,
    q: { en: 'Where are the advice articles?', te: 'సలహా వ్యాసాలు ఎక్కడ ఉన్నాయి?' },
    a: [
      {
        en: 'Under Farm advice → Knowledge. These are articles written from real, solved cases. Search, filter, bookmark the ones you like, and rate them — a very low rating sends the article back for review.',
        te: 'వ్యవసాయ సలహా → జ్ఞానం లో. ఇవి నిజమైన, పరిష్కరించిన కేసుల నుండి రాసిన వ్యాసాలు. శోధించండి, ఫిల్టర్ చేయండి, నచ్చినవి బుక్‌మార్క్ చేయండి, రేటింగ్ ఇవ్వండి — చాలా తక్కువ రేటింగ్ వ్యాసాన్ని సమీక్షకు తిరిగి పంపుతుంది.',
      },
    ],
    keywords: ['knowledge', 'article', 'articles', 'guide', 'bookmark', 'read about', 'జ్ఞానం', 'వ్యాసం', 'వ్యాసాలు', 'బుక్‌మార్క్'],
    link: { to: '/knowledge', label: { en: 'Open Knowledge', te: 'జ్ఞానం తెరవండి' } },
  },
  {
    id: 'courses',
    audience: MEMBER,
    q: { en: 'How do courses and certificates work?', te: 'కోర్సులు, సర్టిఫికెట్లు ఎలా పనిచేస్తాయి?' },
    a: [
      {
        en: 'Open Courses, enrol, and finish the lessons in order. When every lesson is complete your certificate appears on the course page.',
        te: 'కోర్సులు తెరిచి, చేరి, పాఠాలను క్రమంగా పూర్తి చేయండి. ప్రతి పాఠం పూర్తయినప్పుడు మీ సర్టిఫికెట్ కోర్సు పేజీలో కనిపిస్తుంది.',
      },
    ],
    keywords: ['course', 'courses', 'lesson', 'lessons', 'certificate', 'learn', 'training', 'కోర్సు', 'కోర్సులు', 'పాఠం', 'సర్టిఫికెట్'],
    link: { to: '/courses', label: { en: 'Open Courses', te: 'కోర్సులు తెరవండి' } },
  },
  {
    id: 'soil',
    audience: MEMBER,
    q: { en: 'How do I get my soil tested?', te: 'నా నేలను ఎలా పరీక్షించుకోవాలి?' },
    a: [
      {
        en: 'Open Soil Testing and request a sample for your land (tick the collection-instructions box). You can follow it through dispatch, receipt and testing, and read or download the report when it is ready.',
        te: 'నేల పరీక్ష తెరిచి మీ భూమికి నమూనా అభ్యర్థించండి (సేకరణ సూచనల బాక్స్ టిక్ చేయండి). పంపడం, అందుకోవడం, పరీక్ష దశల్లో దాన్ని అనుసరించవచ్చు, నివేదిక సిద్ధమైనప్పుడు చదవవచ్చు లేదా డౌన్‌లోడ్ చేయవచ్చు.',
      },
    ],
    keywords: ['soil', 'soil test', 'soil testing', 'sample', 'lab', 'report', 'నేల', 'నేల పరీక్ష', 'నమూనా', 'మట్టి', 'matti'],
    link: { to: '/soil-samples', label: { en: 'Open Soil Testing', te: 'నేల పరీక్ష తెరవండి' } },
  },

  {
    id: 'case-photos',
    audience: MEMBER,
    q: { en: 'How do I add photos to my case?', te: 'నా కేసుకు ఫోటోలు ఎలా జోడించాలి?' },
    a: [
      {
        en: 'On the New case screen, step 1 is photos: tap “Take a photo” to use the camera, or “Choose from gallery”. You can add up to 6. They are made smaller on your phone before sending, so they upload quickly even on a slow connection. A close photo of the worst part and one of the whole plant help the expert most.',
        te: 'కొత్త కేసు స్క్రీన్‌లో 1వ దశ ఫోటోలు: కెమెరా వాడటానికి “ఫోటో తీయండి” తాకండి, లేదా “గ్యాలరీ నుండి ఎంచుకోండి”. 6 వరకు జోడించవచ్చు. పంపే ముందు అవి మీ ఫోన్‌లోనే చిన్నవిగా చేయబడతాయి, కాబట్టి నెమ్మదైన కనెక్షన్‌లో కూడా త్వరగా అప్‌లోడ్ అవుతాయి. ఎక్కువ దెబ్బతిన్న భాగం యొక్క దగ్గరి ఫోటో, మొత్తం మొక్క ఫోటో నిపుణుడికి ఎక్కువగా సహాయపడతాయి.',
      },
    ],
    keywords: ['photo', 'photos', 'picture', 'camera', 'upload photo', 'add photo', 'add photos', 'take photo', 'ఫోటో', 'ఫోటోలు', 'కెమెరా', 'photo ela'],
    link: { to: '/cases/new', label: { en: 'Start a new case', te: 'కొత్త కేసు ప్రారంభించండి' } },
  },
  {
    id: 'voice',
    audience: MEMBER,
    q: { en: 'Can I speak instead of typing?', te: 'టైప్ చేయడానికి బదులు మాట్లాడవచ్చా?' },
    a: [
      {
        en: 'Yes. On the New case screen tap “Speak” (choose తెలుగు or English first) and say your problem. Where your browser offers it, the words appear in the box. If you do not see the Speak button, tap the microphone on your phone keyboard instead — it also types what you say, in Telugu.',
        te: 'అవును. కొత్త కేసు స్క్రీన్‌లో “మాట్లాడండి” తాకి (ముందు తెలుగు లేదా English ఎంచుకోండి) మీ సమస్య చెప్పండి. మీ బ్రౌజర్‌లో అది ఉంటే, మాటలు బాక్స్‌లో కనిపిస్తాయి. మాట్లాడండి బటన్ కనిపించకపోతే, మీ ఫోన్ కీబోర్డ్‌లోని మైక్రోఫోన్‌ను తాకండి — అది కూడా మీరు చెప్పినదాన్ని తెలుగులో టైప్ చేస్తుంది.',
      },
    ],
    keywords: ['speak', 'voice', 'microphone', 'mic', 'talk', 'say', 'voice typing', 'dictate', 'మాట్లాడ', 'మైక్రోఫోన్', 'వాయిస్', 'matladali', 'matladochha'],
  },
  {
    id: 'offline-case',
    audience: MEMBER,
    q: { en: 'What if I have no signal when I report a problem?', te: 'సమస్యను నివేదించేటప్పుడు సిగ్నల్ లేకపోతే ఏమి చేయాలి?' },
    a: [
      {
        en: 'Keep going. Everything you take or write on the New case screen is kept on your phone as you go, so closing the app or losing signal loses nothing — open New case again and it picks up where you left off. If you press Send with no connection, the case waits on your phone, a strip says so, and it is sent by itself the moment you are back online (on any screen). Photos are kept too.',
        te: 'కొనసాగించండి. కొత్త కేసు స్క్రీన్‌లో మీరు తీసినవి, రాసినవన్నీ మీరు వెళ్తున్న కొద్దీ మీ ఫోన్‌లో భద్రపరచబడతాయి, కాబట్టి యాప్‌ను మూసివేసినా లేదా సిగ్నల్ పోయినా ఏదీ పోదు — కొత్త కేసును మళ్ళీ తెరిస్తే మీరు ఆపిన చోటి నుండి కొనసాగుతుంది. కనెక్షన్ లేకుండా పంపండి తాకితే, కేసు మీ ఫోన్‌లో వేచి ఉంటుంది, ఒక స్ట్రిప్ అదే చెబుతుంది, మీరు మళ్ళీ ఆన్‌లైన్‌లోకి రాగానే (ఏ స్క్రీన్‌లో ఉన్నా) అది దానంతట అదే పంపబడుతుంది. ఫోటోలు కూడా భద్రంగా ఉంటాయి.',
      },
    ],
    keywords: ['no signal', 'no network', 'no internet', 'offline', 'no connection', 'poor signal', 'weak signal', 'lost signal', 'saved on phone', 'draft', 'సిగ్నల్ లేకపోతే', 'సిగ్నల్ లేదు', 'ఇంటర్నెట్ లేదు', 'కనెక్షన్ లేదు', 'ఆఫ్‌లైన్'],
    link: { to: '/cases/new', label: { en: 'Start a new case', te: 'కొత్త కేసు ప్రారంభించండి' } },
  },
  {
    id: 'symptom-chips',
    audience: MEMBER,
    q: { en: 'I cannot type well — how else can I describe the problem?', te: 'నేను బాగా టైప్ చేయలేను — సమస్యను ఇంకెలా వివరించాలి?' },
    a: [
      {
        en: 'Tap the symptom pictures on the New case screen (yellow leaves, spots, wilting, insects, and more). Everything you tap is written into your case in English and Telugu for you. Add photos, and speak a few words if you like.',
        te: 'కొత్త కేసు స్క్రీన్‌లోని లక్షణాల చిత్రాలను తాకండి (పసుపు ఆకులు, మచ్చలు, వాడిపోవడం, పురుగులు, ఇంకా). మీరు తాకినవన్నీ మీ కోసం ఇంగ్లీష్, తెలుగులో మీ కేసులో రాయబడతాయి. ఫోటోలు జోడించండి, కావాలంటే కొన్ని మాటలు మాట్లాడండి.',
      },
    ],
    keywords: ['cannot type', "can't type", 'cant type', 'not able to type', 'symptom', 'symptoms', 'describe problem', 'low literacy', 'టైప్ చేయలేను', 'లక్షణాలు', 'వివరించాలి'],
  },
  {
    id: 'recommended',
    audience: MEMBER,
    q: { en: 'What are “Products that may help” under an article?', te: 'వ్యాసం కింద “ఇవి సహాయపడవచ్చు” అంటే ఏమిటి?' },
    a: [
      {
        en: 'Under each advice article the shop suggests products whose names or descriptions mention the same problem or crop — for example magnesium sulphate under an article about magnesium deficiency. It is a convenience, not a prescription: if you are not sure what your own field needs, ask an expert in My cases.',
        te: 'ప్రతి సలహా వ్యాసం కింద, అదే సమస్య లేదా పంటను పేర్కొనే పేర్లు లేదా వివరణలున్న ఉత్పత్తులను షాప్ సూచిస్తుంది — ఉదాహరణకు మెగ్నీషియం లోపం వ్యాసం కింద మెగ్నీషియం సల్ఫేట్. ఇది సౌకర్యం మాత్రమే, సూచన కాదు: మీ స్వంత పొలానికి ఏమి కావాలో ఖచ్చితంగా తెలియకపోతే, నా కేసులలో నిపుణుడిని అడగండి.',
      },
    ],
    keywords: ['products that may help', 'recommended', 'recommendation', 'suggested products', 'what to buy', 'which product', 'సహాయపడవచ్చు', 'సూచించిన', 'ఏ ఉత్పత్తి'],
    link: { to: '/knowledge', label: { en: 'Open Knowledge', te: 'జ్ఞానం తెరవండి' } },
  },
  {
    id: 'back-in-stock',
    audience: MEMBER,
    q: { en: 'Can I be told when an out-of-stock product comes back?', te: 'స్టాక్ లేని ఉత్పత్తి తిరిగి వచ్చినప్పుడు నాకు చెప్పగలరా?' },
    a: [
      {
        en: 'Yes. Open the product and tap “Tell me when it is back”. When stock returns you get a notification in the bell (and on WhatsApp if you chose that), and the request is then cleared. Tap again any time to cancel.',
        te: 'అవును. ఉత్పత్తిని తెరిచి “మళ్ళీ వచ్చినప్పుడు నాకు చెప్పండి” తాకండి. స్టాక్ తిరిగి వచ్చినప్పుడు బెల్‌లో నోటిఫికేషన్ వస్తుంది (మీరు ఎంచుకుంటే WhatsApp లో కూడా), ఆ తర్వాత అభ్యర్థన తొలగించబడుతుంది. రద్దు చేయడానికి ఎప్పుడైనా మళ్ళీ తాకండి.',
      },
    ],
    keywords: ['tell me when', 'back in stock', 'notify me', 'when available', 'when it is back', 'restock', 'out of stock notify', 'మళ్ళీ వచ్చినప్పుడు', 'స్టాక్ వచ్చినప్పుడు', 'తిరిగి వచ్చినప్పుడు'],
  },
  {
    id: 'reorder',
    audience: MEMBER,
    q: { en: 'How do I order the same things again?', te: 'అవే వస్తువులను మళ్ళీ ఎలా ఆర్డర్ చేయాలి?' },
    a: [
      {
        en: 'Open an earlier order in My orders and tap “Order again”. Everything still available goes into your cart (as much as is in stock) and the cart opens so you can check it. Anything out of stock is skipped and you are told.',
        te: 'నా ఆర్డర్‌లలో ఇంతకు ముందటి ఆర్డర్‌ను తెరిచి “మళ్ళీ ఆర్డర్ చేయండి” తాకండి. ఇంకా అందుబాటులో ఉన్నవన్నీ (స్టాక్‌లో ఉన్నంత వరకు) మీ కార్ట్‌లోకి వెళ్తాయి, చూసుకోవడానికి కార్ట్ తెరుచుకుంటుంది. స్టాక్ లేనివి వదిలివేయబడతాయి, మీకు తెలియజేయబడుతుంది.',
      },
    ],
    keywords: ['అవే వస్తువులను మళ్ళీ', 'మళ్ళీ ఆర్డర్ చేయాలి', 'అవే వస్తువులు', 'ఆర్డర్ చేయాలి అవే', 'order again', 'reorder', 're-order', 'repeat order', 'same order', 'buy again', 'order same', 'మళ్ళీ ఆర్డర్', 'అదే ఆర్డర్', 'మళ్ళీ కొనాలి'],
    link: { to: '/marketplace/orders', label: { en: 'My orders', te: 'నా ఆర్డర్‌లు' } },
  },
  {
    id: 'receipt',
    audience: ['MEMBER', 'ADMINISTRATOR'],
    q: { en: 'How do I get a receipt for an order?', te: 'ఆర్డర్‌కు రసీదు ఎలా పొందాలి?' },
    a: [
      {
        en: 'Open the order and tap “Receipt”, then “Print / save as PDF”. It lists what was ordered, the address, how it was paid and the total, in English and Telugu. It is an order receipt, not a tax invoice.',
        te: 'ఆర్డర్ తెరిచి “రసీదు” తాకి, తర్వాత “ప్రింట్ / PDF గా సేవ్ చేయండి” తాకండి. ఇది ఏమి ఆర్డర్ చేశారో, చిరునామా, ఎలా చెల్లించారో, మొత్తాన్ని ఇంగ్లీష్, తెలుగులో చూపిస్తుంది. ఇది ఆర్డర్ రసీదు, పన్ను ఇన్వాయిస్ కాదు.',
      },
    ],
    keywords: ['receipt for my order', 'need a receipt', 'receipt for order', 'get a receipt', 'receipt', 'invoice', 'bill', 'print order', 'pdf', 'proof of purchase', 'రసీదు', 'బిల్లు', 'ఇన్వాయిస్'],
  },
  {
    id: 'today',
    audience: MEMBER,
    q: { en: 'What is the “Today” section at the top of the shop?', te: 'షాప్ పైన ఉన్న “ఈ రోజు” భాగం ఏమిటి?' },
    a: [
      {
        en: 'A quick summary just for you: how many days of membership are left, your open cases (highlighted when an expert has answered), your latest order, and a button to photograph a problem. Each card opens the screen where you can act on it.',
        te: 'మీ కోసమే ఒక త్వరిత సారాంశం: సభ్యత్వం ఎన్ని రోజులు మిగిలింది, మీ ఓపెన్ కేసులు (నిపుణుడు సమాధానం ఇచ్చినప్పుడు హైలైట్ అవుతుంది), మీ తాజా ఆర్డర్, సమస్యను ఫోటో తీయడానికి బటన్. ప్రతి కార్డ్ మీరు చర్య తీసుకోగల స్క్రీన్‌ను తెరుస్తుంది.',
      },
    ],
    keywords: ['today', 'home', 'summary', 'dashboard', 'days left', 'ఈ రోజు', 'సారాంశం'],
  },
  {
    id: 'seasonal-tips',
    audience: MEMBER,
    q: { en: 'What is “This month on your farm”?', te: '“ఈ నెల మీ పొలంలో” అంటే ఏమిటి?' },
    a: [
      {
        en: 'Short tips for this time of year, shown under “Today” at the top of the shop. Some are for everyone; others appear only if you have listed that crop on one of your farms (Dashboard → your farms). They come from the store’s experts and change with the months.',
        te: 'సంవత్సరంలో ఈ సమయానికి సంబంధించిన చిన్న చిట్కాలు, షాప్ పైన “ఈ రోజు” కింద కనిపిస్తాయి. కొన్ని అందరికీ; మరికొన్ని మీ పొలాలలో ఒకదానిలో ఆ పంటను నమోదు చేసి ఉంటేనే కనిపిస్తాయి (డాష్‌బోర్డ్ → మీ పొలాలు). అవి స్టోర్ నిపుణుల నుండి వస్తాయి, నెలలతో మారతాయి.',
      },
    ],
    keywords: ['this month', 'seasonal', 'season', 'tips', 'tip', 'what to do this month', 'seasonal tips', 'ఈ నెల', 'సీజన్', 'చిట్కా', 'చిట్కాలు'],
  },
  {
    id: 'whatsapp',
    audience: MEMBER,
    q: { en: 'Can I get updates on WhatsApp?', te: 'అప్‌డేట్‌లు WhatsApp లో పొందవచ్చా?' },
    a: [
      {
        en: 'When the store has switched WhatsApp on, Account shows a “WhatsApp updates” box. Tick it and your order, payment, membership and back-in-stock updates are also sent to your mobile number on WhatsApp. It is off until you tick it, you can untick it any time, and the same updates always appear under the bell in the app. If you do not see the box, WhatsApp is not switched on yet.',
        te: 'స్టోర్ WhatsApp ను ఆన్ చేసినప్పుడు, ఖాతాలో “WhatsApp అప్‌డేట్‌లు” బాక్స్ కనిపిస్తుంది. దాన్ని టిక్ చేస్తే మీ ఆర్డర్, చెల్లింపు, సభ్యత్వం, స్టాక్ తిరిగి వచ్చిన అప్‌డేట్‌లు మీ మొబైల్ నంబర్‌కు WhatsApp లో కూడా వస్తాయి. మీరు టిక్ చేసే వరకు ఇది ఆఫ్‌లో ఉంటుంది, ఎప్పుడైనా టిక్ తీసివేయవచ్చు, అవే అప్‌డేట్‌లు యాప్‌లోని గంట కింద ఎల్లప్పుడూ కనిపిస్తాయి. బాక్స్ కనిపించకపోతే, WhatsApp ఇంకా ఆన్ కాలేదు.',
      },
    ],
    keywords: ['whatsapp', 'whats app', 'wa updates', 'message me', 'వాట్సాప్', 'వాట్సప్', 'whatsapp lo'],
    link: { to: '/account/password', label: { en: 'Open Account', te: 'ఖాతా తెరవండి' } },
  },

  // ------------------------------------------------------------ administrator
  {
    id: 'admin-verify-membership',
    audience: ADMIN,
    popular: true,
    q: { en: 'How do I approve a membership payment?', te: 'సభ్యత్వ చెల్లింపును ఎలా ఆమోదించాలి?' },
    a: [
      {
        en: 'Membership → HARIHARAA subscriptions. Find the UTR on your bank statement for that exact amount, then Approve (the plan’s days start now) or Reject with a reason the member will see.',
        te: 'సభ్యత్వం → HARIHARAA సభ్యత్వాలు. ఆ ఖచ్చితమైన మొత్తానికి మీ బ్యాంక్ స్టేట్‌మెంట్‌లో UTR చూడండి, తర్వాత ఆమోదించండి (ప్లాన్ రోజులు ఇప్పుడే మొదలవుతాయి) లేదా సభ్యునికి కనిపించే కారణంతో తిరస్కరించండి.',
      },
    ],
    keywords: ['approve payment', 'verify payment', 'membership payment', 'approve membership', 'pending payment', 'subscriptions', 'utr', 'reject payment', 'చెల్లింపు ఆమోద', 'చెల్లింపు ధృవీకరణ'],
    link: { to: '/admin/hariharaa-subscriptions', label: { en: 'Open subscriptions', te: 'సభ్యత్వాలు తెరవండి' } },
  },
  {
    id: 'admin-verify-order',
    audience: ADMIN,
    q: { en: 'How do I verify a UPI order payment and move an order along?', te: 'UPI ఆర్డర్ చెల్లింపును ఎలా ధృవీకరించి ఆర్డర్‌ను ముందుకు నడపాలి?' },
    a: [
      {
        en: 'Order queue → open the order → verify or reject the payment. A UPI order cannot be confirmed until it is verified. Then Confirm → Ship → Deliver (delivering a Cash on Delivery order marks it paid). The yellow shortcut lists UPI payments waiting.',
        te: 'ఆర్డర్ క్యూ → ఆర్డర్ తెరవండి → చెల్లింపును ధృవీకరించండి లేదా తిరస్కరించండి. ధృవీకరించే వరకు UPI ఆర్డర్‌ను నిర్ధారించలేరు. తర్వాత నిర్ధారించండి → పంపండి → డెలివరీ చేయండి (క్యాష్ ఆన్ డెలివరీ ఆర్డర్‌ను డెలివరీ చేస్తే అది చెల్లించినట్లు గుర్తించబడుతుంది). పసుపు షార్ట్‌కట్ వేచి ఉన్న UPI చెల్లింపులను చూపిస్తుంది.',
      },
    ],
    keywords: ['చెల్లింపును ఎలా ధృవీకరించి', 'upi ఆర్డర్ చెల్లింపు', 'ఆర్డర్‌ను ముందుకు', 'order queue', 'verify order', 'confirm order', 'ship order', 'deliver order', 'upi order', 'order payment', 'orders', 'ఆర్డర్ క్యూ', 'ఆర్డర్ ధృవీకరణ'],
    link: { to: '/marketplace/manage/orders', label: { en: 'Open order queue', te: 'ఆర్డర్ క్యూ తెరవండి' } },
  },
  {
    id: 'admin-cancel-order',
    audience: ADMIN,
    q: { en: 'What happens to stock when I cancel an order?', te: 'ఆర్డర్ రద్దు చేస్తే స్టాక్‌కు ఏమవుతుంది?' },
    a: [
      {
        en: 'Every item goes back on the shelf exactly once and a “Cancelled-order return” line appears in the product’s Stock history. Cancelling twice, or cancelling a delivered order, is refused.',
        te: 'ప్రతి వస్తువు సరిగ్గా ఒక్కసారి స్టాక్‌కు తిరిగి వెళ్తుంది, ఉత్పత్తి స్టాక్ చరిత్రలో “రద్దు చేసిన ఆర్డర్ తిరిగి” లైన్ కనిపిస్తుంది. రెండుసార్లు రద్దు చేయడం, లేదా డెలివరీ అయిన ఆర్డర్‌ను రద్దు చేయడం తిరస్కరించబడుతుంది.',
      },
    ],
    keywords: ['cancel order', 'cancel an order', 'restock', 'stock back', 'cancelled order', 'ఆర్డర్ రద్దు', 'రద్దు చేస్తే'],
  },
  {
    id: 'admin-add-product',
    audience: ADMIN,
    popular: true,
    q: { en: 'How do I add a new product?', te: 'కొత్త ఉత్పత్తిని ఎలా జోడించాలి?' },
    a: [
      {
        en: 'Shop → Manage products → Add new product. Enter name, description (10+ characters), price (₹0.01 to ₹10,00,000, at most 2 decimals), unit, opening stock and category. You land on the product screen to upload photos.',
        te: 'షాప్ → ఉత్పత్తులను నిర్వహించండి → కొత్త ఉత్పత్తిని జోడించండి. పేరు, వివరణ (10+ అక్షరాలు), ధర (₹0.01 నుండి ₹10,00,000 వరకు, గరిష్ఠంగా 2 దశాంశాలు), యూనిట్, ప్రారంభ స్టాక్, వర్గం నమోదు చేయండి. ఫోటోలు అప్‌లోడ్ చేయడానికి మీరు ఉత్పత్తి స్క్రీన్‌కు చేరతారు.',
      },
    ],
    keywords: ['add product', 'new product', 'create product', 'add item', 'product photo', 'upload photo', 'price of product', 'ఉత్పత్తి జోడ', 'కొత్త ఉత్పత్తి', 'ఫోటో అప్‌లోడ్', 'product add'],
    link: { to: '/marketplace/manage/products', label: { en: 'Manage products', te: 'ఉత్పత్తులను నిర్వహించండి' } },
  },
  {
    id: 'admin-stock',
    audience: ['ADMINISTRATOR', 'VENDOR'],
    popular: true,
    q: { en: 'How do I add or reduce stock?', te: 'స్టాక్‌ను ఎలా పెంచాలి లేదా తగ్గించాలి?' },
    a: [
      {
        en: 'Open the product and use the Stock panel. Add stock (reason optional), Reduce stock (reason required, never below zero), or Set to counted quantity after a stock-take (reason required). Every change is recorded in Stock history with who did it. Sales and cancellations adjust stock by themselves.',
        te: 'ఉత్పత్తిని తెరిచి స్టాక్ ప్యానెల్ వాడండి. స్టాక్ జోడించండి (కారణం ఐచ్ఛికం), స్టాక్ తగ్గించండి (కారణం తప్పనిసరి, సున్నా కంటే తక్కువ కాదు), లేదా లెక్కించిన తర్వాత లెక్కించిన పరిమాణానికి సెట్ చేయండి (కారణం తప్పనిసరి). ప్రతి మార్పు ఎవరు చేశారో సహా స్టాక్ చరిత్రలో నమోదవుతుంది. అమ్మకాలు, రద్దులు స్టాక్‌ను తామే సర్దుబాటు చేస్తాయి.',
      },
    ],
    keywords: ['stock', 'add stock', 'reduce stock', 'inventory', 'stock history', 'stock take', 'stocktake', 'counted', 'quantity', 'స్టాక్', 'స్టాక్ చరిత్ర', 'ఇన్వెంటరీ', 'stock peragali', 'stock tagginchali'],
  },
  {
    id: 'admin-negative-stock',
    audience: ['ADMINISTRATOR', 'VENDOR'],
    q: { en: 'Two people bought the last unit — can stock go negative?', te: 'ఇద్దరు చివరి యూనిట్‌ను కొంటే స్టాక్ మైనస్‌లోకి వెళ్తుందా?' },
    a: [
      {
        en: 'No. Stock is taken in one step that only succeeds while enough is on hand, so exactly one buyer gets the last unit and the other is told it is out of stock. Stock never goes below zero.',
        te: 'వెళ్ళదు. తగినంత ఉన్నప్పుడు మాత్రమే విజయవంతమయ్యే ఒకే దశలో స్టాక్ తీసుకోబడుతుంది, కాబట్టి ఒక్క కొనుగోలుదారుకే చివరి యూనిట్ దక్కుతుంది, మరొకరికి స్టాక్ లేదని చెప్పబడుతుంది. స్టాక్ ఎప్పుడూ సున్నా కంటే తక్కువ కాదు.',
      },
    ],
    keywords: ['negative stock', 'oversell', 'overselling', 'last unit', 'same time', 'minus stock', 'మైనస్'],
  },
  {
    id: 'admin-free-access',
    audience: ADMIN,
    q: { en: 'How do I give someone free access?', te: 'ఎవరికైనా ఉచిత ప్రాప్యత ఎలా ఇవ్వాలి?' },
    a: [
      {
        en: 'People → Members & free access. Find the person, choose “Give free access” and pick a date (up to 2 years). “Remove free access” ends it. Their paid days are never touched. You can search and filter by Paid, Free, Waiting, Unpaid or Expired.',
        te: 'వ్యక్తులు → సభ్యులు & ఉచిత ప్రాప్యత. వ్యక్తిని కనుగొని, “ఉచిత ప్రాప్యత ఇవ్వండి” ఎంచుకుని తేదీ ఎంచుకోండి (2 సంవత్సరాల వరకు). “ఉచిత ప్రాప్యత తొలగించండి” దాన్ని ముగిస్తుంది. వారి చెల్లించిన రోజులు మారవు. చెల్లించారు, ఉచితం, వేచి ఉంది, చెల్లించలేదు, గడువు ముగిసింది ద్వారా శోధించి ఫిల్టర్ చేయవచ్చు.',
      },
    ],
    keywords: ['free access', 'give access', 'unlock member', 'members list', 'members', 'give free', 'ఉచిత ప్రాప్యత ఇవ్వ', 'సభ్యులు'],
    link: { to: '/admin/members', label: { en: 'Open Members', te: 'సభ్యులు తెరవండి' } },
  },
  {
    id: 'admin-upi',
    audience: ADMIN,
    q: { en: 'How do I change the UPI ID customers pay to?', te: 'కస్టమర్లు చెల్లించే UPI IDని ఎలా మార్చాలి?' },
    a: [
      {
        en: 'Membership → Settings → Where payments go. Enter the new ID (it must look like name@bank), confirm, and it takes effect immediately in every QR code. Keep a spare ID on file and use Swap to switch. If the new ID belongs to a different merchant account, change or clear the merchant ID too. The change is recorded in the audit log.',
        te: 'సభ్యత్వం → సెట్టింగ్‌లు → చెల్లింపులు ఎక్కడికి వెళ్తాయి. కొత్త IDని నమోదు చేసి (name@bank లా ఉండాలి), ధృవీకరించండి; ప్రతి QR కోడ్‌లో వెంటనే అమలవుతుంది. స్పేర్ IDని ఫైల్‌లో ఉంచి స్వాప్‌తో మారండి. కొత్త ID వేరే మర్చంట్ ఖాతాకు చెందినదైతే మర్చంట్ IDని కూడా మార్చండి లేదా తొలగించండి. మార్పు ఆడిట్ లాగ్‌లో నమోదవుతుంది.',
      },
    ],
    keywords: ['upi id', 'change upi', 'payee', 'merchant', 'qr code', 'swap', 'payment settings', 'where payments go', 'UPI ID మార్చ', 'settings'],
    link: { to: '/admin/hariharaa-settings', label: { en: 'Open Settings', te: 'సెట్టింగ్‌లు తెరవండి' } },
  },
  {
    id: 'admin-plans',
    audience: ADMIN,
    q: { en: 'How do I set membership prices or turn membership off?', te: 'సభ్యత్వ ధరలను ఎలా నిర్ణయించాలి లేదా సభ్యత్వాన్ని ఎలా ఆఫ్ చేయాలి?' },
    a: [
      {
        en: 'Membership → Membership plans. Add plans of any length with a price, edit prices, or switch a plan Off (nothing is deleted; people who paid keep their days). The “Is membership required?” switch at the top turns the requirement off or on for everyone — use it briefly, and only when you mean to.',
        te: 'సభ్యత్వం → సభ్యత్వ ప్లాన్లు. ఏ వ్యవధి ప్లాన్‌నైనా ధరతో చేర్చండి, ధరలు మార్చండి, లేదా ప్లాన్‌ను ఆఫ్ చేయండి (ఏదీ తొలగించబడదు; చెల్లించినవారి రోజులు అలాగే ఉంటాయి). పైన ఉన్న “సభ్యత్వం అవసరమా?” స్విచ్ అందరికీ అవసరాన్ని ఆఫ్ లేదా ఆన్ చేస్తుంది — కొద్దిసేపు, అవసరమైనప్పుడు మాత్రమే వాడండి.',
      },
    ],
    keywords: ['plan', 'plans', 'price', 'membership price', 'monthly', 'yearly', 'membership switch', 'turn off membership', 'membership required', 'ధర', 'ప్లాన్లు', 'సభ్యత్వ స్విచ్'],
    link: { to: '/admin/membership-plans', label: { en: 'Open plans', te: 'ప్లాన్లు తెరవండి' } },
  },
  {
    id: 'admin-staff',
    audience: ADMIN,
    q: { en: 'How do I create a staff account or switch one off?', te: 'సిబ్బంది ఖాతాను ఎలా సృష్టించాలి లేదా ఆఫ్ చేయాలి?' },
    a: [
      {
        en: 'People → Staff accounts. Create experts, moderators, vendors, support agents and administrators with a temporary password (members sign themselves up). Deactivate locks an account out at once; Reactivate restores it. You cannot deactivate yourself or the last active administrator.',
        te: 'వ్యక్తులు → సిబ్బంది ఖాతాలు. తాత్కాలిక పాస్‌వర్డ్‌తో నిపుణులు, మోడరేటర్లు, విక్రేతలు, సపోర్ట్ ఏజెంట్లు, అడ్మినిస్ట్రేటర్లను సృష్టించండి (సభ్యులు తామే సైన్ అప్ అవుతారు). నిష్క్రియం చేస్తే ఖాతా వెంటనే లాక్ అవుతుంది; తిరిగి సక్రియం చేస్తే పునరుద్ధరించబడుతుంది. మిమ్మల్ని లేదా చివరి యాక్టివ్ అడ్మినిస్ట్రేటర్‌ను నిష్క్రియం చేయలేరు.',
      },
    ],
    keywords: ['staff', 'create staff', 'new staff', 'add user', 'deactivate', 'reactivate', 'moderator', 'expert account', 'support agent', 'సిబ్బంది', 'నిష్క్రియ'],
    link: { to: '/admin/staff', label: { en: 'Staff accounts', te: 'సిబ్బంది ఖాతాలు' } },
  },
  {
    id: 'admin-vendors',
    audience: ADMIN,
    q: { en: 'How do I approve a vendor?', te: 'విక్రేతను ఎలా ఆమోదించాలి?' },
    a: [
      {
        en: 'Shop → Vendor approvals. Review the business name and description, then approve or reject. Only approved vendors can list products; if you later un-approve one, their products vanish from the shop.',
        te: 'షాప్ → విక్రేత ఆమోదాలు. వ్యాపార పేరు, వివరణ సమీక్షించి ఆమోదించండి లేదా తిరస్కరించండి. ఆమోదించిన విక్రేతలు మాత్రమే ఉత్పత్తులను జాబితా చేయగలరు; తర్వాత ఆమోదం తొలగిస్తే వారి ఉత్పత్తులు షాప్ నుండి మాయమవుతాయి.',
      },
    ],
    keywords: ['vendor', 'vendors', 'approve vendor', 'vendor approval', 'seller', 'విక్రేత', 'విక్రేతలు'],
    link: { to: '/marketplace/manage/vendors', label: { en: 'Vendor approvals', te: 'విక్రేత ఆమోదాలు' } },
  },
  {
    id: 'admin-categories',
    audience: ADMIN,
    q: { en: 'How do I change the shop’s categories?', te: 'షాప్ వర్గాలను ఎలా మార్చాలి?' },
    a: [
      {
        en: 'Insights & setup → Taxonomy → Product categories. Add a department, categories inside it and sub-categories inside those (nothing goes deeper). Give each an optional Telugu name. Switching one off hides it from the shop without deleting anything.',
        te: 'నివేదికలు & సెటప్ → వర్గీకరణ → ఉత్పత్తి వర్గాలు. విభాగాన్ని, దానిలో వర్గాలను, వాటిలో ఉప-వర్గాలను చేర్చండి (దానికి మించి లోతుకు వెళ్ళదు). ప్రతిదానికి ఐచ్ఛిక తెలుగు పేరు ఇవ్వండి. ఒకదాన్ని ఆఫ్ చేస్తే ఏదీ తొలగించకుండా షాప్ నుండి దాచబడుతుంది.',
      },
    ],
    keywords: ['షాప్ వర్గాలను', 'వర్గాలను ఎలా మార్చాలి', 'taxonomy', 'categories', 'department', 'sub-category', 'subcategory', 'product categories', 'crops', 'regions', 'వర్గీకరణ', 'వర్గాలు'],
    link: { to: '/admin/taxonomy', label: { en: 'Open Taxonomy', te: 'వర్గీకరణ తెరవండి' } },
  },
  {
    id: 'admin-reports',
    audience: ADMIN,
    q: { en: 'Where are reports, the audit log and uploaded files?', te: 'నివేదికలు, ఆడిట్ లాగ్, అప్‌లోడ్ చేసిన ఫైళ్ళు ఎక్కడ?' },
    a: [
      {
        en: 'Insights & setup → Reports (cases, articles, expert workload, accounts) and Audit log (every important action and who did it, filterable by type and date). Content → Media library lists every uploaded photo, video and PDF in one sortable table.',
        te: 'నివేదికలు & సెటప్ → నివేదికలు (కేసులు, వ్యాసాలు, నిపుణుల పని, ఖాతాలు), ఆడిట్ లాగ్ (ప్రతి ముఖ్యమైన చర్య, ఎవరు చేశారు, రకం, తేదీ ద్వారా ఫిల్టర్). కంటెంట్ → మీడియా లైబ్రరీ అప్‌లోడ్ చేసిన ప్రతి ఫోటో, వీడియో, PDFను ఒక క్రమబద్ధీకరించదగిన పట్టికలో చూపిస్తుంది.',
      },
    ],
    keywords: ['report', 'reports', 'audit', 'audit log', 'media', 'media library', 'uploads', 'history of changes', 'who changed', 'నివేదిక', 'ఆడిట్', 'మీడియా'],
    link: { to: '/admin/reports', label: { en: 'Open Reports', te: 'నివేదికలు తెరవండి' } },
  },
  {
    id: 'admin-credentials',
    audience: ADMIN,
    q: { en: 'How do I verify an expert’s qualifications?', te: 'నిపుణుడి అర్హతలను ఎలా ధృవీకరించాలి?' },
    a: [
      {
        en: 'People → Expert credentials. Open the pending qualification, review it and approve or reject. Cases can only be assigned to verified experts.',
        te: 'వ్యక్తులు → నిపుణుల ధృవపత్రాలు. పెండింగ్ అర్హతను తెరిచి, సమీక్షించి ఆమోదించండి లేదా తిరస్కరించండి. ధృవీకరించిన నిపుణులకు మాత్రమే కేసులు కేటాయించబడతాయి.',
      },
    ],
    keywords: ['credential', 'credentials', 'qualification', 'qualifications', 'verify expert', 'అర్హత', 'అర్హతలు'],
    link: { to: '/admin/credentials', label: { en: 'Expert credentials', te: 'నిపుణుల ధృవపత్రాలు' } },
  },

  {
    id: 'admin-temp-password',
    audience: ADMIN,
    popular: true,
    q: { en: 'Someone forgot their password — what do I do?', te: 'ఎవరో పాస్‌వర్డ్ మర్చిపోయారు — నేనేం చేయాలి?' },
    a: [
      {
        en: 'You get a bell notification “Password reset requested” when someone asks. Check it really is them (for example call the number on their account, or confirm their ID and recent order). Then People → Members & free access (or Staff accounts) → “Temporary password” → Issue password. Read the one-time password out to them; it is shown only once. Their old password stops working and they choose their own at the next log in. Every use is recorded in the audit log (never the password itself).',
        te: 'ఎవరైనా అడిగినప్పుడు మీకు బెల్ నోటిఫికేషన్ “పాస్‌వర్డ్ రీసెట్ అభ్యర్థన” వస్తుంది. నిజంగా వారేనని నిర్ధారించుకోండి (ఉదాహరణకు వారి ఖాతాలోని నంబర్‌కు ఫోన్ చేయండి, లేదా వారి ID, ఇటీవలి ఆర్డర్‌ను నిర్ధారించుకోండి). తర్వాత వ్యక్తులు → సభ్యులు & ఉచిత ప్రాప్యత (లేదా సిబ్బంది ఖాతాలు) → “తాత్కాలిక పాస్‌వర్డ్” → పాస్‌వర్డ్ ఇవ్వండి. ఒక్కసారి వాడే పాస్‌వర్డ్‌ను వారికి చదివి చెప్పండి; అది ఒక్కసారి మాత్రమే కనిపిస్తుంది. వారి పాత పాస్‌వర్డ్ పనిచేయదు, తదుపరి లాగిన్‌లో వారు తమ స్వంతదాన్ని ఎంచుకుంటారు. ప్రతి వినియోగం ఆడిట్ లాగ్‌లో నమోదవుతుంది (పాస్‌వర్డ్ మాత్రం కాదు).',
      },
    ],
    keywords: ['someone forgot', 'forgot their password', 'member forgot password', 'someone forgot their password', 'ఎవరో పాస్‌వర్డ్ మర్చి', 'పాస్‌వర్డ్ మర్చిపోయారు', 'ఎవరో పాస్‌వర్డ్', 'forgot password', 'reset password', 'member forgot', 'temporary password', 'temp password', 'password reset requested', 'issue password', 'unlock account', 'పాస్‌వర్డ్ మర్చి', 'తాత్కాలిక పాస్‌వర్డ్'],
    link: { to: '/admin/members', label: { en: 'Open Members', te: 'సభ్యులు తెరవండి' } },
  },
  {
    id: 'admin-lost-admin-password',
    audience: ADMIN,
    q: { en: 'I am the only administrator and I lost my password', te: 'నేనే ఏకైక అడ్మినిస్ట్రేటర్‌ని, నా పాస్‌వర్డ్ పోయింది' },
    a: [
      {
        en: 'Another administrator can issue you a temporary password. If you are the only one, whoever manages the server runs one command in app/backend: npm run admin:reset-password -- <your mobile number>. It prints a temporary password and you choose your own at the next log in. It is also the way to replace the seeded first password.',
        te: 'మరో అడ్మినిస్ట్రేటర్ మీకు తాత్కాలిక పాస్‌వర్డ్ ఇవ్వగలరు. మీరు ఒక్కరే అయితే, సర్వర్‌ను నిర్వహించే వ్యక్తి app/backend లో ఒక కమాండ్ నడపాలి: npm run admin:reset-password -- <మీ మొబైల్ నంబర్>. అది తాత్కాలిక పాస్‌వర్డ్ ఇస్తుంది, తదుపరి లాగిన్‌లో మీరు మీ స్వంతదాన్ని ఎంచుకుంటారు. మొదటి సీడ్ పాస్‌వర్డ్‌ను మార్చడానికి కూడా ఇదే మార్గం.',
      },
    ],
    keywords: ['only administrator', 'lost admin password', 'admin locked out', 'cannot log in as admin', 'reset admin password', 'command line', 'అడ్మిన్ పాస్‌వర్డ్', 'ఏకైక అడ్మినిస్ట్రేటర్'],
  },
  {
    id: 'admin-usage',
    audience: ADMIN,
    q: { en: 'How do I see what people use and what the assistant could not answer?', te: 'ప్రజలు ఏమి వాడుతున్నారో, అసిస్టెంట్ ఏది సమాధానం ఇవ్వలేకపోయిందో ఎలా చూడాలి?' },
    a: [
      {
        en: 'Insights & setup → Usage & questions. It shows, for the last 7–90 days, the most opened screens, the help-assistant questions it could not answer (each is a missing FAQ answer — add it in help/faq.ts), the answers it gave, how the guided tour ended, and errors people hit. Only counts are kept — no names, numbers or passwords — for 90 days.',
        te: 'నివేదికలు & సెటప్ → వినియోగం & ప్రశ్నలు. గత 7–90 రోజులకు ఎక్కువగా తెరిచిన స్క్రీన్‌లు, సహాయ అసిస్టెంట్ సమాధానం ఇవ్వలేకపోయిన ప్రశ్నలు (ప్రతి ఒక్కటి లేని FAQ సమాధానం — help/faq.ts లో చేర్చండి), అది ఇచ్చిన సమాధానాలు, గైడెడ్ టూర్ ఎలా ముగిసింది, ప్రజలు ఎదుర్కొన్న లోపాలు చూపిస్తుంది. లెక్కలు మాత్రమే — పేర్లు, నంబర్లు, పాస్‌వర్డ్‌లు కాదు — 90 రోజులు ఉంచబడతాయి.',
      },
    ],
    keywords: ['what people use', 'what the assistant could not answer', 'ప్రజలు ఏమి వాడుతున్నారో', 'అసిస్టెంట్ ఏది సమాధానం', 'సమాధానం ఇవ్వలేకపోయింది', 'ఎలా చూడాలి వాడుతున్నారో', 'usage', 'statistics', 'analytics', 'unanswered', 'what do people use', 'errors reported', 'most visited', 'page views', 'వినియోగం', 'గణాంకాలు', 'సమాధానం ఇవ్వలేని'],
    link: { to: '/admin/usage', label: { en: 'Open Usage', te: 'వినియోగం తెరవండి' } },
  },
  {
    id: 'admin-seasonal',
    audience: ['ADMINISTRATOR', 'MODERATOR'],
    q: { en: 'How do I add a seasonal tip for members?', te: 'సభ్యుల కోసం సీజన్ చిట్కాను ఎలా జోడించాలి?' },
    a: [
      {
        en: 'Content → Seasonal tips → Add a tip. Write a short title and message in English and in Telugu, choose the first and last month (a season may run over the new year, for example November to February), and optionally a crop so that only members who grow it see the tip. Members with access see up to three tips in season, crop-specific ones first, on their Today panel. Switch a tip off to hide it without deleting it. The list sorts, searches and filters by season, status and crop.',
        te: 'కంటెంట్ → సీజన్ చిట్కాలు → చిట్కా జోడించండి. ఇంగ్లీష్‌లో, తెలుగులో చిన్న శీర్షిక, సందేశం రాయండి, మొదటి, చివరి నెలను ఎంచుకోండి (సీజన్ కొత్త సంవత్సరం దాటి ఉండవచ్చు, ఉదాహరణకు నవంబర్ నుండి ఫిబ్రవరి), కావాలంటే పంటను కూడా ఎంచుకోండి — అప్పుడు ఆ పంట పండించే సభ్యులకు మాత్రమే కనిపిస్తుంది. యాక్సెస్ ఉన్న సభ్యులు సీజన్‌లో ఉన్న మూడు చిట్కాల వరకు (పంట-నిర్దిష్టమైనవి ముందు) తమ ఈ రోజు ప్యానెల్‌లో చూస్తారు. తొలగించకుండా దాచడానికి చిట్కాను ఆఫ్ చేయండి. జాబితా సీజన్, స్థితి, పంట ద్వారా క్రమబద్ధీకరించి, శోధించి, ఫిల్టర్ చేయవచ్చు.',
      },
    ],
    keywords: ['seasonal tip', 'add tip', 'add a tip', 'add seasonal', 'new tip', 'tips for members', 'సీజన్ చిట్కా', 'చిట్కా జోడ'],
    link: { to: '/admin/seasonal', label: { en: 'Seasonal tips', te: 'సీజన్ చిట్కాలు' } },
  },
  {
    id: 'admin-restock',
    audience: ADMIN,
    q: { en: 'How much should I reorder?', te: 'ఎంత తిరిగి ఆర్డర్ చేయాలి?' },
    a: [
      {
        en: 'Manage products shows “Running low — what to restock” at the top whenever something is at or below its warning level. For each product it lists what it sold in the last 30 days (cancelled orders do not count) and a suggested quantity: enough for the next 30 days at that rate, plus a quarter extra, minus what is in stock. A product that has not sold lately gets no suggestion rather than a guess. Click a product to add stock when it arrives.',
        te: 'ఏదైనా దాని హెచ్చరిక స్థాయి లేదా అంతకంటే తక్కువగా ఉన్నప్పుడల్లా ఉత్పత్తులను నిర్వహించండి పైన “తక్కువగా ఉన్నవి — ఏవి తిరిగి తెప్పించాలి” చూపిస్తుంది. ప్రతి ఉత్పత్తికి గత 30 రోజుల్లో అమ్మినవి (రద్దు చేసిన ఆర్డర్లు లెక్కలోకి రావు), సూచించిన పరిమాణం చూపిస్తుంది: ఆ రేటుతో తర్వాతి 30 రోజులకు సరిపడా, పావు వంతు అదనం, స్టాక్‌లో ఉన్నది తీసివేసి. ఇటీవల అమ్ముడుపోని ఉత్పత్తికి ఊహ కాకుండా ఏ సూచనా ఇవ్వదు. స్టాక్ వచ్చినప్పుడు జోడించడానికి ఉత్పత్తిని తాకండి.',
      },
    ],
    keywords: ['reorder', 're-order', 'restock', 'how much to order', 'how much should i order', 'order from supplier', 'purchase order', 'what to restock', 'తిరిగి ఆర్డర్', 'ఎంత ఆర్డర్', 'రీస్టాక్'],
    link: { to: '/marketplace/manage/products', label: { en: 'Manage products', te: 'ఉత్పత్తులను నిర్వహించండి' } },
  },
  {
    id: 'admin-low-stock',
    audience: ['ADMINISTRATOR', 'VENDOR'],
    q: { en: 'How will I know when stock is running low?', te: 'స్టాక్ తక్కువైనప్పుడు నాకు ఎలా తెలుస్తుంది?' },
    a: [
      {
        en: 'When a sale takes a product down to its warning level, the administrators (and the selling vendor) get a bell notification “Running low on stock”, and another when it reaches zero. Each is sent once, when the line is crossed. The level is 5 unless you set one: on a product’s create or edit screen, “Warn me when stock is at or below” (put 0 to be warned only when it is all gone; empty goes back to 5). In Manage products use the Stock filter (Low or Out of stock) to see them all. Members who asked to be told when it returns are notified the moment you add stock.',
        te: 'అమ్మకం వల్ల ఉత్పత్తి దాని హెచ్చరిక స్థాయికి వచ్చినప్పుడు, అడ్మినిస్ట్రేటర్లకు (మరియు అమ్మే విక్రేతకు) బెల్ నోటిఫికేషన్ “స్టాక్ తక్కువగా ఉంది” వస్తుంది, సున్నాకు చేరినప్పుడు మరొకటి. ప్రతి ఒక్కటి ఆ గీతను దాటినప్పుడు ఒక్కసారి పంపబడుతుంది. మీరు సెట్ చేయకపోతే స్థాయి 5: ఉత్పత్తి సృష్టించే లేదా సవరించే స్క్రీన్‌లో “స్టాక్ ఇంత లేదా తక్కువకు వచ్చినప్పుడు నాకు చెప్పండి” (పూర్తిగా అయిపోయినప్పుడు మాత్రమే చెప్పాలంటే 0 పెట్టండి; ఖాళీ చేస్తే 5 కు తిరిగి వెళ్తుంది). ఉత్పత్తులను నిర్వహించండిలో స్టాక్ ఫిల్టర్ (తక్కువ లేదా స్టాక్ లేదు) వాడి అన్నింటినీ చూడండి. తిరిగి వచ్చినప్పుడు చెప్పమని అడిగిన సభ్యులకు మీరు స్టాక్ జోడించిన క్షణంలోనే తెలియజేయబడుతుంది.',
      },
    ],
    keywords: ['low stock', 'running low', 'stock alert', 'stock low', 'out of stock alert', 'reorder level', 'warning level', 'warn me when stock', 'స్టాక్ తక్కువ', 'స్టాక్ అలర్ట్'],
    link: { to: '/marketplace/manage/products', label: { en: 'Manage products', te: 'ఉత్పత్తులను నిర్వహించండి' } },
  },

  // ------------------------------------------------------- other staff roles
  {
    id: 'vendor-start',
    audience: ['VENDOR'],
    popular: true,
    q: { en: 'How do I start selling?', te: 'అమ్మకం ఎలా ప్రారంభించాలి?' },
    a: [
      {
        en: 'On your dashboard submit your business name and description. An administrator must approve it; until then you cannot list products. After approval use Add product: name, description, price, unit, opening stock and category, then upload photos on the product screen.',
        te: 'మీ డాష్‌బోర్డ్‌లో వ్యాపార పేరు, వివరణ సమర్పించండి. అడ్మినిస్ట్రేటర్ ఆమోదించాలి; అప్పటి వరకు ఉత్పత్తులను జాబితా చేయలేరు. ఆమోదం తర్వాత ఉత్పత్తి జోడించండి వాడండి: పేరు, వివరణ, ధర, యూనిట్, ప్రారంభ స్టాక్, వర్గం, తర్వాత ఉత్పత్తి స్క్రీన్‌లో ఫోటోలు అప్‌లోడ్ చేయండి.',
      },
    ],
    keywords: ['sell', 'selling', 'start selling', 'list product', 'add product', 'approval', 'vendor profile', 'అమ్మ', 'జాబితా', 'ఆమోదం'],
    link: { to: '/marketplace/vendor', label: { en: 'Vendor dashboard', te: 'విక్రేత డాష్‌బోర్డ్' } },
  },
  {
    id: 'vendor-own-products',
    audience: ['VENDOR'],
    q: { en: 'Can other vendors see or change my products?', te: 'ఇతర విక్రేతలు నా ఉత్పత్తులను చూడగలరా లేదా మార్చగలరా?' },
    a: [
      {
        en: 'No. Only you (and administrators) can edit your products, change their stock or read their stock history. Other vendors are refused.',
        te: 'లేదు. మీరు (మరియు అడ్మినిస్ట్రేటర్లు) మాత్రమే మీ ఉత్పత్తులను సవరించగలరు, స్టాక్ మార్చగలరు, స్టాక్ చరిత్ర చదవగలరు. ఇతర విక్రేతలకు అనుమతి లేదు.',
      },
    ],
    keywords: ['other vendors', 'my products', 'private', 'who can see', 'ఇతర విక్రేతలు'],
  },
  {
    id: 'expert-start',
    audience: ['EXPERT'],
    popular: true,
    q: { en: 'How do I start answering cases?', te: 'కేసులకు సమాధానం ఇవ్వడం ఎలా ప్రారంభించాలి?' },
    a: [
      {
        en: 'Submit your qualifications first; once an administrator verifies you, cases can be assigned to you. Open a case, read the photos, then answer or ask the farmer for more detail. Closed cases become draft articles you can edit and send for review.',
        te: 'ముందు మీ అర్హతలను సమర్పించండి; అడ్మినిస్ట్రేటర్ ధృవీకరించిన తర్వాత మీకు కేసులు కేటాయించబడతాయి. కేసు తెరిచి, ఫోటోలు చూసి, సమాధానం ఇవ్వండి లేదా రైతును మరిన్ని వివరాలు అడగండి. ముగిసిన కేసులు మీరు సవరించి సమీక్షకు పంపగల డ్రాఫ్ట్ వ్యాసాలు అవుతాయి.',
      },
    ],
    keywords: ['answer case', 'cases', 'qualification', 'credentials', 'article', 'draft', 'కేసు', 'సమాధానం', 'వ్యాసం'],
    link: { to: '/expert/cases', label: { en: 'My cases', te: 'నా కేసులు' } },
  },
  {
    id: 'moderator-start',
    audience: ['MODERATOR'],
    popular: true,
    q: { en: 'What do I do as a moderator?', te: 'మోడరేటర్‌గా నేను ఏం చేయాలి?' },
    a: [
      {
        en: 'Assign new cases to a verified expert (case queue), approve, reject or return articles with notes (article review — a rejection needs a reason), build and publish courses (a course needs at least one lesson), and move soil samples through each stage to the report.',
        te: 'కొత్త కేసులను ధృవీకరించిన నిపుణుడికి కేటాయించండి (కేసు క్యూ), వ్యాసాలను ఆమోదించండి, తిరస్కరించండి లేదా నోట్స్‌తో తిరిగి పంపండి (వ్యాసాల సమీక్ష — తిరస్కరణకు కారణం అవసరం), కోర్సులను తయారు చేసి ప్రచురించండి (కోర్సుకు కనీసం ఒక పాఠం కావాలి), నేల నమూనాలను ప్రతి దశ ద్వారా నివేదిక వరకు తరలించండి.',
      },
    ],
    keywords: ['moderator', 'assign case', 'review article', 'publish course', 'soil queue', 'queue', 'మోడరేటర్', 'క్యూ'],
    link: { to: '/moderator/queue', label: { en: 'Case queue', te: 'కేసు క్యూ' } },
  },
  {
    id: 'support-dispatch',
    audience: ['SUPPORT_AGENT'],
    popular: true,
    q: { en: 'How do I dispatch an order?', te: 'ఆర్డర్‌ను ఎలా పంపాలి?' },
    a: [
      {
        en: 'The dispatch queue shows orders ready to pack (Cash on Delivery, or UPI already verified) with the receiver’s city, PIN and phone. Open one, pack what you have and mark each item Sent; leave the rest Pending. Untick “ready to pack only” to see everything.',
        te: 'డిస్పాచ్ క్యూ ప్యాక్ చేయడానికి సిద్ధమైన ఆర్డర్లను (క్యాష్ ఆన్ డెలివరీ, లేదా ఇప్పటికే ధృవీకరించిన UPI) స్వీకర్త నగరం, పిన్, ఫోన్‌తో చూపిస్తుంది. ఒకదాన్ని తెరిచి, ఉన్నది ప్యాక్ చేసి ప్రతి వస్తువును పంపబడింది అని గుర్తించండి; మిగతావి పెండింగ్‌లో ఉంచండి. అన్నీ చూడటానికి “ప్యాక్ చేయడానికి సిద్ధమైనవి మాత్రమే” టిక్ తీసేయండి.',
      },
    ],
    keywords: ['ఆర్డర్ పంప', 'ఆర్డర్‌ను ఎలా పంప', 'dispatch order', 'pack order', 'dispatch', 'pack', 'packing', 'send item', 'mark sent', 'ready to pack', 'డిస్పాచ్', 'ప్యాక్'],
    link: { to: '/support/dispatch-queue', label: { en: 'Dispatch queue', te: 'డిస్పాచ్ క్యూ' } },
  },
];

export function faqsFor(audience: Audience): Faq[] {
  return FAQS.filter((f) => f.audience === 'ALL' || f.audience.includes(audience));
}
