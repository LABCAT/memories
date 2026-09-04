---
name: social-media-captions
description: >-
  Generate captivating social media captions for creative coding animations,
  tailored to Instagram and Threads — audio-reactive, generative, MIDI-driven
  visual art. Interview the artist first (unless they explicitly skip); only
  then draft the caption. Use when the user wants to write a caption, post, or
  social copy for their animation work, even if they only say something like
  "caption for this," "post this," "write something for insta," or mention
  sharing their work online.
---

# Social Media Captions

Generate captions for Instagram and Threads that showcase creative coding
animations — audio-reactive, generative, MIDI-driven visual art.

---

## ⛔ Non-negotiable rules (read before anything else)

These apply to every execution of this skill. Violating any of them is a
failure regardless of how good the caption text is.

1. **Interview before caption — no exceptions.** If the user has not answered
   the interview questions or explicitly waived them, your **only** permitted
   output is the interview questions. Do not draft any caption text. Do not
   show a "preview." Do not output the `## Caption` block. Nothing.
2. **Max 5 hashtags total** across the entire caption. Tech tools in the
   footer are plain text — not hashtags.
3. **Closing line ≠ tech footer.** Both are required, in that order. The
   closing line is the emotional sign-off. The tech footer is bookkeeping.
   Never collapse them into one.
4. **Hashtags are grammar, not metadata.** Every hashtag must read as a
   natural part of its sentence — noun, adjective, or subject. No tag dumps
   at the end of a clause.
5. **Character count ≤ 500** (Threads hard limit). Verify before delivering —
   do not guess or estimate. See verification workflow below.

---

## Common mistakes — avoid these

Read this before generating anything.

- Writing the caption before the user answers the interview questions
- Producing a "draft" or "preview" as a workaround for the interview gate
- Dumping hashtags at the end of a sentence instead of weaving them inline
- Using the tech footer line as the emotional closing — they are separate
- Including more than 5 hashtags (tech tool names in the footer are plain text)
- Counting characters from memory, estimation, or a local tool instead of
  verifying via the character count workflow
- Swapping fixed lines the user asked to keep (hook, quote, footer) for
  "variety" on a revision request
- Stacking ornate metaphors to sound poetic — prefer one clear image and a
  strong verb

---

## Workflow

**Order is mandatory.** Complete each step fully before starting the next.

### Step 1 — Read the code

Read the sketch file the user points you to. Extract what you can:

- Sketch name/number (e.g. `#CirclesNo9`)
- Visual elements: shapes, geometry, colors, blend modes, effects
- Audio/music relationship: audio-reactive, MIDI-synced, which instruments
- Technologies used: p5js, WebGL, ToneJS, etc.
- Any thematic through-line: sacred geometry, cosmos, psychedelia, etc.

Use the code to **ground** details, not to dictate wording. Implementation
terms (FFT, MIDI tracks, cue indices, ADD blend) belong in READMEs — the
caption should read like motion, color, and feeling unless the artist
explicitly wants a technical voice.

### Step 2 — Interview the user

**If the interview has not been answered or explicitly waived, stop here.**
Your only permitted output is the interview questions below (plus a one-line
summary of what you inferred from the code, if helpful). Do not proceed to
step 3. Do not produce any caption content.

The code won't tell you everything. Ask about what's missing:

- **What does it look like in motion?** Colors shifting, particles flowing,
  shapes morphing — the code shows what's possible; the user knows what's
  actually rendering.
- **What's the mood/feeling?** Meditative, energetic, dark, euphoric, cosmic?
- **What music genre/vibe?** Hip-hop, ambient, electronic, funk?
- **Any specific theme** they want to emphasize?
- **Is there a quote** they want to include, or should you suggest one?

Keep it conversational — don't dump all questions at once. Ask what feels
most missing after reading the code.

The user may waive the interview only with explicit phrasing such as: "skip
the interview," "infer from code only," or "draft without asking me." Vague
requests like "caption for this" or "run the skill" are **not** a waiver —
still ask the interview questions.

If the user asks to **keep** a specific hook, quote, and/or the canonical
tech footer on a revision, treat those as **fixed**. Revise only what they
ask you to and do not swap fixed lines for variety.

### Step 3 — Generate the caption

**Only after step 2 is complete.** Produce one caption that satisfies both
Instagram and the Threads 500-character limit (same text for both). Follow
the anatomy and style rules below.

