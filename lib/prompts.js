/** @import { Stage1Metadata } from './types.js' */
/** @typedef {typeof import('./languageRules.js').languageRules[string]} LanguageRules */

// ─── Stage 2: Core rewrite ─────────────────────────────────────────────────────

/**
 * Builds the Stage 2 rewrite prompt.
 * The prompt is deliberately mechanical and specific — abstract instructions
 * like "improve flow" do not work; the model needs exact transformation rules.
 *
 * Targets are anchored to measured human baselines from the detector:
 *   avg sentence length 23.2 words, ~6% very-short sentences, mean word
 *   length 5.24 chars, ~40% function words, ~1.2 subordinate clauses/sentence.
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
      `RHYTHM PROBLEM: Burstiness is ${burstiness} — all sentences are roughly the same length. This is the clearest AI signal. You MUST mix very short sentences (3–8 words) with longer ones.`,
    );
  } else if (burstiness < 0.2) {
    diagnostics.push(
      `RHYTHM WARNING: Burstiness is ${burstiness} — not enough sentence-length variation. Add at least 2–3 short punchy sentences per paragraph.`,
    );
  }

  if (averageSentenceLength > 23) {
    diagnostics.push(
      `SENTENCE LENGTH: Average is ${averageSentenceLength} words. Human baseline is 23.2 and AI runs ~29. Bring the AVERAGE down to about 23 — not by trimming every sentence evenly, but by splitting the long ones and adding short ones. Any sentence over 25 words must be split.`,
    );
  }

  if (passiveSentenceCount > 0) {
    diagnostics.push(
      `PASSIVE VOICE: ${passiveSentenceCount} sentences use passive voice. Convert them to active — say who does what.`,
    );
  }

  if (formalTransitionsFound.length > 0) {
    diagnostics.push(
      `FORMAL TRANSITIONS FOUND: "${formalTransitionsFound.join('", "')}". Replace all of them (see substitution table below).`,
    );
  }

  if (hedgingPhraseCount > 0) {
    diagnostics.push(
      `HEDGING: ${hedgingPhraseCount} wishy-washy phrases detected. Cut them — state things directly and confidently.`,
    );
  }

  if (repeatedStarts.length > 0) {
    diagnostics.push(
      `REPETITIVE OPENINGS: Sentences keep starting with "${repeatedStarts.join('", "')}". Vary how sentences begin.`,
    );
  }

  if (frequentWords.length > 0) {
    diagnostics.push(
      `OVERUSED WORDS: "${frequentWords.join('", "')}". Find synonyms or restructure sentences to reduce repetition.`,
    );
  }

  const diagnosticBlock =
    diagnostics.length > 0
      ? `PROBLEMS DETECTED IN THIS TEXT:\n${diagnostics.map((d) => `• ${d}`).join("\n")}`
      : `• No major structural issues — focus on naturalness and rhythm.`;

  return `You are rewriting AI-generated text so it reads like a real, thoughtful person wrote it — not a language model. A statistical detector flagged this text. Your rewrite must move every metric toward the HUMAN baseline shown below.

═══════════════════════════════════════════════════
ANALYSIS (${sentenceCount} sentences, avg ${averageSentenceLength} words/sentence)
═══════════════════════════════════════════════════
${diagnosticBlock}

═══════════════════════════════════════════════════
NUMERIC TARGETS — move toward HUMAN, away from AI
═══════════════════════════════════════════════════
• AVG SENTENCE LENGTH: AI ~29 words → HUMAN ~23. Lower the average.
• SUBORDINATE CLAUSES: AI 1.71 per sentence → HUMAN ~1.2. Most sentences should carry ONE clause; many should carry none.
• CLAUSE-JOINING CONJUNCTIONS: AI 1.33 per sentence → fewer. Split compound sentences instead of chaining them.
• VERY SHORT SENTENCES (≤8 words): AI 2.4% → HUMAN ~6%. Roughly 1 in every 6 sentences should be ≤8 words.
• MEAN WORD LENGTH: AI 5.86 chars → HUMAN 5.24. Prefer short, plain words.
• FUNCTION-WORD RATIO: AI ~33% → HUMAN ~40%. More pronouns and connective words; fewer dense noun stacks.
• EM-DASHES: a top AI tell. Target ZERO. One at most in the entire output.

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

3. CUT HEDGING AND AI-SKEWED VOCABULARY
   Remove or replace any phrase that avoids a direct statement:
   ✗ "in many ways" / "to some extent" / "generally speaking" → DELETE
   ✗ "it could be argued that" / "it is possible that" → DELETE — just say it
   ✗ "may potentially" / "could potentially" → "can" or "will"
   ✗ "seems to" / "appears to" → just state it
   Also strip the AI "inspirational" register. These words are overrepresented in
   AI text — cut them or replace with something plain and specific:
   "truly", "essential", "valuable", "meaningful", "fulfillment", "unlock",
   "journey", "delve", "foster", "leverage", "crucial", "vital", "profound",
   "robust", "seamless", "holistic", "transformative", "empower", "elevate",
   "embark", "navigate (figurative)", "realm", "tapestry", "landscape (figurative)".
   Humans are direct and concrete. If something is true, say it plainly.

4. SHORTEN AND SPLIT LONG SENTENCES
   Goal: bring the AVERAGE to ~23 words. Any sentence over 25 words gets split.
   If a sentence blends two ideas, make it two sentences.
   ✗ "The method works well in practice, which means teams can adopt it quickly,
      and once adopted it tends to reduce both cost and friction over time."
   ✓ "The method works well in practice. Teams adopt it fast. Once they do, it cuts
      cost and friction over time."

5. ADD VERY SHORT SENTENCES (≤8 words)
   About 1 in 6 sentences should be short. Drop them mid-paragraph for rhythm —
   not as conclusions.
   Examples: "That's the key point." / "It works." / "Here's why." / "Not always." /
   "Simple as that." / "And it matters."

6. CUT EMBEDDED CLAUSES AND COMPOUND CHAINS
   One main idea per sentence. Reduce subordinate clauses toward ~1.2 per sentence.
   Split compound sentences instead of stacking clauses. If you keep the joining
   word, start a NEW sentence with it.
   ✗ "X is true, and Y follows, which means Z."
   ✓ "X is true. So Y follows. And that means Z."

7. START SENTENCES WITH CONJUNCTIONS (deliberately)
   AI rarely starts a sentence with And/But/So. Humans do, often. Use them to
   open 1–2 sentences per paragraph. This pairs naturally with Rule 6 — when you
   split a compound sentence, push the conjunction to the front of the new one.
   ✓ "But that's not the whole story."
   ✓ "And that's exactly what makes it work."

8. PUNCTUATION — AVOID THE AI TELLS (this REVERSES old advice)
   EM-DASHES ARE A STRONG AI SIGNAL. Do NOT use them for asides or emphasis.
   Target zero in the output; one is the absolute ceiling.
   For a pause, use a comma or a period instead. A single parenthetical or colon
   is fine occasionally, but don't lean on them — overuse reads as AI too.
   ✗ "The method — which is unconventional — works well."
   ✓ "The method is unconventional. It still works well."

9. USE SHORT, PLAIN WORDS (lower mean word length)
   Prefer common Anglo-Saxon words over long Latinate ones:
   "utilize" → "use", "facilitate" → "help", "demonstrate" → "show",
   "numerous" → "many", "approximately" → "about", "additional" → "more",
   "individuals" → "people", "obtain" → "get", "require" → "need",
   "sufficient" → "enough", "commence" → "start", "terminate" → "end",
   "implement" → "do" / "build", "comprehend" → "understand".

10. USE PERSONAL-PRONOUN SUBJECTS — KILL NOMINALIZATION
    AI leans on noun and proper-noun subjects and nominalized framing. Humans use
    pronouns and put a person back into the sentence. This also raises the
    function-word ratio toward the human 40%.
    ✗ "The optimization of the process leads to a reduction in cost."
    ✓ "When you optimize the process, you spend less."
    ✗ "Implementation of the policy resulted in improved outcomes."
    ✓ "After they rolled out the policy, things got better."
    Favor: you, I, we, they, it as sentence subjects. Don't compress ideas into
    dense noun stacks.

11. BREAK PARALLEL "BENEFIT" TRIADS (rule-of-three)
    AI enumerates upsides in tidy threes. Break the pattern.
    ✗ "and you unlock new opportunities, find true fulfillment, and live a much
       more meaningful life"
    ✓ "and you get more chances to do work you actually like."
    Pick the one concrete point. Drop the rest or fold it in differently.

12. VARY OPENINGS AND TRANSITIONS
    Don't sequence the piece with high-level connectives in lockstep. Vary how
    sentences and paragraphs start — sometimes a subject, sometimes a question,
    sometimes a short fragment, sometimes a conjunction. No two adjacent paragraphs
    should open the same way.

13. VARY PARAGRAPH LENGTH
    Not every paragraph should be 3–4 sentences. Mix in:
    • 1-sentence paragraphs for impact
    • longer paragraphs for explanation
    • never have 4+ paragraphs all the same length

14. MAKE LANGUAGE CONCRETE
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
• EM-DASHES: zero ideally, one at most in the whole output

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
□ EM-DASHES — a top AI tell. If you find any "—", replace with a period or comma.
  The whole text should have zero, one at the very most.
□ Formal transitions still present: "furthermore", "moreover", "additionally",
  "consequently", "nevertheless", "therefore", "thus", "hence", "subsequently",
  "it is important to", "it should be noted", "it is worth noting"
□ Passive voice: "is/was/were/been + past participle" constructions
□ Hedging: "in many ways", "to some extent", "it could be argued", "seems to",
  "appears to", "potentially", "generally speaking"
□ AI-skewed "inspirational" words: "truly", "essential", "valuable", "meaningful",
  "fulfillment", "unlock", "journey", "delve", "foster", "leverage", "crucial",
  "vital", "robust", "seamless", "holistic", "transformative", "empower", "elevate"
□ Parallel benefit triads / rule-of-three: "unlock X, find Y, and live Z" — break
  these into one concrete point
□ Sentences over 25 words, or sentences carrying 2+ subordinate clauses — split them
□ Too few short sentences — if a long stretch has no sentence ≤8 words, add one or two
□ Noun-heavy or nominalized subjects where a pronoun fits ("The implementation of..."
  → "When they built...") — rewrite with a personal-pronoun subject
□ Long Latinate words where a short common one works: "utilize"→"use",
  "facilitate"→"help", "demonstrate"→"show", "numerous"→"many", "obtain"→"get",
  "require"→"need", "sufficient"→"enough"
□ Every sentence starting with "The" or "This" — break the pattern
□ Facts, numbers, or names from the ORIGINAL that are missing or changed

IMPORTANT — DO NOT FIX THESE (they are intentional human touches, leave them in):
• Missing Oxford comma in a list
• A comma splice (two clauses joined with just a comma)
• Sentences ending with a preposition
• Informal words like "a bit", "pretty much", "kind of", "just", "actually"
• "which" used without a comma before it
• Omission of "that" where it's optional ("I think you should" not "I think that you should")
• Sentences starting with "And", "But", or "So"

For each problem found, fix it in place. If the rewritten text is clean, return it unchanged.

HARD RULE: Do NOT add new information. Do NOT change facts. Do NOT introduce em-dashes.

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

1. EM-DASH GATE — This is the last checkpoint. Em-dashes are one of the strongest
   AI tells. If ANY "—" remain, remove them: split into two sentences, or use a
   comma. The finished text should have zero, one at the absolute most.

2. RHYTHM — Read aloud mentally. Any sentence that stumbles or drones: rewrite it.
   A short sentence after a long one almost always helps. Aim for an average
   around 23 words, with a few sentences under 8 words mixed in.

3. BLAND VERB CONSTRUCTIONS — Replace:
   ✗ "have an impact on" → ✓ "affect" / "shape"
   ✗ "make a decision" → ✓ "decide"
   ✗ "provide support for" → ✓ "support"
   ✗ "come to the conclusion" → ✓ "conclude"
   ✗ "give consideration to" → ✓ "consider"
   ✗ "take into account" → ✓ "consider"
   ✗ "is able to" → ✓ "can"
   ✗ "in order to" → ✓ "to"

4. LONG WORDS → SHORT WORDS — lower the mean word length:
   "utilize" → "use", "facilitate" → "help", "determine" → "figure out",
   "examine" → "look at", "encounter" → "run into", "numerous" → "many",
   "additional" → "more", "sufficient" → "enough".

5. THROAT-CLEARING OPENERS — Delete sentences that announce what the paragraph
   is about instead of just saying it:
   ✗ "There are several reasons why this is the case."
   ✗ "This section examines the key aspects of..."
   Just start with the actual content.

6. RECAP ENDINGS — Remove final sentences that just restate the paragraph:
   ✗ "Overall, this approach has many advantages."
   ✗ "In summary, the above demonstrates the importance of..."
   End on something specific and concrete.

7. NOMINALIZATION CHECK — Any subject that's an abstract noun where a person or
   pronoun fits: rewrite it. "The adoption of the tool improved speed" →
   "After they adopted the tool, it ran faster."

8. VOICE CHECK — Any sentence that reads like a corporate brochure or Wikipedia:
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
  Use each filler at most once.

• PREPOSITION AT SENTENCE END — end one sentence with a preposition:
  ✓ "That's the part most people don't think about."
  ✓ "It depends on what you're optimizing for."

• "WHICH" WITHOUT A COMMA — use "which" informally without the pause:
  ✓ "an approach which works well in practice"

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
• Do NOT use an em-dash as an "imperfection" — em-dashes are banned
• The text must still be completely readable and understandable
• Spread them through the text — don't cluster them in one spot

═══════════════════════════════════════
HARD CONSTRAINTS (never break these)
═══════════════════════════════════════
• Preserve ALL facts, numbers, names, and meaning
• Do NOT add new information
• Do NOT add a conclusion if there wasn't one
• Do NOT note or explain the imperfections you added
• Zero em-dashes (one at most)

OUTPUT: Return ONLY the final text. No preamble, no commentary.

TEXT:
${stage2Text}`;
}

// ─── Multilingual variants ────────────────────────────────────────────────────
// Used for every supported language except English. English keeps the
// hand-tuned prompts above; these builders interpolate per-language rules
// from lib/languageRules.js (each language's own AI tells — NOT translations
// of the English tables). The universal, language-independent signals
// (sentence-length uniformity, em-dash overuse, hedging, meta-commentary)
// are kept; everything vocabulary-specific comes from the rules object.

/**
 * Formats a two-column substitution table for prompt injection.
 * @param {Array<[string, string]>} rows
 */
