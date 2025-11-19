import React from "react";
import ScanSelector from "./ScanSelector";
import CurrencyInput from "./CurrencyInput";

// --- Icon Decoration ---
const IconMoney = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CheckoutPanel = ({
    total,
    paid,
    change,
    onPaidChange,
    onScanCode,
    onReset,
    onCheckout,
    isCartEmpty
}) => {

    const rp = (n) => "Rp" + Number(n).toLocaleString("id-ID");
    const paidNum = paid === "" ? 0 : Number(paid);

    // Logic validasi sederhana
    const canCheckout = !isCartEmpty && paidNum >= total;

    // Warna status kembalian
    const isShort = change < 0;
    const statusColor = isShort ? "text-red-600" : "text-emerald-600";
    const statusBg = isShort ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100";

    return (
        <div className="w-full md:w-[400px] flex flex-col gap-6 h-full">

            {/* 1. Scanner Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-700 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        Scan Barcode
                    </h3>
                </div>
                <ScanSelector onScan={onScanCode} />
            </div>

            {/* 2. Payment Section (Expanded to fill remaining height) */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex-1 flex flex-col overflow-hidden">

                {/* Total Tagihan Display */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 text-center relative overflow-hidden">
                    {/* Hiasan background abstract */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        </svg>
                    </div>

                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Total Tagihan</p>
                    <h2 className="text-5xl font-extrabold tracking-tight drop-shadow-sm">
                        {rp(total)}
                    </h2>
                </div>

                {/* Form Pembayaran */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-6">

                    {/* Input Group */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">
                                Uang Diterima (Cash)
                                {/* Hint Visual Shortcut */}
                                <span className="text-xs text-gray-400 font-normal ml-2 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                    Tekan ' \ '
                                </span>
                            </label>
                            <div className="relative group">
                                <IconMoney />
                                <CurrencyInput
                                    id="input-payment" // <--- ID PENTING UNTUK SHORTCUT
                                    className="w-full pl-10 pr-4 py-3.5 text-xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300"
                                    value={paid}
                                    onChange={onPaidChange}
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Kembalian Info */}
                        <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${statusBg}`}>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm font-bold uppercase tracking-wide ${isShort ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {isShort ? 'Kurang Bayar' : 'Kembalian'}
                                </span>
                                <span className={`text-2xl font-black ${statusColor}`}>
                                    {rp(Math.abs(change))}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3 mt-auto pt-4 border-t border-gray-100">
                        <button
                            onClick={onReset}
                            title="Shortcut: Spasi"
                            className="col-span-1 py-3.5 px-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 active:bg-gray-300 transition-colors flex flex-col items-center justify-center gap-1 group"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                <span>Reset</span>
                            </div>
                            <span className="text-[10px] font-normal opacity-60">(Spasi)</span>
                        </button>

                        <button
                            onClick={onCheckout}
                            disabled={!canCheckout}
                            title="Shortcut: Enter"
                            className={`
                                col-span-2 py-3.5 px-6 rounded-xl font-bold text-lg text-white shadow-lg flex flex-col items-center justify-center gap-0.5 transition-all
                                ${!canCheckout
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-gray-900 hover:bg-black hover:shadow-xl active:scale-[0.98] active:shadow-sm'}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <span>Bayar & Cetak</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            </div>
                            {canCheckout && <span className="text-[10px] font-normal opacity-80 text-blue-200">(Enter)</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPanel;