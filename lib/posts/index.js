/**
 * Blog data layer. One module per post in this directory; this index owns
 * ordering, cluster metadata, and lookups. Adding a post = new file + import.
 *
 * @typedef {Object} BlogPostBlock
 * @property {string} [p]      Paragraph. Supports [label](href) links and **bold**.
 * @property {string} [h3]     Sub-heading within a section.
 * @property {string[]} [list] Bulleted list items (same inline syntax as `p`).
 * @property {{ headers: string[], rows: string[][] }} [table]
 *
 * @typedef {Object} BlogPost
 * @property {string} slug
 * @property {keyof typeof clusters} cluster
 * @property {string} title
 * @property {string} metaTitle
 * @property {string} metaDescription
 * @property {string} keyword         Primary keyword this post owns.
 * @property {string} datePublished   YYYY-MM-DD
 * @property {string} dateModified    YYYY-MM-DD — bump only on real content changes.
 * @property {string} tldr            40–60 word speakable summary (AI-search snippet).
 * @property {Array<{ heading: string, blocks: BlogPostBlock[] }>} sections
 * @property {Array<{ q: string, a: string }>} [faqs]
 * @property {string[]} [related]     Slugs of related posts.
 */

import wordsChatgptOveruses from "./words-chatgpt-overuses.js";
import chatgptEmDashes from "./chatgpt-em-dashes.js";
import doesTurnitinDetectChatgpt from "./does-turnitin-detect-chatgpt.js";
import aiDetectorFalsePositives from "./ai-detector-false-positives.js";
import howToHumanizeAiText from "./how-to-humanize-ai-text.js";
import makeChatgptSoundMoreHuman from "./make-chatgpt-sound-more-human.js";
import aiHumanizerVsParaphrasingTool from "./ai-humanizer-vs-paraphrasing-tool.js";
import whyWeDontPromise100HumanScore from "./why-we-dont-promise-100-human-score.js";
import isUsingChatgptCheating from "./is-using-chatgpt-cheating.js";
import howToUseAiForHomework from "./how-to-use-ai-for-homework.js";
import doesGooglePenalizeAiContent from "./does-google-penalize-ai-content.js";
import whatIsLlmsTxt from "./what-is-llms-txt.js";
import mostCommonAiWords from "./most-common-ai-words.js";
import aiCoverLetters from "./ai-cover-letters-do-recruiters-notice.js";
import makeAiResumeSoundLikeYou from "./make-ai-resume-sound-like-you.js";
import whatMakesWritingSoundHuman from "./what-makes-writing-sound-human.js";
import theCaseForShortSentences from "./the-case-for-short-sentences.js";

/** Byline used on every post. Swap in a named author + bio page for stronger E-E-A-T. */
export const author = {
  name: "Simply Humanize Team",
  url: "/about",
};

/** Display metadata per cluster, in the order the blog index lists them. */
export const clusters = {
  "ai-writing-patterns": {
    label: "AI Writing Patterns",
    description: "The measurable tells of machine-generated text — and what they reveal about how models write.",
  },
  "ai-detectors": {
    label: "AI Detectors",
    description: "How detection tools work, where they fail, and what their scores actually mean.",
  },
  "how-to": {
    label: "How-To Guides",
    description: "Practical workflows for turning AI drafts into writing that sounds like you.",
  },
  comparisons: {
    label: "Comparisons",
    description: "Honest looks at the tools in this market — including the claims we refuse to make.",
  },
  students: {
    label: "Students & Academic Integrity",
    description: "Using AI for schoolwork without crossing lines — policies, disclosure, and staying safe.",
  },
  "seo-ai-content": {
    label: "SEO & AI Content",
    description: "Publishing AI-assisted content that ranks, survives updates, and serves readers.",
  },
  "data-research": {
    label: "Data & Research",
    description: "Pattern lists and analysis drawn from our own detection and humanizing pipeline.",
  },
  "professional-writing": {
    label: "Professional Writing",
    description: "Cover letters, resumes, and business writing in the age of AI drafts.",
  },
  "writing-craft": {
    label: "Writing Craft",
    description: "The fundamentals that make prose worth reading — human or otherwise assisted.",
  },
};

/** All posts, newest first (stable secondary order: as listed). */
export const posts = [
  wordsChatgptOveruses,
  chatgptEmDashes,
  doesTurnitinDetectChatgpt,
  aiDetectorFalsePositives,
  howToHumanizeAiText,
  makeChatgptSoundMoreHuman,
  aiHumanizerVsParaphrasingTool,
  whyWeDontPromise100HumanScore,
  isUsingChatgptCheating,
  howToUseAiForHomework,
  doesGooglePenalizeAiContent,
  whatIsLlmsTxt,
  mostCommonAiWords,
  aiCoverLetters,
  makeAiResumeSoundLikeYou,
  whatMakesWritingSoundHuman,
  theCaseForShortSentences,
].sort((a, b) => (a.datePublished < b.datePublished ? 1 : a.datePublished > b.datePublished ? -1 : 0));

/** @param {string} slug */
export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}

/** Rough reading time from the post's own text content. */
export function readingTimeMinutes(post) {
  const text = [
    post.tldr,
    ...post.sections.flatMap((s) => [
      s.heading,
      ...s.blocks.flatMap((b) => [b.p, b.h3, ...(b.list ?? []), ...(b.table?.rows.flat() ?? [])]),
    ]),
    ...(post.faqs ?? []).flatMap((f) => [f.q, f.a]),
  ]
    .filter(Boolean)
    .join(" ");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
