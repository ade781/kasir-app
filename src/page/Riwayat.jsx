import React, { useEffect, useState } from "react";
import { useToast } from "../stores/useToast";
import InvoiceModal from "../component/InvoiceModal"; // Import komponen baru

const Riwayat = () => {
  const toast = useToast((s) => s.push);
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);

  // State untuk menyimpan data transaksi yang sedang dilihat detailnya
  const [selectedSale, setSelectedSale] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await window.api.sales.list();
      setSales(res || []);
    } catch (err) {
      console.error("Failed load sales", err);
      toast({ type: "error", title: "Error", message: err?.message || "Gagal memuat riwayat" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Riwayat Transaksi</h1>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Refresh</button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Waktu</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Dibayar</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Memuat data...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Belum ada transaksi</td></tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-sm text-gray-700">#{s.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {new Date(s.datetime).toLocaleString('id-ID', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">
                    Rp{Number(s.total || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2 text-right text-sm text-gray-600">
                    Rp{Number(s.paid || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedSale(s)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm shadow-sm"
                    >
                      Lihat Nota
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tampilkan Modal jika ada data yang dipilih */}
      {selectedSale && (
        <InvoiceModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
};

export default Riwayat;