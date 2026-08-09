import type { ChangeEvent, FormEvent } from 'react';

type Validatable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function decimalPlaces(step: string): number {
  const dot = step.indexOf('.');
  return dot === -1 ? 0 : step.length - dot - 1;
}

// Native HTML5 validation tooltips ("Please fill out this field") come from
// the browser's own locale, not from src/i18n/strings.ts — they bypass the
// whole bilingual system silently. setCustomValidity() is the only way to
// override them; this is that override, applied generically across every
// constraint type actually used in this app's forms (required, minLength,
// pattern, min) and every field type (input, select, textarea all share the
// same ValidityState shape via ElementInternals).
export function bilingualInvalidHandler(event: FormEvent<Validatable>): void {
  const input = event.currentTarget;
  const v = input.validity;

  if (v.valueMissing) {
    input.setCustomValidity('This field is required / ఈ ఫీల్డ్ తప్పనిసరి');
  } else if (v.tooShort && 'minLength' in input) {
    input.setCustomValidity(
      `Must be at least ${input.minLength} characters / కనీసం ${input.minLength} అక్షరాలు ఉండాలి`,
    );
  } else if (v.patternMismatch) {
    input.setCustomValidity('Enter a valid value in the format shown / చూపిన ఫార్మాట్‌లో సరైన విలువను నమోదు చేయండి');
  } else if (v.rangeUnderflow && 'min' in input) {
    input.setCustomValidity(`Enter a value of at least ${input.min} / కనీసం ${input.min} విలువను నమోదు చేయండి`);
  } else if (v.stepMismatch && 'step' in input) {
    input.setCustomValidity(
      `Enter a number with at most ${decimalPlaces(String(input.step))} decimal place(s) / అత్యధికం ${decimalPlaces(String(input.step))} దశాంశ స్థానాలతో సంఖ్యను నమోదు చేయండి`,
    );
  } else if (v.typeMismatch) {
    input.setCustomValidity('Enter a valid value / సరైన విలువను నమోదు చేయండి');
  } else {
    input.setCustomValidity('Please check this field / దయచేసి ఈ ఫీల్డ్‌ను తనిఖీ చేయండి');
  }
}

// The browser only re-checks validity on the next submit attempt, and a
// custom message set once would otherwise stick even after the farmer fixes
// the field — this clears it on every keystroke so the tooltip disappears
// the moment the input becomes valid again.
export function clearCustomValidity(event: ChangeEvent<Validatable>): void {
  event.currentTarget.setCustomValidity('');
}
