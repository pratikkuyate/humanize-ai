/** @type {import("./index.js").BlogPost} */
export default {
  slug: "chatgpt-em-dashes",
  cluster: "ai-writing-patterns",
  title: "Why Does ChatGPT Use So Many Em Dashes?",
  metaTitle: "Why Does ChatGPT Use So Many Em Dashes?",
  metaDescription:
    "The em dash became the internet's favorite AI tell. Here's why ChatGPT actually overuses them, how many is too many, and how to replace them without flattening your writing.",
  keyword: "chatgpt em dash",
  datePublished: "2026-07-15",
  dateModified: "2026-07-15",
  tldr:
    "ChatGPT overuses em dashes because its training data is full of edited prose — books and journalism — where the dash is common, and because the dash lets a model glue clauses together without committing to structure. The em dash itself isn't an AI tell; the density and the repetitive mid-sentence pattern are.",
  sections: [
    {
      heading: "The Punctuation Mark That Became an Accusation",
      blocks: [
        {
          p: "Somewhere around 2024, the em dash stopped being a punctuation mark and became evidence. Writers who had used dashes for decades started getting replies like \"this reads like ChatGPT.\" People began stripping dashes from their own genuine writing to avoid suspicion. It's one of the stranger side effects of AI text flooding the internet: a 200-year-old typographic convention turned into a loyalty test.",
        },
        {
          p: "The accusation isn't baseless — ChatGPT really does produce em dashes at a rate most human writers don't. But the discourse gets the mechanism wrong, and that leads people to \"fix\" their writing in ways that don't help.",
        },
      ],
    },
    {
      heading: "Why the Model Actually Loves the Dash",
      blocks: [
        {
          p: "Three forces stack on top of each other:",
        },
        {
          list: [
            "**Training data skew.** Models learn from disproportionate amounts of professionally edited prose — books, magazines, journalism — where em dashes are far more common than in everyday writing like emails, forum posts, or student essays. The model's \"average\" register is more dash-heavy than yours.",
            "**Structural convenience.** The em dash is the Swiss Army knife of punctuation: it can replace a comma, a colon, parentheses, or a semicolon. For a system predicting one token at a time, the dash is a low-risk way to bolt a clarification onto a sentence without planning its structure in advance.",
            "**Fine-tuning for punch.** Human raters reward writing that feels crisp and engaging. The interrupted rhythm of a dash — like this — reads as lively. So the behavior gets reinforced, and the model deploys it constantly.",
          ],
        },
        {
          p: "Put simply: the model isn't imitating one dash-happy writer. It's averaging a corpus where dashes signal polish, and then a reward signal turned that tendency up.",
        },
      ],
    },
    {
      heading: "The Em Dash Is Not the Tell. The Pattern Is.",
      blocks: [
        {
          p: "Plenty of great human writers are dash addicts — Emily Dickinson built a whole style on them. So a detector, human or automated, that flags any em dash is going to generate [false positives](/blog/ai-detector-false-positives) all day.",
        },
        {
          p: "What actually distinguishes machine output is the pattern:",
        },
        {
          list: [
            "**Density.** Multiple dashes per paragraph, sustained across a whole piece. Human dash users spike; models are uniform.",
            "**The same construction every time.** ChatGPT's signature move is the mid-sentence appositive — a quick elaboration wedged between dashes, or one dash before a punchy restatement at the end. Human writers vary how they use the mark; the model repeats one recipe.",
            "**Dashes plus the rest of the fingerprint.** Uniform sentence lengths, [cliché vocabulary](/blog/words-chatgpt-overuses), formal transitions. A dash in that context is corroborating evidence, not the crime.",
          ],
        },
      ],
    },
    {
      heading: "How Many Em Dashes Is Too Many?",
      blocks: [
        {
          p: "There's no magic number, but a useful editing rule: in a typical 500-word passage, one or two em dashes read as style, four or five read as a habit, and eight or more read as a generator. If nearly every paragraph contains a dash doing the same job, readers will notice the rhythm before they can name it.",
        },
        {
          p: "Our own humanizing pipeline treats em dashes as a high-priority pattern for exactly this reason — not because dashes are bad, but because AI-typical density is one of the first things readers now pattern-match on.",
        },
      ],
    },
    {
      heading: "How to Replace Em Dashes Without Flattening Your Writing",
      blocks: [
        {
          p: "Each dash is doing a specific job. Replace it with the mark that does that job honestly:",
        },
        {
          list: [
            "**Aside or elaboration** → commas or parentheses. \"The results — which surprised everyone — held up\" becomes \"The results, which surprised everyone, held up.\"",
            "**Dramatic reveal** → a colon. \"There was one problem — the data was wrong\" becomes \"There was one problem: the data was wrong.\"",
            "**Two loosely joined thoughts** → a period. Splitting a dash-spliced sentence into two shorter ones usually improves it, and short sentences are their own [human signal](/blog/the-case-for-short-sentences).",
            "**A genuine interruption** → keep the dash. If it's the best mark for the sentence, use it. One well-placed dash per page is writing, not evidence.",
          ],
        },
        {
          p: "If you're cleaning up a long AI draft, doing this by hand gets tedious fast. [Simply Humanize](/) handles the dash pass automatically as part of rewriting for natural rhythm, and you can check the before/after with our [AI content detector](/tools/ai-content-detector), which shows its signals instead of issuing a verdict.",
        },
      ],
    },
    {
      heading: "If You're a Human Who Just Likes Em Dashes",
      blocks: [
        {
          p: "Keep them. Seriously. Sanding the personality out of your writing to dodge suspicion is a losing trade — voice is the thing AI can't fake, and defensive writing reads worse than dash-heavy writing. If you're worried about a specific context, like a graded essay or a job application, vary your constructions, keep your drafts and version history, and let the overall humanity of the writing carry the argument.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Are em dashes proof of AI writing?",
      a: "No. Em dashes predate AI by centuries and many skilled writers use them heavily. AI-generated text tends to use them at unusually high density in one repetitive construction, which is why they became associated with ChatGPT — but a dash alone proves nothing.",
    },
    {
      q: "Should I remove every em dash from my AI draft?",
      a: "No — that overcorrects. Replace the mechanical ones (repeated mid-sentence asides) with commas, colons, or sentence breaks, and keep the rare dash that genuinely earns its place. The goal is natural variety, not zero dashes.",
    },
    {
      q: "Why do people on social media call the em dash \"the ChatGPT dash\"?",
      a: "Because AI text flooded feeds with dash-heavy prose, and the dash is easy to spot at a glance. It became shorthand for \"this looks generated.\" The observation has a real statistical basis, but as a one-signal test it misidentifies plenty of human writers.",
    },
    {
      q: "Does Simply Humanize remove em dashes?",
      a: "Our pipeline treats AI-typical em-dash density as a pattern to rewrite, replacing dashes with punctuation that fits each sentence. It doesn't blanket-ban the mark — the target is machine-like uniformity, not the dash itself.",
    },
  ],
  related: ["words-chatgpt-overuses", "the-case-for-short-sentences", "how-to-humanize-ai-text"],
};
