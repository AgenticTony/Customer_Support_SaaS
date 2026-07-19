import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ch.6 proof-of-concept: a tool the voice agent can call.
 *
 * The widget receives `response.function_call_arguments.done` from the voice
 * server, calls this mutation, and returns the result as `function_call_output`.
 * This is the seam ch.19 (text tools) and ch.22 (RAG search) later unify on —
 * voice and text will call the same Convex layer.
 *
 * ⚠️ No auth yet — the widget is anonymous until contact sessions (ch. 10) and
 * the gateway (ch. 24/28). This is a ch.6 proof only; do not ship state-changing
 * tools without session + ownership validation at the public boundary.
 *
 * File is camelCase (`voiceTools.ts`) — Convex filenames must not contain dashes,
 * and the generated api path is `api.voiceTools.getAccountBalance`.
 */
export const getAccountBalance = mutation({
  args: { last4: v.string() },
  handler: async (_ctx, args) => {
    // placeholder lookup — real data + auth come with sessions (ch. 10)
    return { balance: "$1,234.56", last4: args.last4 };
  },
});
