import React from "react";

// Menambahkan ...props untuk menangkap properti lain seperti 'id', 'onKeyDown', dll.
const CurrencyInput = ({ value, onChange, placeholder, className, autoFocus, ...props }) => {

    // Format tampilan ke user (misal: 1.000.000)
    const displayValue = value
        ? Number(value).toLocaleString("id-ID")
        : "";

    const handleChange = (e) => {
        // Ambil input mentah, buang semua karakter selain angka
        const rawValue = e.target.value.replace(/\D/g, "");

        // Kembalikan angka murni ke parent component
        onChange(rawValue);
    };

    return (
        <input
            {...props} // Spread props disini agar 'id' dari parent masuk ke elemen input
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