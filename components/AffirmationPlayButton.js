"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  pickAffirmationVoiceUrl,
  toPlayableAffirmationAudioUrl,
} from "../lib/affirmationVoiceUrl";

export default function AffirmationPlayButton({
  affirmation,
  text,
  lang,
  voiceProxyOrigin,
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const rawVoice = affirmation
    ? pickAffirmationVoiceUrl(affirmation)
    : "";
  const playableVoice = rawVoice
    ? toPlayableAffirmationAudioUrl(rawVoice, voiceProxyOrigin)
    : "";

  const textOnly = (() => {
    const t = affirmation?.text ?? text;
    return typeof t === "string" ? t.trim() : "";
  })();

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  function speakTextOnly() {
    if (!textOnly) return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      window.alert?.("This browser does not support text-to-speech.");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(textOnly);
    u.lang =
      lang ||
      (typeof navigator !== "undefined" && navigator.language) ||
      "en-US";
    u.rate = 0.92;
    u.pitch = 1;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(u);
  }

  async function playVoice() {
    if (!playableVoice) return;
    window.speechSynthesis?.cancel();
    if (!audioRef.current) audioRef.current = new Audio();
    const el = audioRef.current;
    el.pause();
    el.currentTime = 0;
    el.src = playableVoice;
    el.onended = () => setPlaying(false);
    el.onerror = () => setPlaying(false);
    setPlaying(true);
    try {
      await el.play();
    } catch {
      setPlaying(false);
    }
  }

  function toggle() {
    if (playing) {
      stop();
      return;
    }
    if (rawVoice && playableVoice) {
      void playVoice();
      return;
    }
    speakTextOnly();
  }

  const canPlay = Boolean(rawVoice || textOnly);
  const modeHint = rawVoice
    ? "Play recorded voice"
    : textOnly
      ? "Play text (no recording)"
      : "No voice or text";

  if (!canPlay) {
    return (
      <span className="muted affirmation-play-empty" title={modeHint}>
        —
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`affirmation-play-btn ghost-button${playing ? " affirmation-play-btn--active" : ""}`}
      onClick={toggle}
      title={playing ? "Stop" : modeHint}
      aria-label={
        playing ? "Stop playback" : rawVoice ? "Play user voice" : "Play text"
      }
    >
      {playing ? (
        <span className="affirmation-play-icon" aria-hidden>
          ■
        </span>
      ) : (
        <span className="affirmation-play-icon" aria-hidden>
          ▶
        </span>
      )}
    </button>
  );
}
