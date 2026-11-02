import { bi } from '../../common/i18n';

// One entry per update. Every update that reaches the live app adds an entry here: when the new
// version starts, every active Administrator gets it as a notification (once; see ReleasesService).
// Write it for an administrator, in English then Telugu, saying what changed and where to see it.
// Keep `id` unique and never change it after release (it is how "already told them" is remembered).
export interface ReleaseNote {
  id: string;
  title: string;
  body: string;
  linkPath?: string;
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    id: '2026-11-02-logo-and-case-flow',
    title: bi('Update: new logo, simpler problem report, fuller case details', 'అప్‌డేట్: కొత్త లోగో, సులభమైన సమస్య నివేదిక, పూర్తి కేసు వివరాలు'),
    body: bi(
      'The app is now "Organic Carbon Farming with SPIN" with the new logo. Report a problem no longer asks for a category (new cases start as Unknown Problem) and has a new farming choice, Transitioning to Organic. Members can remove a wrong photo from their case, see how old each crop is on their parcel, and add an optional postal address under Account. Moderators and experts now see all the details the farmer gave. The testers guide, help, FAQs and tour are updated.',
      'యాప్ ఇప్పుడు కొత్త లోగోతో "ఆర్గానిక్ కార్బన్ ఫార్మింగ్ విత్ SPIN". సమస్య నివేదికలో ఇకపై వర్గం అడగదు (కొత్త కేసులు తెలియని సమస్యగా మొదలవుతాయి), కొత్త సాగు ఎంపిక — సేంద్రియ మార్పు దిశగా — ఉంది. సభ్యులు తమ కేసు నుండి తప్పు ఫోటోను తొలగించవచ్చు, స్థలంలో ప్రతి పంట వయస్సు చూడవచ్చు, ఖాతాలో ఐచ్ఛికంగా తపాలా చిరునామా జోడించవచ్చు. మోడరేటర్లు, నిపుణులకు రైతు ఇచ్చిన పూర్తి వివరాలు కనిపిస్తాయి. టెస్టర్ల గైడ్, సహాయం, FAQలు, టూర్ నవీకరించబడ్డాయి.',
    ),
    linkPath: '/admin',
  },
  {
    id: '2026-11-02-audit-fixes',
    title: bi('Update: moderators and experts can set a case category; fixes after review', 'అప్‌డేట్: మోడరేటర్లు, నిపుణులు కేసు వర్గాన్ని సెట్ చేయవచ్చు; సమీక్ష తర్వాత సవరణలు'),
    body: bi(
      'Moderators (and the assigned expert) can now set the category of a case, because new cases start as Unknown Problem. When a farmer removes a photo, the assigned expert is notified. Crop age is counted as of the day the problem was reported. Administrators can now see each member postal address under Members. Several smaller fixes to the new case form and photo removal.',
      'కొత్త కేసులు తెలియని సమస్యగా మొదలవుతాయి కాబట్టి మోడరేటర్లు (మరియు కేటాయించిన నిపుణుడు) ఇప్పుడు కేసు వర్గాన్ని సెట్ చేయవచ్చు. రైతు ఫోటోను తొలగిస్తే కేటాయించిన నిపుణుడికి తెలియజేయబడుతుంది. పంట వయస్సు సమస్యను నివేదించిన రోజు నాటికి లెక్కించబడుతుంది. అడ్మినిస్ట్రేటర్లు ఇప్పుడు సభ్యుల పేజీలో ప్రతి సభ్యుని తపాలా చిరునామా చూడవచ్చు. కొత్త కేసు ఫారం, ఫోటో తొలగింపులో మరికొన్ని చిన్న సవరణలు.',
    ),
    linkPath: '/admin/members',
  },
  {
    id: '2026-11-02-water-and-pest-shop',
    title: bi('Update: more water choices, and Pest Control and Mother Cultures in the shop', 'అప్‌డేట్: నీటి ఎంపికలు పెరిగాయి; షాప్‌లో చీడపీడల నివారణ, మదర్ కల్చర్లు'),
    body: bi(
      'Report a problem now offers Sprinkler and Rain hose under "How does your field get water?". The shop has two new groups under Farm Inputs: Pest Control (Solar Light Traps, Sticky Traps, Pheromone Traps & Lures) and Mother Cultures. Add products to them under Marketplace, and rename or reorder them under Taxonomy, Product categories. Help, FAQs and the testers guide are updated.',
      'సమస్య నివేదికలో "మీ పొలానికి నీరు ఎలా అందుతుంది?" కింద ఇప్పుడు స్ప్రింక్లర్, రెయిన్ హోస్ ఎంపికలు ఉన్నాయి. షాప్‌లో వ్యవసాయ ఇన్‌పుట్ల కింద రెండు కొత్త విభాగాలు: చీడపీడల నివారణ (సోలార్ లైట్ ట్రాప్స్, జిగురు ట్రాప్స్, ఫెరోమోన్ ట్రాప్స్ & ల్యూర్స్) మరియు మదర్ కల్చర్లు. వీటిలో ఉత్పత్తులను మార్కెట్‌ప్లేస్‌లో జోడించండి; పేరు మార్చడానికి లేదా క్రమం మార్చడానికి వర్గీకరణ, ఉత్పత్తి వర్గాలు చూడండి. సహాయం, FAQలు, టెస్టర్ల గైడ్ నవీకరించబడ్డాయి.',
    ),
    linkPath: '/marketplace',
  },
];
