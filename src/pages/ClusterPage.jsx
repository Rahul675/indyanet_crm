// import React, { useEffect, useState } from "react";
// import Card from "../components/ui/Card";
// import Badge from "../components/ui/Badge";
// import Breadcrumbs from "../components/ui/Breadcrumbs";
// import AddCustomerModal from "../components/modals/AddCustomerModal";

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// export default function ClusterPage({ setSelectedCluster }) {
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [error, setError] = useState("");

//   // ✅ Fetch all customers from backend
//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   async function fetchCustomers() {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await fetch(`${API_URL}/customers`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();

//       // ✅ Handle wrapped response { data: { data: [...] } }
//       const data = Array.isArray(json)
//         ? json
//         : Array.isArray(json.data)
//         ? json.data
//         : Array.isArray(json.data?.data)
//         ? json.data.data
//         : [];

//       setCustomers(data);
//     } catch (err) {
//       console.error("Failed to fetch customers:", err);
//       setError("Could not load customers from backend.");
//       setCustomers([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ After add, just refresh instead of pushing manually
//   const handleAdd = async () => {
//     await fetchCustomers();
//     setShowAddModal(false);
//   };

//   const badge = (s) =>
//     s === "Active" ? (
//       <Badge tone="green">Active</Badge>
//     ) : s === "Suspended" ? (
//       <Badge tone="amber">Suspended</Badge>
//     ) : (
//       <Badge tone="red">Inactive</Badge>
//     );

//   // Export: ask backend for an Excel file and download it
//   const handleExport = async () => {
//     try {
//       const res = await fetch(`${API_URL}/customers/export`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "customers.xlsx";
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Export failed", err);
//       alert("Failed to export customers.");
//     } finally {
//       setMenuOpen(false);
//     }
//   };

//   // Import: upload the file to the backend import endpoint
//   const handleImport = async (e) => {
//     const file = e.target.files[0];
//     e.target.value = ""; // reset input so same file can be reselected later
//     if (!file) return;
//     const form = new FormData();
//     form.append("file", file);
//     try {
//       setLoading(true);
//       setError("");
//       const res = await fetch(`${API_URL}/customers/import`, {
//         method: "POST",
//         body: form,
//       });
//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || `HTTP ${res.status}`);
//       }
//       // refresh list
//       await fetchCustomers();
//       alert("Import completed.");
//     } catch (err) {
//       console.error("Import failed", err);
//       setError("Failed to import Excel file.");
//     } finally {
//       setMenuOpen(false);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <Breadcrumbs active="customers" />
//       <Card
//         title="Customers"
//         subtitle="Click any customer to view details and linked issues."
//         right={
//           <div className="flex gap-2 items-center relative">
//             {/* ⋯ Menu */}
//             <div className="relative">
//               <button
//                 onClick={() => setMenuOpen(!menuOpen)}
//                 className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm"
//               >
//                 ⋯
//               </button>
//               {menuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border rounded-xl shadow-lg z-50">
//                   <label
//                     htmlFor="importFile"
//                     className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
//                   >
//                     Import Excel
//                   </label>
//                   <input
//                     type="file"
//                     id="importFile"
//                     className="hidden"
//                     accept=".xlsx,.xls"
//                     onChange={handleImport}
//                   />
//                   <button
//                     onClick={handleExport}
//                     className="w-full text-left block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
//                   >
//                     Export Excel
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Add Customer Button */}
//             <button
//               onClick={() => setShowAddModal(true)}
//               className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white"
//             >
//               + Add Customer
//             </button>
//           </div>
//         }
//       >
//         {loading ? (
//           <p className="p-4 text-center text-slate-500">Loading customers...</p>
//         ) : error ? (
//           <p className="p-4 text-center text-red-500">{error}</p>
//         ) : (
//           <div className="overflow-auto border rounded-2xl dark:border-slate-800">
//             <table className="w-full text-sm">
//               <thead className="bg-slate-100 dark:bg-slate-900">
//                 <tr>
//                   {[
//                     "Code",
//                     "Name",
//                     "Contact",
//                     "Plan",
//                     "Status",
//                     "Installed",
//                   ].map((h) => (
//                     <th
//                       key={h}
//                       className="text-left font-semibold px-3 py-2 whitespace-nowrap"
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {customers.map((c) => (
//                   <tr
//                     key={c.id}
//                     onClick={() => setSelectedCluster(c)}
//                     className="border-t cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
//                   >
//                     <td className="px-3 py-2 font-mono">{c.customerCode}</td>
//                     <td className="px-3 py-2">{c.fullName}</td>
//                     <td className="px-3 py-2">{c.contactNumber}</td>
//                     <td className="px-3 py-2">{c.planType}</td>
//                     <td className="px-3 py-2">{badge(c.connectionStatus)}</td>
//                     <td className="px-3 py-2">
//                       {c.installDate
//                         ? new Date(c.installDate).toLocaleDateString()
//                         : "-"}
//                     </td>
//                   </tr>
//                 ))}
//                 {customers.length === 0 && (
//                   <tr>
//                     <td colSpan="6" className="text-center text-slate-500 py-6">
//                       No customers found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Card>

//       {showAddModal && (
//         <AddCustomerModal
//           onClose={() => setShowAddModal(false)}
//           onAdd={handleAdd}
//         />
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AddClusterModal from "../components/modals/AddClusterModel";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function ClusterPage({ setSelectedCluster }) {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch clusters
  useEffect(() => {
    fetchClusters();
  }, []);

  async function fetchClusters() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/clusters`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const data = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.data)
        ? json.data.data
        : [];

      setClusters(data);
    } catch (err) {
      console.error("Failed to fetch clusters:", err);
      setError("Could not load clusters from backend.");
      setClusters([]);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    await fetchClusters();
    setShowAddModal(false);
  };

  const statusBadge = (s) =>
    s === "Active" ? (
      <Badge tone="green">Active</Badge>
    ) : (
      <Badge tone="red">Inactive</Badge>
    );

  // ✅ Export Excel
  const handleExport = async () => {
    try {
      const res = await fetch(`${API_URL}/clusters/export`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clusters.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export clusters.");
    } finally {
      setMenuOpen(false);
    }
  };

  // ✅ Import Excel
  const handleImport = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/clusters/import`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      await fetchClusters();
      alert("Import completed.");
    } catch (err) {
      console.error("Import failed", err);
      setError("Failed to import Excel file.");
    } finally {
      setMenuOpen(false);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs active="clusters" />

      <Card
        title="Clusters"
        subtitle="Click any cluster to view linked loadshare records."
        right={
          <div className="flex gap-2 items-center relative">
            {/* ⋯ Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm"
              >
                ⋯
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border rounded-xl shadow-lg z-50">
                  <label
                    htmlFor="importClusterFile"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Import Excel
                  </label>
                  <input
                    type="file"
                    id="importClusterFile"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                  />

                  <button
                    onClick={handleExport}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>

            {/* Add Cluster */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white"
            >
              + Add Cluster
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading clusters...</p>
        ) : error ? (
          <p className="p-4 text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-auto border rounded-2xl dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  {["Code", "Name", "State", "Status", "Created"].map((h) => (
                    <th
                      key={h}
                      className="text-left font-semibold px-3 py-2 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {clusters.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCluster(c.id)}
                    className="border-t cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <td className="px-3 py-2 font-mono">{c.code}</td>
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">{c.state}</td>
                    <td className="px-3 py-2">{statusBadge(c.status)}</td>
                    <td className="px-3 py-2">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}

                {clusters.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-slate-500 py-6">
                      No clusters found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddModal && (
        <AddClusterModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
