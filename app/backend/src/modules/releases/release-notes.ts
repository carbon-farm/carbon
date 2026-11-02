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
      'యాప్ ఇప్పుడు కొత్త లోగోతో "ఆర్గానిక్ కార్బన్ ఫార్మింగ్ విత్ SPIN". సమస్య నివేదికలో ఇకపై వర్గం అడగదు (కొత్త కేసులు తెలియని సమస్యగా మొదలవుతాయి), కొత్త సాగు ఎంపిక — సేంద్రీయ మార్పు దిశగా — ఉంది. సభ్యులు తమ కేసు నుండి తప్పు ఫోటోను తొలగించవచ్చు, స్థలంలో ప్రతి పంట వయస్సు చూడవచ్చు, ఖాతాలో ఐచ్ఛికంగా తపాలా చిరునామా జోడించవచ్చు. మోడరేటర్లు, నిపుణులకు రైతు ఇచ్చిన పూర్తి వివరాలు కనిపిస్తాయి. టెస్టర్ల గైడ్, సహాయం, FAQలు, టూర్ నవీకరించబడ్డాయి.',
    ),
    linkPath: '/admin',
  },
];
