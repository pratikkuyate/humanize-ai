/** @type {import("./index.js").BlogPost} */
export default {
  slug: "what-is-turnitin-clarity",
  cluster: "students",
  title: "What Is Turnitin Clarity? What It Tracks, What It Doesn't, and What Students Should Know",
  metaTitle: "What Is Turnitin Clarity? What It Tracks (2026 Guide)",
  metaDescription:
    "Turnitin Clarity is a writing space that records how an essay was written. Here's what it logs, what instructors see, whether it records your screen, and how it relates to AI detection.",
  keyword: "what is turnitin clarity",
  datePublished: "2026-10-19",
  dateModified: "2026-10-19",
  tldr:
    "Turnitin Clarity is a paid add-on to Turnitin Feedback Studio that gives students a built-in editor for drafting and submitting work. It logs typing, pastes and tab switching inside that editor and shows instructors a Writing Report with a replay. It doesn't record your screen or webcam, and it isn't an AI detector on its own.",
  sections: [
    {
      heading: "Turnitin Clarity in One Paragraph",
      blocks: [
        {
          p: "Turnitin Clarity is a writing environment that lives inside Turnitin. Instead of writing your essay in Word or Google Docs and uploading the file, you write it in Clarity's own editor and submit it from there. Turnitin's student guide describes the result as \"proof of process\": your instructor can see how the document came together, not only the finished version. ([Turnitin: Getting Started with Clarity for Students](https://guides.turnitin.com/hc/en-us/articles/36982699236877-Getting-Started-with-Turnitin-Clarity-for-Students))",
        },
        {
          p: "Turnitin announced Clarity at SXSW EDU in March 2025 and made it generally available in July 2025 as a paid add-on for institutions that already use Feedback Studio. ([Turnitin press release](https://www.turnitin.co.uk/press/turnitin-launches-turnitin-clarity-bringing-transparency-and-integrity-insights-to-education))",
        },
      ],
    },
    {
      heading: "Is Turnitin Clarity Free?",
      blocks: [
        {
          p: "Not for institutions. Clarity is sold as an add-on, and Turnitin doesn't publish a price. Students can't buy it themselves. If your course uses it, the cost is covered by your school, and you'll reach it through your learning management system or Turnitin's website.",
        },
        {
          p: "If a Clarity assignment doesn't appear for an instructor, Turnitin's admin guides point them to their institution's Turnitin contact, because the feature has to be licensed first. ([Clarity assignments in Canvas](https://guides.turnitin.com/hc/en-us/articles/37202130121869-Clarity-assignments-in-Canvas-LTI-1-3))",
        },
      ],
    },
    {
      heading: "What Turnitin Clarity Records",
      blocks: [
        {
          p: "According to Turnitin's student FAQ, Clarity logs activity **inside its own writing space**:",
        },
        {
          list: [
            "**Editing events:** text you insert, delete and revise.",
            "**Clipboard events:** paste, copy and cut.",
            "**Engagement signals:** switching tabs, browser window focus, opening and closing the window, and periodic snapshots.",
          ],
        },
        {
          p: "The same FAQ says activity outside the writing environment isn't captured, and that the space \"is not a proctoring environment.\" ([Turnitin Clarity FAQ for students](https://guides.turnitin.com/hc/en-us/articles/36983230792461-FAQs-for-students-using-Turnitin-Clarity)) UCLA's sample syllabus language puts it plainly: Clarity \"does not monitor anything you do outside of the Clarity writing space.\" ([UCLA DTS](https://dts.ucla.edu/initiatives/bruin-learn-center-excellence/academic-tech-tools/turnitin-clarity))",
        },
        {
          h3: "Does Turnitin Clarity record your screen?",
        },
        {
          p: "No. Turnitin says Clarity assignments aren't monitored, supervised or video-recorded. There's no webcam or screen capture. What it does have is a detailed log of what happened in the editor, which instructors can play back like a video of the document being typed.",
        },
      ],
    },
    {
      heading: "What Your Instructor Sees: The Writing Report",
      blocks: [
        {
          p: "After you submit, the instructor gets a Writing Report. Turnitin's guide lists these parts ([Reviewing the Writing Report](https://guides.turnitin.com/hc/en-us/articles/36916426919949-Reviewing-the-Writing-Report)):",
        },
        {
          table: {
            headers: ["Part", "What it shows"],
            rows: [
              ["Observations", "Final word count, active writing time, number of writing sessions, and a class average once at least three students have submitted"],
              ["Pasted text", "Each paste, whether it was left unchanged or edited, and any source matches"],
              ["Flags", "Process patterns such as very short writing time, little revision, or heavy reliance on pasted text"],
              ["AI Chat activity", "If the instructor enabled Clarity's AI assistant, the full chat history and a summary"],
              ["Playback", "A timeline of additions, deletions and pastes that can be replayed at 0.25x to 10x speed"],
            ],
          },
        },
        {
          p: "Turnitin notes that each document is different and may carry any combination of flags. A flag is a prompt for a conversation, not a verdict.",
        },
      ],
    },
    {
      heading: "Does Turnitin Clarity Detect AI?",
      blocks: [
        {
          p: "Not by itself. Clarity is a process-tracking tool. AI writing detection is a separate Turnitin product (Originality). When a school licenses both and turns detection on, Turnitin can flag a **pasted** block of more than 300 words that its model thinks was AI-written or AI-altered. ([AI Tools with Turnitin Clarity](https://guides.turnitin.com/hc/en-us/articles/36917529868429-AI-Tools-with-Turnitin-Clarity))",
        },
        {
          p: "That distinction matters. A detector looks at the finished text and guesses. Clarity shows the writing history. If you wrote the essay yourself in the editor, the history is your strongest evidence, far stronger than any score. If you want to understand how detector scores work and why they misfire, read our guides on [AI detector false positives](/blog/ai-detector-false-positives) and [whether Turnitin detects ChatGPT](/blog/does-turnitin-detect-chatgpt).",
        },
      ],
    },
    {
      heading: "Practical Questions Students Ask",
      blocks: [
        {
          h3: "Does Clarity autosave?",
        },
        {
          p: "Yes. Turnitin says progress saves automatically, at least every five seconds while you're typing, with a \"Saved\" indicator at the top. There's no offline mode, so if your connection drops the editor pauses until it's back.",
        },
        {
          h3: "Does Turnitin Clarity work with PDFs?",
        },
        {
          p: "You write in the editor rather than uploading a file. You can download a PDF of your work, and you can add images. Turnitin lists a known issue where text pasted from Microsoft Word can arrive as an image; the workaround is pasting as plain text with Ctrl+Shift+V (Cmd+Shift+V on a Mac). ([Turnitin known issues](https://guides.turnitin.com/hc/en-us/articles/38980348552461-Turnitin-add-on-known-issues))",
        },
        {
          h3: "Does it work in Canvas?",
        },
        {
          p: "Yes, through Turnitin's LTI 1.3 integration. Turnitin publishes setup guides for Canvas, D2L, Moodle and Blackboard. Clarity assignments are only available through LTI 1.3 or Turnitin's website.",
        },
        {
          h3: "Can I write on my phone?",
        },
        {
          p: "Turnitin added support for phone-sized screens in September 2026. Avoid editing on two devices at once, which Turnitin warns can cause data loss. ([Turnitin product updates](https://guides.turnitin.com/hc/en-us/articles/29645383597965-Turnitin-product-updates))",
        },
      ],
    },
    {
      heading: "How to Write Comfortably When Your Process Is Visible",
      blocks: [
        {
          list: [
            "**Write in the editor from the start.** Drafting elsewhere and pasting it in at the end creates one large paste, which is exactly what the report highlights.",
            "**Keep your notes and sources.** Outlines, reading notes and earlier drafts back up the story the replay tells.",
            "**Don't perform for the replay.** Messy writing is normal. Deleting paragraphs, restarting and revising are what a genuine process looks like.",
            "**Ask before using AI.** If the AI Chat tab is enabled, your instructor can read the whole conversation after you submit. Follow the course policy and see our guide on [using AI for homework without breaking the rules](/blog/how-to-use-ai-for-homework).",
          ],
        },
      ],
    },
    {
      heading: "The Debate Around Clarity",
      blocks: [
        {
          p: "Process tracking has supporters and critics. Some instructors see it as fairer than AI detection, which is unreliable. Others worry about privacy and about students writing for the camera rather than for the assignment. A University of Colorado Boulder pilot in spring 2026 concluded there wasn't enough evidence to support broader adoption, citing usability and workflow concerns. ([CU Boulder OIT](https://oit.colorado.edu/node/32396)) Jonathan Bailey at Plagiarism Today predicted privacy pushback when it launched. ([Plagiarism Today](https://www.plagiarismtoday.com/2025/03/06/turnitin-announces-clarity-aim-to-make-student-writing-more-transparent/))",
        },
        {
          p: "If your course doesn't use Clarity and you need to show your work, Grammarly offers a similar opt-in tool. Our guide to [Grammarly Authorship](/blog/grammarly-authorship) explains how it compares.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "What is Turnitin Clarity?",
      a: "A writing space inside Turnitin where students draft and submit assignments. It records the writing process (typing, deletions, pastes, tab switching) and gives instructors a Writing Report with a playback of how the document was written.",
    },
    {
      q: "Does Turnitin Clarity record your screen or webcam?",
      a: "No. Turnitin says Clarity is not a proctoring environment and assignments are not video-recorded. It logs activity inside its own editor, plus tab and window focus changes.",
    },
    {
      q: "Does Turnitin Clarity detect AI?",
      a: "Clarity itself tracks process, not authorship. If a school also licenses Turnitin's AI writing detection, pasted blocks over 300 words can be flagged as likely AI-written. Detection is a separate product.",
    },
    {
      q: "Is Turnitin Clarity free for students?",
      a: "Students don't pay for it, but it isn't free: institutions buy it as a paid add-on to Turnitin Feedback Studio. You can only use it if your school has licensed it.",
    },
    {
      q: "Can my instructor see my AI chat in Clarity?",
      a: "Yes. If your instructor enables Clarity's AI Chat, students see a banner explaining that instructors can access the full chat history after submission.",
    },
  ],
  related: ["grammarly-authorship", "does-turnitin-detect-chatgpt", "ai-detector-false-positives"],
};
