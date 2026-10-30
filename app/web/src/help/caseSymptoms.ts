import type { HelpText } from './content';

// Pick-from-a-picture-or-word symptoms for a new case, so a farmer who finds typing hard can still
// describe the problem. The chosen ones are added to the description as a short list.
export interface Symptom {
  id: string;
  icon: string;
  // What the farmer is asked on the button, as a question.
  question: HelpText;
  // How it is written into the case for the expert once ticked.
  label: HelpText;
}

// Buttons that no longer exist, still understood when an old draft or a case queued on a phone
// before this change is sent.
export const LEGACY_SYMPTOM_LABELS: Record<string, HelpText> = {
  soil: { en: 'Soil problem (hard, salty, dry)', te: 'నేల సమస్య (గట్టిగా, ఉప్పగా, పొడిగా)' },
  weeds: { en: 'Too many weeds', te: 'కలుపు ఎక్కువగా ఉంది' },
};

export const SYMPTOMS: Symptom[] = [
  {
    id: 'yellow-leaves',
    icon: '🍂',
    question: { en: 'Have the leaves changed colour (turning yellow)?', te: 'ఆకులు ఏమైనా రంగులు మారాయా?' },
    label: { en: 'Leaves turning yellow', te: 'ఆకులు పసుపు రంగులోకి మారుతున్నాయి' },
  },
  {
    id: 'leaf-spots',
    icon: '🟤',
    question: { en: 'Do you see spots on the leaves?', te: 'ఆకులపై మచ్చలు కనిపిస్తున్నాయా?' },
    label: { en: 'Spots on leaves', te: 'ఆకులపై మచ్చలు' },
  },
  {
    id: 'wilting',
    icon: '🥀',
    question: {
      en: 'Is the plant drying from the top, or wilting from the bottom or the middle?',
      te: 'మొక్క పై నుండి ఎండిపోతోందా, లేదా కింద నుండి లేక మధ్యలో నుండి వాడిపోతోందా?',
    },
    label: { en: 'Wilting or drying', te: 'వాడిపోవడం లేదా ఎండిపోవడం' },
  },
  {
    id: 'insects',
    icon: '🐛',
    question: {
      en: 'Do you see caterpillars, grasshoppers, beetles, flies or mosquitoes, sap-sucking insects, mites or snails?',
      te: 'గొంగళి పురుగులు, మిడతలు, ముక్కు/పెంకు పురుగులు, ఈగలు/దోమలు, రసం పీల్చే పురుగులు, గజ్జి పురుగులు, జెలగలు, నత్తలు కనిపిస్తున్నాయా?',
    },
    label: { en: 'Insects or worms seen', te: 'పురుగులు కనిపిస్తున్నాయి' },
  },
  {
    id: 'holes',
    icon: '🕳️',
    question: { en: 'Do you see spots, holes or worms in the fruit?', te: 'కాయలపై మచ్చలు, బెజ్జాలు లేదా కాయల్లో పురుగులు కనిపిస్తున్నాయా?' },
    label: { en: 'Spots, holes or worms in the fruit', te: 'కాయలపై మచ్చలు, బెజ్జాలు లేదా పురుగులు' },
  },
  {
    id: 'white-powder',
    icon: '⚪',
    question: { en: 'Do you see any fungal or bacterial disease?', te: 'ఏమైనా శిలీంధ్ర లేదా బాక్టీరియా తెగులు కనిపిస్తున్నాయా?' },
    label: { en: 'Fungal or bacterial disease seen', te: 'శిలీంధ్ర లేదా బాక్టీరియా తెగులు కనిపిస్తోంది' },
  },
  {
    id: 'curling',
    icon: '🌀',
    question: { en: 'Do you see a viral disease (leaves curling)?', te: 'వైరల్ తెగులు (ఆకులు ముడుచుకోవడం) కనిపిస్తోందా?' },
    label: { en: 'Viral disease seen (leaves curling)', te: 'వైరల్ తెగులు కనిపిస్తోంది (ఆకులు ముడుచుకోవడం)' },
  },
  {
    id: 'flower-drop',
    icon: '🌼',
    question: { en: 'Are flowers, young fruit or fruit dropping?', te: 'పూత, పిందె లేదా కాయలు ఏమైనా రాలుతున్నాయా?' },
    label: { en: 'Flowers or fruit dropping', te: 'పువ్వులు లేదా కాయలు రాలిపోతున్నాయి' },
  },
  {
    id: 'stunted',
    icon: '🌱',
    question: { en: 'Are the plants not growing healthily?', te: 'మొక్కలు ఆరోగ్యంగా ఎదగడం లేదా?' },
    label: { en: 'Poor or slow growth', te: 'ఎదుగుదల తక్కువగా ఉంది' },
  },
  {
    id: 'root-rot',
    icon: '🪱',
    question: { en: 'Are the roots or the stem rotting?', te: 'వేర్లు లేదా కాండం కుళ్ళిపోతున్నాయా?' },
    label: { en: 'Roots or stem rotting', te: 'వేర్లు లేదా కాండం కుళ్ళిపోతున్నాయి' },
  },
];