function formatTable(rows) {
  return rows.map(([from, to]) => `   ${from} → ${to}`).join("\n");
}

/** @param {string[]} items */
function formatList(items) {
  return items.map((i) => `"${i}"`).join(", ");
}

/**
 * Stage 2 rewrite prompt for non-English text.
 *
 * @param {string} cleanedText
 * @param {Stage1Metadata} metadata
 * @param {LanguageRules} rules
 * @returns {string}
 */
export function buildMultilingualStage2Prompt(cleanedText, metadata, rules) {
  const { sentenceCount, burstiness, averageSentenceLength, repeatedStarts, frequentWords } =
    metadata;

  const diagnostics = [];

  if (burstiness < 0) {
    diagnostics.push(
      `RHYTHM PROBLEM: Burstiness is ${burstiness} — all sentences are roughly the same length. This is the clearest AI signal. You MUST mix very short sentences (3–8 words) with longer ones.`,
    );
  } else if (burstiness < 0.2) {
    diagnostics.push(
      `RHYTHM WARNING: Burstiness is ${burstiness} — not enough sentence-length variation. Add at least 2–3 short punchy sentences per paragraph.`,
    );
  }

  if (averageSentenceLength > 22) {
    diagnostics.push(
      `SENTENCE LENGTH: Average is ${averageSentenceLength} words. AI-generated ${rules.languageName} runs long; humans average roughly 18–22 words. Split every sentence over 25 words and add short ones — don't trim every sentence evenly.`,
    );
  }

  if (repeatedStarts.length > 0) {
    diagnostics.push(
      `REPETITIVE OPENINGS: Sentences keep starting with "${repeatedStarts.join('", "')}". Vary how sentences begin.`,
    );
  }

  if (frequentWords.length > 0) {
    diagnostics.push(
      `OVERUSED WORDS: "${frequentWords.join('", "')}". Find synonyms or restructure sentences to reduce repetition.`,
    );
  }

  const diagnosticBlock =
    diagnostics.length > 0
      ? `PROBLEMS DETECTED IN THIS TEXT:\n${diagnostics.map((d) => `• ${d}`).join("\n")}`
      : `• No major structural issues — focus on naturalness and rhythm.`;

  return `You are rewriting AI-generated ${rules.languageName} text so it reads like a real, thoughtful native speaker wrote it — not a language model.

ABSOLUTE LANGUAGE RULE: The text is in ${rules.languageName}. Your output must be entirely in ${rules.languageName} — the same language, the same regional variant, the same register (formal/informal address) as the input. Do NOT translate anything into English.

═══════════════════════════════════════════════════
ANALYSIS (${sentenceCount} sentences, avg ${averageSentenceLength} words/sentence)
═══════════════════════════════════════════════════
${diagnosticBlock}

═══════════════════════════════════════════════════
UNIVERSAL TARGETS — these apply in every language
═══════════════════════════════════════════════════
• SENTENCE LENGTH: split every sentence over 25 words. One main idea per sentence.
• VERY SHORT SENTENCES (≤8 words): roughly 1 in every 6 sentences should be this short. Drop them mid-paragraph for rhythm, not as conclusions.
• EM-DASHES (—): a top AI tell in every language. Target ZERO; one at most in the whole output. Use a comma or a period instead.
• PARAGRAPH LENGTH: vary it. Mix 1-sentence paragraphs with longer ones; never 4+ paragraphs of identical length.
• CONCRETE LANGUAGE: name actual things instead of vague abstractions ("various factors", "a significant impact" and their ${rules.languageName} equivalents).
• ACTIVE VOICE: where ${rules.languageName} allows it naturally, say who does what instead of using impersonal or passive constructions.

═══════════════════════════════════════════════════
${rules.languageName.toUpperCase()}-SPECIFIC RULES — apply ALL of these
═══════════════════════════════════════════════════

1. KILL FORMAL AI TRANSITIONS — replace using this table:
${formatTable(rules.transitionTable)}

2. DELETE META-COMMENTARY OUTRIGHT — these phrases add nothing; remove them and just state the point:
   ${formatList(rules.deletePhrases)}

3. CUT AI-SKEWED VOCABULARY — these words are overrepresented in AI-generated ${rules.languageName}. Cut them or replace with something plain and specific:
   ${formatList(rules.aiWords)}

4. CUT HEDGING — remove or replace phrases that avoid a direct statement:
   ${formatList(rules.hedging)}

5. USE SHORT, PLAIN WORDS:
${formatTable(rules.plainWordSwaps)}

6. LANGUAGE-SPECIFIC PATTERNS:
${rules.extraNotes.map((n) => `   • ${n}`).join("\n")}

═══════════════════════════════════════════════════
HARD CONSTRAINTS (never violate these)
═══════════════════════════════════════════════════
• Output entirely in ${rules.languageName} — never translate
• Preserve ALL facts, numbers, names, and core meaning exactly
• Preserve the regional variant and register of the input
• Do NOT add new information
• Do NOT use bullet points or headers unless already in the source
• Do NOT write a conclusion paragraph if there wasn't one
• Do NOT start or end with a meta-comment about the rewrite
• EM-DASHES: zero ideally, one at most in the whole output

OUTPUT: Return ONLY the rewritten text. No preamble, no commentary.

═══════════════════════════════════════════════════
TEXT TO REWRITE:
═══════════════════════════════════════════════════
${cleanedText}`;
}

