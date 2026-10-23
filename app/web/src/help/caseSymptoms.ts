import type { HelpText } from './content';

// Pick-from-a-picture-or-word symptoms for a new case, so a farmer who finds typing hard can still
// describe the problem. The chosen ones are added to the description as a short list.
export interface Symptom {
  id: string;
  icon: string;
  label: HelpText;
}

export const SYMPTOMS: Symptom[] = [
  { id: 'yellow-leaves', icon: '🍂', label: { en: 'Leaves turning yellow', te: 'ఆకులు పసుపు రంగులోకి మారుతున్నాయి' } },
  { id: 'leaf-spots', icon: '🟤', label: { en: 'Spots on leaves', te: 'ఆకులపై మచ్చలు' } },
  { id: 'wilting', icon: '🥀', label: { en: 'Wilting or drying', te: 'వాడిపోవడం లేదా ఎండిపోవడం' } },
  { id: 'insects', icon: '🐛', label: { en: 'Insects or worms seen', te: 'పురుగులు కనిపిస్తున్నాయి' } },
  { id: 'holes', icon: '🕳️', label: { en: 'Holes in leaves or fruit', te: 'ఆకులు లేదా కాయల్లో రంధ్రాలు' } },
  { id: 'white-powder', icon: '⚪', label: { en: 'White powder or fungus', te: 'తెల్లటి పొడి లేదా శిలీంధ్రం' } },
  { id: 'curling', icon: '🌀', label: { en: 'Leaves curling', te: 'ఆకులు ముడుచుకుపోతున్నాయి' } },
  { id: 'flower-drop', icon: '🌼', label: { en: 'Flowers or fruit dropping', te: 'పువ్వులు లేదా కాయలు రాలిపోతున్నాయి' } },
  { id: 'stunted', icon: '🌱', label: { en: 'Poor or slow growth', te: 'ఎదుగుదల తక్కువగా ఉంది' } },
  { id: 'root-rot', icon: '🪱', label: { en: 'Roots or stem rotting', te: 'వేర్లు లేదా కాండం కుళ్ళిపోతున్నాయి' } },
  { id: 'soil', icon: '🟫', label: { en: 'Soil problem (hard, salty, dry)', te: 'నేల సమస్య (గట్టిగా, ఉప్పగా, పొడిగా)' } },
  { id: 'weeds', icon: '🌿', label: { en: 'Too many weeds', te: 'కలుపు ఎక్కువగా ఉంది' } },
];
