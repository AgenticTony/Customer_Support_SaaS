/**
 * Minimal OpenAI Realtime WebSocket client for the HF speech-to-speech server.
 *
 * Owns the WebSocket + protocol ONLY. Audio I/O (AudioContext, mic capture
 * worklet, playback worklet) lives in the React hook — this client just exposes
 * `appendAudio` (mic in) and emits `onAudio` (16 kHz Float32 out).
 *
 * Protocol (HF speech-to-speech speaks OpenAI Realtime):
 *   client -> server: input_audio_buffer.append, session.update,
 *                     conversation.item.create (function_call_output), response.create
 *   server -> client: session.created, input_audio_buffer.speech_started/stopped,
 *                     conversation.item.input_audio_transcription.{delta,completed},
 *                     response.created, response.output_audio.{delta,done},
 *                     response.output_audio_transcript.{delta,done},
 *                     response.function_call_arguments.done, response.done, error
 */

import { arrayBufferToBase64, pcm16Base64ToFloat32 } from "./codec";

export type VoiceToolDef = {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
};

export type VoiceTranscriptEvent = {
  role: "user" | "assistant";
  text: string;
  partial: boolean;
};

export type VoiceToolCall = {
  callId: string;
  name: string;
  arguments: string; // raw JSON string from the server
};

export type VoiceClientHandlers = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (message: string) => void;
  /** Who is currently speaking: "user" (VAD fired), "assistant" (response streaming), or null. */
  onSpeakingChange?: (speaking: "user" | "assistant" | null) => void;
  onTranscript?: (e: VoiceTranscriptEvent) => void;
  onToolCall?: (call: VoiceToolCall) => void;
  /** 16 kHz Float32 PCM chunk from the server — feed it to the playback worklet. */
  onAudio?: (samples: Float32Array) => void;
};

export type VoiceClientOptions = {
  url: string;
  instructions: string;
  voice?: string;
  tools?: VoiceToolDef[];
  handlers: VoiceClientHandlers;
};

export class VoiceRealtimeClient {
  private ws: WebSocket | null = null;
  private readonly opts: VoiceClientOptions;

  constructor(opts: VoiceClientOptions) {
    this.opts = opts;
  }

  /** Open the WebSocket; sends `session.update` once open. Resolves on open. */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.opts.url);
      ws.binaryType = "arraybuffer";
      this.ws = ws;

      ws.addEventListener("open", () => {
        // session.update must match the server's strict pydantic model — extra fields
        // (input_audio_format, turn_detection, etc.) make it reject the WHOLE event
        // ("Unknown or invalid event: session.update"), so instructions + tools never
        // register. The server uses its own VAD + audio-format defaults; we only send
        // the tunable bits. Mirrors HF's reference client (demo/ws/s2s-ws-client.js).
        // Match HF's reference _sendSessionUpdate exactly. The server's pydantic
        // model requires `type: "realtime"` (the discriminator) and the `audio`
        // block — omitting either rejects the whole event ("Unknown or invalid
        // event: session.update"). Do NOT send audio.input.format / turn_detection
        // / output.format: the server defaults to server_vad + 16 kHz in / 16 kHz
        // out and rejects unknown sub-fields.
        const session: Record<string, unknown> = {
          type: "realtime",
          instructions: this.opts.instructions,
          audio: { output: { voice: this.opts.voice } },
        };
        const tools = this.opts.tools ?? [];
        if (tools.length) {
          session.tools = tools;
          session.tool_choice = "auto";
        }
        this.send({ type: "session.update", session });
        this.opts.handlers.onOpen?.();
        resolve();
      });

      ws.addEventListener("message", (ev) => this.onMessage(ev));
      ws.addEventListener("error", () => {
        const msg =
          "Voice WebSocket error (is the server running at " +
          this.opts.url +
          "?)";
        this.opts.handlers.onError?.(msg);
        reject(new Error(msg));
      });
      ws.addEventListener("close", () => {
        this.opts.handlers.onClose?.();
      });
    });
  }

  /** Mic chunk (Int16 16 kHz ArrayBuffer from the capture worklet) -> server. */
  appendAudio(int16Buffer: ArrayBuffer): void {
    this.send({
      type: "input_audio_buffer.append",
      audio: arrayBufferToBase64(int16Buffer),
    });
  }

  /** Return a tool result so the LLM can incorporate it (then call triggerResponse). */
  sendToolOutput(callId: string, output: string): void {
    this.send({
      type: "conversation.item.create",
      item: { type: "function_call_output", call_id: callId, output },
    });
  }

  /** Ask the model to generate (e.g. to speak a tool result). Swallowed if already generating. */
  triggerResponse(): void {
    this.send({ type: "response.create" });
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }

  private send(payload: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private onMessage(ev: MessageEvent): void {
    // Realtime wire events are a dynamic JSON protocol; typed narrowing here
    // adds noise without real safety, so the parse is intentionally untyped.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = JSON.parse(
        typeof ev.data === "string"
          ? ev.data
          : new TextDecoder().decode(ev.data),
      );
    } catch {
      return;
    }
    const h = this.opts.handlers;
    switch (data.type) {
      case "input_audio_buffer.speech_started":
        h.onSpeakingChange?.("user");
        break;
      case "input_audio_buffer.speech_stopped":
        h.onSpeakingChange?.(null);
        break;
      case "response.created":
        h.onSpeakingChange?.("assistant");
        break;
      case "response.done":
        h.onSpeakingChange?.(null);
        break;
      case "conversation.item.input_audio_transcription.delta":
        h.onTranscript?.({
          role: "user",
          text: data.delta ?? "",
          partial: true,
        });
        break;
      case "conversation.item.input_audio_transcription.completed":
        h.onTranscript?.({
          role: "user",
          text: data.transcript ?? "",
          partial: false,
        });
        break;
      case "response.output_audio_transcript.delta":
        h.onTranscript?.({
          role: "assistant",
          text: data.delta ?? "",
          partial: true,
        });
        break;
      case "response.output_audio_transcript.done":
        h.onTranscript?.({
          role: "assistant",
          text: data.transcript ?? "",
          partial: false,
        });
        break;
      case "response.output_audio.delta":
        if (typeof data.delta === "string" && data.delta.length > 0) {
          h.onAudio?.(pcm16Base64ToFloat32(data.delta));
        }
        break;
      case "response.function_call_arguments.done":
        h.onToolCall?.({
          callId: data.call_id,
          name: data.name,
          arguments: data.arguments ?? "{}",
        });
        break;
      case "error":
        h.onError?.(data.error?.message ?? "Realtime protocol error");
        break;
      default:
        // many event types are intentionally ignored at this layer
        break;
    }
  }
}
