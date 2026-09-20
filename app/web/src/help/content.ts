import type { Audience } from '../tour/steps';

export interface HelpText {
  en: string;
  te: string;
}

export interface HelpSection {
  id: string;
  audience: Audience[] | 'ALL';
  title: HelpText;
  // One entry per paragraph, each in English then Telugu.
  body: HelpText[];
}

const MEMBERS: Audience[] = ['MEMBER'];
const SHOPPERS: Audience[] = ['GUEST', 'MEMBER'];

// The Help page. Kept in plain language and in step with the app: change a screen, change its
// entry here (and the tour in tour/steps.ts).
export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'language',
    audience: 'ALL',
    title: { en: 'Everything is in English and Telugu', te: 'అంతా ఇంగ్లీష్, తెలుగులో ఉంటుంది' },
    body: [
      {
        en: 'Every screen, button and message shows English first, then Telugu underneath. Nothing needs a language setting.',
        te: 'ప్రతి స్క్రీన్, బటన్, సందేశం మొదట ఇంగ్లీష్‌లో, దాని కింద తెలుగులో కనిపిస్తుంది. భాష సెట్టింగ్ అవసరం లేదు.',
      },
    ],
  },
  {
    id: 'shop',
    audience: SHOPPERS,
    title: { en: 'Browsing the shop', te: 'షాప్‌ను చూడటం' },
    body: [
      {
        en: 'You do not need an account to look around. Open Marketplace to see farm inputs and natural foods together.',
        te: 'చూడటానికి ఖాతా అవసరం లేదు. వ్యవసాయ ఇన్‌పుట్లు, సహజ ఆహారాలు కలిపి చూడటానికి మార్కెట్‌ప్లేస్ తెరవండి.',
      },
      {
        en: 'Use Department, then Category, then Sub-category to narrow the list. You can also search by name and sort by price, name or newest.',
        te: 'జాబితాను తగ్గించడానికి విభాగం, తర్వాత వర్గం, తర్వాత ఉప-వర్గం ఉపయోగించండి. పేరుతో శోధించి, ధర, పేరు లేదా కొత్తవి ప్రకారం క్రమబద్ధీకరించవచ్చు.',
      },
      {
        en: 'Open a product to see its photos, price, stock and reviews. “Out of stock” items cannot be added to the cart.',
        te: 'ఫోటోలు, ధర, స్టాక్, సమీక్షలు చూడటానికి ఉత్పత్తిని తెరవండి. “స్టాక్ లేదు” వస్తువులను కార్ట్‌కు జోడించలేరు.',
      },
    ],
  },
  {
    id: 'cart',
    audience: SHOPPERS,
    title: { en: 'Your cart', te: 'మీ కార్ట్' },
    body: [
      {
        en: 'Add products to your cart and change quantities any time. If you are not logged in, your cart is kept on this device and joins your account when you log in or register.',
        te: 'ఉత్పత్తులను కార్ట్‌కు జోడించి ఎప్పుడైనా పరిమాణాలు మార్చండి. మీరు లాగిన్ కాకపోతే, కార్ట్ ఈ పరికరంలో ఉంటుంది; లాగిన్ లేదా నమోదు చేసినప్పుడు అది మీ ఖాతాలో చేరుతుంది.',
      },
      {
        en: 'Checking out needs an account and an active membership. Your cart is safe while you sort that out.',
        te: 'చెక్అవుట్‌కు ఖాతా, యాక్టివ్ సభ్యత్వం అవసరం. మీరు అది సరిచేసుకునే వరకు మీ కార్ట్ భద్రంగా ఉంటుంది.',
      },
    ],
  },
  {
    id: 'account',
    audience: ['GUEST'],
    title: { en: 'Creating an account', te: 'ఖాతా సృష్టించడం' },
    body: [
      {
        en: 'Register with your name, mobile number and a password (at least 8 characters). A 6-digit code is shown on the screen — type it in to finish. Everyone has the same kind of account.',
        te: 'మీ పేరు, మొబైల్ నంబర్, పాస్‌వర్డ్ (కనీసం 8 అక్షరాలు)తో నమోదు చేసుకోండి. 6 అంకెల కోడ్ స్క్రీన్‌పై కనిపిస్తుంది — పూర్తి చేయడానికి దాన్ని నమోదు చేయండి. అందరికీ ఒకే రకమైన ఖాతా.',
      },
      {
        en: 'You get a personal ID such as HHC-0042. It is shown in the top bar and is how we recognise your payments.',
        te: 'మీకు HHC-0042 వంటి వ్యక్తిగత ID వస్తుంది. ఇది పైన బార్‌లో కనిపిస్తుంది, మీ చెల్లింపులను గుర్తించడానికి ఇదే ఉపయోగపడుతుంది.',
      },
    ],
  },
  {
    id: 'membership',
    audience: MEMBERS,
    title: { en: 'Membership: what it unlocks and how to pay', te: 'సభ్యత్వం: ఏం అన్‌లాక్ అవుతుంది, ఎలా చెల్లించాలి' },
    body: [
      {
        en: 'A paid membership unlocks checkout and the farm-advice features: My cases, Knowledge, Courses and Soil Testing. Anyone can still browse and fill a cart.',
        te: 'చెల్లించిన సభ్యత్వం చెక్అవుట్, వ్యవసాయ సలహా సౌకర్యాలను అన్‌లాక్ చేస్తుంది: నా కేసులు, జ్ఞానం, కోర్సులు, నేల పరీక్ష. బ్రౌజ్ చేయడం, కార్ట్ నింపడం అందరికీ ఇంకా సాధ్యమే.',
      },
      {
        en: 'To pay: open My subscription, tap Pay now, scan the QR with any UPI app (or use the payment link), pay the shown amount, then type the UTR / reference number from your UPI app and submit.',
        te: 'చెల్లించడానికి: నా సభ్యత్వం తెరిచి, ఇప్పుడే చెల్లించండి తాకి, ఏదైనా UPI యాప్‌తో QR స్కాన్ చేసి (లేదా చెల్లింపు లింక్ వాడి), చూపిన మొత్తాన్ని చెల్లించి, మీ UPI యాప్‌లోని UTR / రిఫరెన్స్ నంబర్‌ను నమోదు చేసి సమర్పించండి.',
      },
      {
        en: 'We check the payment in our bank and confirm it — usually the same day. The yellow strip under the top bar disappears by itself and everything unlocks. If we cannot find the payment, you will see the reason and can try again.',
        te: 'మేము మా బ్యాంకులో చెల్లింపును తనిఖీ చేసి నిర్ధారిస్తాము — సాధారణంగా అదే రోజు. పై బార్ కింద ఉన్న పసుపు స్ట్రిప్ దానంతట అదే మాయమై అన్నీ అన్‌లాక్ అవుతాయి. చెల్లింపు కనిపించకపోతే కారణం కనిపిస్తుంది, మళ్ళీ ప్రయత్నించవచ్చు.',
      },
      {
        en: 'Renewing early is never wasted: new days are added after the days you already have. Free access given by an administrator is shown as “Free access until …”.',
        te: 'ముందే పునరుద్ధరించినా వృధా కాదు: కొత్త రోజులు మీకు ఇప్పటికే ఉన్న రోజుల తర్వాత చేరతాయి. అడ్మినిస్ట్రేటర్ ఇచ్చిన ఉచిత ప్రాప్యత “… వరకు ఉచిత ప్రాప్యత” అని కనిపిస్తుంది.',
      },
    ],
  },
  {
    id: 'checkout',
    audience: MEMBERS,
    title: { en: 'Checkout, addresses and paying for an order', te: 'చెక్అవుట్, చిరునామాలు, ఆర్డర్‌కు చెల్లింపు' },
    body: [
      {
        en: 'From your cart choose Proceed to checkout. Pick a saved address or add a new one: receiver name, phone, house/street, town, state and 6-digit PIN are needed; landmark, second phone and email are optional.',
        te: 'కార్ట్ నుండి చెక్అవుట్‌కు వెళ్ళండి ఎంచుకోండి. సేవ్ చేసిన చిరునామాను ఎంచుకోండి లేదా కొత్తది చేర్చండి: స్వీకర్త పేరు, ఫోన్, ఇంటి నంబర్/వీధి, పట్టణం, రాష్ట్రం, 6 అంకెల పిన్ అవసరం; ల్యాండ్‌మార్క్, రెండవ ఫోన్, ఇమెయిల్ ఐచ్ఛికం.',
      },
      {
        en: 'Choose Cash on Delivery (pay when it arrives) or UPI. For UPI, open the order, tap Pay now, pay the exact total, and submit the UTR. We verify it before we pack your order.',
        te: 'క్యాష్ ఆన్ డెలివరీ (అందినప్పుడు చెల్లించండి) లేదా UPI ఎంచుకోండి. UPI కోసం ఆర్డర్ తెరిచి, ఇప్పుడే చెల్లించండి తాకి, ఖచ్చితమైన మొత్తం చెల్లించి, UTR సమర్పించండి. మేము మీ ఆర్డర్‌ను ప్యాక్ చేసే ముందు దాన్ని ధృవీకరిస్తాము.',
      },
      {
        en: 'Your addresses are saved under Addresses. Changing a saved address never changes an order you already placed.',
        te: 'మీ చిరునామాలు చిరునామాలు లో సేవ్ అవుతాయి. సేవ్ చేసిన చిరునామాను మార్చినా, మీరు ఇప్పటికే చేసిన ఆర్డర్ మారదు.',
      },
    ],
  },
  {
    id: 'orders',
    audience: MEMBERS,
    title: { en: 'Following your orders', te: 'మీ ఆర్డర్లను అనుసరించడం' },
    body: [
      {
        en: 'My orders lists everything you have bought. Open an order to see its status (Placed, Confirmed, Shipped, Delivered) and its payment status.',
        te: 'నా ఆర్డర్‌లు మీరు కొన్నవన్నీ చూపిస్తుంది. స్థితి (చేయబడింది, నిర్ధారించబడింది, పంపబడింది, డెలివరీ అయింది), చెల్లింపు స్థితి చూడటానికి ఆర్డర్ తెరవండి.',
      },
      {
        en: 'Each item also shows Sent or Pending. If some stock is short we send what is available first — pending items follow.',
        te: 'ప్రతి వస్తువు పంపబడింది లేదా పెండింగ్ అని కూడా చూపిస్తుంది. కొంత స్టాక్ తక్కువైతే, ఉన్నది మొదట పంపుతాము — పెండింగ్ వస్తువులు తర్వాత వస్తాయి.',
      },
    ],
  },
  {
    id: 'advice',
    audience: MEMBERS,
    title: { en: 'Farm advice: cases, knowledge, courses, soil tests', te: 'వ్యవసాయ సలహా: కేసులు, జ్ఞానం, కోర్సులు, నేల పరీక్షలు' },
    body: [
      {
        en: 'My cases: describe a problem with your crop and add photos. A moderator passes it to the right expert, who answers. You can reply if they need more detail.',
        te: 'నా కేసులు: మీ పంట సమస్యను వివరించి ఫోటోలు జోడించండి. మోడరేటర్ దాన్ని సరైన నిపుణుడికి పంపుతారు, ఆయన సమాధానం ఇస్తారు. మరిన్ని వివరాలు కావాలంటే మీరు బదులివ్వవచ్చు.',
      },
      {
        en: 'Knowledge: advice articles from solved cases — search, filter, and bookmark. Courses: finish lessons in order and earn a certificate. Soil Testing: register a sample for your land and read the report when it is ready.',
        te: 'జ్ఞానం: పరిష్కరించిన కేసుల సలహా వ్యాసాలు — శోధించండి, ఫిల్టర్ చేయండి, బుక్‌మార్క్ చేయండి. కోర్సులు: పాఠాలను క్రమంగా పూర్తి చేసి సర్టిఫికెట్ పొందండి. నేల పరీక్ష: మీ భూమికి నమూనాను నమోదు చేసి, సిద్ధమైనప్పుడు నివేదిక చదవండి.',
      },
      {
        en: 'These need an active membership. Without one you will see a “Members only” card with a button to pay.',
        te: 'వీటికి యాక్టివ్ సభ్యత్వం అవసరం. అది లేకపోతే “సభ్యులకు మాత్రమే” కార్డ్, చెల్లించడానికి బటన్ కనిపిస్తాయి.',
      },
    ],
  },
  {
    id: 'notifications',
    audience: ['MEMBER', 'ADMINISTRATOR', 'VENDOR', 'EXPERT', 'MODERATOR', 'SUPPORT_AGENT'],
    title: { en: 'Notifications and your account', te: 'నోటిఫికేషన్లు, మీ ఖాతా' },
    body: [
      {
        en: 'The bell in the top bar shows new notifications. Open it to read them. Under Account you can change your password.',
        te: 'పై బార్‌లోని గంట కొత్త నోటిఫికేషన్లను చూపిస్తుంది. చదవడానికి దాన్ని తెరవండి. ఖాతా లో మీ పాస్‌వర్డ్ మార్చవచ్చు.',
      },
    ],
  },
  {
    id: 'admin-members',
    audience: ['ADMINISTRATOR'],
    title: { en: 'Members, free access and membership payments', te: 'సభ్యులు, ఉచిత ప్రాప్యత, సభ్యత్వ చెల్లింపులు' },
    body: [
      {
        en: 'Members lists everyone with one label: Paid, Free, Waiting, Unpaid or Expired. Search, filter and sort by any column. “Give free access” unlocks a member until a date you choose (up to 2 years); “Remove free access” ends it. Paid days are never touched.',
        te: 'సభ్యులు అందరినీ ఒక లేబుల్‌తో చూపిస్తుంది: చెల్లించారు, ఉచితం, వేచి ఉంది, చెల్లించలేదు లేదా గడువు ముగిసింది. ఏ కాలమ్ ద్వారానైనా శోధించండి, ఫిల్టర్ చేయండి, క్రమబద్ధీకరించండి. “ఉచిత ప్రాప్యత ఇవ్వండి” మీరు ఎంచుకున్న తేదీ వరకు (2 సంవత్సరాల వరకు) సభ్యుడిని అన్‌లాక్ చేస్తుంది; “ఉచిత ప్రాప్యత తొలగించండి” దాన్ని ముగిస్తుంది. చెల్లించిన రోజులు మారవు.',
      },
      {
        en: 'HARIHARAA subscriptions lists membership payments waiting for you. Look for the UTR in the bank statement for that exact amount, then Approve (30 days start) or Reject with a reason.',
        te: 'HARIHARAA సభ్యత్వాలు మీ కోసం వేచి ఉన్న సభ్యత్వ చెల్లింపులను చూపిస్తుంది. ఆ ఖచ్చితమైన మొత్తానికి బ్యాంక్ స్టేట్‌మెంట్‌లో UTR చూడండి, తర్వాత ఆమోదించండి (30 రోజులు మొదలవుతాయి) లేదా కారణంతో తిరస్కరించండి.',
      },
    ],
  },
  {
    id: 'admin-orders',
    audience: ['ADMINISTRATOR'],
    title: { en: 'Orders and UPI verification', te: 'ఆర్డర్లు, UPI ధృవీకరణ' },
    body: [
      {
        en: 'The order queue is a table you can sort and filter (status, payment method, payment status, search by order, customer or UTR). The button above it jumps to UPI payments waiting for verification.',
        te: 'ఆర్డర్ క్యూ మీరు క్రమబద్ధీకరించి ఫిల్టర్ చేయగల పట్టిక (స్థితి, చెల్లింపు విధానం, చెల్లింపు స్థితి, ఆర్డర్, కస్టమర్ లేదా UTR ద్వారా శోధన). దాని పైన ఉన్న బటన్ ధృవీకరణ కోసం వేచి ఉన్న UPI చెల్లింపులకు తీసుకెళ్తుంది.',
      },
      {
        en: 'Open an order to verify or reject its UPI payment. A UPI order cannot be confirmed until it is verified. Then Confirm → Ship → Deliver. Delivering a Cash on Delivery order marks it paid.',
        te: 'UPI చెల్లింపును ధృవీకరించడానికి లేదా తిరస్కరించడానికి ఆర్డర్ తెరవండి. ధృవీకరించే వరకు UPI ఆర్డర్‌ను నిర్ధారించలేరు. తర్వాత నిర్ధారించండి → పంపండి → డెలివరీ చేయండి. క్యాష్ ఆన్ డెలివరీ ఆర్డర్‌ను డెలివరీ చేస్తే అది చెల్లించినట్లు గుర్తించబడుతుంది.',
      },
    ],
  },
  {
    id: 'admin-catalog',
    audience: ['ADMINISTRATOR'],
    title: { en: 'Categories, settings and staff', te: 'వర్గాలు, సెట్టింగ్‌లు, సిబ్బంది' },
    body: [
      {
        en: 'Taxonomy → Product categories builds the shop tree: add a department, add categories inside it, and sub-categories inside those (nothing goes deeper). Each can have a Telugu name. Switching one off hides it from the shop without deleting anything.',
        te: 'వర్గీకరణ → ఉత్పత్తి వర్గాలు షాప్ చెట్టును నిర్మిస్తుంది: విభాగాన్ని చేర్చండి, దానిలో వర్గాలు, వాటిలో ఉప-వర్గాలు చేర్చండి (దానికి మించి లోతుకు వెళ్ళదు). ప్రతిదానికి తెలుగు పేరు ఉండవచ్చు. ఒకదాన్ని ఆఫ్ చేస్తే ఏదీ తొలగించకుండా షాప్ నుండి దాచబడుతుంది.',
      },
      {
        en: 'Settings holds the membership price and the UPI details customers pay to. Staff accounts creates experts, moderators, vendors, support agents and administrators (people sign themselves up as members).',
        te: 'సెట్టింగ్‌లు సభ్యత్వ ధర, కస్టమర్లు చెల్లించే UPI వివరాలను కలిగి ఉంటాయి. సిబ్బంది ఖాతాలు నిపుణులు, మోడరేటర్లు, విక్రేతలు, సపోర్ట్ ఏజెంట్లు, అడ్మినిస్ట్రేటర్లను సృష్టిస్తాయి (ప్రజలు తామే సభ్యులుగా సైన్ అప్ అవుతారు).',
      },
    ],
  },
  {
    id: 'vendor',
    audience: ['VENDOR'],
    title: { en: 'Selling on the marketplace', te: 'మార్కెట్‌ప్లేస్‌లో అమ్మడం' },
    body: [
      {
        en: 'Submit your business name and description from your dashboard. An administrator approves it, and only then can you list products. Add price, unit, stock, photos and a category from the full Department › Category › Sub-category list.',
        te: 'మీ డాష్‌బోర్డ్ నుండి వ్యాపార పేరు, వివరణ సమర్పించండి. అడ్మినిస్ట్రేటర్ ఆమోదిస్తారు, ఆ తర్వాతే మీరు ఉత్పత్తులను జాబితా చేయగలరు. ధర, యూనిట్, స్టాక్, ఫోటోలు, పూర్తి విభాగం › వర్గం › ఉప-వర్గం జాబితా నుండి వర్గాన్ని జోడించండి.',
      },
    ],
  },
  {
    id: 'expert',
    audience: ['EXPERT'],
    title: { en: 'Answering cases and writing articles', te: 'కేసులకు సమాధానం, వ్యాసాలు రాయడం' },
    body: [
      {
        en: 'Submit your qualifications first; once an administrator verifies you, cases can be assigned to you. Open a case, read the photos, and answer or ask the farmer for more detail. Solved cases become draft articles you can edit and send for review.',
        te: 'ముందు మీ అర్హతలను సమర్పించండి; అడ్మినిస్ట్రేటర్ ధృవీకరించిన తర్వాత మీకు కేసులు కేటాయించబడతాయి. కేసు తెరిచి, ఫోటోలు చూసి, సమాధానం ఇవ్వండి లేదా రైతును మరిన్ని వివరాలు అడగండి. పరిష్కరించిన కేసులు మీరు సవరించి సమీక్షకు పంపగల డ్రాఫ్ట్ వ్యాసాలు అవుతాయి.',
      },
    ],
  },
  {
    id: 'moderator',
    audience: ['MODERATOR'],
    title: { en: 'Reviewing cases, articles, courses and soil samples', te: 'కేసులు, వ్యాసాలు, కోర్సులు, నేల నమూనాల సమీక్ష' },
    body: [
      {
        en: 'Assign new cases to the right expert, approve or reject articles (or send them back with notes), build and publish courses, and move soil samples through each stage to the report.',
        te: 'కొత్త కేసులను సరైన నిపుణుడికి కేటాయించండి, వ్యాసాలను ఆమోదించండి లేదా తిరస్కరించండి (లేదా నోట్స్‌తో తిరిగి పంపండి), కోర్సులను తయారు చేసి ప్రచురించండి, నేల నమూనాలను ప్రతి దశ ద్వారా నివేదిక వరకు తరలించండి.',
      },
    ],
  },
  {
    id: 'dispatch',
    audience: ['SUPPORT_AGENT'],
    title: { en: 'Dispatching orders', te: 'ఆర్డర్లను పంపడం' },
    body: [
      {
        en: 'The queue shows orders ready to pack: Cash on Delivery, or UPI already verified. Each row shows the receiver’s city, PIN and phone. Open an order, pack what you have and mark each item Sent; leave the rest Pending. Untick “ready to pack only” to see everything.',
        te: 'క్యూ ప్యాక్ చేయడానికి సిద్ధమైన ఆర్డర్లను చూపిస్తుంది: క్యాష్ ఆన్ డెలివరీ, లేదా ఇప్పటికే ధృవీకరించిన UPI. ప్రతి వరుస స్వీకర్త నగరం, పిన్, ఫోన్ చూపిస్తుంది. ఆర్డర్ తెరిచి, ఉన్నది ప్యాక్ చేసి ప్రతి వస్తువును పంపబడింది అని గుర్తించండి; మిగతావి పెండింగ్‌లో ఉంచండి. అన్నీ చూడటానికి “ప్యాక్ చేయడానికి సిద్ధమైనవి మాత్రమే” టిక్ తీసేయండి.',
      },
    ],
  },
  {
    id: 'faq-paid',
    audience: ['MEMBER'],
    title: { en: 'FAQ: I paid but I am still locked', te: 'తరచుగా అడిగేవి: చెల్లించాను కానీ ఇంకా లాక్ అయి ఉంది' },
    body: [
      {
        en: 'Payments are checked by hand against the bank, so it can take a few hours. Make sure you submitted the UTR after paying — until you do, the payment shows as unpaid. If it was rejected, the reason is on the My subscription page; pay again or correct the reference.',
        te: 'చెల్లింపులు బ్యాంకుతో చేతితో తనిఖీ చేయబడతాయి, కాబట్టి కొన్ని గంటలు పట్టవచ్చు. చెల్లించిన తర్వాత UTR సమర్పించారో లేదో చూసుకోండి — అప్పటి వరకు చెల్లింపు చెల్లించనిదిగా కనిపిస్తుంది. తిరస్కరించబడితే కారణం నా సభ్యత్వం పేజీలో ఉంటుంది; మళ్ళీ చెల్లించండి లేదా రిఫరెన్స్ సరిచేయండి.',
      },
    ],
  },
  {
    id: 'faq-password',
    audience: ['GUEST', 'MEMBER', 'ADMINISTRATOR', 'VENDOR', 'EXPERT', 'MODERATOR', 'SUPPORT_AGENT'],
    title: { en: 'FAQ: password and sign-in codes', te: 'తరచుగా అడిగేవి: పాస్‌వర్డ్, సైన్-ఇన్ కోడ్‌లు' },
    body: [
      {
        en: 'Forgot your password? Use “Forgot password” on the log-in screen: enter your mobile number, type the 6-digit code shown on screen, and choose a new password. While SMS is not connected, codes appear on the screen instead of being texted.',
        te: 'పాస్‌వర్డ్ మర్చిపోయారా? లాగిన్ స్క్రీన్‌లో “పాస్‌వర్డ్ మర్చిపోయారా” ఉపయోగించండి: మీ మొబైల్ నంబర్ నమోదు చేసి, స్క్రీన్‌పై కనిపించే 6 అంకెల కోడ్ టైప్ చేసి, కొత్త పాస్‌వర్డ్ ఎంచుకోండి. SMS అనుసంధానం అయ్యే వరకు కోడ్‌లు టెక్స్ట్ చేయబడకుండా స్క్రీన్‌పై కనిపిస్తాయి.',
      },
    ],
  },
];

export function sectionsFor(audience: Audience): HelpSection[] {
  return HELP_SECTIONS.filter((s) => s.audience === 'ALL' || s.audience.includes(audience));
}
