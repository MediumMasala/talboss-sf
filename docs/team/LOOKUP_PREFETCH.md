# LinkedIn lookup: what the flow must change (v4.2 §10, backend done Nov 5)

The backend can now start the search at A2, while the person types their title, and attach the A3 start to it. It
also holds each poll open until something happens, so the browser can stop waiting between polls. Old flow code
still works; it just doesn't get faster. The full contract is in `API.md` → Endpoints.

Measured on the founder's profile: **16.0 s before**. With the three changes below it's **0.9 s after the A3
submit**, and 4.9 s from A2. For someone whose LinkedIn handle isn't `first-last`, it's about 10–11 s from A2, so
≤ 6 s after A3 if the title takes 5 s or more to type.

## 1. Start at A2 (prefetch), attach at A3
All in `components/flow/Flow.tsx`.

**A2 submit** (`submitCompany`, after it validates): fire the start and don't wait for it.
```ts
const key = `${s.name.trim()}|${s.company.trim()}`.toLowerCase();
if (prefetch.current?.key !== key)
  prefetch.current = { key, reply: post("/api/linkedin/start", { name: s.name.trim(), company: s.company.trim(), partial: true }) };
dispatch({ type: "go", step: "title" });
```
- `prefetch` is a `useRef<{ key: string; reply: Promise<Reply> } | null>`. Don't poll this token and don't show
  anything from this reply, errors included.
- If they go back and change the name or company, the next A2 submit fires a new prefetch (new key). Same name and
  company again: nothing new is fired.
- Preview mode (`s.preview`): skip it.

**A3 submit** (`lookup`): wait for the prefetch (it has almost always finished; it takes about 1 s), then start with
its token.
```ts
const key = `${s.name.trim()}|${s.company.trim()}`.toLowerCase();
const pre = prefetch.current?.key === key ? await prefetch.current.reply : null;
begin({
  name: s.name.trim(), company: s.company.trim(), role: s.title.trim(), partial: true,
  ...(pre?.state === "pending" ? { token: pre.token } : {}),
});
```
(Widen `begin`'s body type to `Record<string, string | boolean>`. The server checks `partial === true`, so it must
be a boolean. It reads `body.url` for the paste-link path, which is unchanged.)
- **Always await the prefetch before the A3 start.** Two starts fired at the same instant are still caught on the
  server, but the A3 start then waits up to 3 s.
- If the prefetch failed (429, 502, 400), drop it and start as usual. The A3 start returns the same error if it
  still applies, and that's the one to show. A prefetched job is counted against the limits once, never again at A3.
- The A3 reply is `pending` as before. Poll it. Its first poll is usually `found` straight away.

## 2. Poll without waiting
- `FIRST_POLL_MS = 0` (was 300) and `POLL_MS = 150` (was 1700). Each poll now waits up to about 5 s on the server
  and comes back as soon as a search finishes or the stage changes, so the stage line keeps moving.
- `poll()` must not time out under about 15 s. It has no timeout today, which is fine. `GIVE_UP_MS` stays.
- Keep `Math.max` on the stage index. The guessed-handle pull never reports `profile`.

## 3. Partial cards (`partial: true` on start)
A `found` reply can now carry `partial`. Partial cards are rare: one appears only when Google returns a result
before the people search does, and LinkedIn's own company field on that result matches. Until this section is
built, leave `partial` out of both starts. Sections 1 and 2 give almost all of the gain.

| Reply | Do |
|---|---|
| `found`, `partial: true`, `token` | Show A5 with `profile`. It has the name, headline, company and location; `photo` is `""` and `experience` is `[]`, so show the initials tile and a short skeleton where the role rows go. Leave "Yes" and "Not me" enabled. **Keep polling in the background** with `reply.token` while the card is up. |
| `found`, `partial: false` | The full card for the same person (same `slug`). Replace `s.profile` in place and let the photo and roles fade in. Stop polling. |
| `retracted: true` (on `pending`, `not_found`, or `found` with a different `slug`) | The partial card was someone else. If they haven't answered, take the card down: back to A4 (keep polling the new token), show the new card, or go to not-found. If they already said "Yes", undo the confirmation and do the same. |

- "Yes" on a partial card confirms at once. Keep polling for up to about 8 s so the full card can replace
  `s.profile` before the upload. If the upload happens first, the partial card is sent as it is (it passed the
  guard).
- "Not me" on a partial card: post `{ next: reply.next }` as usual and stop the background poll. That person is
  never shown again.

## Analytics (optional)
Every poll reply carries `timings` (ms since the A2 start). The two useful fields are
`first - attach` (how long A3 waited) and `src` (`people` | `guess` | `search` | `cache`). For example:
`track("linkedin_found", { score, seconds, partial: Boolean(reply.partial), src: reply.timings?.src, after_title_ms: (reply.timings?.first ?? 0) - (reply.timings?.attach ?? 0) })`.

## Check it
Run `POLL_MS=150 node scripts/lookup-timing.mjs --prefetch 4000 --partial` against `next dev -p 3217`. That is
the exact sequence above, as curl-style calls. Use the allowed identity only. A repeat within 6 h is a free cache hit.
