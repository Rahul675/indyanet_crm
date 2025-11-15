export default function Breadcrumbs({ active }) {
  const crumbs = ["Home", active?.toLowerCase?.() || "dashboard"];
  return (
    <nav className="text-sm text-slate-500">
      <ol className="flex items-center gap-2">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i !== 0 && <span>/</span>}
            <span
              className={
                i === crumbs.length - 1
                  ? "text-slate-700 dark:text-slate-200"
                  : "hover:underline"
              }
            >
              {c}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
