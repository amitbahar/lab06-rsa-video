# RSA Explained — Video Script

**Format:** 1920×1080, 30 fps, Remotion (`video/`) · **Narration:** Kokoro, voice `af_heart`, speed 1.0 (`scripts/narrate.py`)
**Target length:** ~3 minutes (10 scenes) · **Style:** dark slate background (`#0b1120` → `#1e293b`), white text, public key = sky `#38bdf8`, private key = pink `#f472b6`, accent/math = amber `#fbbf24`

**Conventions**
- Each scene has an ID (`S01`…`S10`). Component: `video/src/scenes/SNN_Name.tsx`. Audio: `video/public/audio/SNN.wav`.
- Narration text is the blockquote under **Narration** — it is passed verbatim to `narrate.py`. Write numbers the way they should be *spoken*.
- Scene length = narration length + ~0.5 s padding (computed from the WAV, not hardcoded).
- Durations below are estimates (~150 words/min).

**Running example (verified):** p = 5, q = 11 → n = 55, φ(n) = 40, e = 3, d = 27 (3 · 27 = 81 ≡ 1 mod 40). Message m = 7 → c = 7³ mod 55 = **13** → 13²⁷ mod 55 = **7**.

---

## S01 — Hook (~12 s)

**Narration**
> Every time you buy something online, your browser shares a secret with a computer it has never met, over a network anyone can listen to. How is that even possible? The answer is RSA.

**Visuals**
- A laptop on the left, a server on the right, a wire between them. Small packets travel along it.
- A shadowy "eavesdropper" eye fades in above the wire, watching the packets.
- Hard cut to the `RSA` title card (reuse the title treatment from `TestClip.tsx`), subtitle "Public-key cryptography".

---

## S02 — The key-exchange problem (~18 s)

**Narration**
> Classic encryption uses one shared key. The same key locks and unlocks the message. That works great, if you already share the key. But how do you send the key itself, when anyone can read what you send? For centuries, this was the unsolved problem of cryptography.

**Visuals**
- Alice and Bob (simple avatar circles with labels) each holding an identical gold key.
- A message box locks with the key, travels, unlocks with Bob's identical key. ✓
- Rewind: Bob has no key. Alice tries to send the key across the wire → the eavesdropper copies it (key duplicates into the eye). Red ✗.
- Text: "How do you share the key?"

---

## S03 — Two keys: the padlock idea (~20 s)

**Narration**
> In nineteen seventy-seven, Rivest, Shamir and Adleman published a different idea: use two keys. A public key, which you hand out to everyone, and a private key, which you never share. Think of the public key as an open padlock. Anyone can snap it shut, but only the private key can open it.

