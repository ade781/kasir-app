import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../stores/useToast";
import { useConfirm } from "../stores/useConfirm";

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
            toast({ type: "error", title: "Gagal memuat produk", message: err?.message || "Terjadi kesalahan" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onDelete = async (id) => {
        const product = products.find((p) => p.id === id);
        const ok = await openConfirm({ title: "Hapus Produk", message: `Apakah anda yakin ingin menghapus produk ini? ${product?.name} / ${product?.barcode}` });
        if (!ok) return;
        try {
            await window.api.products.delete(id);
            toast({ type: "success", title: "Berhasil", message: "Produk dihapus" });
            await load();
        } catch (err) {
            console.error("Delete error:", err);
            toast({ type: "error", title: "Gagal menghapus produk", message: err?.message || "Terjadi kesalahan" });
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
        <div className="p-4">
            <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="text-2xl font-semibold">Daftar Produk</h2>

                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari nama atau barcode produk..."
                            className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                aria-label="clear"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={onAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                >
                    Tambah Produk
                </button>
            </div>

            <div className="bg-white shadow rounded overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Barcode</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nama</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Harga</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Stok</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                                    Memuat...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                                    {products.length === 0 ? "Belum ada produk. Klik \"Tambah Produk\" untuk menambahkan." : "Tidak ada hasil untuk pencarian."}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p, idx) => (
                                <tr key={p.id} className="border-t last:border-b">
                                    <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{p.barcode || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{p.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                        Rp{Number(p.price || 0).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{p.stock}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <div className="inline-flex gap-2">
                                            <button
                                                onClick={() => onEdit(p.id)}
                                                className="text-sm px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(p.id)}
                                                className="text-sm px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                                            >
                                                Delete tes
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
    );
};

export default ProductList;
