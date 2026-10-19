/** @type {import("./index.js").BlogPost} */
export default {
  slug: "make-chatgpt-write-like-me",
  cluster: "how-to",
  title: "How to Make ChatGPT Write Like You (2026 Settings + Prompts)",
  metaTitle: "How to Make ChatGPT Write Like You: 2026 Guide",
  metaDescription:
    "Teach ChatGPT your writing style with a voice profile, custom instructions, personality settings, memory and Projects. Step-by-step setup for 2026, with copy-paste templates.",
  keyword: "how to make chatgpt write like me",
  datePublished: "2026-10-19",
  dateModified: "2026-10-19",
  tldr:
    "Give ChatGPT real samples of your writing, ask it to describe your style as rules, and save those rules where they apply every time: custom instructions for all chats, or a Project for one kind of writing. Then tune the personality settings and edit the output yourself. Samples work far better than adjectives like \"casual.\"",
  sections: [
    {
      heading: "Why ChatGPT Doesn't Sound Like You by Default",
      blocks: [
        {
          p: "ChatGPT writes in an average register: polished, balanced, and the same for everyone. Telling it to \"sound more natural\" just swaps one generic voice for another. To get your voice, it needs evidence of how you actually write. OpenAI's own training material makes the same point: paste in examples of your writing and ask it to summarize your tone and style, then mirror it. ([OpenAI Academy: Customizing ChatGPT](https://academy.openai.com/public/clubs/work-users-ynjqu/resources/customizing-chatgpt))",
        },
      ],
    },
    {
      heading: "Step 1: Build a Voice Profile From Your Own Writing",
      blocks: [
        {
          p: "Collect three to five pieces you wrote without AI help, ideally the same kind of writing you want help with: emails, blog posts or essays. Around 800 to 1,500 words in total is plenty. Then paste them into a new chat with this prompt:",
        },
        {
          p: "**Prompt:** \"Here are samples of my writing. Describe my style as a set of specific rules another writer could follow: typical sentence length and variation, vocabulary level, words and phrases I use often, words I never use, how I open and close, use of humor, punctuation habits, and how direct I am. Quote short examples from the samples for each rule. Don't flatter me.\"",
        },
        {
          p: "Edit the result. Delete anything that isn't true, and add things you know about yourself (\"I never use exclamation marks,\" \"I explain with examples from cooking\"). This voice profile is the core of everything that follows.",
        },
      ],
    },
    {
      heading: "Step 2: Save It in Custom Instructions",
      blocks: [
        {
          p: "Custom instructions apply to every new chat. On the web or desktop, go to **Settings → Personalization → Custom instructions**; on iOS and Android, **Settings → Customize ChatGPT**. ([OpenAI Help: Custom instructions](https://help.openai.com/en/articles/8096356))",
        },
        {
          p: "Space is limited. Free and Go users can save up to 1,500 characters; Plus, Pro, Business, Enterprise and Education users can save up to 5,000, following an increase in July 2026. ([OpenAI release notes](https://help.openai.com/en/articles/6825453)) On a free plan, compress your profile to the most important rules:",
        },
        {
          p: "**Template:** \"When writing for me: Use short paragraphs and mix very short sentences with longer ones. Plain words over formal ones. No 'delve,' 'furthermore,' 'it's important to note,' or 'in today's world.' Don't use em dashes. Commit to claims; don't hedge. Use concrete examples, not generic ones. Don't end paragraphs with a summary line. Match the tone of my samples: [one-line description from your profile].\"",
        },
      ],
    },
    {
      heading: "Step 3: Pick a Personality and Tune the Characteristics",
      blocks: [
        {
          p: "Under **Settings → Personalization** you can choose a base style and tone. The current presets are Default, Professional, Friendly, Candid, Quirky, Efficient and Cynical. Since December 2025 you can also adjust individual characteristics: warmth, enthusiasm, use of headers and lists, and emoji. ([OpenAI Help: ChatGPT personality](https://help.openai.com/en/articles/11899719))",
        },
        {
          p: "For writing that sounds like a person, two settings help most: turn down **headers and lists** (AI drafts are over-formatted) and turn down **enthusiasm** (it drives the cheerful filler). Pick the preset closest to your natural register, then let your custom instructions do the detailed work.",
        },
      ],
    },
    {
      heading: "Step 4: Use a Project for Each Kind of Writing",
      blocks: [
        {
          p: "If you write in more than one voice, say professional emails and a casual newsletter, global instructions will fight each other. Projects solve this. A Project keeps related chats, files and instructions together, and its instructions override your global custom instructions inside that project. ([OpenAI Help: Projects](https://help.openai.com/en/articles/10169521))",
        },
        {
          list: [
            "Create a Project per voice (\"Newsletter,\" \"Client emails\").",
            "Paste the matching voice profile into the project instructions.",
            "Upload your best samples as project files so ChatGPT can refer to them. Free users can add 5 files per project; Plus and Go users can add 25.",
          ],
        },
      ],
    },
    {
      heading: "Step 5: Let Memory Learn Your Preferences (Carefully)",
      blocks: [
        {
          p: "With Memory on, ChatGPT can use saved memories and relevant details from past chats. ([OpenAI Help: Memory](https://help.openai.com/en/articles/8590148)) You can tell it directly: \"Remember that I never use exclamation marks and I prefer short paragraphs.\" Review **Settings → Personalization → Memory** now and then, because it also remembers things you'd rather it didn't, and an out-of-date memory can quietly pull the style off course.",
        },
      ],
    },
    {
      heading: "A Note on Custom GPTs",
      blocks: [
        {
          p: "Older guides tell you to build a custom GPT trained on your writing. That advice is out of date. OpenAI says new GPT creation is no longer available on personal accounts, including Plus and Pro, and custom GPTs are scheduled to retire on December 11, 2026, with workflows moving to plugins and skills. ([OpenAI Help: custom GPT retirement](https://help.openai.com/en/articles/20001519)) Projects are the better home for a personal writing voice now.",
        },
      ],
    },
    {
      heading: "Step 6: Prompt Like an Editor, Then Actually Edit",
      blocks: [
        {
          list: [
            "**Give it your notes, not a topic.** \"Write about remote work\" produces generic text. Your bullet points, opinions and examples produce your text.",
            "**Ask for a first draft, not a final one.** Then tell it what's wrong: \"Too formal in paragraph two. Cut the last line of every paragraph.\"",
            "**Correct it in the same chat.** Corrections teach the style better than starting over.",
            "**Do the last pass yourself.** Read it aloud. Add a specific detail only you know to each section. Our [10-point \"does this sound like AI\" check](/blog/does-this-sound-like-ai) is a quick final review.",
          ],
        },
        {
          p: "For more prompt patterns, see [how to make ChatGPT sound more human](/blog/make-chatgpt-sound-more-human). If you already have a ChatGPT draft that reads robotic, our [ChatGPT humanizer](/humanize-chatgpt-text) fixes the rhythm and stock phrasing in one pass, and you can check the result for free with the [AI content detector](/tools/ai-content-detector).",
        },
      ],
    },
    {
      heading: "What ChatGPT Still Can't Copy",
      blocks: [
        {
          p: "A voice profile gets the surface right: sentence length, vocabulary, punctuation. It can't supply what makes your writing yours: what you've seen, what you think, and what you'd leave out. That part is still your job, and it's the part readers notice. ([What makes writing sound human](/blog/what-makes-writing-sound-human))",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Can ChatGPT learn my writing style?",
      a: "Yes, from examples. Paste samples of your writing, ask it to describe your style as specific rules, and save that description in custom instructions or a Project so it applies every time.",
    },
    {
      q: "How many characters can custom instructions hold?",
      a: "Free and Go users can save up to 1,500 characters. Plus, Pro, Business, Enterprise and Education users can save up to 5,000 characters, after an increase in July 2026.",
    },
    {
      q: "Should I make a custom GPT of my writing style?",
      a: "Not anymore. OpenAI says new custom GPTs can't be created on personal accounts and custom GPTs are scheduled to retire on December 11, 2026. Use a Project with instructions and sample files instead.",
    },
    {
      q: "Which ChatGPT personality is best for writing?",
      a: "Choose the preset closest to your natural tone, then turn down headers and lists and enthusiasm. Detailed custom instructions matter more than the preset.",
    },
  ],
  related: ["make-chatgpt-sound-more-human", "write-like-a-human-claude-skill", "how-to-humanize-ai-text"],
};
