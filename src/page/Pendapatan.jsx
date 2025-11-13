import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Pendapatan = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const rows = await window.api.sales.list();
        if (!mounted) return;
        setSales(rows || []);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Gagal memuat data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const formatCurrency = (v) => "Rp" + (Number(v) || 0).toLocaleString("id-ID");

  function parseSaleTotal(sale) {
    if (sale == null) return 0;
    const t = Number(sale.total ?? 0);
    if (t && !Number.isNaN(t)) return t;
    if (Array.isArray(sale.SaleItems) && sale.SaleItems.length) {
      return sale.SaleItems.reduce((s, it) => s + (Number(it.total ?? it.price * it.qty) || 0), 0);
    }
    if (Array.isArray(sale.items) && sale.items.length) {
      return sale.items.reduce((s, it) => s + (Number(it.total ?? it.price * it.qty) || 0), 0);
    }
    return 0;
  }

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const totals = useMemo(() => {
    const now = new Date();
    const dayIdx = (now.getDay() + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayIdx);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayTotal = sales.reduce((s, sale) => {
      const dt = new Date(sale.datetime || sale.createdAt || sale.date);
      if (isNaN(dt)) return s;
      return isSameDay(dt, now) ? s + parseSaleTotal(sale) : s;
    }, 0);

    const weekTotal = sales.reduce((s, sale) => {
      const dt = new Date(sale.datetime || sale.createdAt || sale.date);
      if (isNaN(dt)) return s;
      return dt >= startOfWeek ? s + parseSaleTotal(sale) : s;
    }, 0);

    const monthTotal = sales.reduce((s, sale) => {
      const dt = new Date(sale.datetime || sale.createdAt || sale.date);
      if (isNaN(dt)) return s;
      return dt >= startOfMonth ? s + parseSaleTotal(sale) : s;
    }, 0);

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return { date: d, total: 0 };
    });
    for (const sale of sales) {
      const dt = new Date(sale.datetime || sale.createdAt || sale.date);
      if (isNaN(dt)) continue;
      for (const day of days) {
        if (isSameDay(dt, day.date)) {
          day.total += parseSaleTotal(sale);
        }
      }
    }

    const months = Array.from({ length: 12 }).map((_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { month: m, total: 0 };
    });
    for (const sale of sales) {
      const dt = new Date(sale.datetime || sale.createdAt || sale.date);
      if (isNaN(dt)) continue;
      for (const m of months) {
        if (dt.getFullYear() === m.month.getFullYear() && dt.getMonth() === m.month.getMonth()) {
          m.total += parseSaleTotal(sale);
        }
      }
    }

    return {
      todayTotal,
      weekTotal,
      monthTotal,
      last7days: days,
      last12months: months,
    };
  }, [sales]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-gray-500">Memuat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  // chart data for 12 months
  const monthLabels = totals.last12months.map((m) =>
    m.month.toLocaleString(undefined, { month: "short", year: "numeric" })
  );
  const monthValues = totals.last12months.map((m) => Math.round(m.total || 0));

  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Pendapatan",
        data: monthValues,
        backgroundColor: "rgba(37,99,235,0.8)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Pendapatan 12 Bulan Terakhir" },
      tooltip: {
        callbacks: {
          label: (ctx) => formatCurrency(ctx.parsed.y),
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: {
          callback: (val) => {
            return Number(val).toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pendapatan</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-600">Harian (hari ini)</div>
          <div className="text-2xl font-semibold mt-2">{formatCurrency(totals.todayTotal)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-600">Mingguan (mulai minggu ini)</div>
          <div className="text-2xl font-semibold mt-2">{formatCurrency(totals.weekTotal)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-600">Bulanan (bulan ini)</div>
          <div className="text-2xl font-semibold mt-2">{formatCurrency(totals.monthTotal)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded shadow p-3">
          <h2 className="font-semibold mb-2">7 Hari Terakhir</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-1">Tanggal</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {totals.last7days.map((d) => (
                <tr key={d.date.toISOString()} className="border-t">
                  <td className="py-2">{d.date.toLocaleDateString()}</td>
                  <td className="py-2 text-right">{formatCurrency(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded shadow p-3">
          <h2 className="font-semibold mb-2">12 Bulan Terakhir</h2>
          <div style={{ height: 300 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>

          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-1">Bulan</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {totals.last12months.map((m) => (
                <tr key={m.month.toISOString()} className="border-t">
                  <td className="py-2">{m.month.toLocaleString(undefined, { month: "long", year: "numeric" })}</td>
                  <td className="py-2 text-right">{formatCurrency(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pendapatan;