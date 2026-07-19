"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  VoiceRealtimeClient,
  type VoiceToolCall,
  type VoiceToolDef,
} from "@/lib/voice/realtime-client";

export type TranscriptMessage = { role: "user" | "assistant"; text: string };

export type UseVoiceOptions = {
  /** Voice server WebSocket URL. ch.6 hard-codes local dev; ch.28 uses a gateway token. */
  url: string;
  instructions: string;
  voice?: string;
  tools?: VoiceToolDef[];
  /** Execute a tool call and return the JSON string to send back as function_call_output. */
  onToolCall?: (call: VoiceToolCall) => Promise<string> | string;
};

/**
 * Drives the HF speech-to-speech Realtime server from the widget.
 *
 * The `VoiceRealtimeClient` (lib/voice/realtime-client.ts) is the swappable
 * transport seam: ch.6 connects via `directUrl`; ch.28 swaps in a gateway-issued
 * session token. This hook owns the AudioContext + mic/playback worklets and
 * exposes the same shape the course's `use-vapi.ts` did, so ch.28 is additive.
 */
export function useVoice(opts: UseVoiceOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [speaking, setSpeaking] = useState<"user" | "assistant" | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [partial, setPartial] = useState<TranscriptMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<VoiceRealtimeClient | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micNodeRef = useRef<AudioWorkletNode | null>(null);
  const playbackNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  const endCall = useCallback(() => {
    playbackNodeRef.current?.port.postMessage({ kind: "clear" });
    clientRef.current?.close();
    clientRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    micNodeRef.current?.disconnect();
    micNodeRef.current = null;
    playbackNodeRef.current?.disconnect();
    playbackNodeRef.current = null;
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setSpeaking(null);
  }, []);

  const startCall = useCallback(async () => {
    if (clientRef.current) return;
    setIsConnecting(true);
    setError(null);
    try {
      // AudioContext + worklets — created inside the click gesture so the context starts.
      const ctx = new AudioContext({ sampleRate: 48000 });
      if (ctx.state === "suspended") await ctx.resume();
      await ctx.audioWorklet.addModule("/voice/worklets/mic-capture.js");
      await ctx.audioWorklet.addModule("/voice/worklets/audio-playback.js");
      audioCtxRef.current = ctx;

      // Mic → capture worklet. Connect through a zero-gain sink to destination so the
      // node stays scheduled (we do NOT want to hear ourselves).
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      const micNode = new AudioWorkletNode(ctx, "mic-capture");
      source.connect(micNode);
      const silentSink = ctx.createGain();
      silentSink.gain.value = 0;
      micNode.connect(silentSink);
      silentSink.connect(ctx.destination);
      micNode.port.onmessage = (e: MessageEvent) => {
        if (e.data instanceof ArrayBuffer)
          clientRef.current?.appendAudio(e.data);
      };
      micNodeRef.current = micNode;

      // Playback worklet → destination.
      // Outbound is 16 kHz, NOT 24 kHz: the server's realtime handler defaults
      // client_out_rate to PIPELINE_SAMPLE_RATE (16000) when no format.rate is sent.
      // Playing 16 kHz audio at 24 kHz is the "chipmunk" (1.5x) effect.
      const playbackNode = new AudioWorkletNode(ctx, "audio-playback");
      playbackNode.port.postMessage({ kind: "config", inputRate: 16000 });
      playbackNode.connect(ctx.destination);
      playbackNodeRef.current = playbackNode;

      // Realtime client (protocol only). Audio I/O bridged through the worklets above.
      const client = new VoiceRealtimeClient({
        url: optsRef.current.url,
        instructions: optsRef.current.instructions,
        voice: optsRef.current.voice,
        tools: optsRef.current.tools,
        handlers: {
          onOpen: () => {
            setIsConnected(true);
            setIsConnecting(false);
          },
          onClose: () => {
            setIsConnected(false);
            setIsConnecting(false);
            setSpeaking(null);
          },
          onError: (msg) => {
            setError(msg);
            setIsConnecting(false);
          },
          onSpeakingChange: setSpeaking,
          onTranscript: (e) => {
            const msg = { role: e.role, text: e.text };
            if (e.partial) {
              setPartial(msg);
            } else {
              setPartial(null);
              setTranscript((prev) => [...prev, msg]);
            }
          },
          onAudio: (samples) => {
            const buf = samples.buffer.slice(0);
            playbackNodeRef.current?.port.postMessage(
              { kind: "audio", samples: new Float32Array(buf) },
              [buf],
            );
          },
          onToolCall: async (call) => {
            const exec = optsRef.current.onToolCall;
            if (!exec) return;
            try {
              const out = await exec(call);
              clientRef.current?.sendToolOutput(call.callId, out);
              clientRef.current?.triggerResponse(); // speak the tool result
            } catch (err) {
              clientRef.current?.sendToolOutput(
                call.callId,
                JSON.stringify({ error: String(err) }),
              );
            }
          },
        },
      });
      clientRef.current = client;
      await client.connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsConnecting(false);
      endCall();
    }
  }, [endCall]);

  // Tear down on unmount.
  useEffect(() => endCall, [endCall]);

  return {
    isConnected,
    isConnecting,
    speaking,
    transcript,
    partial,
    error,
    startCall,
    endCall,
  };
}
