# services/voice — HF speech-to-speech voice server

Echo's open-voice core (ch. 6). A self-hosted realtime voice pipeline
(VAD → STT → LLM → TTS) that exposes an **OpenAI Realtime-compatible
WebSocket** at `ws://localhost:8765/v1/realtime`, with client-side function
calling. The web widget (ch. 6) and the Twilio telephony bridge (ch. 25) are
both Realtime clients of this one server — one brain, two channels.

This is a **Python** service. It is deliberately **NOT a pnpm/Turborepo
workspace** (the rest of the monorepo is TypeScript); it has its own venv and
is run as a separate process. `turbo build`/`turbo dev` do not touch it.

## Python version: 3.11 (NOT 3.13)

`speech-to-speech` depends on `misaki` (a TTS phonemizer) on macOS, and
**`misaki` requires Python `>=3.8,<3.13`** — it refuses to install on 3.13.
Use **Python 3.11** (3.12 also works; 3.11 is what's set up here).

```bash
# one-time setup (Python 3.11.9 via pyenv)
PY311="$(pyenv prefix 3.11.9)/bin/python3.11"
"$PY311" -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install speech-to-speech
```

## Run (local, Apple Silicon MLX — free, no API key)

```bash
.venv/bin/speech-to-speech \
  --llm_backend mlx-lm \
  --model_name mlx-community/Qwen3-4B-Instruct-2507-bf16 \
  --init_chat_role system \
  --init_chat_prompt "You are a friendly support assistant for a bank." \
  --enable_live_transcription
```
(`mlx-lm` uses Apple Silicon MPS automatically — there is no `--llm_device` flag.
`--mode realtime` is the default, so it's omitted.)
- Server URL: `ws://127.0.0.1:8765/v1/realtime` (**use `127.0.0.1`, not `localhost`** — the server binds IPv4-only `0.0.0.0`; browsers resolve `localhost` → `::1` and the WS is refused). On connect it pushes `session.created`.
- First run downloads multi-GB models (LLM + STT + TTS) — once.
- Verify the exact flags for your installed version: `.venv/bin/speech-to-speech --help`.
- macOS uses MLX for STT (Parakeet), `mlx-audio` for Qwen3-TTS, and `mlx-lm` for the LLM automatically.
- **`session.update` must be minimal + include `type: "realtime"`** — the server's pydantic validator rejects the whole event ("Unknown or invalid event: session.update") if you send `input_audio_format` / `output_audio_format` / `turn_detection`, or omit `type: "realtime"`. Send only `{ type: "realtime", instructions, audio: { output: { voice } }, tools?, tool_choice? }`; the server defaults to server_vad + 16 kHz in / 16 kHz out. Mirror `demo/ws/s2s-ws-client.js` `_sendSessionUpdate`.

## Audio contract (memorize)

- **Inbound mic** (widget → server): PCM16 **16 kHz** mono, base64, via `input_audio_buffer.append`.
- **Outbound** (server → widget): `response.output_audio.delta` = PCM16 **16 kHz** mono base64.
- The widget's mic worklet downsamples 48 kHz → 16 kHz; the playback worklet upsamples 16 kHz → 48 kHz.
- Twilio Media Streams (ch. 25) are 8 kHz μ-law — the telephony bridge resamples both ways.

## Tool calling (the Convex bridge)

Tools are declared in `session.update`. When the LLM calls one, the server emits
`response.function_call_arguments.done` (`{ call_id, name, arguments }`) to the
client. The **client** executes the tool (calls a Convex mutation) and replies
via `conversation.item.create` with `{ type: "function_call_output", call_id, output }`.
This keeps tool execution in Echo's trust boundary (Convex), unified with the
text agent (ch. 19).

## Prod

Local MLX is for dev. For prod, point the LLM at a hosted provider
(`--llm_backend responses-api --responses_api_base_url ...`) and run on a GPU
box or container. Covered in ch. 35 (deploy).