/**
 * Stage 2.5 self-critique prompt for non-English text.
 *
 * @param {string} originalText
 * @param {string} rewrittenText
 * @param {LanguageRules} rules
 * @returns {string}
 */
export function buildMultilingualCritiquePrompt(originalText, rewrittenText, rules) {
  return `You are an expert ${rules.languageName} editor hunting for AI writing patterns that survived a rewrite. Both texts below are in ${rules.languageName}; your corrected output must also be entirely in ${rules.languageName}.

Scan the REWRITTEN TEXT for these specific problems:

CHECKLIST — flag and fix each one found:
□ EM-DASHES — a top AI tell. If you find any "—" used for asides or emphasis, replace with a period or comma. The whole text should have zero, one at the very most.
□ Formal AI transitions still present: ${formatList(rules.transitionTable.map(([from]) => from.replace(/"/g, "")))}
□ Meta-commentary still present: ${formatList(rules.deletePhrases)}
□ Hedging: ${formatList(rules.hedging)}
□ AI-skewed vocabulary: ${formatList(rules.aiWords)}
□ Parallel "not only… but also" constructions in ${rules.languageName} — break them into one concrete point
□ Sentences over 25 words, or sentences stacking multiple subordinate clauses — split them
□ Too few short sentences — if a long stretch has no sentence ≤8 words, add one or two
□ Impersonal or nominalized constructions where a person or pronoun fits as the subject — rewrite actively
□ Every sentence starting with the same word — break the pattern
□ Facts, numbers, or names from the ORIGINAL that are missing or changed
□ Any register or variant drift (formal/informal address switching, regional variant mixing)

IMPORTANT — DO NOT FIX THESE (they are intentional human touches, leave them in):
• Sentences starting with the ${rules.languageName} equivalents of "And", "But", "So"
• A comma splice (two short clauses joined with just a comma)
• Informal filler words and slightly colloquial word choices
• One sentence that reads correct but not perfectly polished
• Short verbless fragments used for rhythm

For each problem found, fix it in place. If the rewritten text is clean, return it unchanged.

HARD RULE: Do NOT add new information. Do NOT change facts. Do NOT introduce em-dashes. Do NOT translate anything.

OUTPUT: Return ONLY the corrected text, entirely in ${rules.languageName}. No commentary.

ORIGINAL:
${originalText}

REWRITTEN:
${rewrittenText}`;
}

