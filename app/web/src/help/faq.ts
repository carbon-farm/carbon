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
        en: 'Sign-up and password-reset codes are not texted yet. The 6-digit code appears on the screen itself, under a red “Temporary” banner. Type that in.',
        te: 'సైన్-అప్, పాస్‌వర్డ్ రీసెట్ కోడ్‌లు ఇంకా SMS ద్వారా రావు. 6 అంకెల కోడ్ ఎరుపు “తాత్కాలికం” బ్యానర్ కింద స్క్రీన్‌పైనే కనిపిస్తుంది. దాన్ని టైప్ చేయండి.',
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
        en: 'On the log-in screen choose “Forgot password”. Enter your mobile number, type the 6-digit code shown on screen, then choose a new password.',
        te: 'లాగిన్ స్క్రీన్‌లో “పాస్‌వర్డ్ మర్చిపోయారా” ఎంచుకోండి. మీ మొబైల్ నంబర్ నమోదు చేసి, స్క్రీన్‌పై కనిపించే 6 అంకెల కోడ్ టైప్ చేసి, కొత్త పాస్‌వర్డ్ ఎంచుకోండి.',
      },
    ],
    keywords: ['forgot password', 'forgot my password', 'reset password', 'lost password', 'cannot log in', 'cant login', "can't login", 'unable to login', 'పాస్‌వర్డ్ మర్చిపోయ', 'పాస్‌వర్డ్ మర్చి', 'password marchipoyanu', 'password marchipoya'],
    link: { to: '/forgot-password', label: { en: 'Reset my password', te: 'నా పాస్‌వర్డ్ రీసెట్ చేయండి' } },
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
        en: 'Open Account in the top bar, enter your current password and a new one. You will be logged out afterwards and sign in again with the new password.',
        te: 'పై బార్‌లో ఖాతా తెరిచి, మీ ప్రస్తుత పాస్‌వర్డ్, కొత్తది నమోదు చేయండి. ఆ తర్వాత మీరు లాగ్ అవుట్ అవుతారు; కొత్త పాస్‌వర్డ్‌తో మళ్ళీ సైన్ ఇన్ అవ్వండి.',
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
        en: 'Open My cases → New case. Choose the category, add your crop, describe the problem and attach photos. A moderator passes it to the right expert. You get a bell notification when they answer, and you can reply if they need more detail.',
        te: 'నా కేసులు → కొత్త కేసు తెరవండి. వర్గం ఎంచుకుని, మీ పంట జోడించి, సమస్యను వివరించి ఫోటోలు జోడించండి. మోడరేటర్ దాన్ని సరైన నిపుణుడికి పంపుతారు. వారు సమాధానం ఇచ్చినప్పుడు బెల్ నోటిఫికేషన్ వస్తుంది; మరిన్ని వివరాలు అడిగితే మీరు బదులివ్వవచ్చు.',
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
