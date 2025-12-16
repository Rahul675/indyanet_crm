// src/App.jsx
import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Shell from "./components/layout/Shell";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/Customers/CustomersPage";
import CustomerDetailPage from "./pages/Customers/CustomerDetailPage";
import IssuesPage from "./pages/IssuesPage";
import ReportsPage from "./pages/ReportsPage";
import LoadsharePage from "./pages/LoadsharePage";
import OtherClientsPage from "./pages/OtherClientsPage";
import RechargePage from "./pages/RechargePage";
import AuditPage from "./pages/AuditPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

// ✅ New imports
import OperatorsPage from "./pages/Operators/OperatorsPage";
import OperatorDetailPage from "./pages/Operators/OperatorDetailPage";
import ClusterPage from "./pages/ClusterPage";

function ProtectedApp() {
  const { user, loading } = useAuth();
  const [active, setActive] = React.useState("Dashboard");
  const [selectedCluster, setSelectedCluster] = React.useState(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [selectedOperator, setSelectedOperator] = React.useState(null);
  const [globalSearchValue, setGlobalSearchValue] = React.useState("");

  // 🕐 Wait until localStorage restores session
  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-400 border-t-transparent mb-4"></div>
        <p className="text-sm">Loading session...</p>
      </div>
    );
  }

  // 🚪 Not logged in → show login
  if (!user) return <LoginPage />;

  // ✅ Page rendering logic
  const renderPage = () => {
    // Show customer detail if selected
    if (selectedCustomer)
      return (
        <CustomerDetailPage
          customer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
        />
      );

    // Show cluster detail if selected
    if (selectedCluster)
      return (
        <LoadsharePage
          clusterId={selectedCluster}
          globalSearchValue={globalSearchValue}
          onBack={() => setSelectedCluster(null)}
        />
      );

    // Show operator detail if selected
    if (selectedOperator)
      return (
        <OperatorDetailPage
          operator={selectedOperator}
          onBack={() => setSelectedOperator(null)}
        />
      );

    // Regular navigation
    switch (active) {
      case "Dashboard":
        return <Dashboard />;
      case "Customers":
        return <CustomersPage setSelectedCustomer={setSelectedCustomer} />;
      case "Cluster":
        return <ClusterPage setSelectedCluster={setSelectedCluster} />;
      case "Issues":
        return <IssuesPage />;
      case "Reports":
        return <ReportsPage />;
      // case "Loadshare":
      //   return <LoadsharePage />;
      case "Other Clients":
        return <OtherClientsPage />;
      case "Recharge":
        return <RechargePage />;
      case "Audit Log":
        return <AuditPage />;
      case "Operators":
        return <OperatorsPage setSelectedOperator={setSelectedOperator} />;
      case "Settings":
        return <SettingsPage />;
      case "Profile":
        return <ProfilePage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Shell
      active={active}
      setActive={setActive}
      setSelectedCluster={setSelectedCluster}
      setGlobalSearchValue={setGlobalSearchValue}
    >
      {renderPage()}
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}