// Pick-one questions: tap an answer to choose it, tap it again to clear it. The answers are written
// into the case after the symptoms, in English and Telugu.
export interface ChoiceOption {
  id: string;
  label: HelpText;
}

export interface ChoiceQuestion {
  id: string;
  // Asked on the screen.
  question: HelpText;
  // Short name used in the written case ("Soil: …").
  summary: HelpText;
  options: ChoiceOption[];
}

const YES_NO: ChoiceOption[] = [
  { id: 'yes', label: { en: 'Yes', te: 'అవును' } },
  { id: 'no', label: { en: 'No', te: 'కాదు' } },
];

// Asked together with the symptoms (step 2).
export const SOIL_QUESTIONS: ChoiceQuestion[] = [
  {
    id: 'soilType',
    question: { en: 'What is your soil like?', te: 'మీ భూమి స్వభావం ఏమిటి?' },
    summary: { en: 'Soil', te: 'నేల' },
    options: [
      { id: 'red-clay', label: { en: 'Red soil – clay', te: 'ఎర్ర నేల – ఎర్ర బంక నేల' } },
      { id: 'red-sandy', label: { en: 'Red soil – sandy', te: 'ఎర్ర నేల – ఎర్ర ఇసుక పొర నేల' } },
      { id: 'black-clay', label: { en: 'Black soil – clay', te: 'నల్ల నేల – నల్ల బంక నేల' } },
      { id: 'black-sandy', label: { en: 'Black soil – sandy', te: 'నల్ల నేల – నల్ల ఇసుక పొర నేల' } },
    ],
  },
  {
    id: 'soilTested',
    question: { en: 'Have you had your soil tested at the OCF-SPIN lab?', te: 'మీ మట్టిని OCF-SPIN ల్యాబ్‌లో పరీక్ష చేయించారా?' },
    summary: { en: 'Soil tested at OCF-SPIN lab', te: 'OCF-SPIN ల్యాబ్‌లో మట్టి పరీక్ష' },
    options: YES_NO,
  },
  {
    id: 'weeds',
    question: { en: 'How much weed growth is there?', te: 'కలుపు ప్రభావం ఎంత ఉంది?' },
    summary: { en: 'Weed growth', te: 'కలుపు' },
    options: [
      { id: 'high', label: { en: 'A lot', te: 'ఎక్కువ' } },
      { id: 'medium', label: { en: 'Moderate', te: 'ఓ మాదిరిగా' } },
      { id: 'low', label: { en: 'Light', te: 'పల్చగా' } },
    ],
  },
];

// Asked under "3. More details we need".
export const FIELD_QUESTIONS: ChoiceQuestion[] = [
  {
    id: 'irrigation',
    question: { en: 'How does your field get water?', te: 'మీ పొలానికి నీరు ఎలా అందుతుంది?' },
    summary: { en: 'Water', te: 'నీరు' },
    options: [
      { id: 'flood', label: { en: 'Flood / canal irrigation', te: 'నీటి పారుదల' } },
      { id: 'drip', label: { en: 'Drip', te: 'డ్రిప్' } },
      { id: 'rainfed', label: { en: 'Rain-fed', te: 'వర్షాధారం' } },
    ],
  },
  {
    id: 'farmingMethod',
    question: { en: 'How have you farmed this land so far?', te: 'ఇప్పటి వరకు ఈ భూమిలో మీరు ఎలా సాగు చేశారు?' },
    summary: { en: 'Farming so far', te: 'ఇప్పటి వరకు సాగు' },
    options: [
      { id: 'chemical', label: { en: 'Chemical', te: 'రసాయనిక' } },
      { id: 'organic', label: { en: 'Organic', te: 'సేంద్రియ' } },
      { id: 'natural', label: { en: 'Natural farming', te: 'ప్రకృతి' } },
    ],
  },
];

export const CHOICE_QUESTIONS: ChoiceQuestion[] = [...SOIL_QUESTIONS, ...FIELD_QUESTIONS];
