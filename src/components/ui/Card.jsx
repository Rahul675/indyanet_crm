export default function Card({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
      {(title || right) && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                {subtitle}
              </p>
            )}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