**Visuals**
- Names "Rivest · Shamir · Adleman · 1977" appear, then collapse into "RSA".
- Bob generates a key pair: blue public key + pink private key (the two `Key` components from `TestClip`).
- Blue key morphs into an open padlock; Bob copies it to everyone (padlock duplicates fan out, including to the eavesdropper — that's fine).
- Alice puts a message in a box, snaps the padlock shut, sends it. Eavesdropper can't open it. Bob opens it with the pink key.

---

## S04 — The one-way trapdoor (~20 s)

**Narration**
> To build such a lock, RSA uses a mathematical trapdoor. Multiplying two large prime numbers is easy. But taking the result and finding the original primes is incredibly hard. Easy in one direction, practically impossible in the other, unless you know the secret.

**Visuals**
- Left → right arrow labeled "easy": `61 × 53` → `3233` computes instantly (counter animation).
- Right → left arrow labeled "hard": `3233 → ? × ?` with a trial-division counter ticking through candidates.
- Scale up: a 617-digit number scrolls by; the "hard" counter displays "longer than the age of the universe".
- Keyhole icon labeled "trapdoor = knowing p and q".

---

## S05 — Generating the keys (~28 s)

**Narration**
> Let's build a tiny key pair. Pick two primes: p equals five, and q equals eleven. Multiply them to get n, fifty-five. Next, compute phi of n: p minus one, times q minus one, which is forty. Choose a public exponent e that shares no factors with forty. We'll use three. Finally, find d, so that e times d leaves a remainder of one when divided by forty. That's twenty-seven, because eighty-one is two forties plus one. The public key is e and n. The private key is d. Everything else gets thrown away.

**Visuals**
- Step list builds line by line in amber, each value highlighting as it is spoken:
  1. `p = 5, q = 11`
  2. `n = p · q = 55`
  3. `φ(n) = (p−1)(q−1) = 4 · 10 = 40`
  4. `e = 3` (gcd(3, 40) = 1)
  5. `d = 27` (3 · 27 = 81 = 2·40 + 1)
- At the end, values fly into two cards: blue **Public key (e = 3, n = 55)**, pink **Private key (d = 27)**. p, q, φ shred / fade out ("thrown away").

---

## S06 — Encrypting and decrypting (~24 s)

**Narration**
> Now Alice wants to send the number seven. She uses Bob's public key: seven to the power of three is three hundred forty-three. Modulo fifty-five, that leaves thirteen. She sends thirteen. Bob raises thirteen to the power of twenty-seven, modulo fifty-five, and gets back exactly seven. The eavesdropper only ever saw thirteen.

**Visuals**
- Alice side: `m = 7` → formula `c = mᵉ mod n` → `7³ = 343` → `343 mod 55 = 13`.
- Packet labeled `13` travels across the wire; eavesdropper sees `13` with a "?" over it.
- Bob side: `m = c^d mod n` → `13²⁷ mod 55 = 7` ✓ (green check).
- Optional: a "clock" visual for modular arithmetic (numbers wrapping around a 55-tick circle) during "modulo fifty-five".

---

## S07 — Why it works (~18 s)

**Narration**
> Why does this work? Because e and d were chosen as inverses, raising to e and then to d is the same as raising to e times d, which brings every message back to itself. To find d, an attacker needs phi of n, and to get phi, they need to factor n. That's the trapdoor.

**Visuals**
- Equation chain: `(mᵉ)ᵈ = m^(e·d) ≡ m (mod n)`, with `e · d ≡ 1 (mod φ(n))` beneath.
- Dependency chain for the attacker, right to left, each link greyed/locked: `d ← φ(n) ← p, q ← factor n` 🔒.
- Re-use the keyhole icon from S04.

---

## S08 — Digital signatures (~18 s)

**Narration**
> RSA also works in reverse. If Bob encrypts something with his private key, anyone can check it with his public key. Only Bob could have produced it. That's a digital signature, and it's how your browser knows a website is really who it claims to be.

**Visuals**
- Bob's document gets stamped with the pink key → a wax-seal "signature" appears.
- Anyone (Alice, a crowd of avatars) applies the blue key → seal glows green "Verified: Bob".
- Forger tries with a fake pink key → seal turns red "Invalid".
- Ends on a browser address bar with a padlock icon.

---

## S09 — RSA in the real world (~18 s)

**Narration**
> Real RSA keys don't use five and eleven. They use primes hundreds of digits long, giving keys of two thousand forty-eight bits or more. And in practice, RSA is used to exchange or sign a small secret, while faster algorithms encrypt the actual data.

**Visuals**
- `n = 55` grows into a wall of digits labeled "2048-bit n ≈ 617 digits".
- Diagram: RSA-wrapped small gold key → unlocks a fast "AES" pipe carrying lots of data (hybrid encryption).
- Small footnote text: "Real systems also use padding (OAEP / PSS)."

---

## S10 — Recap & outro (~14 s)

**Narration**
> So, to recap. Two keys: one public, one private. Security rests on how hard it is to factor a huge number. And that simple idea protects almost everything you do online.

**Visuals**
- Three recap bullets appear with icons: 🔑🔑 "Public + private key", 🧮 "Factoring is hard", 🌐 "Protects the web".
- Final shot: title `RSA` + both keys (mirroring S01), fade to black.

---

## Totals

| Scene | Est. | Scene | Est. |
|---|---|---|---|
| S01 Hook | 12 s | S06 Encrypt/Decrypt | 24 s |
| S02 Key-exchange problem | 18 s | S07 Why it works | 18 s |
| S03 Two keys | 20 s | S08 Signatures | 18 s |
| S04 Trapdoor | 20 s | S09 Real world | 18 s |
| S05 Key generation | 28 s | S10 Recap | 14 s |
| | | **Total** | **~190 s (~3:10)** |
