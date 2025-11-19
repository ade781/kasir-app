import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../stores/useToast";

// Import Components dari folder component yang sejajar dengan page
import CartList from "../component/CartList";
import CheckoutPanel from "../component/CheckoutPanel";
import ProductListSidebar from "../component/ProductListSidebar";

// --- Icons ---
const IconBack = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

const Transaksi = () => {
    const navigate = useNavigate();
    const toast = useToast((s) => s.push);

    // State Utama
    const [cart, setCart] = useState([]);
    const [paid, setPaid] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // --- Logic Cart & Total ---
    const addToCart = (product) => {
        setCart((c) => {
            const idx = c.findIndex((x) => x.id === product.id);
            if (idx >= 0) {
                const copy = [...c];
                copy[idx] = { ...copy[idx], qty: Number(copy[idx].qty || 0) + 1 };
                return copy;
            }
            return [...c, {
                id: product.id,
                barcode: product.barcode,
                name: product.name,
                price: Number(product.price || 0),
                qty: 1
            }];
        });
        toast({ type: "success", title: "Ditambahkan", message: `${product.name} +1` });
        setShowSearchModal(false);
    };

    const removeFromCart = (id) => setCart((c) => c.filter((x) => x.id !== id));

    const changeQty = (id, next) => {
        setCart((c) => {
            // Ubah qty dulu
            const nextQty = Math.max(0, Number(next) || 0);

            // Jika qty jadi 0, hapus item
            if (nextQty === 0) {
                return c.filter((it) => it.id !== id);
            }

            // Jika tidak 0, update qty
            return c.map((it) => (it.id === id ? { ...it, qty: nextQty } : it));
        });
    };

    const increment = (id) => setCart((c) => c.map((it) => (it.id === id ? { ...it, qty: Number(it.qty || 0) + 1 } : it)));

    const decrement = (id) => {
        setCart((c) => {
            const item = c.find((it) => it.id === id);
            if (!item) return c;

            const nextQty = Math.max(0, Number(item.qty || 0) - 1);

            // Jika qty jadi 0, hapus item
            if (nextQty === 0) {
                return c.filter((it) => it.id !== id);
            }

            // Update qty
            return c.map((it) => (it.id === id ? { ...it, qty: nextQty } : it));
        });
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

    // Perhitungan Total
    const subtotal = useMemo(() => cart.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0), [cart]);
    const total = subtotal;
    const paidNum = paid === "" ? 0 : Number(paid);
    const change = paidNum - total;

    // Logic Checkout
    const openConfirmModal = () => {
        if (!cart.length) return toast({ type: "info", title: "Keranjang kosong", message: "Tambahkan produk sebelum checkout" });
        if (paidNum < total) return toast({ type: "error", title: "Pembayaran kurang", message: "Jumlah pembayaran kurang dari total" });
        setShowConfirm(true);
    };

    const onCheckout = async () => {
        const items = cart.map((it) => ({ id: it.id, price: it.price, qty: it.qty }));
        const sale = { items, subtotal, total, paid: paidNum, change };

        try {
            const id = await window.api.sales.checkout(sale);
            toast({ type: "success", title: "Sukses", message: `Checkout berhasil (id: ${id})` });

            setCart([]);
            setPaid("");
            setShowConfirm(false);
        } catch (err) {
            console.error("Checkout failed", err);
            toast({ type: "error", title: "Gagal", message: err?.message || "Checkout gagal" });
        }
    };

    // --- KEYBOARD SHORTCUTS ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const activeTag = document.activeElement.tagName;
            const isInputActive = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

            // 1. Shortcut '=' -> Buka Modal Cari (Pengganti Q)
            if (key === '=' && !isInputActive && !showSearchModal && !showConfirm) {
                e.preventDefault();
                setShowSearchModal(true);
                return;
            }

            // 2. Shortcut '\' (Backslash) -> Toggle Fokus Input Pembayaran
            if (key === '\\' && !showConfirm) {
                e.preventDefault();
                const inputPayment = document.getElementById('input-payment');
                if (inputPayment) {
                    if (document.activeElement === inputPayment) {
                        inputPayment.blur();
                    } else {
                        inputPayment.focus();
                        inputPayment.select();
                    }
                }
                return;
            }

            // 3. Shortcut 'Space' -> Reset Transaksi
            if (key === ' ' && !isInputActive && !showSearchModal && !showConfirm) {
                e.preventDefault();
                if (cart.length > 0 || paid !== "") {
                    const ok = confirm("Reset keranjang transaksi?");
                    if (ok) {
                        setCart([]);
                        setPaid("");
                        toast({ type: "info", title: "Reset", message: "Transaksi direset" });
                    }
                }
                return;
            }

            // 4. Shortcut 'Backspace' -> Batal / Tutup Modal
            if (key === 'backspace') {
                // A. Jika modal KONFIRMASI terbuka -> Tutup
                if (showConfirm) {
                    e.preventDefault();
                    setShowConfirm(false);
                    return;
                }

                // B. Jika modal PENCARIAN BARANG terbuka -> Tutup
                // Syarat: Fokus TIDAK sedang di input pencarian (input text)
                // (Karena kalau di input, backspace dipakai buat hapus huruf)
                if (showSearchModal && !isInputActive) {
                    e.preventDefault();
                    setShowSearchModal(false);
                    return;
                }
            }

            // 5. Shortcut 'Enter' -> Bayar / Proses
            if (key === 'enter') {
                // Fungsi Helper: Lepas fokus dari input pembayaran (Membatalkan fungsi '\')
                const blurPaymentInput = () => {
                    const inputPayment = document.getElementById('input-payment');
                    if (inputPayment) inputPayment.blur();
                };

                // Skenario B: Modal Konfirmasi sedang terbuka -> TEKAN ENTER UNTUK PROSES FINAL
                if (showConfirm) {
                    e.preventDefault();
                    blurPaymentInput(); // Pastikan tidak fokus lagi
                    onCheckout();
                    return;
                }

                // Skenario A: Modal belum terbuka -> TEKAN ENTER UNTUK BUKA KONFIRMASI
                if (!showSearchModal && !showConfirm) {
                    if (cart.length > 0 && paidNum >= total) {
                        e.preventDefault();
                        blurPaymentInput(); // Lepas fokus agar user tidak mengetik di background modal
                        openConfirmModal();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cart, paid, paidNum, total, showSearchModal, showConfirm]);

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
                        onClick={() => setShowSearchModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all transform active:scale-95 font-semibold text-sm tracking-wide"
                        title="Shortcut: ="
                    >
                        <IconPlus />
                        Cari Barang <span className="opacity-70 font-normal ml-1 text-xs hidden md:inline">(=)</span>
                    </button>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="flex-1 p-4 md:p-6 overflow-hidden h-[calc(100vh-80px)]">
                <div className="flex flex-col md:flex-row gap-6 h-full">

                    {/* Left: Cart List Component */}
                    <CartList
                        cart={cart}
                        onIncrement={increment}
                        onDecrement={decrement}
                        onChangeQty={changeQty}
                        onRemove={removeFromCart}
                    />

                    {/* Right: Checkout Panel Component */}
                    <CheckoutPanel
                        total={total}
                        paid={paid}
                        change={change}
                        onPaidChange={setPaid}
                        onScanCode={handleScannedCode}
                        onReset={() => { setCart([]); setPaid(""); }}
                        onCheckout={openConfirmModal}
                        isCartEmpty={cart.length === 0}
                    />
                </div>
            </div>

            {/* --- Modals --- */}

            <ProductListSidebar
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                onSelectProduct={addToCart}
            />

            {/* Modal: Confirm Checkout */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => setShowConfirm(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-transform">
                        <div className="bg-green-50 p-6 flex flex-col items-center border-b border-green-100">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Konfirmasi Transaksi</h2>
                            <p className="text-sm text-gray-500">Tekan <b>Enter</b> untuk memproses</p>
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
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                title="Shortcut: Backspace"
                            >
                                Batal <span className="text-[10px] opacity-50">(Backspace)</span>
                            </button>
                            <button
                                onClick={onCheckout}
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-md shadow-green-200 transition-colors"
                            >
                                Ya, Proses
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transaksi;