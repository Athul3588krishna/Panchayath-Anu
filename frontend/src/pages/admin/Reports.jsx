import React, { useEffect, useState } from 'react';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import { FileText, Download, RefreshCw, BarChart } from 'lucide-react';

const Reports = () => {
  const { token } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/schemes`);
      if (res.ok) {
        const data = await res.json();
        setSchemes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const totalViews = schemes.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
  const totalDownloads = schemes.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);

  // Generate CSV and trigger browser download
  const downloadCSVReport = () => {
    if (schemes.length === 0) return;

    // Headers
    const headers = ['Scheme ID', 'Scheme Name', 'Category', 'Views', 'Downloads', 'Min Age Limit', 'Max Age Limit', 'Income Cap (Rs.)'];
    
    // Rows
    const rows = schemes.map(s => [
      s._id,
      `"${s.title.replace(/"/g, '""')}"`,
      s.category,
      s.viewsCount || 0,
      s.downloadsCount || 0,
      s.eligibilityCriteria?.minAge || 0,
      s.eligibilityCriteria?.maxAge || 120,
      s.eligibilityCriteria?.maxIncome !== null && s.eligibilityCriteria?.maxIncome !== undefined ? s.eligibilityCriteria.maxIncome : 'No Cap'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smart_Panchayat_Welfare_Report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate plain text summary print report
  const downloadTxtReport = () => {
    if (schemes.length === 0) return;

    let report = `======================================================
SMART PANCHAYAT WELFARE SCHEMES PERFORMANCE REPORT
======================================================
Generated Date: ${new Date().toLocaleDateString()}
Generated Time: ${new Date().toLocaleTimeString()}

------------------------------------------------------
METRICS OVERVIEW
------------------------------------------------------
Total Schemes Managed: ${schemes.length}
Total Scheme Portal Views: ${totalViews}
Total Application Forms Downloaded: ${totalDownloads}
Download Conversion Rate: ${totalViews > 0 ? ((totalDownloads / totalViews) * 100).toFixed(1) : 0}%

------------------------------------------------------
SCHEME PERFORMANCE DIRECTORY
------------------------------------------------------
`;

    schemes.forEach((s, i) => {
      report += `
${i + 1}. SCHEME: ${s.title}
   CATEGORY: ${s.category}
   VIEWS: ${s.viewsCount || 0}
   DOWNLOADS: ${s.downloadsCount || 0}
   ELIGIBILITY ARGS: Age ${s.eligibilityCriteria?.minAge || 0}-${s.eligibilityCriteria?.maxAge || 120} yrs | Max Income: ₹${s.eligibilityCriteria?.maxIncome || 'No Cap'}
   TARGET OCCUPATIONS: ${s.eligibilityCriteria?.allowedOccupations?.length > 0 ? s.eligibilityCriteria.allowedOccupations.join(', ') : 'All'}
   TARGET CATEGORIES: ${s.eligibilityCriteria?.allowedCategories?.length > 0 ? s.eligibilityCriteria.allowedCategories.join(', ') : 'All'}
   REQUIRED DOCUMENTS: ${s.requiredDocuments?.join(', ') || 'None'}
------------------------------------------------------`;
    });

    report += `\n\n======================================================
End of Panchayat Secretary Administration Report.
======================================================`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smart_Panchayat_Detailed_Report_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Generate Reports</h1>
            <p className="text-slate-400 text-sm">Download interaction statistics, view counts, and form download reports for government evaluations.</p>
          </div>
        </div>

        <div className="flex space-x-2 shrink-0">
          <button
            onClick={downloadCSVReport}
            disabled={schemes.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 glow-btn"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={downloadTxtReport}
            disabled={schemes.length === 0}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>Export Txt Report</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-800">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Managed Schemes</span>
          <div className="flex items-baseline space-x-2 mt-4">
            <span className="text-4xl font-extrabold text-white">{schemes.length}</span>
            <span className="text-xs text-slate-400">active programs</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-800">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Scheme Portal Views</span>
          <div className="flex items-baseline space-x-2 mt-4">
            <span className="text-4xl font-extrabold text-sky-400">{totalViews}</span>
            <span className="text-xs text-slate-400">citizens reached</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-800">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Application Downloads</span>
          <div className="flex items-baseline space-x-2 mt-4">
            <span className="text-4xl font-extrabold text-emerald-400">{totalDownloads}</span>
            <span className="text-xs text-slate-400">forms collected</span>
          </div>
        </div>
      </div>

      {/* Detailed performance list */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h3 className="text-white font-bold text-base mb-4 flex items-center space-x-2">
          <BarChart className="h-4 w-4 text-emerald-400" />
          <span>Welfare Scheme Analytical Log</span>
        </h3>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6 text-slate-500 flex items-center justify-center space-x-1">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-450" />
              <span>Compiling records...</span>
            </div>
          ) : schemes.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No schemes found.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="py-3">Welfare Scheme Name</th>
                  <th className="py-3">Category</th>
                  <th className="py-3 text-center">Views</th>
                  <th className="py-3 text-center">Downloads</th>
                  <th className="py-3 text-center">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {schemes.map((s) => {
                  const rate = s.viewsCount > 0 ? ((s.downloadsCount / s.viewsCount) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={s._id} className="hover:bg-slate-900/40">
                      <td className="py-3.5 font-semibold text-white">{s.title}</td>
                      <td className="py-3.5">{s.category}</td>
                      <td className="py-3.5 text-center text-sky-400 font-medium">{s.viewsCount || 0}</td>
                      <td className="py-3.5 text-center text-emerald-400 font-medium">{s.downloadsCount || 0}</td>
                      <td className="py-3.5 text-center font-bold text-slate-400">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
