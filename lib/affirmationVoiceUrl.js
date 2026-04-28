/**
 * Resolves a playable voice URL from an affirmation object returned by the API.
 * Field names vary by backend version — explicit keys, then a shallow/deep scan.
 */

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|#|$)/i;
const AUDIO_EXT = /\.(m4a|mp3|wav|aac|ogg|webm|mpeg|mp4)(\?|#|$)/i;

function normalizeMediaPath(s) {
  let t = (s || "").trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (!t.startsWith("/") && /^[\w-][\w-./]*\/[\w./-]+$/i.test(t)) {
    t = `/${t}`;
  }
  return t;
}

function stringifyMediaCandidate(val) {
  if (typeof val === "string") return normalizeMediaPath(val);
  if (!val || typeof val !== "object") return "";
  for (const k of [
    "url",
    "uri",
    "src",
    "path",
    "location",
    "file",
    "link",
    "fileUrl",
    "publicUrl",
    "secureUrl",
  ]) {
    if (typeof val[k] === "string" && val[k].trim()) {
      return normalizeMediaPath(val[k]);
    }
  }
  return "";
}

function deepFindVoiceStrings(value, depth, seen, out) {
  if (depth > 12 || out.length >= 12 || value == null) return;
  if (typeof value === "string") {
    const t = value.trim();
    if (!t || t.length > 2048 || IMAGE_EXT.test(t)) return;
    if (AUDIO_EXT.test(t) && (/^https?:\/\//i.test(t) || t.startsWith("/"))) {
      out.push(t);
      return;
    }
    if (
      /^https?:\/\//i.test(t) &&
      /voice|audio|record|sound|affirm|media|upload|file|m4a|mp3|wav|aac|ogg|webm/i.test(
        t
      )
    ) {
      out.push(t);
    }
    return;
  }
  if (typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      deepFindVoiceStrings(item, depth + 1, seen, out);
      if (out.length >= 12) return;
    }
    return;
  }

  const keys = Object.keys(value);
  keys.sort((a, b) => {
    const pa = /voice|audio|record|sound|media|file|attachment|url/i.test(a)
      ? 0
      : 1;
    const pb = /voice|audio|record|sound|media|file|attachment|url/i.test(b)
      ? 0
      : 1;
    return pa - pb;
  });

  for (const k of keys) {
    deepFindVoiceStrings(value[k], depth + 1, seen, out);
    if (out.length >= 12) return;
  }
}

export function pickAffirmationVoiceUrl(record) {
  if (!record || typeof record !== "object") return "";

  if (typeof record.voice === "string" && record.voice.trim()) {
    return normalizeMediaPath(record.voice);
  }
  if (typeof record.audio === "string" && record.audio.trim()) {
    return normalizeMediaPath(record.audio);
  }

  const from = [
    record.voiceUrl,
    record.voiceURL,
    record.audioUrl,
    record.audioURL,
    record.recordingUrl,
    record.voiceRecording,
    record.voiceFile,
    record.soundUrl,
    record.mediaUrl,
    record.fileUrl,
    record.affirmationVoice,
    record.voiceNote,
    record.audioFile,
    record.voice_url,
    record.audio_url,
    record.recording_url,
    record.sound_url,
    record.media_url,
    record.file_url,
    record.voice_path,
    record.audio_path,
    record.voicePath,
    record.audioPath,
    record.files?.[0]?.url,
    record.files?.[0]?.file,
    record.voice?.url,
    record.voice?.file,
    record.voice?.path,
    record.voice?.location,
    record.voice?.uri,
    record.audio?.url,
    record.audio?.file,
    record.media?.url,
    record.media?.file,
    record.recording?.url,
    record.attachments?.[0]?.url,
    record.attachments?.[0]?.file,
    record.voiceData,
    record.audioData,
  ];

  for (const v of from) {
    const s = stringifyMediaCandidate(v);
    if (s) return s;
  }

  const found = [];
  deepFindVoiceStrings(record, 0, new WeakSet(), found);
  if (found.length) return normalizeMediaPath(found[0]);

  return "";
}

/**
 * URL for <audio src>: same-origin proxy (JWT) for backend paths / same-host URLs,
 * or direct URL for public CDNs.
 */
export function toPlayableAffirmationAudioUrl(raw, voiceProxyOrigin) {
  const t = normalizeMediaPath(raw);
  if (!t) return "";

  if (t.startsWith("/")) {
    return `/api/admin/affirmation-voice?path=${encodeURIComponent(t)}`;
  }

  if (/^https?:\/\//i.test(t)) {
    const originBase = (voiceProxyOrigin || "").trim().replace(/\/+$/, "");
    if (originBase) {
      try {
        const baseUrl = new URL(
          originBase.startsWith("http") ? originBase : `https://${originBase}`
        );
        const targetUrl = new URL(t);
        const sameHost =
          targetUrl.hostname === baseUrl.hostname &&
          targetUrl.port === baseUrl.port;
        if (sameHost || t.startsWith(`${originBase}/`) || t === originBase) {
          return `/api/admin/affirmation-voice?src=${encodeURIComponent(t)}`;
        }
      } catch {
        if (t.startsWith(`${originBase}/`) || t === originBase) {
          return `/api/admin/affirmation-voice?src=${encodeURIComponent(t)}`;
        }
      }
    }
    return t;
  }

  return t;
}

/** @deprecated use toPlayableAffirmationAudioUrl */
export function resolveAbsoluteMediaUrl(urlOrPath) {
  const s = (urlOrPath || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) {
    const base =
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_MINDOVER_API_BASE_URL) ||
      "";
    if (base) return `${base.replace(/\/+$/, "")}${s}`;
  }
  return s;
}
