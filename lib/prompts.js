/** @import { Stage1Metadata } from './types.js' */

// ─── Stage 2: Core rewrite ─────────────────────────────────────────────────────

/**
 * Builds the Stage 2 rewrite prompt.
 * The prompt is deliberately mechanical and specific — abstract instructions
 * like "improve flow" do not work; the model needs exact transformation rules.
 *
 * @param {string} cleanedText
 * @param {Stage1Metadata} metadata
 * @returns {string}
 */
export function buildStage2Prompt(cleanedText, metadata) {
  const {
    sentenceCount,
    burstiness,
    averageSentenceLength,
    repeatedStarts,
    frequentWords,
    passiveSentenceCount,
    formalTransitionsFound,
    hedgingPhraseCount,
  } = metadata;

  // ── Diagnostic summary injected into the prompt ──────────────────────────
  const diagnostics = [];

  if (burstiness < 0) {
    diagnostics.push(
      `RHYTHM PROBLEM: Burstiness is ${burstiness} — all sentences are roughly the same length. This is the clearest AI signal. You MUST mix very short sentences (3–8 words) with longer ones.`
    );
  } else if (burstiness < 0.2) {
    diagnostics.push(
      `RHYTHM WARNING: Burstiness is ${burstiness} — not enough sentence-length variation. Add at least 2–3 short punchy sentences per paragraph.`
    );
  }

  if (averageSentenceLength > 22) {
    diagnostics.push(
      `SENTENCE LENGTH: Average is ${averageSentenceLength} words — too long. Split any sentence over 22 words into two.`
    );
  }

  if (passiveSentenceCount > 0) {
    diagnostics.push(
      `PASSIVE VOICE: ${passiveSentenceCount} sentences use passive voice. Convert them to active — say who does what.`
    );
  }

  if (formalTransitionsFound.length > 0) {
    diagnostics.push(
      `FORMAL TRANSITIONS FOUND: "${formalTransitionsFound.join('", "')}". Replace all of them (see substitution table below).`
    );
  }

  if (hedgingPhraseCount > 0) {
    diagnostics.push(
      `HEDGING: ${hedgingPhraseCount} wishy-washy phrases detected. Cut them — state things directly and confidently.`
    );
  }

  if (repeatedStarts.length > 0) {
    diagnostics.push(
      `REPETITIVE OPENINGS: Sentences keep starting with "${repeatedStarts.join('", "')}". Vary how sentences begin.`
    );
  }

  if (frequentWords.length > 0) {
    diagnostics.push(
      `OVERUSED WORDS: "${frequentWords.join('", "')}". Find synonyms or restructure sentences to reduce repetition.`
    );
  }

  const diagnosticBlock =
    diagnostics.length > 0
      ? `PROBLEMS DETECTED IN THIS TEXT:\n${diagnostics.map((d) => `• ${d}`).join("\n")}`
      : `• No major structural issues — focus on naturalness and rhythm.`;

  return `You are rewriting AI-generated text so it reads like it was written by a real, thoughtful person — not a language model.

═══════════════════════════════════════════════════
ANALYSIS (${sentenceCount} sentences, avg ${averageSentenceLength} words/sentence)
═══════════════════════════════════════════════════
${diagnosticBlock}

═══════════════════════════════════════════════════
MANDATORY TRANSFORMATION RULES — apply ALL of these
═══════════════════════════════════════════════════

1. KILL FORMAL AI TRANSITIONS
   Replace word-for-word using this table. No exceptions:
   "Furthermore" → "And" or start a new sentence
   "Moreover" → "On top of that" / "Also" / just continue the thought
   "Additionally" → "Also" / "And"
   "However" → "But" / "That said"
   "Therefore" / "Thus" / "Hence" → "So"
   "Consequently" / "As a result" → "So" / "Because of this"
   "Nevertheless" / "Nonetheless" → "Still" / "Even so"
   "Subsequently" → "Then" / "After that"
   "In addition" → "Also"
   "In contrast" → "But"
   "On the other hand" → "Then again" / "But"
   "It is important to note that" → DELETE — just state the point
   "It should be noted that" → DELETE
   "It is worth noting that" → DELETE
   "This demonstrates that" → "This shows"
   "This highlights" → "This shows" / rewrite directly
   "This enables" → "This lets"
   "This allows" → "This lets"

2. DESTROY PASSIVE VOICE
   Find every "is/was/were/been + past participle" and convert to active.
   ✗ "It has been shown that X occurs" → ✓ "X occurs"
   ✗ "This can be achieved by doing Y" → ✓ "You can achieve this by doing Y"
   ✗ "The results were found to be significant" → ✓ "The results were significant"
   ✗ "It is believed that" → ✓ "Most people think" or just state it directly
   ✗ "This approach has been utilized" → ✓ "This approach works"

3. CUT HEDGING LANGUAGE
   Remove or replace any phrase that avoids making a direct statement:
   ✗ "in many ways" → DELETE
   ✗ "to some extent" → DELETE or pick a side
   ✗ "it could be argued that" → DELETE — just argue it
   ✗ "it is possible that" → DELETE — just say it
   ✗ "may potentially" / "could potentially" → "can" or "will"
   ✗ "seems to" / "appears to" → just state it
   ✗ "generally speaking" → DELETE
   ✗ "in certain circumstances" → be specific or delete
   Humans are direct. If something is true, say it is.

4. BREAK UNIFORM SENTENCE LENGTH
   Humans do not write sentences of the same length back to back.
   Rule: after every 2–3 sentences of 15+ words, add one sentence under 8 words.
   Examples of short punchy sentences: "That's the key point." / "Simple as that." /
   "It works." / "And it matters." / "Here's why." / "Not always."
   These are not conclusions — drop them mid-paragraph for rhythm.

5. START SENTENCES WITH CONJUNCTIONS (deliberately)
   AI never starts sentences with And/But/So. Humans do, often.
   Use "And", "But", or "So" to start 1–2 sentences per paragraph.
   ✓ "But that's not the whole story."
   ✓ "And that's exactly what makes it work."
   ✓ "So the question becomes: what now?"

6. ADD HUMAN PUNCTUATION PATTERNS
   Use em-dashes (—) for asides: "The method — while unconventional — works well."
   Use parentheticals: "The approach (which is often ignored) saves time."
   Use colons for reveals: "There's one problem: it doesn't scale."
   These break monotony and sound like a person thinking on paper.

7. BREAK UP PARALLEL LISTS
   AI loves: "First... Second... Third..." or "The first X... The second X..."
   Convert these to flowing prose:
   ✗ "First, it improves speed. Second, it reduces cost. Third, it scales well."
   ✓ "It's faster and cheaper. And it scales — which is the part most people overlook."

8. VARY PARAGRAPH LENGTH
   Not every paragraph should be 3–4 sentences. Mix in:
   • 1-sentence paragraphs for impact or emphasis
   • Longer paragraphs for explanation
   • Never have 4+ paragraphs all the same length

9. MAKE LANGUAGE CONCRETE
   ✗ "various factors" → name the actual factors
   ✗ "plays a crucial role" → say what it actually does
   ✗ "a significant impact" → describe what actually changes
   ✗ "in a meaningful way" → DELETE or specify how

═══════════════════════════════════════════════════
HARD CONSTRAINTS (never violate these)
═══════════════════════════════════════════════════
• Preserve ALL facts, numbers, names, and core meaning exactly
• Do NOT add new information
• Do NOT use bullet points or headers unless already in the source
• Do NOT write a conclusion paragraph if there wasn't one
• Do NOT start or end with a meta-comment about the rewrite

OUTPUT: Return ONLY the rewritten text. No preamble, no commentary.

═══════════════════════════════════════════════════
TEXT TO REWRITE:
═══════════════════════════════════════════════════
${cleanedText}`;
}

