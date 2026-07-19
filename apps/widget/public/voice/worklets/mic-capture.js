// Adapted from Hugging Face speech-to-speech demo (Apache 2.0):
//   https://github.com/huggingface/speech-to-speech/blob/main/demo/worklets/mic-capture.js
//
// AudioWorkletProcessor: resamples the AudioContext rate (typically 48 kHz) down
// to 16 kHz, packs as little-endian Int16 PCM, and posts it back to the main
// thread in fixed-size chunks. The HF speech-to-speech server expects
// `input_audio_buffer.append` at 16 kHz PCM16 mono. The main thread base64-
// encodes the Int16 buffer and sends it.
//
// 48 -> 16 is an exact 3:1 ratio, so a 3-tap boxcar average low-pass before
// decimating is good enough for voice STT. Float -> Int16 saturates to [-1, 1].
//
// Messages:
//   main -> worklet: { kind: "enable", value: boolean }
//   worklet -> main: ArrayBuffer (Int16 16 kHz chunk, transferable)
//                  | { kind: "level", rms }

const TARGET_RATE = 16000;
const DEFAULT_CHUNK_MS = 40;

class MicCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const chunkMs = options?.processorOptions?.chunkMs ?? DEFAULT_CHUNK_MS;
    this._inputRate = sampleRate;
    this._ratio = this._inputRate / TARGET_RATE;
    this._chunkSamples16k = Math.round((TARGET_RATE * chunkMs) / 1000);
    this._scratch = new Float32Array(0);
    this._decimated = new Float32Array(this._chunkSamples16k);
    this._enabled = true;

    this.port.onmessage = (e) => {
      const data = e.data;
      if (data?.kind === "enable") this._enabled = !!data.value;
    };
  }

  _ingest(incoming) {
    if (incoming.length === 0) return;
    const next = new Float32Array(this._scratch.length + incoming.length);
    next.set(this._scratch, 0);
    next.set(incoming, this._scratch.length);
    this._scratch = next;
    this._maybeEmit();
  }

  _maybeEmit() {
    const r = this._ratio;
    const n = this._chunkSamples16k;
    const needIn = Math.ceil(n * r);
    const dec = this._decimated;
    while (this._scratch.length >= needIn) {
      for (let i = 0; i < n; i++) {
        if (Math.abs(r - 3) < 1e-6) {
          const idx = i * 3;
          dec[i] =
            (this._scratch[idx] +
              this._scratch[idx + 1] +
              this._scratch[idx + 2]) /
            3;
        } else {
          const srcPos = i * r;
          const idx = Math.floor(srcPos);
          const frac = srcPos - idx;
          const a = this._scratch[idx];
          const b = this._scratch[idx + 1] ?? a;
          dec[i] = a + (b - a) * frac;
        }
      }

      const out = new Int16Array(n);
      for (let i = 0; i < n; i++) {
        let s = dec[i];
        s = s < -1 ? -1 : s > 1 ? 1 : s;
        out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      const consumed = Math.floor(n * r);
      this._scratch = this._scratch.slice(consumed);

      if (this._enabled) {
        this.port.postMessage(out.buffer, [out.buffer]);
      }
      // When disabled we silently consume input so the buffer never grows.
    }
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0 || !input[0]) return true;
    const mono = input[0];
    if (mono.length > 0) this._ingest(mono);
    return true;
  }
}

registerProcessor("mic-capture", MicCaptureProcessor);
