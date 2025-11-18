import React, { useEffect, useState, useMemo } from "react";
import { useConfirm } from "../stores/useConfirm";
import { useToast } from "../stores/useToast";
import InvoiceModal from "../component/InvoiceModal";

// --- Icons ---
const IconSearch = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconRefresh = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const IconFilter = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const IconEye = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const IconEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const Riwayat = () => {
  const toast = useToast((s) => s.push);
  const confirm = useConfirm((s) => s.open);

  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [amountFilter, setAmountFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await window.api.sales.list();
      setSales(res || []);
    } catch (err) {
      toast({ type: "error", title: "Error", message: "Gagal memuat data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Hapus Transaksi?",
      message: "Data akan dihapus permanen dan stok barang akan dikembalikan."
    });
    if (!ok) return;

    try {
      await window.api.sales.delete(id);
      toast({ type: "success", title: "Berhasil", message: "Transaksi dihapus" });
      load();
    } catch (err) {
      toast({ type: "error", title: "Gagal", message: err.message });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSale) return;
    try {
      await window.api.sales.update({
        id: editingSale.id,
        datetime: editingSale.datetime,
        total: Number(editingSale.total)
      });
      toast({ type: "success", title: "Berhasil", message: "Data diperbarui" });
      setEditingSale(null);
      load();
    } catch (err) {
      toast({ type: "error", title: "Gagal", message: err.message });
    }
  };

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    let data = sales.filter(s =>
      s.id.toString().includes(q) ||
      s.total.toString().includes(q)
    );

    if (amountFilter !== "all") {
      data = data.filter(s => {
        const total = Number(s.total);
        if (amountFilter === "small") return total < 100000;
        if (amountFilter === "medium") return total >= 100000 && total < 1000000;
        if (amountFilter === "large") return total >= 1000000;
        return true;
      });
    }
    return data;
  }, [sales, search, amountFilter]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-8 py-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pantau dan kelola penjualan toko Anda</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Search & Filter Group */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200 flex-1 md:flex-none">
            <div className="relative flex-1 md:w-48">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <IconSearch />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID..."
                className="w-full pl-9 pr-3 py-1.5 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <div className="w-px h-5 bg-gray-300 mx-1"></div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500 pointer-events-none">
                <IconFilter />
              </span>
              <select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="pl-8 pr-6 py-1.5 bg-transparent text-sm outline-none text-gray-700 cursor-pointer appearance-none font-medium hover:bg-gray-200 rounded transition-colors"
              >
                <option value="all">Semua</option>
                <option value="small">&lt; 100rb</option>
                <option value="medium">100rb - 1jt</option>
                <option value="large">&gt; 1jt</option>
              </select>
            </div>
          </div>

          <button
            onClick={load}
            className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 rounded-lg shadow-sm transition-all active:scale-95"
            title="Refresh Data"
          >
            <IconRefresh />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8 overflow-hidden flex flex-col">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">

          {/* Table Header Info */}
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs font-medium text-gray-500">
            <span>Menampilkan <strong>{filteredData.length}</strong> transaksi</span>
            {amountFilter !== 'all' && (
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                Filter Aktif
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-32">ID Invoice</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Waktu</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Total</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-32">Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-sm text-gray-400 animate-pulse">Memuat data...</td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-sm text-gray-400">
                      Tidak ada data transaksi yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                          #{String(s.id).padStart(6, '0')}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 ml-0.5">
                          {s.SaleItems ? s.SaleItems.length : 0} Barang
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">
                            {new Date(s.datetime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-gray-400 font-mono mt-0.5">
                            {new Date(s.datetime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900">
                          Rp{Number(s.total).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${Number(s.paid) >= Number(s.total)
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                          {Number(s.paid) >= Number(s.total) ? "Lunas" : "Belum Lunas"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedSale(s)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Lihat Nota"
                          >
                            <IconEye />
                          </button>
                          <button
                            onClick={() => setEditingSale(s)}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit Transaksi"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Transaksi"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Lihat Nota */}
      {selectedSale && (
        <InvoiceModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}

      {/* Modal Edit */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">Edit Transaksi</h3>
              <button onClick={() => setEditingSale(null)} className="text-gray-400 hover:text-gray-600 transition-colors text-xl">×</button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Waktu Transaksi</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={new Date(editingSale.datetime).toISOString().slice(0, 16)}
                  onChange={(e) => setEditingSale({ ...editingSale, datetime: new Date(e.target.value).toISOString() })}
                />
                <p className="text-[10px] text-gray-400 mt-1">Sesuaikan jika jam komputer salah saat transaksi.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Nominal (Rp)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={editingSale.total}
                  onChange={(e) => setEditingSale({ ...editingSale, total: e.target.value })}
                />
                <p className="text-[10px] text-red-400 mt-1">Perhatian: Mengubah total tidak otomatis mengubah harga per item.</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-md shadow-blue-100 transition-all active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Riwayat;