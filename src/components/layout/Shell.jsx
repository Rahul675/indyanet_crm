import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function Shell({
  children,
  active,
  setActive,
  setSelectedCluster,
  setGlobalSearchValue,
}) {
  return (
    <div className="min-h-screen">
      <Topbar
        setActive={setActive}
        setSelectedCluster={setSelectedCluster}
        setGlobalSearchValue={setGlobalSearchValue}
      />
      <div className="mx-auto max-w-[1400px] px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 h-fit sticky top-[84px]">
          <Sidebar active={active} setActive={setActive} />
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
