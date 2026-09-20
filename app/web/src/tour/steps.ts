// The first-visit tour. Each step points at something on screen (by a data-tour marker) and
// explains it in English then Telugu. A step whose target is not on the current screen is
// skipped, so one list serves every page a person might first land on.

export interface TourStep {
  // Value of the data-tour attribute to highlight. Omit for a centred welcome/finish card.
  target?: string;
  en: string;
  te: string;
}

export type Audience = 'GUEST' | 'MEMBER' | 'ADMINISTRATOR' | 'VENDOR' | 'EXPERT' | 'MODERATOR' | 'SUPPORT_AGENT';

const HELP: TourStep = {
  target: 'help',
  en: 'Stuck? Help has plain answers for every screen, and you can replay this tour from there any time.',
  te: 'ఇరుక్కున్నారా? ప్రతి స్క్రీన్‌కు సులభమైన సమాధానాలు Help లో ఉన్నాయి, అక్కడి నుండి ఈ టూర్‌ను ఎప్పుడైనా మళ్ళీ చూడవచ్చు.',
};

const BELL: TourStep = {
  target: 'bell',
  en: 'Notifications appear here — payment verified, order shipped, an answer to your question. The red number is how many are new.',
  te: 'నోటిఫికేషన్లు ఇక్కడ కనిపిస్తాయి — చెల్లింపు ధృవీకరణ, ఆర్డర్ షిప్ అయింది, మీ ప్రశ్నకు సమాధానం. ఎరుపు సంఖ్య కొత్తవి ఎన్నో చూపిస్తుంది.',
};

