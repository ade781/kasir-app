import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../stores/useToast";
import ScanSelector from "../component/ScanSelector";

// --- Komponen Ikon Sederhana (Inline) ---
const IconBack = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const IconMinus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
const IconTrash = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconCartEmpty = () => <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const Transaksi = () => {
    const navigate = useNavigate();
    const toast = useToast((s) => s.push);

    const [allProducts, setAllProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // PERUBAHAN 1: Default state string kosong ""
    const [paid, setPaid] = useState("");

    const [cart, setCart] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [search, setSearch] = useState("");
    const searchRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingProducts(true);
            try {
                const res = await window.api.products.list();
                if (!mounted) return;
                setAllProducts(res || []);
            } catch (err) {
                console.error("Failed load products", err);
                toast({ type: "error", title: "Error", message: err?.message || "Gagal memuat produk" });
            } finally {
                if (mounted) setLoadingProducts(false);
            }
        })();
        return () => (mounted = false);
    }, []);

    const filtered = useMemo(() => {
        const q = (search || "").toString().trim().toLowerCase();
        if (!q) return allProducts;
        return allProducts.filter((p) => {
            return (p.name || "").toString().toLowerCase().includes(q) || (p.barcode || "").toString().toLowerCase().includes(q);
        });
    }, [allProducts, search]);

    const openAddModal = () => {
        setSearch("");
        setShowModal(true);
        setTimeout(() => searchRef.current?.focus(), 50);
    };

    const addToCart = (product) => {
        setCart((c) => {
            const idx = c.findIndex((x) => x.id === product.id);
            if (idx >= 0) {
                const copy = [...c];
                copy[idx] = { ...copy[idx], qty: Number(copy[idx].qty || 0) + 1 };
                return copy;
            }
            return [...c, { id: product.id, barcode: product.barcode, name: product.name, price: Number(product.price || 0), qty: 1 }];
        });
        toast({ type: "success", title: "Ditambahkan", message: `${product.name} +1` });
    };

    const handleScannedCode = async (code) => {
        if (!code) return;
        try {
            const prod = await window.api.products.byBarcode(String(code).trim());
            if (!prod) {
                toast({ type: "error", title: "Tidak ditemukan", message: `Kode ${code} tidak ditemukan` });
                return;
            }
            addToCart(prod);
        } catch (err) {
            console.error("scan error:", err);
            toast({ type: "error", title: "Error", message: err?.message || "Gagal memproses scan" });
        }
    };

    const removeFromCart = (id) => setCart((c) => c.filter((x) => x.id !== id));

    const changeQty = (id, next) => {
        setCart((c) => c.map((it) => (it.id === id ? { ...it, qty: Math.max(0, Number(next) || 0) } : it)));
    };

    const increment = (id) => {
        setCart((c) => c.map((it) => (it.id === id ? { ...it, qty: Number(it.qty || 0) + 1 } : it)));
    };

    const decrement = (id) => {
        setCart((c) => c.map((it) => (it.id === id ? { ...it, qty: Math.max(0, Number(it.qty || 0) - 1) } : it)));
    };

    const subtotal = useMemo(() => cart.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0), [cart]);
    const total = subtotal;

    // PERUBAHAN: Handle paid jika kosong
    const paidNum = paid === "" ? 0 : Number(paid);
    const change = paidNum - total;

    const openConfirmModal = () => {
        if (!cart.length) return toast({ type: "info", title: "Keranjang kosong", message: "Tambahkan produk sebelum checkout" });
        if (paidNum < total) return toast({ type: "error", title: "Pembayaran kurang", message: "Jumlah pembayaran kurang dari total" });
        setShowConfirm(true);
    };
    const closeConfirmModal = () => setShowConfirm(false);

    const closeModal = () => setShowModal(false);

    const onCheckout = async () => {
        const items = cart.map((it) => ({ id: it.id, price: it.price, qty: it.qty }));
        const sale = {
            items,
            subtotal,
            total,
            paid: paidNum,
            change: change,
        };
        try {
            const id = await window.api.sales.checkout(sale);
            toast({ type: "success", title: "Sukses", message: `Checkout berhasil (id: ${id})` });
            setCart([]);
            // PERUBAHAN 2: Reset paid jadi string kosong
            setPaid("");
        } catch (err) {
            console.error("Checkout failed", err);
            toast({ type: "error", title: "Gagal", message: err?.message || "Checkout gagal" });
        }
    };

    // Format Rupiah helper
    const rp = (n) => "Rp" + Number(n).toLocaleString("id-ID");

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
            {/* --- Header --- */}
            <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <IconBack />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 leading-none">Transaksi Kasir</h1>
                        <span className="text-xs text-gray-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
                <div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all transform active:scale-95 font-semibold text-sm tracking-wide"
                    >
                        <IconPlus />
                        Cari Barang
                    </button>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="flex-1 p-4 md:p-6 overflow-hidden h-[calc(100vh-80px)]">
                <div className="flex flex-col md:flex-row gap-6 h-full">

                    {/* LEFT: Cart Table */}
                    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-700">Keranjang Belanja</h2>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{cart.length} Item</span>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full table-auto">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">Produk</th>
                                        <th className="px-4 py-3 text-right">Harga</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <IconCartEmpty />
                                                    <p className="mt-4 font-medium text-gray-500">Keranjang masih kosong</p>
                                                    <p className="text-sm">Scan barcode atau klik "Cari Barang" untuk memulai.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        cart.map((it) => (
                                            <tr key={it.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800">{it.name}</div>
                                                    {it.barcode && <div className="text-xs text-gray-500 font-mono mt-0.5">{it.barcode}</div>}
                                                </td>
                                                <td className="px-4 py-4 text-right font-medium text-gray-600">
                                                    {rp(it.price)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center bg-white border border-gray-300 rounded-lg w-max mx-auto shadow-sm">
                                                        <button onClick={() => decrement(it.id)} className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition-colors rounded-l-lg"><IconMinus /></button>
                                                        <input
                                                            value={it.qty}
                                                            onChange={(e) => changeQty(it.id, e.target.value)}
                                                            className="w-12 text-center font-semibold text-gray-800 outline-none border-x border-gray-200 py-1"
                                                        />
                                                        <button onClick={() => increment(it.id)} className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition-colors rounded-r-lg"><IconPlus /></button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                    {rp(it.price * it.qty)}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => removeFromCart(it.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                        title="Hapus"
                                                    >
                                                        <IconTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT: Action Panel */}
                    <div className="w-full md:w-[400px] flex flex-col gap-6">

                        {/* Scanner Widget */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                <span>Input Barcode</span>
                            </div>
                            <ScanSelector onScan={handleScannedCode} />
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                                <div className="text-blue-100 text-sm font-medium mb-1">Total Tagihan</div>
                                <div className="text-4xl font-bold tracking-tight">
                                    {rp(total)}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Uang Diterima</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                                        <input
                                            className="w-full pl-12 pr-4 py-3 text-xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                                            type="number"
                                            value={paid}
                                            onChange={(e) => setPaid(e.target.value)}
                                            placeholder="0"
                                            min={0}
                                        />
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl flex justify-between items-center transition-colors ${change >= 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                    <span className={`text-sm font-medium ${change >= 0 ? 'text-green-700' : 'text-gray-500'}`}>
                                        {change >= 0 ? 'Kembalian' : 'Kurang Bayar'}
                                    </span>
                                    <span className={`text-xl font-bold ${change >= 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                        {rp(Math.abs(change))}
                                    </span>
                                </div>

                                <div className="mt-auto flex gap-3 pt-4">
                                    <button
                                        onClick={() => { setCart([]); setPaid(""); }}
                                        className="px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={openConfirmModal}
                                        disabled={!cart.length || paidNum < total}
                                        className="flex-1 bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]"
                                    >
                                        Bayar Sekarang
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Modal: Confirm Checkout */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={closeConfirmModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-transform">
                        <div className="bg-green-50 p-6 flex flex-col items-center border-b border-green-100">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Konfirmasi Transaksi</h2>
                            <p className="text-sm text-gray-500">Pastikan data sudah benar</p>
                        </div>

                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Belanja</span>
                                <span className="font-bold text-gray-800">{rp(total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tunai</span>
                                <span className="font-bold text-gray-800">{rp(paidNum)}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Kembalian</span>
                                <span className="text-lg font-bold text-green-600">{rp(change)}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 flex gap-3">
                            <button onClick={closeConfirmModal} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                                Batal
                            </button>
                            <button onClick={() => { closeConfirmModal(); onCheckout(); }} className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-md shadow-green-200 transition-colors">
                                Ya, Proses
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Search Product */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={closeModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[70vh]">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="text-gray-400"><IconSearch /></div>
                            <input
                                ref={searchRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama produk atau kode..."
                                className="flex-1 text-lg outline-none placeholder:text-gray-400 text-gray-700"
                            />
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">✕</button>
                        </div>

                        <div className="p-2 overflow-y-auto bg-gray-50 flex-1">
                            {loadingProducts ? (
                                <div className="text-center py-10 text-gray-500">Memuat data...</div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                                    <IconSearch />
                                    <span className="mt-2">Tidak ada produk ditemukan</span>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    {filtered.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => addToCart(p)}
                                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-transparent hover:border-blue-500 hover:shadow-md transition-all group text-left"
                                        >
                                            <div>
                                                <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{p.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p.barcode || "NO-CODE"}</span>
                                                    <span className="text-xs text-gray-400">Stok: {p.stock}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-blue-600">{rp(p.price)}</div>
                                                <div className="text-xs text-gray-400 mt-1">Klik untuk tambah</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-white border-t border-gray-100 text-center text-xs text-gray-400">
                            Menampilkan {filtered.length} hasil
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transaksi;