---

## Caption anatomy

Every caption follows this structure (order can flex slightly):

```
[Opening hook — one evocative line + emojis]

[Sketch hashtag + description block — what the viewer is seeing, rich with
 inline #Hashtags and emojis. This is the heart of the caption.]

[Quote — always attributed, always relevant, followed by emoji(s).]

[Closing line — ties the visual/audio experience together with
 #AudioReactive and #GenerativeArt woven in naturally.]

[Tech footer — credits the tools, plain text only, always last.]
```

### Opening hook

A single punchy line that pulls the viewer in. Poetic, mysterious, or bold.
Bookended with 1–2 emojis.

**Examples:**
- `Breakbeats twist into symmetry. 🍩💫`
- `🌌 When darkness reveals the light and sound paints the cosmos! 🎧`
- `Unveil the hidden frequency of the universe. 🗝️`
- `🌌 The Visible Spectrum of Rhythm 🌈🎧`

### Description block

Start with the sketch hashtag (e.g. `#CirclesNo9`), then paint the visual
experience. Weave **CamelCase hashtags inline** as natural parts of the
sentence — not dumped at the end. Use emojis as punctuation after phrases,
not every word.

**Examples (density and hashtag-weaving, not copy-paste):**
- `#CirclesNo9 Toruses breathe through a hex lattice — each ring a slow
  spectrum exhale 🌈💫 #Kaleidoscopic #SacredGeometry tension, then release.`
- `#DonutsNo2 ADD stacks the halo until the beat feels like stained glass
  under voltage 🍩💎 #AudioReactive heat.`

**Hashtag weaving (non-negotiable):** Tags must read as **grammar**, not
stickers. Patterns like `#TagOne #TagTwo blooms as …` or `…a #Luminous
reality. #Futuristic voltage …` — the hashtag is the noun, adjective, or
subject the sentence is *about*. A plain scene followed by a pile of tags
(`…energy. #Futuristic #Luminous`) with no syntactic link is a failure.

**Voice:** Prefer strong, simple verbs (blaze, fracture, tear, spiral, pulse)
and one clear image over ornate stacked metaphors. Evocative ≠ fancy. If the
output feels weaker than the hook examples, rewrite — don't treat gaps as
missing instructions.

**Hashtag rules:**
- **Maximum 5 hashtags per caption.** Choose the 5 that best balance
  discoverability with the sketch's identity. Prioritize: the sketch name
  (`#CirclesNo9`), the core art form (`#GenerativeArt`), and 3 others that
  capture what makes this piece unique — visual quality (`#SacredGeometry`,
  `#Kaleidoscopic`), music genre (`#HipHop`), or technique (`#AudioReactive`).
- Tech tools in the footer (ReasonStudios, p5js, etc.) are plain text — they
  do **not** use `#` and do **not** count toward the 5-hashtag limit.
- Always CamelCase: `#SacredGeometry`, `#CosmicArt`, `#PsychedelicArt`
- Inline, as part of sentence flow — never appended as a tag cloud

### Quote

Include a relevant quote from an artist, scientist, musician, or philosopher.
Format:

```
"Quote text." — Author Name [emoji(s)]
```

Or with a platform handle:

```
"Quote text." – @handle - Full Name
```

The quote should resonate with the theme — not be generic motivation. Think
Tesla on vibration, Kandinsky on color, Einstein on mystery.

Always offer 2–3 quote options in the same message as the caption (after the
interview step — not before).

### Closing line

The **last poetic beat** before credits. Voice of the artist, image and sound
tied together, wonder or punch. Weave in `#AudioReactive` and `#GenerativeArt`
(or `#GenerativeDesign`) naturally.

**Do not** skip this or replace it with the tech footer. The tech footer is
bookkeeping; the closing line is the goodbye.

**Examples (tone only — adapt to the piece):**
- `#AudioReactive — code becomes mandala ✨ #GenerativeArt`
- `The glow doesn't argue with the groove — it inherits it. #AudioReactive #GenerativeArt 🌌`
- `What you hear redraws what you see — same signal, two languages. #GenerativeArt 🎧`

### Tech footer

Always the **last line**, always after the closing line. Tech tool names are
plain text — no hashtags.

**Canonical line (use exactly unless the artist explicitly requests otherwise):**

