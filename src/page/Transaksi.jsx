import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../stores/useToast";
import { useCart } from "../hooks/useCart"; // Import Hook

// Import Components
import CartList from "../component/CartList";
import CheckoutPanel from "../component/CheckoutPanel";
import ProductListSidebar from "../component/ProductListSidebar";
import KeyboardShortcuts from "../component/KeyboardShortcuts";

// Icons
const IconBack = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

const Transaksi = () => {
    const navigate = useNavigate();
    const toast = useToast((s) => s.push);

    // Custom Hook untuk Cart Logic
    const { cart, total, addToCart, removeFromCart, changeQty, increment, decrement, clearCart } = useCart();

    // UI State
    const [paid, setPaid] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const paidNum = paid === "" ? 0 : Number(paid);
    const change = paidNum - total;
    const canCheckout = cart.length > 0 && paidNum >= total;

    // --- Handlers ---
    const handleAddToCart = (product) => {
        addToCart(product);
        setShowSearchModal(false);
    };

    const handleScannedCode = async (code) => {
        if (!code) return;
        try {
            const prod = await window.api.products.byBarcode(String(code).trim());
            if (!prod) return toast({ type: "error", title: "Gagal", message: "Produk tidak ditemukan" });
            addToCart(prod);
        } catch (err) {
            toast({ type: "error", title: "Error", message: "Gagal memproses scan" });
        }
    };

    const onCheckout = async () => {
        try {
            const sale = { items: cart.map(i => ({ id: i.id, price: i.price, qty: i.qty })), subtotal: total, total, paid: paidNum, change };
            const id = await window.api.sales.checkout(sale);
            toast({ type: "success", title: "Sukses", message: `Checkout berhasil (id: ${id})` });
            clearCart();
            setPaid("");
            setShowConfirm(false);
        } catch (err) {
            toast({ type: "error", title: "Gagal", message: err.message });
        }
    };

    // --- Shortcut Helpers ---
    const handleFocusPayment = () => {
        const el = document.getElementById('input-payment');
        if (el) document.activeElement === el ? el.blur() : (el.focus(), el.select());
    };

    const handleReset = () => {
        if (cart.length > 0 && confirm("Reset keranjang?")) {
            clearCart();
            setPaid("");
        }
    };

    const handleConfirmAction = () => {
        document.getElementById('input-payment')?.blur();
        showConfirm ? onCheckout() : (canCheckout && setShowConfirm(true));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
            <KeyboardShortcuts
                onSearch={() => setShowSearchModal(true)}
                onFocusPay={handleFocusPayment}
                onReset={handleReset}
                onConfirm={handleConfirmAction}
                onCancel={() => { setShowConfirm(false); setShowSearchModal(false); }}
                isSearchModalOpen={showSearchModal}
                isConfirmModalOpen={showConfirm}
                canCheckout={canCheckout}
            />

            {/* Header */}
            <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><IconBack /></button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 leading-none">Transaksi Kasir</h1>
                        <span className="text-xs text-gray-500">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                    </div>
                </div>
                <button onClick={() => setShowSearchModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md active:scale-95 font-semibold text-sm">
                    <IconPlus /> Cari Barang <span className="opacity-70 font-normal text-xs ml-1">(=)</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6 overflow-hidden h-[calc(100vh-80px)]">
                <div className="flex flex-col md:flex-row gap-6 h-full">
                    <CartList cart={cart} onIncrement={increment} onDecrement={decrement} onChangeQty={changeQty} onRemove={removeFromCart} />
                    <CheckoutPanel
                        total={total} paid={paid} change={change} isCartEmpty={cart.length === 0}
                        onPaidChange={setPaid} onScanCode={handleScannedCode} onReset={() => { clearCart(); setPaid(""); }} onCheckout={() => setShowConfirm(true)}
                    />
                </div>
            </div>

            <ProductListSidebar isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} onSelectProduct={handleAddToCart} />

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="absolute inset-0" onClick={() => setShowConfirm(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="text-center border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Konfirmasi</h2>
                            <p className="text-sm text-gray-500">Tekan <b>Enter</b> untuk memproses</p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Total</span><span className="font-bold">Rp{total.toLocaleString("id-ID")}</span></div>
                            <div className="flex justify-between"><span>Tunai</span><span className="font-bold">Rp{paidNum.toLocaleString("id-ID")}</span></div>
                            <div className="flex justify-between pt-2 border-t"><span>Kembali</span><span className="text-lg font-bold text-green-600">Rp{change.toLocaleString("id-ID")}</span></div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 bg-white border rounded-xl hover:bg-gray-50">Batal <span className="text-[10px] opacity-50">(Backspace)</span></button>
                            <button onClick={onCheckout} className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">Proses</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transaksi;