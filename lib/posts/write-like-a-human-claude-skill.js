/** @type {import("./index.js").BlogPost} */
export default {
  slug: "write-like-a-human-claude-skill",
  cluster: "how-to",
  title: "How to Build a \"Write Like a Human\" Skill for Claude",
  metaTitle: "Write Like a Human: Build a Claude Skill (Step by Step)",
  metaDescription:
    "Claude Skills let you package writing rules Claude loads automatically. Here's how to build a \"write like a human\" skill, a template SKILL.md, popular community humanizer skills, and their limits.",
  keyword: "write like a human claude skill",
  datePublished: "2026-10-19",
  dateModified: "2026-10-19",
  tldr:
    "A Claude Skill is a folder with a SKILL.md file that Claude loads when a task matches its description. A \"write like a human\" skill packages your style rules, banned phrases and before/after examples so Claude applies them whenever you ask for prose. Upload one under Customize > Skills, or start from a community skill like humanizer.",
  sections: [
    {
      heading: "What a Claude Skill Is",
      blocks: [
        {
          p: "Anthropic introduced Agent Skills in October 2025. A skill is a folder of instructions, scripts and resources that Claude can load when it needs them, and the same skill can work across the Claude apps, Claude Code and the API. ([Anthropic: Introducing Agent Skills](https://www.anthropic.com/news/skills))",
        },
        {
          p: "The clever part is \"progressive disclosure.\" Claude always sees each skill's short name and description, roughly 100 tokens. Only when your request matches does it load the full instructions, and only then any extra files. ([Claude docs: Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)) That means you can keep a detailed style guide installed without it crowding every conversation.",
        },
        {
          p: "Anthropic's personalization guide now lists skills alongside account instructions and project instructions as the main ways to shape Claude's responses, including applying \"communication patterns based on your own writing.\" ([Claude Help: personalization features](https://support.claude.com/en/articles/10185728))",
        },
      ],
    },
    {
      heading: "Why a Skill Beats Pasting the Same Prompt",
      blocks: [
        {
          list: [
            "**It triggers on its own.** Ask for a blog post or an email and Claude pulls in the skill. No copy-pasting.",
            "**It can be long.** A full style guide with examples is fine, because it only loads when needed.",
            "**It can include examples.** Before/after pairs teach style better than rules alone. Anthropic's own advice for custom skills is to include example inputs and outputs. ([Claude Help: creating custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills))",
            "**It's portable.** The same folder works in Claude Code and in other tools that support the open Agent Skills format.",
          ],
        },
      ],
    },
    {
      heading: "Build Your Own: The Folder",
      blocks: [
        {
          p: "Create a folder named **write-like-a-human** containing a file named **SKILL.md**. Optionally add a second file, **examples.md**, with before/after rewrites. Zip the folder so the folder itself sits at the root of the zip.",
        },
        {
          p: "SKILL.md starts with a short YAML header. Two fields are required: **name** (up to 64 characters, lowercase letters, numbers and hyphens, and it can't include the words \"claude\" or \"anthropic\") and **description** (up to 1,024 characters). ([Claude docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)) The description is what Claude reads to decide when to use the skill, so make it specific.",
        },
        {
          h3: "Template SKILL.md",
        },
        {
          list: [
            "**Header line 1:** name: write-like-a-human",
            "**Header line 2:** description: Use when writing or editing prose for the user (emails, posts, essays, reports). Applies the user's plain, direct style and removes common AI writing patterns.",
            "**Rule:** Vary sentence length. Include at least one short sentence (under 8 words) in most paragraphs.",
            "**Rule:** Use plain words. Never use: delve, tapestry, testament, pivotal, seamless, furthermore, moreover, \"it's important to note,\" \"in today's world.\"",
            "**Rule:** No em dashes. Use commas, colons or a new sentence.",
            "**Rule:** Commit to claims. Only hedge when there's a specific uncertainty, and name it.",
            "**Rule:** No \"not just X, but Y\" constructions, and avoid lists of three unless there really are three things.",
            "**Rule:** Don't end paragraphs with a summary sentence. Don't open with a restatement of the question.",
            "**Rule:** Prefer concrete examples with names, numbers or places. If none are available, ask the user rather than inventing one.",
            "**Rule:** Keep formatting light: no headers or bullet lists in emails or short replies.",
            "**Reference:** Before finishing, read examples.md and compare the draft against the 'after' versions.",
          ],
        },
        {
          p: "Adapt the rules to your own voice. The fastest way to find them is to give Claude three samples of your writing and ask it to describe your style as rules, the same method we describe in [how to make ChatGPT write like you](/blog/make-chatgpt-write-like-me).",
        },
      ],
    },
    {
      heading: "Install It",
      blocks: [
        {
          list: [
            "**Claude apps (Free, Pro, Max):** go to **Customize → Skills** and upload the zip. Team plans have skills on by default; on Enterprise, an owner has to enable them. ([Claude Help: using skills](https://support.claude.com/en/articles/12512180-using-skills-in-claude))",
            "**Claude Code:** place the folder in your skills directory (for personal skills, ~/.claude/skills).",
            "**API:** skills use the code execution tool and a dedicated skills endpoint (see the [developer docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)).",
          ],
        },
        {
          p: "Custom skills don't sync automatically between the API and the apps, so upload the skill wherever you plan to use it.",
        },
      ],
    },
    {
      heading: "Or Start From a Community Skill",
      blocks: [
        {
          p: "Two open-source writing skills have become popular starting points (star counts as of October 2026):",
        },
        {
          table: {
            headers: ["Skill", "What it does", "Notes"],
            rows: [
              ["[blader/humanizer](https://github.com/blader/humanizer)", "Removes signs of AI writing, checking for 26 patterns drawn from Wikipedia's Signs of AI writing guide", "About 58,000 stars. Its README says passing AI detectors is not a goal and detectors still flag most of its output"],
              ["[hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)", "A skill file for removing AI tells, with phrase, structure and example references and a 50-point self-score", "About 18,000 stars. Strict rules, including no em dashes"],
            ],
          },
        },
        {
          p: "Both are built on the same public source, [Wikipedia's Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). Read a skill's files before installing it, as you would any code.",
        },
      ],
    },
    {
      heading: "What a Skill Can and Can't Do",
      blocks: [
        {
          p: "A good skill removes the obvious tells: stock phrases, uniform rhythm, over-formatting. It can't add knowledge you didn't give it, and it won't make text undetectable. The humanizer skill's own documentation is upfront about that, and so are we: we [don't promise a \"100% human\" score](/blog/why-we-dont-promise-100-human-score) either.",
        },
        {
          p: "Also watch for over-correction. A skill that bans every em dash and every list of three can produce its own flat, recognizable style. Use rules that describe your writing, not just rules against AI's.",
        },
        {
          p: "To test the result, paste a before and after into our free [AI content detector](/tools/ai-content-detector), which shows which signals changed. If a Claude draft still reads stiff, the [Claude humanizer](/humanize-claude-text) is a one-click alternative, and our [10-point self-check](/blog/does-this-sound-like-ai) works on anything.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "What is a Claude skill?",
      a: "A folder containing a SKILL.md file with a name, a description and instructions, plus optional resources. Claude loads it automatically when a request matches the description.",
    },
    {
      q: "Can free Claude users use custom skills?",
      a: "Anthropic's help center says Free, Pro and Max users can enable example skills and upload their own under Customize > Skills. Team plans have skills on by default, and Enterprise owners must enable them.",
    },
    {
      q: "Is there a ready-made humanizer skill for Claude?",
      a: "Yes. Popular open-source options include blader/humanizer and hardikpandya/stop-slop on GitHub, both based on Wikipedia's Signs of AI writing guide.",
    },
    {
      q: "Will a humanizer skill make Claude's writing undetectable?",
      a: "No, and the popular skills don't claim to. They remove recognizable patterns and improve readability. Detection tools use different methods, and Anthropic announced in August 2026 that Claude's text output carries a statistical watermark.",
    },
  ],
  related: ["make-chatgpt-write-like-me", "what-makes-writing-sound-human", "words-chatgpt-overuses"],
};