// ─── Stage 2.5: Self-critique ─────────────────────────────────────────────────

/**
 * Stage 2.5 — the model hunts for specific AI patterns that survived Stage 2
 * and corrects them. Focused on the exact tells that slip through rewrites.
 *
 * @param {string} originalText
 * @param {string} rewrittenText
 * @returns {string}
 */
export function buildSelfCritiquePrompt(originalText, rewrittenText) {
  return `You are an expert editor hunting for AI writing patterns that survived a rewrite.

Scan the REWRITTEN TEXT below for these specific problems:

CHECKLIST — flag and fix each one found:
□ Formal transitions still present: "furthermore", "moreover", "additionally",
  "consequently", "nevertheless", "therefore", "thus", "hence", "subsequently",
  "it is important to", "it should be noted", "it is worth noting"
□ Passive voice: "is/was/were/been + past participle" constructions
□ Hedging: "in many ways", "to some extent", "it could be argued", "seems to",
  "appears to", "potentially", "generally speaking"
□ Back-to-back sentences of identical length (5+ sentences all 15–25 words)
□ Every sentence starting with "The" or "This" — break the pattern
□ Parallel list structure: "First... Second... Third..."
□ Overly formal word choices: "utilize", "facilitate", "demonstrate", "numerous",
  "significant", "substantial", "encompass", "possess", "comprise"
□ Facts, numbers, or names from the ORIGINAL that are missing or changed

IMPORTANT — DO NOT FIX THESE (they are intentional human touches, leave them in):
• Missing Oxford comma in a list
• A comma splice (two clauses joined with just a comma)
• Sentences ending with a preposition
• Informal words like "a bit", "pretty much", "kind of", "just", "actually"
• "which" used without a comma before it
• Omission of "that" where it's optional ("I think you should" not "I think that you should")

For each problem found, fix it in place. If the rewritten text is clean, return it unchanged.

HARD RULE: Do NOT add new information. Do NOT change facts.

OUTPUT: Return ONLY the corrected text. No commentary.

ORIGINAL:
${originalText}

REWRITTEN:
${rewrittenText}`;
}

