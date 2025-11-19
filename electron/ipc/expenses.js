const { ipcMain } = require("electron");
const { getDb } = require("../db");

function registerExpensesIpc() {
    const { Supplier, Expense } = getDb();

    // --- SUPPLIERS (TOKO TEMPAT KULAK) ---

    ipcMain.handle("suppliers:list", async () => {
        const rows = await Supplier.findAll({ order: [["name", "ASC"]] });
        return rows.map(r => r.get({ plain: true }));
    });

    ipcMain.handle("suppliers:add", async (_e, name) => {
        if (!name || !name.trim()) throw new Error("Nama toko wajib diisi");
        const created = await Supplier.create({ name: name.trim() });
        return created.get({ plain: true });
    });

    ipcMain.handle("suppliers:delete", async (_e, id) => {
        const item = await Supplier.findByPk(id);
        if (!item) throw new Error("Toko tidak ditemukan");
        await item.destroy();
        return true;
    });

    // --- EXPENSES (PENGELUARAN HARIAN) ---

    ipcMain.handle("expenses:list", async () => {
        const rows = await Expense.findAll({
            order: [["date", "DESC"]],
            include: [Supplier], // Join dengan tabel Supplier agar nama toko muncul
            limit: 100 // Batasi 100 terakhir agar ringan
        });
        return rows.map(r => {
            const plain = r.get({ plain: true });
            // Flatten object untuk kemudahan di frontend
            return {
                ...plain,
                supplierName: plain.Supplier ? plain.Supplier.name : "Tanpa Nama"
            };
        });
    });

    ipcMain.handle("expenses:add", async (_e, { supplierId, amount }) => {
        if (!supplierId) throw new Error("Pilih toko tempat kulak");
        if (!amount || amount <= 0) throw new Error("Nominal tidak valid");

        const created = await Expense.create({
            supplierId,
            amount: Number(amount),
            date: new Date().toISOString()
        });
        return created.id;
    });

    ipcMain.handle("expenses:delete", async (_e, id) => {
        const item = await Expense.findByPk(id);
        if (!item) throw new Error("Data tidak ditemukan");
        await item.destroy();
        return true;
    });
}

module.exports = { registerExpensesIpc };