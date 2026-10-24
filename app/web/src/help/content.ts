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
    id: 'assistant',
    audience: 'ALL',
    title: { en: 'Ask the help assistant', te: 'సహాయ అసిస్టెంట్‌ను అడగండి' },
    body: [
      {
        en: 'The round button at the bottom right of every screen (“Ask a question”) opens a small chat. Type a question in your own words — English, Telugu, or Telugu typed in English letters — or tap one of the suggested questions. It answers in English and Telugu and has a button that takes you straight to the screen it describes.',
        te: 'ప్రతి స్క్రీన్ కుడి దిగువన ఉన్న గుండ్రని బటన్ (“ప్రశ్న అడగండి”) చిన్న చాట్‌ను తెరుస్తుంది. మీ సొంత మాటల్లో ప్రశ్న టైప్ చేయండి — ఇంగ్లీష్, తెలుగు, లేదా ఇంగ్లీష్ అక్షరాలతో తెలుగు — లేదా సూచించిన ప్రశ్నలలో ఒకదాన్ని తాకండి. ఇది ఇంగ్లీష్, తెలుగులో సమాధానం ఇస్తుంది, అది వివరించే స్క్రీన్‌కు నేరుగా తీసుకెళ్లే బటన్ ఉంటుంది.',
      },
      {
        en: 'It gives the same answer every time and does not need an internet service of its own. If it cannot find an answer it says so and offers related questions and this Help page.',
        te: 'ఇది ప్రతిసారీ ఒకే సమాధానం ఇస్తుంది, దానికి ప్రత్యేక ఇంటర్నెట్ సేవ అవసరం లేదు. సమాధానం దొరకకపోతే అదే చెప్పి, సంబంధిత ప్రశ్నలను, ఈ సహాయం పేజీని సూచిస్తుంది.',
      },
    ],
  },
  {
    id: 'install',
    audience: 'ALL',
    title: { en: 'Using it like a phone app', te: 'ఫోన్ యాప్‌లా వాడటం' },
    body: [
      {
        en: 'Open the site in your phone’s browser and choose “Add to Home screen” (or “Install app”) from the browser menu. It then opens full-screen like any other app. Nothing else needs to be downloaded.',
        te: 'మీ ఫోన్ బ్రౌజర్‌లో సైట్ తెరిచి, బ్రౌజర్ మెనూ నుండి “హోమ్ స్క్రీన్‌కు జోడించండి” (లేదా “యాప్ ఇన్‌స్టాల్ చేయండి”) ఎంచుకోండి. తర్వాత అది ఇతర యాప్‌ల లాగే పూర్తి స్క్రీన్‌లో తెరుచుకుంటుంది. ఇంకేమీ డౌన్‌లోడ్ చేయనవసరం లేదు.',
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
      {
        en: 'Tap the heart on a product to save it to your wishlist. It works before you log in too, and your hearts join your account when you sign in. Products without a photo show a leaf tile.',
        te: 'ఉత్పత్తిని మీ విష్‌లిస్ట్‌లో సేవ్ చేయడానికి దానిపై హృదయం గుర్తును తాకండి. లాగిన్ కాకముందే కూడా పనిచేస్తుంది, సైన్ ఇన్ చేసినప్పుడు మీ హృదయాలు మీ ఖాతాలో చేరతాయి. ఫోటో లేని ఉత్పత్తులు ఆకు టైల్‌ను చూపిస్తాయి.',
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
        en: 'You cannot put more of a product in the cart than is in stock (and at most 999 at a time); the screen tells you how many are left.',
        te: 'స్టాక్‌లో ఉన్నదానికంటే ఎక్కువ (ఒకేసారి గరిష్ఠంగా 999) ఉత్పత్తిని కార్ట్‌లో పెట్టలేరు; ఎన్ని మిగిలాయో స్క్రీన్ చెబుతుంది.',
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
        en: 'In the last 3 days of your access a strip under the top bar and one bell notification remind you to renew; you get one more notice when it has ended. Renewing early is never wasted: new days are added after the days you already have. Free access given by an administrator is shown as “Free access until …”.',
        te: 'మీ ప్రాప్యత చివరి 3 రోజుల్లో పై బార్ కింద ఒక స్ట్రిప్, ఒక బెల్ నోటిఫికేషన్ పునరుద్ధరించమని గుర్తు చేస్తాయి; అది ముగిసిన తర్వాత మరొక నోటీసు వస్తుంది. ముందే పునరుద్ధరించినా వృధా కాదు: కొత్త రోజులు మీకు ఇప్పటికే ఉన్న రోజుల తర్వాత చేరతాయి. అడ్మినిస్ట్రేటర్ ఇచ్చిన ఉచిత ప్రాప్యత “… వరకు ఉచిత ప్రాప్యత” అని కనిపిస్తుంది.',
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
        en: 'Payment is by UPI. After you place the order, open it, tap Pay now, pay the exact total, and submit the UTR. We verify it before we pack your order.',
        te: 'చెల్లింపు UPI ద్వారా. ఆర్డర్ చేసిన తర్వాత దాన్ని తెరిచి, ఇప్పుడే చెల్లించండి తాకి, ఖచ్చితమైన మొత్తం చెల్లించి, UTR సమర్పించండి. మేము మీ ఆర్డర్‌ను ప్యాక్ చేసే ముందు దాన్ని ధృవీకరిస్తాము.',
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
      {
        en: 'The price on an order never changes after you place it, even if the shop changes the price later. To cancel, contact the store with your ID and order number before it ships — the store cancels it and the items go back to stock. A delivered order cannot be cancelled.',
        te: 'మీరు ఆర్డర్ చేసిన తర్వాత షాప్ ధర మార్చినా, ఆర్డర్‌లోని ధర ఎప్పటికీ మారదు. రద్దు చేయడానికి, అది పంపబడే ముందు మీ ID, ఆర్డర్ నంబర్‌తో స్టోర్‌ను సంప్రదించండి — స్టోర్ రద్దు చేస్తుంది, వస్తువులు స్టాక్‌కు తిరిగి వెళ్తాయి. డెలివరీ అయిన ఆర్డర్‌ను రద్దు చేయలేరు.',
      },
    ],
  },
  {
    id: 'advice',
    audience: MEMBERS,
    title: { en: 'Farm advice: cases, knowledge, courses, soil tests', te: 'వ్యవసాయ సలహా: కేసులు, జ్ఞానం, కోర్సులు, నేల పరీక్షలు' },
    body: [
      {
        en: 'My cases: take photos of the problem (up to 6 — they are shrunk on your phone so they send quickly), tap the symptoms you see, and add a few words by typing or speaking. What you write is kept on your phone as you go, and if there is no signal when you press Send, the case waits on the phone and is sent by itself when you are back online. A moderator passes it to the right expert, who answers. You can reply if they need more detail.',
        te: 'నా కేసులు: సమస్య ఫోటోలు తీయండి (6 వరకు — త్వరగా పంపడానికి అవి మీ ఫోన్‌లోనే చిన్నవిగా చేయబడతాయి), మీకు కనిపించే లక్షణాలను తాకండి, టైప్ చేసి లేదా మాట్లాడి కొన్ని మాటలు జోడించండి. మీరు రాసేది వెళ్తున్న కొద్దీ మీ ఫోన్‌లో భద్రపరచబడుతుంది, పంపండి తాకినప్పుడు సిగ్నల్ లేకపోతే కేసు ఫోన్‌లో వేచి ఉండి, మీరు మళ్ళీ ఆన్‌లైన్‌లోకి రాగానే దానంతట అదే పంపబడుతుంది. మోడరేటర్ దాన్ని సరైన నిపుణుడికి పంపుతారు, ఆయన సమాధానం ఇస్తారు. మరిన్ని వివరాలు కావాలంటే మీరు బదులివ్వవచ్చు.',
      },
      {
        en: 'On your Dashboard, “Recent advice” shows advice for the crops on your parcels and from your own cases, with a tag saying why. “Delete parcel” removes a parcel nobody has used, or hides one that has cases (they stay safe). Knowledge: advice articles from solved cases — search, filter, and bookmark; under each article “Products that may help” suggests shop products that mention the same problem or crop. Courses: finish lessons in order and earn a certificate. Soil Testing: register a sample for your land and read the report when it is ready.',
        te: 'మీ డాష్‌బోర్డ్‌లో “ఇటీవలి సలహా” మీ స్థలాలలోని పంటలకు, మీ స్వంత కేసుల నుండి సలహాను చూపిస్తుంది, ఎందుకో ఒక ట్యాగ్ చెబుతుంది. “స్థలాన్ని తొలగించండి” ఎవరూ వాడని స్థలాన్ని తీసివేస్తుంది, కేసులు ఉన్నదాన్ని దాచుతుంది (అవి భద్రంగా ఉంటాయి). జ్ఞానం: పరిష్కరించిన కేసుల సలహా వ్యాసాలు — శోధించండి, ఫిల్టర్ చేయండి, బుక్‌మార్క్ చేయండి; ప్రతి వ్యాసం కింద “ఇవి సహాయపడవచ్చు” అదే సమస్య లేదా పంటను పేర్కొనే షాప్ ఉత్పత్తులను సూచిస్తుంది. కోర్సులు: పాఠాలను క్రమంగా పూర్తి చేసి సర్టిఫికెట్ పొందండి. నేల పరీక్ష: మీ భూమికి నమూనాను నమోదు చేసి, సిద్ధమైనప్పుడు నివేదిక చదవండి.',
      },
      {
        en: 'These need an active membership. Without one you will see a “Members only” card with a button to pay.',
        te: 'వీటికి యాక్టివ్ సభ్యత్వం అవసరం. అది లేకపోతే “సభ్యులకు మాత్రమే” కార్డ్, చెల్లించడానికి బటన్ కనిపిస్తాయి.',
      },
    ],
  },
  {
    id: 'today',
    audience: MEMBERS,
    title: { en: 'The “Today” section, order again, receipts and stock alerts', te: '“ఈ రోజు” భాగం, మళ్ళీ ఆర్డర్, రసీదులు, స్టాక్ అలర్ట్‌లు' },
    body: [
      {
        en: 'At the top of the shop, “Today” shows what needs you: days of membership left, your open cases (highlighted when an expert has answered), your latest order, and a “Photo your problem” button. Below it, “This month on your farm” shows short seasonal tips — some only for crops you grow.',
        te: 'షాప్ పైన “ఈ రోజు” మీకు ఏమి అవసరమో చూపిస్తుంది: సభ్యత్వ రోజులు మిగిలినవి, మీ ఓపెన్ కేసులు (నిపుణుడు సమాధానం ఇచ్చినప్పుడు హైలైట్ అవుతుంది), మీ తాజా ఆర్డర్, “సమస్య ఫోటో తీయండి” బటన్. దాని కింద “ఈ నెల మీ పొలంలో” చిన్న సీజన్ చిట్కాలను చూపిస్తుంది — కొన్ని మీరు పండించే పంటలకు మాత్రమే.',
      },
      {
        en: 'On an order, “Order again” puts everything still available back in your cart, and “Receipt” opens a printable receipt (save it as a PDF from the print window). On an out-of-stock product, “Tell me when it is back” sends you a notification the moment stock returns.',
        te: 'ఆర్డర్‌లో, “మళ్ళీ ఆర్డర్ చేయండి” ఇంకా అందుబాటులో ఉన్నవన్నీ మీ కార్ట్‌లో పెడుతుంది, “రసీదు” ప్రింట్ చేయదగిన రసీదును తెరుస్తుంది (ప్రింట్ విండో నుండి PDF గా సేవ్ చేయండి). స్టాక్ లేని ఉత్పత్తిపై, “మళ్ళీ వచ్చినప్పుడు నాకు చెప్పండి” స్టాక్ తిరిగి వచ్చిన క్షణంలోనే మీకు నోటిఫికేషన్ పంపుతుంది.',
      },
      {
        en: 'If the store has switched WhatsApp on, Account has a “WhatsApp updates” box: tick it to get order, payment and membership updates on WhatsApp too. It is off until you tick it.',
        te: 'స్టోర్ WhatsApp ను ఆన్ చేసి ఉంటే, ఖాతాలో “WhatsApp అప్‌డేట్‌లు” బాక్స్ ఉంటుంది: ఆర్డర్, చెల్లింపు, సభ్యత్వ అప్‌డేట్‌లు WhatsApp లో కూడా పొందడానికి దాన్ని టిక్ చేయండి. మీరు టిక్ చేసే వరకు ఇది ఆఫ్‌లో ఉంటుంది.',
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
        en: 'Open an order to verify or reject its UPI payment. A UPI order cannot be confirmed until it is verified. Then Confirm → Ship → Deliver. Delivering an older Cash on Delivery order marks it paid.',
        te: 'UPI చెల్లింపును ధృవీకరించడానికి లేదా తిరస్కరించడానికి ఆర్డర్ తెరవండి. ధృవీకరించే వరకు UPI ఆర్డర్‌ను నిర్ధారించలేరు. తర్వాత నిర్ధారించండి → పంపండి → డెలివరీ చేయండి. క్యాష్ ఆన్ డెలివరీ ఆర్డర్‌ను డెలివరీ చేస్తే అది చెల్లించినట్లు గుర్తించబడుతుంది.',
      },
      {
        en: 'Cancel puts every item back in stock exactly once and records a “Cancelled-order return” line in each product’s Stock history. Cancelling twice (even by two administrators at the same moment) or cancelling a delivered order is refused.',
        te: 'రద్దు చేస్తే ప్రతి వస్తువు సరిగ్గా ఒక్కసారి స్టాక్‌కు తిరిగి వెళ్తుంది, ప్రతి ఉత్పత్తి స్టాక్ చరిత్రలో “రద్దు చేసిన ఆర్డర్ తిరిగి” లైన్ నమోదవుతుంది. రెండుసార్లు రద్దు చేయడం (ఇద్దరు అడ్మినిస్ట్రేటర్లు ఒకే క్షణంలో చేసినా) లేదా డెలివరీ అయిన ఆర్డర్‌ను రద్దు చేయడం తిరస్కరించబడుతుంది.',
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
        en: 'Staff accounts creates experts, moderators, vendors, support agents and administrators (people sign themselves up as members).',
        te: 'సిబ్బంది ఖాతాలు నిపుణులు, మోడరేటర్లు, విక్రేతలు, సపోర్ట్ ఏజెంట్లు, అడ్మినిస్ట్రేటర్లను సృష్టిస్తాయి (ప్రజలు తామే సభ్యులుగా సైన్ అప్ అవుతారు).',
      },
    ],
  },
  {
    id: 'admin-products',
    audience: ['ADMINISTRATOR'],
    title: { en: 'Adding products and managing stock', te: 'ఉత్పత్తులను జోడించడం, స్టాక్ నిర్వహణ' },
    body: [
      {
        en: 'Shop → Manage products → Add new product. Fill name, description (10+ characters), price (₹0.01 to ₹10,00,000, at most 2 decimals), unit, opening stock (0 to 10,00,000) and category. Products you add are sold by the platform itself; after saving you land on the product screen to upload photos. The list has search, filters (seller, status) and sortable columns.',
        te: 'షాప్ → ఉత్పత్తులను నిర్వహించండి → కొత్త ఉత్పత్తిని జోడించండి. పేరు, వివరణ (10+ అక్షరాలు), ధర (₹0.01 నుండి ₹10,00,000, గరిష్ఠంగా 2 దశాంశాలు), యూనిట్, ప్రారంభ స్టాక్ (0 నుండి 10,00,000), వర్గం నింపండి. మీరు జోడించే ఉత్పత్తులను ప్లాట్‌ఫామ్ స్వయంగా అమ్ముతుంది; సేవ్ చేసిన తర్వాత ఫోటోలు అప్‌లోడ్ చేయడానికి ఉత్పత్తి స్క్రీన్‌కు చేరతారు. జాబితాలో శోధన, ఫిల్టర్లు (విక్రేత, స్థితి), క్రమబద్ధీకరించదగిన కాలమ్‌లు ఉన్నాయి.',
      },
      {
        en: 'On a product, the Stock panel has three actions: Add stock (reason optional), Reduce stock (reason required — damaged, expired, given away; it can never go below zero) and Set to counted quantity (a stock-take; reason required). Editing the price or details never overwrites stock by accident.',
        te: 'ఉత్పత్తిపై స్టాక్ ప్యానెల్‌లో మూడు చర్యలు ఉన్నాయి: స్టాక్ జోడించండి (కారణం ఐచ్ఛికం), స్టాక్ తగ్గించండి (కారణం తప్పనిసరి — పాడైంది, గడువు ముగిసింది, ఇచ్చేశారు; సున్నా కంటే తక్కువ కాదు), లెక్కించిన పరిమాణానికి సెట్ చేయండి (స్టాక్ లెక్కింపు; కారణం తప్పనిసరి). ధర లేదా వివరాలు సవరించినప్పుడు స్టాక్ పొరపాటున మారదు.',
      },
      {
        en: 'Stock history lists every change: opening stock, each sale (with the order number and buyer), cancelled-order returns, adds, reduces and corrections — with who did it. It is sortable and filterable, and always adds up to the live count. Sales take stock automatically, and if two buyers go for the last unit exactly one gets it.',
        te: 'స్టాక్ చరిత్ర ప్రతి మార్పును చూపిస్తుంది: ప్రారంభ స్టాక్, ప్రతి అమ్మకం (ఆర్డర్ నంబర్, కొనుగోలుదారుతో), రద్దు చేసిన ఆర్డర్ తిరిగి, జోడింపులు, తగ్గింపులు, సవరణలు — ఎవరు చేశారో సహా. దీన్ని క్రమబద్ధీకరించి ఫిల్టర్ చేయవచ్చు, ఇది ఎల్లప్పుడూ ప్రస్తుత లెక్కకు సరిపోతుంది. అమ్మకాలు స్టాక్‌ను ఆటోమేటిక్‌గా తీసుకుంటాయి; ఇద్దరు కొనుగోలుదారులు చివరి యూనిట్ కోసం వస్తే సరిగ్గా ఒకరికే దక్కుతుంది.',
      },
    ],
  },
  {
    id: 'admin-insights',
    audience: ['ADMINISTRATOR'],
    title: { en: 'Vendors, reports, audit log and media', te: 'విక్రేతలు, నివేదికలు, ఆడిట్ లాగ్, మీడియా' },
    body: [
      {
        en: 'Vendor approvals: review each vendor’s business name and description, then approve or reject. Expert credentials: verify an expert’s qualifications — cases can only be assigned to verified experts.',
        te: 'విక్రేత ఆమోదాలు: ప్రతి విక్రేత వ్యాపార పేరు, వివరణ సమీక్షించి ఆమోదించండి లేదా తిరస్కరించండి. నిపుణుల ధృవపత్రాలు: నిపుణుడి అర్హతలను ధృవీకరించండి — ధృవీకరించిన నిపుణులకు మాత్రమే కేసులు కేటాయించబడతాయి.',
      },
      {
        en: 'Reports show case volume, resolution time, the article funnel, expert workload and accounts by role. The Audit log records every important action (prices, UPI ID changes, approvals, stock changes) and who did it, filterable by type and date. The Media library lists every uploaded photo, video and PDF in one sortable table.',
        te: 'నివేదికలు కేసుల సంఖ్య, పరిష్కార సమయం, వ్యాసాల ప్రవాహం, నిపుణుల పని, పాత్ర వారీ ఖాతాలను చూపిస్తాయి. ఆడిట్ లాగ్ ప్రతి ముఖ్యమైన చర్యను (ధరలు, UPI ID మార్పులు, ఆమోదాలు, స్టాక్ మార్పులు) ఎవరు చేశారో సహా నమోదు చేస్తుంది, రకం, తేదీ ద్వారా ఫిల్టర్ చేయవచ్చు. మీడియా లైబ్రరీ అప్‌లోడ్ చేసిన ప్రతి ఫోటో, వీడియో, PDFను ఒక క్రమబద్ధీకరించదగిన పట్టికలో చూపిస్తుంది.',
      },
    ],
  },
  {
    id: 'admin-seasonal',
    audience: ['ADMINISTRATOR', 'MODERATOR'],
    title: { en: 'Seasonal tips and restock suggestions', te: 'సీజన్ చిట్కాలు, రీస్టాక్ సూచనలు' },
    body: [
      {
        en: 'Content → Seasonal tips: write short English and Telugu tips for a stretch of months (a season can run over the new year), optionally for one crop. Members with access see up to three tips that are in season, crop-specific first, under “This month on your farm” on the Today panel. Switch a tip off to hide it without deleting.',
        te: 'కంటెంట్ → సీజన్ చిట్కాలు: కొన్ని నెలల కాలానికి (సీజన్ కొత్త సంవత్సరం దాటి ఉండవచ్చు) చిన్న ఇంగ్లీష్, తెలుగు చిట్కాలు రాయండి, కావాలంటే ఒక పంటకు మాత్రమే. యాక్సెస్ ఉన్న సభ్యులు ఈ రోజు ప్యానెల్‌లో “ఈ నెల మీ పొలంలో” కింద సీజన్‌లో ఉన్న మూడు చిట్కాల వరకు (పంట-నిర్దిష్టమైనవి ముందు) చూస్తారు. తొలగించకుండా దాచడానికి చిట్కాను ఆఫ్ చేయండి.',
      },
      {
        en: 'Administrators: Manage products starts with “Running low — what to restock”, listing products at or below their warning level with their last-30-day sales and a suggested quantity to order. Nothing is suggested for products that have not sold lately.',
        te: 'అడ్మినిస్ట్రేటర్లు: ఉత్పత్తులను నిర్వహించండి “తక్కువగా ఉన్నవి — ఏవి తిరిగి తెప్పించాలి” తో మొదలవుతుంది; హెచ్చరిక స్థాయి లేదా అంతకంటే తక్కువగా ఉన్న ఉత్పత్తులను, వాటి గత 30 రోజుల అమ్మకాలను, ఆర్డర్ చేయమని సూచించిన పరిమాణాన్ని చూపిస్తుంది. ఇటీవల అమ్ముడుపోని ఉత్పత్తులకు ఏదీ సూచించబడదు.',
      },
    ],
  },
  {
    id: 'admin-passwords',
    audience: ['ADMINISTRATOR'],
    title: { en: 'Forgotten passwords, stock alerts and usage', te: 'మర్చిపోయిన పాస్‌వర్డ్‌లు, స్టాక్ అలర్ట్‌లు, వినియోగం' },
    body: [
      {
        en: 'There is no code on the screen for resetting a password any more — that let anyone reset anyone’s. When someone asks, you get a “Password reset requested” notification. After checking it really is them, open People → Members & free access (or Staff accounts), tap “Temporary password” → Issue password, and read the one-time password out. Their old password stops working at once and they must choose their own at their next log in. If the only administrator is locked out, run npm run admin:reset-password in app/backend.',
        te: 'పాస్‌వర్డ్ రీసెట్ కోసం స్క్రీన్‌పై ఇకపై కోడ్ లేదు — అది ఎవరైనా ఎవరి పాస్‌వర్డ్‌నైనా రీసెట్ చేయడానికి అనుమతించేది. ఎవరైనా అడిగినప్పుడు, మీకు “పాస్‌వర్డ్ రీసెట్ అభ్యర్థన” నోటిఫికేషన్ వస్తుంది. నిజంగా వారేనని నిర్ధారించుకున్న తర్వాత, వ్యక్తులు → సభ్యులు & ఉచిత ప్రాప్యత (లేదా సిబ్బంది ఖాతాలు) తెరిచి, “తాత్కాలిక పాస్‌వర్డ్” → పాస్‌వర్డ్ ఇవ్వండి తాకి, ఒక్కసారి వాడే పాస్‌వర్డ్‌ను చదివి చెప్పండి. వారి పాత పాస్‌వర్డ్ వెంటనే పనిచేయదు, తదుపరి లాగిన్‌లో వారు తమ స్వంతదాన్ని ఎంచుకోవాలి. ఏకైక అడ్మినిస్ట్రేటర్ లాక్ అయితే, app/backend లో npm run admin:reset-password నడపండి.',
      },
      {
        en: 'Stock alerts: when a sale takes a product to its warning level (5 unless you set one on the product — “Warn me when stock is at or below”), and again at zero, administrators (and the selling vendor) get a notification, once each. Manage products has a Stock filter (Low / Out of stock). Members waiting for a product are told when you add stock.',
        te: 'స్టాక్ అలర్ట్‌లు: అమ్మకం వల్ల ఉత్పత్తి దాని హెచ్చరిక స్థాయికి (ఉత్పత్తిపై మీరు సెట్ చేయకపోతే 5 — “స్టాక్ ఇంత లేదా తక్కువకు వచ్చినప్పుడు నాకు చెప్పండి”) వచ్చినప్పుడు, సున్నాకు చేరినప్పుడు మళ్ళీ, అడ్మినిస్ట్రేటర్లకు (మరియు అమ్మే విక్రేతకు) ఒక్కొక్కటి ఒక్కసారి నోటిఫికేషన్ వస్తుంది. ఉత్పత్తులను నిర్వహించండిలో స్టాక్ ఫిల్టర్ (తక్కువ / స్టాక్ లేదు) ఉంది. ఉత్పత్తి కోసం వేచి ఉన్న సభ్యులకు మీరు స్టాక్ జోడించినప్పుడు తెలియజేయబడుతుంది.',
      },
      {
        en: 'Usage & questions (Insights & setup) shows the most opened screens, the help-assistant questions it could not answer (each is a missing FAQ — add it in help/faq.ts), how the tour ended and errors people hit. Only counts are kept, for 90 days.',
        te: 'వినియోగం & ప్రశ్నలు (నివేదికలు & సెటప్) ఎక్కువగా తెరిచిన స్క్రీన్‌లు, సహాయ అసిస్టెంట్ సమాధానం ఇవ్వలేకపోయిన ప్రశ్నలు (ప్రతి ఒక్కటి లేని FAQ — help/faq.ts లో చేర్చండి), టూర్ ఎలా ముగిసింది, ప్రజలు ఎదుర్కొన్న లోపాలు చూపిస్తుంది. లెక్కలు మాత్రమే, 90 రోజులు ఉంచబడతాయి.',
      },
    ],
  },
  {
    id: 'admin-plans',
    audience: ['ADMINISTRATOR'],
    title: { en: 'Membership plans, the UPI ID and the membership switch', te: 'సభ్యత్వ ప్లాన్లు, UPI ID, సభ్యత్వ స్విచ్' },
    body: [
      {
        en: 'Membership plans: each plan is a price for a length of access (for example Monthly ₹499 / 30 days, Yearly ₹4,999 / 365 days). Add as many as you like, edit prices, and switch a plan Off to stop selling it — nothing is deleted, and people who already paid keep their days. When there is more than one plan, members pick one on the payment screen. Price changes only affect new payments.',
        te: 'సభ్యత్వ ప్లాన్లు: ప్రతి ప్లాన్ ఒక కాలానికి ప్రాప్యత ధర (ఉదాహరణకు నెలవారీ ₹499 / 30 రోజులు, వార్షిక ₹4,999 / 365 రోజులు). మీకు కావలసినన్ని చేర్చండి, ధరలను మార్చండి, అమ్మకాన్ని ఆపడానికి ప్లాన్‌ను ఆఫ్ చేయండి — ఏదీ తొలగించబడదు, ఇప్పటికే చెల్లించిన వారికి వారి రోజులు అలాగే ఉంటాయి. ఒకటి కంటే ఎక్కువ ప్లాన్లు ఉన్నప్పుడు, సభ్యులు చెల్లింపు స్క్రీన్‌లో ఒకదాన్ని ఎంచుకుంటారు. ధర మార్పులు కొత్త చెల్లింపులకు మాత్రమే వర్తిస్తాయి.',
      },
      {
        en: 'The membership switch (top of the plans page) decides whether membership is needed at all. Turn it Off and checkout and farm advice open to every signed-in member — useful while testing. Turn it On again and members without a paid or free membership are locked as before.',
        te: 'సభ్యత్వ స్విచ్ (ప్లాన్ల పేజీ పైన) అసలు సభ్యత్వం అవసరమా కాదా నిర్ణయిస్తుంది. దాన్ని ఆఫ్ చేస్తే చెక్అవుట్, వ్యవసాయ సలహా సైన్ ఇన్ అయిన ప్రతి సభ్యునికి తెరుచుకుంటాయి — పరీక్ష సమయంలో ఉపయోగకరం. మళ్ళీ ఆన్ చేస్తే చెల్లించిన లేదా ఉచిత సభ్యత్వం లేని సభ్యులు మునుపటిలా లాక్ అవుతారు.',
      },
      {
        en: 'Settings → Where payments go: change the UPI ID customers pay to whenever your account changes. It must look like name@bank; you are asked to confirm, and the change is recorded in the audit log. Keep a spare UPI ID on file and use Swap to switch to it. If the new ID belongs to a different merchant account, change or clear the merchant ID too.',
        te: 'సెట్టింగ్‌లు → చెల్లింపులు ఎక్కడికి వెళ్తాయి: మీ ఖాతా మారినప్పుడల్లా కస్టమర్లు చెల్లించే UPI IDని మార్చండి. అది name@bank లా ఉండాలి; ధృవీకరణ అడుగుతుంది, మార్పు ఆడిట్ లాగ్‌లో నమోదవుతుంది. స్పేర్ UPI IDని ఫైల్‌లో ఉంచి, స్వాప్‌తో దానికి మారండి. కొత్త ID వేరే మర్చంట్ ఖాతాకు చెందినదైతే మర్చంట్ IDని కూడా మార్చండి లేదా తొలగించండి.',
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
      {
        en: 'Price must be ₹0.01 to ₹10,00,000 with at most 2 decimals; stock 0 to 10,00,000. To change stock later open the product and use the Stock panel — Add, Reduce (reason required) or Set to counted quantity. Every change, every sale and every cancelled order appears in Stock history. Only you and administrators can edit your products; if an administrator un-approves your business, your products leave the shop until it is approved again.',
        te: 'ధర ₹0.01 నుండి ₹10,00,000 వరకు, గరిష్ఠంగా 2 దశాంశాలు; స్టాక్ 0 నుండి 10,00,000. తర్వాత స్టాక్ మార్చడానికి ఉత్పత్తిని తెరిచి స్టాక్ ప్యానెల్ వాడండి — జోడించండి, తగ్గించండి (కారణం తప్పనిసరి) లేదా లెక్కించిన పరిమాణానికి సెట్ చేయండి. ప్రతి మార్పు, ప్రతి అమ్మకం, ప్రతి రద్దు చేసిన ఆర్డర్ స్టాక్ చరిత్రలో కనిపిస్తాయి. మీరు, అడ్మినిస్ట్రేటర్లు మాత్రమే మీ ఉత్పత్తులను సవరించగలరు; అడ్మినిస్ట్రేటర్ మీ వ్యాపార ఆమోదాన్ని తొలగిస్తే, మళ్ళీ ఆమోదించే వరకు మీ ఉత్పత్తులు షాప్ నుండి వెళ్ళిపోతాయి.',
      },
    ],
  },
  {
    id: 'expert',
    audience: ['EXPERT'],
    title: { en: 'Answering cases and writing articles', te: 'కేసులకు సమాధానం, వ్యాసాలు రాయడం' },
    body: [
      {
        en: 'Submit your qualifications first; once an administrator verifies you, cases can be assigned to you. Open a case: you see the farmer’s photos and videos and “What has been said on this case” — the whole conversation, including your earlier advice if the farmer disputed it. Then answer, or ask the farmer for more detail. Solved cases become draft articles you can edit and send for review.',
        te: 'ముందు మీ అర్హతలను సమర్పించండి; అడ్మినిస్ట్రేటర్ ధృవీకరించిన తర్వాత మీకు కేసులు కేటాయించబడతాయి. కేసు తెరవండి: రైతు ఫోటోలు, వీడియోలు, “ఈ కేసులో ఇప్పటివరకు చెప్పినవి” — రైతు వివాదం చేస్తే మీ ముందటి సలహా సహా మొత్తం సంభాషణ — కనిపిస్తాయి. తర్వాత సమాధానం ఇవ్వండి, లేదా రైతును మరిన్ని వివరాలు అడగండి. పరిష్కరించిన కేసులు మీరు సవరించి సమీక్షకు పంపగల డ్రాఫ్ట్ వ్యాసాలు అవుతాయి.',
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
        en: 'The queue shows orders ready to pack: UPI payment already verified (or an older Cash on Delivery order). Each row shows the receiver’s city, PIN and phone. Open an order, pack what you have and mark each item Sent; leave the rest Pending. Untick “ready to pack only” to see everything.',
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
        en: 'Forgot your password? For your safety only the store can reset it. Use “Forgot password” on the log-in screen and enter your mobile number — the store’s Administrators are told. Contact the store and quote your ID; an Administrator checks it is you and gives you a temporary password, and you choose your own as soon as you log in with it. Sign-up codes (not texted yet) appear on the screen under a red “Temporary” banner.',
        te: 'పాస్‌వర్డ్ మర్చిపోయారా? మీ భద్రత కోసం దాన్ని స్టోర్ మాత్రమే రీసెట్ చేయగలదు. లాగిన్ స్క్రీన్‌లో “పాస్‌వర్డ్ మర్చిపోయారా” ఉపయోగించి మీ మొబైల్ నంబర్ నమోదు చేయండి — స్టోర్ అడ్మినిస్ట్రేటర్లకు తెలియజేయబడుతుంది. స్టోర్‌ను సంప్రదించి మీ ID చెప్పండి; అది మీరేనని అడ్మినిస్ట్రేటర్ నిర్ధారించుకుని మీకు తాత్కాలిక పాస్‌వర్డ్ ఇస్తారు, దానితో లాగిన్ అయిన వెంటనే మీ స్వంతదాన్ని ఎంచుకుంటారు. సైన్-అప్ కోడ్‌లు (ఇంకా టెక్స్ట్ చేయబడవు) ఎరుపు “తాత్కాలికం” బ్యానర్ కింద స్క్రీన్‌పై కనిపిస్తాయి.',
      },
      {
        en: 'Every password box has an eye button at its right edge — tap it to see what you typed, and again to hide it.',
        te: 'ప్రతి పాస్‌వర్డ్ బాక్స్ కుడి అంచున కన్ను బటన్ ఉంటుంది — మీరు టైప్ చేసినది చూడటానికి దాన్ని తాకండి, దాచడానికి మళ్ళీ తాకండి.',
      },
    ],
  },
];

export function sectionsFor(audience: Audience): HelpSection[] {
  return HELP_SECTIONS.filter((s) => s.audience === 'ALL' || s.audience.includes(audience));
}
