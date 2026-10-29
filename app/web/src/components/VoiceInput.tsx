import { useEffect, useRef, useState } from 'react';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// "Speak your problem": the phone's own speech recognition turns what is said into text, in Telugu
// or English. Nothing is sent anywhere until the person presses "Use this": they first see (and can
// edit) the words it heard and play back their own recording, and they can record again as many
// times as they like. The recording lives only in this page, on the phone, for the playback — it is
// never uploaded. The control only appears where the browser offers speech recognition (Chrome on
// Android does; some others do not) — elsewhere the keyboard's microphone key does the same job.

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

interface Review {
  text: string;
  audioUrl: string | null;
}

export function VoiceInput({ onText }: { onText: (text: string) => void }) {
  const Ctor = typeof window === 'undefined' ? null : recognitionCtor();
  const [lang, setLang] = useState<'te-IN' | 'en-IN'>('te-IN');
  const [listening, setListening] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const heardRef = useRef('');
  const finishedRef = useRef(true);
  const urlRef = useRef<string | null>(null);

  function dropAudio() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }

  function releaseMic() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(
    () => () => {
      recRef.current?.stop();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      releaseMic();
      dropAudio();
    },
    [],
  );

  if (!Ctor) return null;

  // The recognition has ended: close the recording and show what we have for the person to check.
  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setListening(false);
    const recorder = recorderRef.current;
    const show = () => {
      let audioUrl: string | null = null;
      if (chunksRef.current.length > 0) {
        audioUrl = URL.createObjectURL(new Blob(chunksRef.current, { type: recorder?.mimeType || 'audio/webm' }));
        urlRef.current = audioUrl;
      }
      releaseMic();
      const text = heardRef.current.trim();
      if (!text && !audioUrl) {
        setProblem('nospeech');
        return;
      }
      setReview({ text, audioUrl });
    };
    if (recorder && recorder.state === 'recording') {
      recorder.onstop = show;
      recorder.stop();
    } else {
      show();
    }
  }

  async function start() {
    if (!Ctor) return;
    setProblem(null);
    setReview(null);
    dropAudio();
    heardRef.current = '';
    chunksRef.current = [];
    finishedRef.current = false;

    // Best effort: keep a copy of the audio so it can be played back. If the phone will not let two
    // things listen at once, the words are still shown — only the playback is missing.
    recorderRef.current = null;
    try {
      if (typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
        recorder.start();
        recorderRef.current = recorder;
      }
    } catch {
      releaseMic();
    }

    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) heardRef.current += `${heardRef.current ? ' ' : ''}${e.results[i][0].transcript.trim()}`;
      }
    };
    rec.onerror = (e) => {
      setProblem(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'permission' : e.error === 'no-speech' ? 'nospeech' : 'other');
    };
    rec.onend = finish;
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      finishedRef.current = true;
      setListening(false);
      releaseMic();
    }
  }

  function stop() {
    recRef.current?.stop();
  }

  function useThis() {
    if (review?.text.trim()) onText(review.text.trim());
    dropAudio();
    setReview(null);
  }

  function discard() {
    dropAudio();
    setReview(null);
  }

  return (
    <div className="voice-input">
      <button type="button" className={listening ? 'voice-btn listening' : 'voice-btn'} onClick={listening ? stop : () => void start()} aria-pressed={listening}>
        <span aria-hidden="true">🎤</span> <Bi id={listening ? 'voiceStop' : review ? 'voiceRecordAgain' : 'voiceStart'} />
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
      {review && (
        <div className="voice-review card" role="group" aria-label={biInline('voiceReviewHeading')}>
          <Bi id="voiceReviewHeading" as="strong" />
          {review.audioUrl && <audio controls src={review.audioUrl} preload="auto" />}
          <label>
            <Bi id="voiceHeardLabel" />
            <textarea value={review.text} onChange={(e) => setReview({ ...review, text: e.target.value })} rows={3} placeholder={biInline('voiceHeardPlaceholder')} />
          </label>
          {!review.text.trim() && <BiValue value={strings.voiceNoTextHint} as="small" className="hint" />}
          <div className="button-row">
            <button type="button" onClick={useThis} disabled={!review.text.trim()}>
              <Bi id="voiceUseThis" />
            </button>
            <button type="button" className="secondary" onClick={() => void start()}>
              <Bi id="voiceRecordAgain" />
            </button>
            <button type="button" className="secondary" onClick={discard}>
              <Bi id="voiceDiscard" />
            </button>
          </div>
          <small className="hint">
            <Bi id="voiceStaysOnPhone" />
          </small>
        </div>
      )}
    </div>
  );
}
