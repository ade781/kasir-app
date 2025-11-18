import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../stores/useToast";
import { useConfirm } from "../stores/useConfirm";

// --- Ikon SVG Sederhana & Elegan ---
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconPlus = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const IconEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconClear = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const IconEmpty = () => <svg className="w-16 h-16 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const toast = useToast((s) => s.push);
    const openConfirm = useConfirm((s) => s.open);

    const load = async () => {
        setLoading(true);
        try {
            const res = await window.api.products.list();
            setProducts(res || []);
        } catch (err) {
            console.error("Load products error:", err);
            toast({ type: "error", title: "Gagal memuat data", message: err?.message || "Terjadi kesalahan" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onDelete = async (id) => {
        const product = products.find((p) => p.id === id);
        const ok = await openConfirm({
            title: "Hapus Produk?",
            message: `Produk "${product?.name}" akan dihapus permanen.`
        });
        if (!ok) return;
        try {
            await window.api.products.delete(id);
            toast({ type: "success", title: "Terhapus", message: "Produk berhasil dihapus" });
            await load();
        } catch (err) {
            toast({ type: "error", title: "Gagal", message: err?.message || "Gagal menghapus" });
        }
    };

    const filtered = useMemo(() => {
        const q = (query || "").toString().trim().toLowerCase();
        if (!q) return products;
        return products.filter((p) => {
            const name = (p.name || "").toString().toLowerCase();
            const barcode = (p.barcode || "").toString().toLowerCase();
            return name.includes(q) || barcode.includes(q);
        });
    }, [products, query]);

    const onEdit = (id) => navigate(`/edit/${id}`);
    const onAdd = () => navigate("/add");

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans text-gray-800">
            {/* --- Header --- */}
            <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventaris</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola stok dan harga produk Anda</p>
                </div>
                <button
                    onClick={onAdd}
                    className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 font-medium text-sm"
                >
                    <IconPlus />
                    <span>Produk Baru</span>
                </button>
            </div>

            {/* --- Content --- */}
            <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">

                {/* Search Bar */}
                <div className="mb-8 flex justify-center">
                    <div className="relative w-full max-w-lg group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                            <IconSearch />
                        </div>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari nama produk, barcode, atau SKU..."
                            className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-700 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <IconClear />
                            </button>
                        )}
                    </div>
                </div>

                {/* Product Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-16">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Info Produk</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Harga Jual</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Stok</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-32">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-gray-400 animate-pulse">
                                            Memuat data produk...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <IconEmpty />
                                                <p className="mt-4 font-medium text-gray-500">Tidak ada produk ditemukan</p>
                                                <p className="text-sm text-gray-400">Coba kata kunci lain atau tambahkan produk baru.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((p, idx) => (
                                        <tr key={p.id} className="group hover:bg-blue-50/30 transition-colors">
                                            {/* Index */}
                                            <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                                                {idx + 1}
                                            </td>

                                            {/* Info Produk (Kontras Tinggi) */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                        {p.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 font-mono tracking-wide">
                                                            {p.barcode || "NO-CODE"}
                                                        </span>
                                                        {/* Anda bisa menambahkan kategori/brand di sini nanti */}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Harga (Rapi) */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        Rp{Number(p.price || 0).toLocaleString("id-ID")}
                                                    </span>

                                                </div>
                                            </td>

                                            {/* Stok (Badge style) */}
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${Number(p.stock) <= 5
                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                    : 'bg-green-50 text-green-700 border-green-100'
                                                    }`}>
                                                    {p.stock} Unit
                                                </span>
                                            </td>

                                            {/* Aksi (Clean Buttons) */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onEdit(p.id)}
                                                        className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100"
                                                        title="Edit Produk"
                                                    >
                                                        <IconEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(p.id)}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                                        title="Hapus Produk"
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

                    {/* Table Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs font-medium text-gray-500">
                        <span>Total Inventaris: {products.length} Item</span>
                        <span>Menampilkan {filtered.length} hasil</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;