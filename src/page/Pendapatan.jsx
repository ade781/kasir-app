  import React, { useEffect, useMemo, useState } from "react";
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
  import { Bar } from "react-chartjs-2";
  import { useConfirm } from "../stores/useConfirm";
  import { useToast } from "../stores/useToast";

  // --- Icons ---
  const IconEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
  const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
  const IconCalendar = () => <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  const Pendapatan = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // State untuk Edit
    const [editingSale, setEditingSale] = useState(null); // null jika tidak edit, object jika edit

    const confirm = useConfirm((s) => s.open);
    const toast = useToast((s) => s.push);

    const loadData = async () => {
      setLoading(true);
      try {
        const rows = await window.api.sales.list();
        setSales(rows || []);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadData();
    }, []);

    // --- Handler Delete ---
    const handleDelete = async (id) => {
      const ok = await confirm({
        title: "Hapus Transaksi?",
        message: "Stok barang akan dikembalikan. Data yang dihapus tidak bisa dikembalikan."
      });
      if (!ok) return;

      try {
        await window.api.sales.delete(id);
        toast({ type: "success", title: "Berhasil", message: "Transaksi dihapus & stok dikembalikan" });
        loadData(); // Reload data
      } catch (err) {
        toast({ type: "error", title: "Gagal", message: err.message });
      }
    };

    // --- Handler Edit ---
    const handleSaveEdit = async (e) => {
      e.preventDefault();
      if (!editingSale) return;

      try {
        // Panggil API update (pastikan di backend sudah ada handler sales:update)
        // Kita kirim datetime baru dan total (jika diedit)
        await window.api.sales.update({
          id: editingSale.id,
          datetime: editingSale.datetime,
          total: Number(editingSale.total)
        });
        toast({ type: "success", title: "Berhasil", message: "Data transaksi diperbarui" });
        setEditingSale(null);
        loadData();
      } catch (err) {
        toast({ type: "error", title: "Gagal", message: err.message || "Gagal update" });
      }
    };

    const formatCurrency = (v) => "Rp" + (Number(v) || 0).toLocaleString("id-ID");

    function parseSaleTotal(sale) {
      return Number(sale.total || 0);
    }

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const totals = useMemo(() => {
      const now = new Date();
      const dayIdx = (now.getDay() + 6) % 7;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayIdx);
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let today = 0, week = 0, month = 0;

      // Reset logic grafik agar akurat dengan data sales terbaru
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return { date: d, total: 0 };
      });

      const months = Array.from({ length: 12 }).map((_, i) => {
        const m = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        return { month: m, total: 0 };
      });

      for (const sale of sales) {
        const dt = new Date(sale.datetime);
        if (isNaN(dt)) continue;
        const t = parseSaleTotal(sale);

        if (isSameDay(dt, now)) today += t;
        if (dt >= startOfWeek) week += t;
        if (dt >= startOfMonth) month += t;

        // Fill days chart
        const dayFound = days.find(d => isSameDay(d.date, dt));
        if (dayFound) dayFound.total += t;

        // Fill months chart
        const monthFound = months.find(m =>
          m.month.getFullYear() === dt.getFullYear() &&
          m.month.getMonth() === dt.getMonth()
        );
        if (monthFound) monthFound.total += t;
      }

      return {
        todayTotal: today,
        weekTotal: week,
        monthTotal: month,
        last7days: days,
        last12months: months,
      };
    }, [sales]);

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

    // Chart Config
    const chartData = {
      labels: totals.last12months.map((m) => m.month.toLocaleString('id-ID', { month: "short", year: "2-digit" })),
      datasets: [{
        label: "Pendapatan",
        data: totals.last12months.map((m) => m.total),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 4,
      }],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (val) => Number(val).toLocaleString('id-ID') } },
        x: { grid: { display: false } }
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">Laporan Pendapatan</h1>
          <p className="text-xs text-gray-500">Ringkasan keuangan toko Anda</p>
        </div>

        <div className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Hari Ini", val: totals.todayTotal, color: "bg-blue-600" },
              { label: "Minggu Ini", val: totals.weekTotal, color: "bg-indigo-600" },
              { label: "Bulan Ini", val: totals.monthTotal, color: "bg-purple-600" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                  <div className="text-2xl font-bold text-gray-800">{formatCurrency(item.val)}</div>
                </div>
                <div className={`w-10 h-10 rounded-full ${item.color} opacity-10 flex items-center justify-center`}>
                  <IconCalendar />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Tren Pendapatan (12 Bulan)</h3>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* 7 Hari Terakhir Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">7 Hari Terakhir</h3>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {totals.last7days.map((d, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 text-gray-600">{d.date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tabel Rincian Transaksi dengan Edit/Hapus */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Rincian Transaksi Terakhir</h3>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Total: {sales.length}</span>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b sticky top-0">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Waktu</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.slice(0, 50).map((sale) => (
                    <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-3 font-mono text-gray-500">#{sale.id}</td>
                      <td className="px-6 py-3 text-gray-700">
                        {new Date(sale.datetime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-800">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingSale(sale)}
                            className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 border border-amber-200 transition-colors"
                            title="Edit Tanggal/Total"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200 transition-colors"
                            title="Hapus Transaksi"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sales.length === 0 && (
                <div className="p-8 text-center text-gray-400">Belum ada data transaksi.</div>
              )}
            </div>
          </div>
        </div>

        {/* --- MODAL EDIT --- */}
        {editingSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Edit Transaksi #{editingSale.id}</h3>
                <button onClick={() => setEditingSale(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Waktu Transaksi</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={new Date(editingSale.datetime).toISOString().slice(0, 16)}
                    onChange={(e) => setEditingSale({ ...editingSale, datetime: new Date(e.target.value).toISOString() })}
                  />
                  <p className="text-xs text-gray-400 mt-1">Ubah jika tanggal/jam salah.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Nominal (Rp)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800"
                    value={editingSale.total}
                    onChange={(e) => setEditingSale({ ...editingSale, total: e.target.value })}
                  />
                  <p className="text-xs text-red-400 mt-1">Perhatian: Mengubah total tidak mengubah rincian barang.</p>
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setEditingSale(null)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-600">Batal</button>
                  <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white shadow-lg shadow-blue-200">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Pendapatan;