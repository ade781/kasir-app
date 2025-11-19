const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  products: {
    list: () => ipcRenderer.invoke("products:list"),
    add: (p) => ipcRenderer.invoke("products:add", p),
    byBarcode: (code) => ipcRenderer.invoke("products:byBarcode", code),
    byId: (id) => ipcRenderer.invoke("products:byId", id),
    update: (id, delta) => ipcRenderer.invoke("products:update", id, delta),
    delete: (id) => ipcRenderer.invoke("products:delete", id),
  },
  sales: {
    checkout: (sale) => ipcRenderer.invoke("sales:checkout", sale),
    list: () => ipcRenderer.invoke("sales:list"),
    delete: (id) => ipcRenderer.invoke("sales:delete", id),
    update: (data) => ipcRenderer.invoke("sales:update", data),
  },
  // API Baru untuk Pengeluaran
  expenses: {
    listSuppliers: () => ipcRenderer.invoke("suppliers:list"),
    addSupplier: (name) => ipcRenderer.invoke("suppliers:add", name),
    deleteSupplier: (id) => ipcRenderer.invoke("suppliers:delete", id),

    listExpenses: () => ipcRenderer.invoke("expenses:list"),
    addExpense: (data) => ipcRenderer.invoke("expenses:add", data),
    deleteExpense: (id) => ipcRenderer.invoke("expenses:delete", id),
  }
});