// ─── Stage 3: Final human polish ──────────────────────────────────────────────

/**
 * Stage 3 — final editorial pass: rhythm, voice, concrete language,
 * and deliberate subtle human imperfections.
 *
 * @param {string} stage2Text
 * @returns {string}
 */
export function buildStage3Prompt(stage2Text) {
  return `You are a senior editor doing a final pass. The text has been rewritten twice. Your job has two parts: fix what's still robotic, then add subtle human imperfections so it reads like a real person typed it.

═══════════════════════════════════════
PART 1 — FIX REMAINING ROBOTIC PATTERNS
═══════════════════════════════════════

1. RHYTHM — Read aloud mentally. Any sentence that stumbles or drones: rewrite it.
   A short sentence after a long one almost always helps.

2. BLAND VERB CONSTRUCTIONS — Replace:
   ✗ "have an impact on" → ✓ "affect" / "shape"
   ✗ "make a decision" → ✓ "decide"
   ✗ "provide support for" → ✓ "support"
   ✗ "come to the conclusion" → ✓ "conclude"
   ✗ "give consideration to" → ✓ "consider"
   ✗ "take into account" → ✓ "consider"
   ✗ "is able to" → ✓ "can"
   ✗ "in order to" → ✓ "to"

3. THROAT-CLEARING OPENERS — Delete sentences that announce what the paragraph
   is about instead of just saying it:
   ✗ "There are several reasons why this is the case."
   ✗ "This section examines the key aspects of..."
   Just start with the actual content.

4. RECAP ENDINGS — Remove final sentences that just restate the paragraph:
   ✗ "Overall, this approach has many advantages."
   ✗ "In summary, the above demonstrates the importance of..."
   End on something specific and concrete.

5. VOICE CHECK — Any sentence that reads like a corporate brochure or Wikipedia:
   rewrite it as a smart person explaining something to a colleague.

═══════════════════════════════════════════════════════════════
PART 2 — ADD SUBTLE HUMAN IMPERFECTIONS (this is REQUIRED)
═══════════════════════════════════════════════════════════════

Real humans don't produce perfectly polished text. A flawless, error-free output
is itself an AI signal. You MUST introduce 4–6 subtle imperfections scattered
naturally through the text. Choose from this list:

WHAT TO ADD — pick 4–6, place them naturally, space them out:

• MISSING OXFORD COMMA — in one or two lists, drop the final comma:
  ✓ "speed, cost and reliability" (not "speed, cost, and reliability")

• COMMA SPLICE — join two short related clauses with just a comma once:
  ✓ "It's not complicated, it just takes practice."
  ✓ "The result was clear, nobody argued with it."

• OMIT OPTIONAL "THAT" — remove "that" where it's grammatically optional:
  ✓ "I think you should try it" (not "I think that you should try it")
  ✓ "The fact it works is enough" (not "The fact that it works")

• INFORMAL FILLER WORD — drop one of these into a sentence naturally:
  "just", "actually", "pretty much", "a bit", "kind of", "fairly", "really"
  ✓ "It's actually simpler than it looks."
  ✓ "That part is just harder to get right."
  ✓ "It works pretty well in most cases."
  Use each filler at most once.

• PREPOSITION AT SENTENCE END — end one sentence with a preposition:
  ✓ "That's the part most people don't think about."
  ✓ "It depends on what you're optimizing for."

• "WHICH" WITHOUT A COMMA — use "which" informally without the pause:
  ✓ "an approach which works well in practice"
  (Technically should be "that" or "which," with a comma — humans ignore this)

• SLIGHTLY INFORMAL WORD — swap one formal word for a casual equivalent:
  "alright" instead of "all right"
  "OK" instead of "acceptable" or "adequate"
  "figure out" instead of "determine"
  "look at" instead of "examine"
  "run into" instead of "encounter"

• MILD SENTENCE AWKWARDNESS — leave one sentence that's correct but not
  perfectly smooth, the way a fast typist would leave it:
  ✓ "It's one of those things that once you see it, you can't unsee it."
  ✓ "The tricky part is knowing when not to apply it."

RULES FOR IMPERFECTIONS:
• Maximum 1 imperfection per paragraph
• No spelling mistakes — imperfections are grammatical/stylistic, not typos
• No missing words that create confusion
• No changed facts, numbers, or names
• The text must still be completely readable and understandable
• Spread them through the text — don't cluster them in one spot

═══════════════════════════════════════
HARD CONSTRAINTS (never break these)
═══════════════════════════════════════
• Preserve ALL facts, numbers, names, and meaning
• Do NOT add new information
• Do NOT add a conclusion if there wasn't one
• Do NOT note or explain the imperfections you added

OUTPUT: Return ONLY the final text. No preamble, no commentary.

TEXT:
${stage2Text}`;
}
