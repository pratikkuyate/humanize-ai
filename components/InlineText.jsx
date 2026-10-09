import Link from "next/link";

const linkClass =
  "text-violet-600 dark:text-violet-400 font-medium underline decoration-violet-300 dark:decoration-violet-700 underline-offset-2 hover:decoration-2";

/**
 * Outbound editorial citation. Opens in a new tab; followed (no nofollow).
 * @param {{ href: string, children: React.ReactNode }} props
 */
export function ExternalLink({ href, children }) {
  return (
    <a href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/**
 * Renders a plain string with [label](href) links and **bold** spans (either may nest the other).
 * Internal hrefs (starting with "/") use next/link; anything else is an ExternalLink.
 * Hrefs must not contain raw parentheses — percent-encode them as %28 / %29.
 * @param {string} text
 * @returns {React.ReactNode[]}
 */
export function renderInline(text) {
  const parts = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      const href = match[2];
      const label = renderInline(match[1]);
      parts.push(
        href.startsWith("/") ? (
          <Link key={key++} href={href} className={linkClass}>
            {label}
          </Link>
        ) : (
          <ExternalLink key={key++} href={href}>
            {label}
          </ExternalLink>
        )
      );
    } else {
      parts.push(
        <strong key={key++} className="font-semibold text-slate-800 dark:text-slate-100">
          {renderInline(match[3])}
        </strong>
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/** Strip inline markdown for schema text fields. */
export function plainText(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}
