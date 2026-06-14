/** @param {{ children: React.ReactNode }} props */
export function H2({ children }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
      {children}
    </h2>
  );
}

/** @param {{ children: React.ReactNode }} props */
export function H3({ children }) {
  return (
    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
      {children}
    </h3>
  );
}

/** @param {{ children: React.ReactNode }} props */
export function P({ children }) {
  return <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{children}</p>;
}

/** @param {{ items: React.ReactNode[] }} props */
export function UL({ items }) {
  return (
    <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-600 dark:text-slate-300 leading-relaxed">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