/**
 * Stage 3 final polish prompt for non-English text.
 *
 * @param {string} stage2Text
 * @param {LanguageRules} rules
 * @returns {string}
 */
export function buildMultilingualStage3Prompt(stage2Text, rules) {
  return `You are a senior ${rules.languageName} editor doing a final pass. The text has been rewritten twice. Your job has two parts: fix what's still robotic, then add subtle human imperfections so it reads like a real person typed it. The text is in ${rules.languageName}; your output must be entirely in ${rules.languageName}.

═══════════════════════════════════════
PART 1 — FIX REMAINING ROBOTIC PATTERNS
═══════════════════════════════════════

1. EM-DASH GATE — last checkpoint. If ANY "—" remain as asides or emphasis, remove them: split into two sentences, or use a comma. Zero is the target, one is the absolute ceiling.

2. RHYTHM — Read aloud mentally. Any sentence that stumbles or drones: rewrite it. A short sentence after a long one almost always helps. Mix in a few sentences under 8 words.

3. THROAT-CLEARING OPENERS — Delete sentences that announce what the paragraph is about instead of just saying it. Just start with the actual content.

4. RECAP ENDINGS — Remove final sentences that merely restate the paragraph (the ${rules.languageName} equivalents of "In summary…", "Overall…"). End on something specific and concrete.

5. NOMINALIZATION CHECK — Any subject that's an abstract noun where a person or pronoun fits: rewrite it actively. ${rules.extraNotes[0]}

6. VOICE CHECK — Any sentence that reads like a corporate brochure or an encyclopedia: rewrite it as a smart person explaining something to a colleague, in natural ${rules.languageName}.

═══════════════════════════════════════════════════════════════
PART 2 — ADD SUBTLE HUMAN IMPERFECTIONS (this is REQUIRED)
═══════════════════════════════════════════════════════════════

Real humans don't produce perfectly polished text. A flawless, error-free output is itself an AI signal. Introduce subtle imperfections scattered naturally through the text, chosen from this ${rules.languageName}-specific list:

${rules.naturalTouches.map((t) => `• ${t}`).join("\n")}

RULES FOR IMPERFECTIONS:
• Scale with length: 1–2 imperfections for texts under 150 words, 4–6 for longer texts. Never force one in where it doesn't fit.
• Maximum 1 imperfection per paragraph
• A filler must never change what a sentence claims — if adding it alters the meaning even slightly, leave the sentence alone
• No spelling mistakes — imperfections are stylistic, not typos
• Everything must remain grammatical enough that a native speaker would not flinch
• No changed facts, numbers, or names
• Do NOT use an em-dash as an "imperfection" — em-dashes are banned
• Spread them through the text — don't cluster them in one spot

═══════════════════════════════════════
HARD CONSTRAINTS (never break these)
═══════════════════════════════════════
• Output entirely in ${rules.languageName}, preserving the input's regional variant and register
• Preserve ALL facts, numbers, names, and meaning
• Do NOT add new information
• Do NOT add a conclusion if there wasn't one
• Do NOT note or explain the imperfections you added
• Zero em-dashes (one at most)

OUTPUT: Return ONLY the final text. No preamble, no commentary.

TEXT:
${stage2Text}`;
}
