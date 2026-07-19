"use client";

import { useCallback } from "react";
import { api } from "@workspace/backend/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@workspace/ui/components/button";
import { useVoice } from "@/modules/widget/hooks/use-voice";
import type { VoiceToolCall, VoiceToolDef } from "@/lib/voice/realtime-client";

// ch.6 local dev. Uses 127.0.0.1 (not "localhost") on purpose: the voice server
// binds IPv4-only (0.0.0.0), and browsers resolve "localhost" -> ::1 (IPv6) first,
// which the server refuses. ch.28 swaps this for a gateway-issued URL.
const VOICE_URL = "ws://127.0.0.1:8765/v1/realtime";

const TOOLS: VoiceToolDef[] = [
  {
    type: "function",
    name: "getAccountBalance",
    description:
      "Get the account balance for the given last 4 digits of the account number.",
    parameters: {
      type: "object",
      properties: {
        last4: {
          type: "string",
          description: "Last 4 digits of the account number",
        },
      },
      required: ["last4"],
    },
  },
];

export default function VoiceTestPage() {
  const getAccountBalance = useMutation(api.voiceTools.getAccountBalance);

  const onToolCall = useCallback(
    async (call: VoiceToolCall): Promise<string> => {
      if (call.name === "getAccountBalance") {
        const { last4 } = JSON.parse(call.arguments) as { last4?: string };
        const res = await getAccountBalance({ last4: last4 ?? "" });
        return JSON.stringify(res);
      }
      return JSON.stringify({ error: `Unknown tool: ${call.name}` });
    },
    [getAccountBalance],
  );

  const voice = useVoice({
    url: VOICE_URL,
    instructions:
      "You are a friendly support assistant for a bank. If the caller asks for their balance, call getAccountBalance with the last 4 digits they provide, then read the balance back.",
    tools: TOOLS,
    onToolCall,
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-2xl font-bold">Voice test (HF speech-to-speech)</h1>
        <p className="text-muted-foreground text-sm">
          Allow mic, click Start, and say: “what&apos;s the balance on account
          1234?”
        </p>
      </div>

      <div className="flex gap-2">
        {!voice.isConnected ? (
          <Button
            onClick={() => void voice.startCall()}
            disabled={voice.isConnecting}
          >
            {voice.isConnecting ? "Connecting…" : "Start call"}
          </Button>
        ) : (
          <Button variant="destructive" onClick={voice.endCall}>
            End call
          </Button>
        )}
      </div>

      <div className="text-sm">
        {voice.isConnected
          ? voice.speaking === "assistant"
            ? "🤖 Assistant speaking…"
            : voice.speaking === "user"
              ? "🎙️ Listening…"
              : "Connected"
          : "Idle"}
      </div>

      {voice.error && (
        <p className="max-w-md text-center text-sm text-red-500">
          {voice.error}
        </p>
      )}

      <div className="bg-muted h-48 w-full max-w-md overflow-y-auto rounded-lg p-4 text-sm">
        {voice.transcript.length === 0 && !voice.partial ? (
          <p className="text-muted-foreground">Transcript will appear here.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {voice.transcript.map((m, i) => (
              <li
                key={i}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <span
                  className={
                    m.role === "user" ? "text-blue-500" : "text-emerald-600"
                  }
                >
                  {m.role === "user" ? "You" : "AI"}: {m.text}
                </span>
              </li>
            ))}
            {voice.partial && (
              <li
                className={
                  voice.partial.role === "user" ? "text-right" : "text-left"
                }
              >
                <span className="text-muted-foreground italic">
                  {voice.partial.role === "user" ? "You" : "AI"}:{" "}
                  {voice.partial.text}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