export const TOURS: Record<Audience, TourStep[]> = {
  GUEST: [
    {
      en: 'Welcome! You can look around the whole shop without signing in. This short tour shows where things are.',
      te: 'స్వాగతం! సైన్ ఇన్ కాకుండానే మీరు షాప్ మొత్తం చూడవచ్చు. వస్తువులు ఎక్కడున్నాయో ఈ చిన్న టూర్ చూపిస్తుంది.',
    },
    {
      target: 'filters',
      en: 'Narrow things down by Department, Category and Sub-category, search by name, and sort by price or newest.',
      te: 'విభాగం, వర్గం, ఉప-వర్గం ద్వారా వెతకండి, పేరుతో శోధించండి, ధర లేదా కొత్తవి ప్రకారం క్రమబద్ధీకరించండి.',
    },
    {
      target: 'products',
      en: 'Tap any product to see its price, stock, photos and reviews, then add it to your cart.',
      te: 'ఏదైనా ఉత్పత్తిని తాకి ధర, స్టాక్, ఫోటోలు, సమీక్షలు చూడండి, తర్వాత కార్ట్‌కు జోడించండి.',
    },
    {
      target: '/marketplace/cart',
      en: 'Your cart is saved on this device. When you log in or register it comes with you.',
      te: 'మీ కార్ట్ ఈ పరికరంలో సేవ్ అవుతుంది. మీరు లాగిన్ లేదా నమోదు చేసుకున్నప్పుడు అది మీతో వస్తుంది.',
    },
    {
      target: 'auth',
      en: 'Ready to buy? Register (or log in) to check out. Checkout and the farm-advice features need a membership.',
      te: 'కొనడానికి సిద్ధమా? చెక్అవుట్ కోసం నమోదు చేసుకోండి (లేదా లాగిన్ అవ్వండి). చెక్అవుట్, వ్యవసాయ సలహా సౌకర్యాలకు సభ్యత్వం అవసరం.',
    },
    HELP,
  ],

  MEMBER: [
    {
      en: 'Welcome! Here is a quick look at everything you can do. It takes about a minute, and you can skip it any time.',
      te: 'స్వాగతం! మీరు చేయగలిగినవన్నీ ఒక్కసారి చూద్దాం. దీనికి ఒక నిమిషం పడుతుంది, ఎప్పుడైనా దాటవేయవచ్చు.',
    },
    {
      target: 'user',
      en: 'Your name and personal ID (like HHC-0042) are always here. Quote the ID whenever you contact us or pay.',
      te: 'మీ పేరు, వ్యక్తిగత ID (HHC-0042 లాగా) ఎల్లప్పుడూ ఇక్కడ ఉంటాయి. మమ్మల్ని సంప్రదించినప్పుడు లేదా చెల్లించినప్పుడు ఈ ID చెప్పండి.',
    },
    {
      target: 'payment-strip',
      en: 'This strip means your membership payment is not confirmed yet. It disappears by itself once we verify your payment.',
      te: 'ఈ స్ట్రిప్ అంటే మీ సభ్యత్వ చెల్లింపు ఇంకా నిర్ధారణ కాలేదు. మేము మీ చెల్లింపును ధృవీకరించగానే అది దానంతట అదే మాయమవుతుంది.',
    },
    {
      target: '/marketplace',
      en: 'The Marketplace: farm inputs and natural foods together. Browse by Department, Category and Sub-category.',
      te: 'మార్కెట్‌ప్లేస్: వ్యవసాయ ఇన్‌పుట్లు, సహజ ఆహారాలు కలిపి. విభాగం, వర్గం, ఉప-వర్గం ద్వారా చూడండి.',
    },
    {
      target: '/marketplace/cart',
      en: 'Your cart. Change quantities here, then proceed to checkout.',
      te: 'మీ కార్ట్. ఇక్కడ పరిమాణాలు మార్చి, చెక్అవుట్‌కు వెళ్ళండి.',
    },
    {
      target: '/marketplace/orders',
      en: 'Your orders: see each one’s status, whether each item is Sent or Pending, and pay by UPI if you chose it.',
      te: 'మీ ఆర్డర్లు: ప్రతి ఆర్డర్ స్థితి, ప్రతి వస్తువు పంపబడిందా లేదా పెండింగ్‌లో ఉందా చూడండి, UPI ఎంచుకుంటే ఇక్కడ చెల్లించండి.',
    },
    {
      target: '/account/addresses',
      en: 'Save your delivery addresses once here and pick one at checkout.',
      te: 'మీ డెలివరీ చిరునామాలను ఇక్కడ ఒకసారి సేవ్ చేసి, చెక్అవుట్‌లో ఒకదాన్ని ఎంచుకోండి.',
    },
    {
      target: '/dashboard',
      en: 'Your farm dashboard: a summary of your cases and what needs your attention.',
      te: 'మీ వ్యవసాయ డాష్‌బోర్డ్: మీ కేసుల సారాంశం, మీ శ్రద్ధ అవసరమైనవి.',
    },
    {
      target: '/cases',
      en: 'My cases: describe a problem in your field with photos, and an expert will answer. Members only.',
      te: 'నా కేసులు: మీ పొలంలోని సమస్యను ఫోటోలతో వివరించండి, నిపుణుడు సమాధానం ఇస్తారు. సభ్యులకు మాత్రమే.',
    },
    {
      target: '/knowledge',
      en: 'Knowledge: advice articles written from real, solved cases. Bookmark the ones you like.',
      te: 'జ్ఞానం: నిజమైన, పరిష్కరించిన కేసుల నుండి రాసిన సలహా వ్యాసాలు. మీకు నచ్చినవాటిని బుక్‌మార్క్ చేయండి.',
    },
    {
      target: '/courses',
      en: 'Courses: lessons you can complete step by step, with a certificate at the end.',
      te: 'కోర్సులు: దశలవారీగా పూర్తి చేయగల పాఠాలు, చివర సర్టిఫికెట్‌తో.',
    },
    {
      target: '/soil-samples',
      en: 'Soil Testing: request a soil test for your land and read the report here.',
      te: 'నేల పరీక్ష: మీ భూమికి నేల పరీక్షను అభ్యర్థించి, నివేదికను ఇక్కడ చదవండి.',
    },
    {
      target: '/hariharaa/subscription',
      en: 'Your membership: pay by UPI, submit the reference number, and see how long it lasts. Checkout and farm advice unlock with it.',
      te: 'మీ సభ్యత్వం: UPI ద్వారా చెల్లించి, రిఫరెన్స్ నంబర్ సమర్పించండి, ఎంతకాలం ఉంటుందో చూడండి. దీనితో చెక్అవుట్, వ్యవసాయ సలహా అన్‌లాక్ అవుతాయి.',
    },
    BELL,
    HELP,
  ],

  ADMINISTRATOR: [
    {
      en: 'Welcome, Administrator. This tour shows where each of your tools is.',
      te: 'స్వాగతం, అడ్మినిస్ట్రేటర్. మీ ప్రతి సాధనం ఎక్కడ ఉందో ఈ టూర్ చూపిస్తుంది.',
    },
    { target: '/admin', en: 'The Admin hub: a one-page summary of what is waiting for you.', te: 'అడ్మిన్ హబ్: మీ కోసం వేచి ఉన్నవాటి ఒక పేజీ సారాంశం.' },
    { target: '/admin/staff', en: 'Staff accounts: create experts, moderators, vendors, support agents and administrators; switch accounts off or on.', te: 'సిబ్బంది ఖాతాలు: నిపుణులు, మోడరేటర్లు, విక్రేతలు, సపోర్ట్ ఏజెంట్లు, అడ్మినిస్ట్రేటర్లను సృష్టించండి; ఖాతాలను ఆఫ్ లేదా ఆన్ చేయండి.' },
    { target: '/admin/members', en: 'Members: everyone who signed up, labelled Paid, Free, Waiting, Unpaid or Expired. Give free access until a date here, for testing or friends of the store.', te: 'సభ్యులు: సైన్ అప్ అయిన అందరూ, చెల్లించారు, ఉచితం, వేచి ఉంది, చెల్లించలేదు లేదా గడువు ముగిసింది అని లేబుల్‌తో. పరీక్ష లేదా స్టోర్ మిత్రుల కోసం ఇక్కడ తేదీ వరకు ఉచిత ప్రాప్యత ఇవ్వండి.' },
    { target: '/admin/hariharaa-subscriptions', en: 'Membership payments waiting for you: check the UTR in the bank, then approve or reject with a reason.', te: 'మీ కోసం వేచి ఉన్న సభ్యత్వ చెల్లింపులు: బ్యాంకులో UTR తనిఖీ చేసి, ఆమోదించండి లేదా కారణంతో తిరస్కరించండి.' },
    { target: '/marketplace/manage/orders', en: 'The order queue. UPI orders must have their payment verified here before they can be confirmed and packed.', te: 'ఆర్డర్ క్యూ. UPI ఆర్డర్లను నిర్ధారించి ప్యాక్ చేసే ముందు ఇక్కడ చెల్లింపును ధృవీకరించాలి.' },
    { target: '/marketplace/manage/products', en: 'All products from every seller, with their stock and status.', te: 'అన్ని విక్రేతల ఉత్పత్తులు, వాటి స్టాక్, స్థితితో.' },
    { target: '/admin/taxonomy', en: 'Taxonomy: crops, regions and the shop’s Department → Category → Sub-category tree.', te: 'వర్గీకరణ: పంటలు, ప్రాంతాలు, షాప్ విభాగం → వర్గం → ఉప-వర్గం చెట్టు.' },
    { target: '/admin/membership-plans', en: 'Membership plans: set prices, add plans of different lengths (monthly, yearly…), switch each on or off, and turn the membership requirement off or on for everyone.', te: 'సభ్యత్వ ప్లాన్లు: ధరలు నిర్ణయించండి, వేర్వేరు వ్యవధుల ప్లాన్లను (నెలవారీ, వార్షిక…) చేర్చండి, ప్రతిదాన్ని ఆన్ లేదా ఆఫ్ చేయండి, అందరికీ సభ్యత్వ అవసరాన్ని ఆఫ్ లేదా ఆన్ చేయండి.' },
    { target: '/admin/hariharaa-settings', en: 'Settings: the UPI ID customers pay to (change it any time), the merchant ID and payee name.', te: 'సెట్టింగ్‌లు: కస్టమర్లు చెల్లించే UPI ID (ఎప్పుడైనా మార్చవచ్చు), మర్చంట్ ID, చెల్లింపు పొందేవారి పేరు.' },
    { target: '/admin/reports', en: 'Reports and the audit log show what is happening and who did what.', te: 'నివేదికలు, ఆడిట్ లాగ్ ఏం జరుగుతోందో, ఎవరు ఏం చేశారో చూపిస్తాయి.' },
    BELL,
    HELP,
  ],

  VENDOR: [
    { en: 'Welcome! This tour shows how to list and manage your products.', te: 'స్వాగతం! మీ ఉత్పత్తులను ఎలా జాబితా చేయాలో, నిర్వహించాలో ఈ టూర్ చూపిస్తుంది.' },
    { target: '/marketplace/vendor', en: 'Your vendor dashboard: submit your business for approval, then add products, prices, stock and photos. Pick each product’s category from the full Department › Category › Sub-category list.', te: 'మీ విక్రేత డాష్‌బోర్డ్: ఆమోదం కోసం మీ వ్యాపారాన్ని సమర్పించి, తర్వాత ఉత్పత్తులు, ధరలు, స్టాక్, ఫోటోలు జోడించండి. ప్రతి ఉత్పత్తి వర్గాన్ని పూర్తి విభాగం › వర్గం › ఉప-వర్గం జాబితా నుండి ఎంచుకోండి.' },
    { target: '/marketplace', en: 'See your products the way customers see them.', te: 'కస్టమర్లు చూసినట్లే మీ ఉత్పత్తులను చూడండి.' },
    BELL,
    HELP,
  ],

  EXPERT: [
    { en: 'Welcome! This tour shows where your work is.', te: 'స్వాగతం! మీ పని ఎక్కడ ఉందో ఈ టూర్ చూపిస్తుంది.' },
    { target: '/expert/cases', en: 'Cases assigned to you. Open one to read the farmer’s problem and photos, then answer.', te: 'మీకు కేటాయించిన కేసులు. రైతు సమస్య, ఫోటోలు చదివి సమాధానం ఇవ్వడానికి ఒకదాన్ని తెరవండి.' },
    { target: '/expert/articles', en: 'Articles drafted from solved cases. Edit, then submit them for review.', te: 'పరిష్కరించిన కేసుల నుండి రూపొందించిన వ్యాసాలు. సవరించి, సమీక్ష కోసం సమర్పించండి.' },
    { target: '/expert/credentials', en: 'Your qualifications: submit them so an Administrator can verify you.', te: 'మీ అర్హతలు: అడ్మినిస్ట్రేటర్ మిమ్మల్ని ధృవీకరించడానికి వాటిని సమర్పించండి.' },
    BELL,
    HELP,
  ],

  MODERATOR: [
    { en: 'Welcome! This tour shows your review queues.', te: 'స్వాగతం! మీ సమీక్ష క్యూలను ఈ టూర్ చూపిస్తుంది.' },
    { target: '/moderator/queue', en: 'The case queue: review new cases and assign them to the right expert.', te: 'కేసు క్యూ: కొత్త కేసులను సమీక్షించి, సరైన నిపుణుడికి కేటాయించండి.' },
    { target: '/moderator/articles', en: 'Article review: approve, reject or send articles back to the expert.', te: 'వ్యాసాల సమీక్ష: వ్యాసాలను ఆమోదించండి, తిరస్కరించండి లేదా నిపుణుడికి తిరిగి పంపండి.' },
    { target: '/courses/manage', en: 'Courses: build lessons and publish them.', te: 'కోర్సులు: పాఠాలను తయారు చేసి ప్రచురించండి.' },
    { target: '/soil-samples/manage', en: 'The soil-sample queue: track each sample through to its report.', te: 'నేల నమూనా క్యూ: ప్రతి నమూనాను నివేదిక వరకు ట్రాక్ చేయండి.' },
    BELL,
    HELP,
  ],

  SUPPORT_AGENT: [
    { en: 'Welcome! This tour shows how to dispatch orders.', te: 'స్వాగతం! ఆర్డర్లను ఎలా పంపాలో ఈ టూర్ చూపిస్తుంది.' },
    { target: '/support/dispatch-queue', en: 'The dispatch queue: orders ready to pack (Cash on Delivery, or UPI already verified) with the receiver’s city, PIN and phone. Open one and mark each item Sent or Pending — if some stock is short, send what you have.', te: 'డిస్పాచ్ క్యూ: ప్యాక్ చేయడానికి సిద్ధమైన ఆర్డర్లు (క్యాష్ ఆన్ డెలివరీ, లేదా ఇప్పటికే ధృవీకరించిన UPI), స్వీకర్త నగరం, పిన్, ఫోన్‌తో. ఒకదాన్ని తెరిచి ప్రతి వస్తువును పంపబడింది లేదా పెండింగ్ అని గుర్తించండి — కొంత స్టాక్ తక్కువైతే, ఉన్నది పంపండి.' },
    BELL,
    HELP,
  ],
};

export function audienceFor(role: string | undefined): Audience {
  if (!role) return 'GUEST';
  return role in TOURS ? (role as Audience) : 'GUEST';
}

// Bump the version to show the tour again to everyone after a big change to the app.
export const TOUR_VERSION = 1;
export const tourStorageKey = (audience: Audience, userId?: string | null) => `agriai.tour.v${TOUR_VERSION}.${audience}${userId ? `.${userId}` : ''}`;
