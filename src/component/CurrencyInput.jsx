import React from "react";

const CurrencyInput = ({ value, onChange, placeholder, className, autoFocus }) => {
    // Format tampilan ke user (misal: 1.000.000)
    const displayValue = value
        ? Number(value).toLocaleString("id-ID")
        : "";

    const handleChange = (e) => {
        // Ambil input mentah, buang semua karakter selain angka
        const rawValue = e.target.value.replace(/\D/g, "");

        // Kembalikan angka murni ke parent component
        // Jika kosong, kirim string kosong atau 0 sesuai kebutuhan parent
        onChange(rawValue);
    };

    return (
        <input
            type="text" // Harus text agar bisa menerima titik
            inputMode="numeric" // Agar keyboard HP muncul angka
            className={className}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
            autoFocus={autoFocus}
        />
    );
};

export default CurrencyInput;