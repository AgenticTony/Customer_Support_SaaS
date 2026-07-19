/**
 * Base64 + PCM helpers for the Realtime voice client.
 *
 * Audio contract (HF speech-to-speech, OpenAI Realtime):
 *   - mic in  (widget -> server): PCM16 16 kHz mono, base64, `input_audio_buffer.append`
 *   - audio out (server -> widget): `response.output_audio.delta` = PCM16 16 kHz mono base64
 *
 * The mic worklet posts Int16 16 kHz ArrayBuffers; we base64 them to send.
 * The playback worklet wants Float32 samples; we decode PCM16 16 kHz base64 to Float32.
 */

/** ArrayBuffer (of Int16 samples) -> base64, for `input_audio_buffer.append`. */
export function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  // Chunked so we don't blow the call stack on long buffers.
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunk) as unknown as number[],
    );
  }
  return btoa(binary);
}

/** base64 -> bytes. */
export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/**
 * Decode PCM16 16 kHz mono base64 (server `output_audio.delta`) -> Float32Array
 * for the playback worklet. Little-endian Int16, mono.
 */
export function pcm16Base64ToFloat32(b64: string): Float32Array {
  const bytes = base64ToBytes(b64);
  const n = bytes.length >> 1;
  const out = new Float32Array(n);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < n; i++) {
    const s = view.getInt16(i * 2, true); // little-endian
    out[i] = s < 0 ? s / 0x8000 : s / 0x7fff;
  }
  return out;
}
