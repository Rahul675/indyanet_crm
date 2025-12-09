import {
  Home,
  Users,
  Package,
  Building2,
  History,
  BarChart3,
  Settings,
  ShieldCheck, // icon for Operators tab
} from "lucide-react";
import Badge from "../ui/Badge";
import { useAuth } from "../../context/AuthContext"; // ✅ get role from context

const NAV = [
  { key: "Dashboard", label: "Dashboard", icon: Home },
  { key: "Customers", label: "Customers", icon: Users },
  { key: "Loadshare", label: "Loadshare", icon: Package },
  { key: "Other Clients", label: "Other Clients", icon: Building2 },
  { key: "Recharge", label: "Recharge", icon: History },
  { key: "Issues", label: "Issues", icon: BarChart3 },
  { key: "Reports", label: "Reports", icon: BarChart3, adminOnly: true },
  { key: "Audit Log", label: "Audit Log", icon: History, adminOnly: true },
  { key: "Operators", label: "Operators", icon: ShieldCheck, adminOnly: true }, // ✅ new admin-only tab
  { key: "Settings", label: "Settings", icon: Settings, adminOnly: true },
];

export default function Sidebar({ active, setActive }) {
  const { user } = useAuth();
  // const role = user?.role || user?.user?.role;
  const rawRole = user?.role || user?.user?.role;
  const role = rawRole?.toLowerCase();

  // 🔒 Filter navigation for admins/operators
  const filteredNav = NAV.filter((n) => {
    if (n.adminOnly && role !== "admin") return false; // show only for admins
    return true;
  });

  return (
    <div className="rounded-2xl border bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold">Navigation</h3>
          <p className="text-xs text-slate-500 mt-0.5">Pick a module</p>
        </div>
        {/* <Badge tone="blue">v1 Preview</Badge> */}
      </div>
      <nav className="p-3">
        <ul className="space-y-1">
          {filteredNav.map((n) => (
            <li key={n.key}>
              <button
                onClick={() => setActive(n.key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition ${
                  active === n.key
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <n.icon size={16} />
                <span>{n.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