```
Music made in ReasonStudios 🎹 Animation created with p5js, WebGL and ToneJS 💻
```

- Never drop `Music made in ReasonStudios 🎹` or the phrase `Animation created with`.
- Do not substitute "more accurate" stack fragments (e.g. "Web Audio FFT,
  MIDI") for this public line unless the artist explicitly asks — the footer
  is house style, not a build manifest.
- This line is **not** a substitute for the closing line above.

---

## Platform rules

Instagram and Threads are linked — the same caption posts to both.

- **First 125 characters** are the Instagram preview before "…more" — make
  the opening hook count even in short format.
- **500-character hard limit** (Threads). Everything — text, hashtags, emojis,
  spaces, newlines — counts toward this limit.

---

## Character count verification (mandatory)

Verify the count before delivering the caption. Do not guess, estimate, or use
memory. Report the result as `Character count: [N]/500` in your output.

**Preferred method — Cursor embedded browser:**

Use `cursor-ide-browser` MCP against https://wordcounter.net/character-count
with `position: "side"` and `newTab: true`.

1. Navigate to the URL (side panel, new tab).
2. Confirm **Count Spaces** is checked. Toggle it on if it is off.
3. Paste the full caption into the text area (`browser_fill`).
4. Read the **Characters** figure from the page snapshot.
5. If count exceeds 500, trim and repeat from step 3 until ≤ 500.

**Fallback — if `cursor-ide-browser` is unavailable:**

Count via terminal (do not use PowerShell or the editor's line indicator):

```bash
python3 -c "
caption = '''[paste full caption here]'''
print(len(caption))
"
```

Report the result. If it exceeds 500, trim and recount until ≤ 500.

**Never** report a character count without running one of these two methods.

---

## Style notes

- **Emojis:** Use generously but intentionally — as visual punctuation, not
  filler. 2–4 per section is typical. Match to content: 🌌 cosmic, 🎧 audio,
  💎 polished visuals, 🔮 mystical.
- **Tone:** Poetic and evocative with an undercurrent of technical wonder.
  Speak to both art lovers and creative coders. Avoid purely technical or
  purely flowery — blend both.
- **No generic AI voice:** Avoid "Check out my latest!", "Don't miss this!",
  "Link in bio!" The voice is an artist sharing work, not a brand manager.
- **Match the bar set by the hook examples:** If the opening line sings and
  the description reads like patch notes, rewrite the middle until the whole
  post feels like one voice — lush, specific, rhythmic.

---

## Full caption calibration (quality bar)

Use these as length, rhythm, and hashtag-weaving references — not templates
to copy. Note that closing line and tech footer are always distinct.

**Circles (chill / sacred / hip-hop):**

```
🌀 Geometry breathes. Rhythm dissolves. 🧘

#CirclesNo9 — luminous toruses spiral across a hexagonal lattice, each ring
spinning through the full spectrum 🌈💫 #Kaleidoscopic #SacredGeometry blooms
as chill hip hop pulses beneath ethereal choirs 🎧✨

"Sitting quietly, doing nothing, spring comes, and the grass grows by itself."
— Matsuo Bashō 🪷

#AudioReactive — code becomes mandala ✨ #GenerativeArt

Music made in ReasonStudios 🎹 Animation created with p5js, WebGL and ToneJS 💻
```

**Rectangles (high-energy / futuristic):**

```
⚡🔊 Pumping bass rewires the frame.

#RectanglesNo1 — four corner halos blaze and fracture, light tearing through
the frame of a #Luminous reality. #Futuristic voltage tickles the edges of the
universe. 🌐💫 🎧⚡

"Everything in the universe has a rhythm, everything dances." — Maya Angelou ✨

#AudioReactive — four frames, one voltage ✨ #GenerativeArt

Music made in ReasonStudios 🎹 Animation created with p5js, WebGL and ToneJS 💻
```

---

## Output format

After the interview is answered (or waived), present quote options and a
single caption (same text for Instagram and Threads):

```
## Quote options

1. "Quote A" — Author
2. "Quote B" — Author
3. "Quote C" — Author

## Caption (using quote [N])

[caption text]

Character count: [N]/500
```

Always verify the character count using the workflow above before reporting it.
If it exceeds 500, trim and re-verify — do not deliver an unverified count.