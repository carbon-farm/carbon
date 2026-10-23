import { useEffect, useRef, useState } from 'react';
import { Bi } from '../i18n/Bi';

// "Speak your problem": fills a text box from the phone's own speech recognition, in Telugu or
// English. It only appears where the browser offers speech recognition (Chrome on Android does;
// some others do not) — elsewhere the keyboard's microphone key does the same job, which the
// hint beside it mentions. Nothing is recorded or sent by us: the browser does the listening.

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type Ctor = new () => SpeechRecognitionLike;

function recognitionCtor(): Ctor | null {
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceInput({ onText }: { onText: (text: string) => void }) {
  const Ctor = typeof window === 'undefined' ? null : recognitionCtor();
  const [lang, setLang] = useState<'te-IN' | 'en-IN'>('te-IN');
  const [listening, setListening] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => recRef.current?.stop(), []);

  if (!Ctor) return null;

  function start() {
    if (!Ctor) return;
    setProblem(null);
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript;
      }
      if (text.trim()) onText(text.trim());
    };
    rec.onerror = (e) => {
      setProblem(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'permission' : e.error === 'no-speech' ? 'nospeech' : 'other');
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stop() {
    recRef.current?.stop();
    setListening(false);
  }

  return (
    <div className="voice-input">
      <button type="button" className={listening ? 'voice-btn listening' : 'voice-btn'} onClick={listening ? stop : start} aria-pressed={listening}>
        <span aria-hidden="true">🎤</span> <Bi id={listening ? 'voiceStop' : 'voiceStart'} />
      </button>
      <div className="voice-lang" role="group" aria-label="Language / భాష">
        {(['te-IN', 'en-IN'] as const).map((l) => (
          <button key={l} type="button" className={lang === l ? 'chip-on' : 'secondary'} onClick={() => setLang(l)} disabled={listening}>
            {l === 'te-IN' ? 'తెలుగు' : 'English'}
          </button>
        ))}
      </div>
      {problem && (
        <small className="voice-problem" role="status">
          <Bi id={problem === 'permission' ? 'voiceNoPermission' : problem === 'nospeech' ? 'voiceNoSpeech' : 'voiceFailed'} />
        </small>
      )}
    </div>
  );
}
