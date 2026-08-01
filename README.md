# Perpétue Sablé

A browser-based conversation piece. Perpétue Sablé — called the Abnomaly, called
Patient S — sits on the rocks at the edge of a pond, missing her brain, in a
4 November 1953 that never ends. You type; she answers in the pink box above her.

Clicking *"Click to know who you are"* replaces the white background with the
viewer's own front-facing camera, so they appear inside the scene.

The dialogue box has no fill — it is an outline you can drag anywhere on the
scene, and the dashed line follows it back to Perpétue.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Oswald Light.
The chat completion runs server-side against an OpenAI-compatible LM Studio
server, reached over a Cloudflare tunnel.

## Setup

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. The camera feature needs `localhost` or HTTPS, and
the browser will ask permission the first time.

### The model

`LLM_API_KEY` is required — the tunnel returns 401 without it. It lives in
`.env.local`, which is gitignored and must never be committed.

| Variable | Default | Notes |
| --- | --- | --- |
| `LLM_BASE_URL` | the tunnel URL, `/v1` suffixed | |
| `LLM_MODEL` | `qwen/qwen3.6-35b-a3b` | |
| `LLM_API_KEY` | none | **secret** — set in `.env.local` |

Cloudflare quick tunnels get a new hostname each time they restart, so if
replies stop arriving, check the current URL and update `LLM_BASE_URL`. To see
what a server is serving:

```bash
curl -H "Authorization: Bearer $LLM_API_KEY" "$LLM_BASE_URL/models"
```

## Structure

```
public/assets/          # the collage: doll, rocks, lotus, willow, branch, pocket watch
src/app/
├── page.tsx            # the whole scene + dialogue
├── line-art.tsx        # dotted magenta flowers filling the empty left side
├── prompt.ts           # Perpétue's system prompt
├── layout.tsx          # fonts + metadata
├── globals.css         # base styles and the sway/fade animations
└── api/chat/route.ts   # server-side chat completion
```

## Deployment

Push to GitHub, connect the repo to Vercel, add `TOGETHER_API_KEY` as an
environment variable, and deploy.

---

Built from the AI Chatbot Template by Halim Madi (www.halimmadi.com). MIT License.
