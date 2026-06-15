export default function manifest() {
  return {
    name: 'Simply Humanize — AI Text Humanizer Free',
    short_name: 'Simply Humanize',
    description:
      'Humanize AI text online free. Turn ChatGPT, Claude & Gemini output into natural, human-sounding writing in one click. No sign-up.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}
