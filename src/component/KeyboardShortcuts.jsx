import { useEffect } from "react";

const KeyboardShortcuts = ({
    onSearch,
    onFocusPay,
    onReset,
    onConfirm,
    onCancel,
    // Kondisi untuk mencegah shortcut aktif di saat yang salah
    isSearchModalOpen,
    isConfirmModalOpen,
    canCheckout
}) => {

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const activeTag = document.activeElement.tagName;
            // Cek apakah user sedang mengetik di input, textarea, atau select
            const isInputActive = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

            // 1. Shortcut '=' -> Buka Modal Cari
            // Syarat: Tidak sedang ngetik, modal cari belum buka, modal konfirmasi belum buka
            if (key === '=' && !isInputActive && !isSearchModalOpen && !isConfirmModalOpen) {
                e.preventDefault();
                if (onSearch) onSearch();
                return;
            }

            // 2. Shortcut '\' (Backslash) -> Toggle Fokus Input Pembayaran
            // Syarat: Modal konfirmasi belum buka
            if (key === '\\' && !isConfirmModalOpen) {
                e.preventDefault();
                if (onFocusPay) onFocusPay();
                return;
            }

            // 3. Shortcut 'Space' -> Reset Transaksi
            // Syarat: Tidak sedang ngetik, modal cari & konfirmasi tertutup
            if (key === ' ' && !isInputActive && !isSearchModalOpen && !isConfirmModalOpen) {
                e.preventDefault();
                if (onReset) onReset();
                return;
            }

            // 4. Shortcut 'Backspace' -> Batal / Tutup Modal
            if (key === 'backspace') {
                // Jika modal konfirmasi terbuka -> Tutup (Batal)
                if (isConfirmModalOpen) {
                    e.preventDefault();
                    if (onCancel) onCancel();
                    return;
                }

                // Jika modal pencarian terbuka & tidak ngetik -> Tutup
                if (isSearchModalOpen && !isInputActive) {
                    e.preventDefault();
                    if (onCancel) onCancel(); // onCancel di sini akan menutup search modal
                    return;
                }
            }

            // 5. Shortcut 'Enter' -> Bayar / Proses
            if (key === 'enter') {
                // Jika modal konfirmasi terbuka -> Proses Final
                if (isConfirmModalOpen) {
                    e.preventDefault();
                    if (onConfirm) onConfirm(); // onConfirm saat modal buka = checkout final
                    return;
                }

                // Jika modal tertutup -> Buka Konfirmasi (jika valid)
                if (!isSearchModalOpen && !isConfirmModalOpen && canCheckout) {
                    e.preventDefault();
                    if (onConfirm) onConfirm(); // onConfirm saat modal tutup = buka modal
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        onSearch, onFocusPay, onReset, onConfirm, onCancel,
        isSearchModalOpen, isConfirmModalOpen, canCheckout
    ]);

    return null; // Komponen ini tidak menampilkan apa-apa
};

export default KeyboardShortcuts;