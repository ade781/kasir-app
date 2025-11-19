import { useState, useMemo } from "react";
import { useToast } from "../stores/useToast";

export const useCart = () => {
    const [cart, setCart] = useState([]);
    const toast = useToast((s) => s.push);

    const addToCart = (product) => {
        setCart((c) => {
            const idx = c.findIndex((x) => x.id === product.id);
            if (idx >= 0) {
                const copy = [...c];
                copy[idx] = { ...copy[idx], qty: Number(copy[idx].qty || 0) + 1 };
                return copy;
            }
            return [
                ...c,
                {
                    id: product.id,
                    barcode: product.barcode,
                    name: product.name,
                    price: Number(product.price || 0),
                    qty: 1,
                },
            ];
        });
        toast({ type: "success", title: "Ditambahkan", message: `${product.name} +1` });
    };

    const removeFromCart = (id) => setCart((c) => c.filter((x) => x.id !== id));

    const changeQty = (id, next) => {
        setCart((c) => {
            const nextQty = Math.max(0, Number(next) || 0);
            if (nextQty === 0) return c.filter((it) => it.id !== id);
            return c.map((it) => (it.id === id ? { ...it, qty: nextQty } : it));
        });
    };

    const increment = (id) =>
        setCart((c) =>
            c.map((it) => (it.id === id ? { ...it, qty: Number(it.qty || 0) + 1 } : it))
        );

    const decrement = (id) => {
        setCart((c) => {
            const item = c.find((it) => it.id === id);
            if (!item) return c;
            const nextQty = Math.max(0, Number(item.qty || 0) - 1);
            if (nextQty === 0) return c.filter((it) => it.id !== id);
            return c.map((it) => (it.id === id ? { ...it, qty: nextQty } : it));
        });
    };

    const clearCart = () => setCart([]);

    const total = useMemo(
        () => cart.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0),
        [cart]
    );

    return {
        cart,
        total,
        addToCart,
        removeFromCart,
        changeQty,
        increment,
        decrement,
        clearCart,
    };
};