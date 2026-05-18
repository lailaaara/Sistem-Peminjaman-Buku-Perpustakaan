import { useEffect, useState } from "react";
import "./transaksi.css";
import AdminNavbar from "../components/adminnavbar";
import { fetchApi } from "../config/api";

const STATUS_LABELS = {
  borrowed: "Dipinjam",
  pending_return: "Menunggu Verifikasi",
  returned: "Selesai",
  not_returned: "Buku Tidak Ada",
};

const STATUS_CLASSES = {
  borrowed: "status-dipinjam",
  pending_return: "status-terlambat",
  returned: "status-selesai",
  not_returned: "status-dipinjam",
};

const PER_PAGE = 5;

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconFilter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconReceipt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function TransaksiPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTransactions() {
    setLoading(true);
    const res = await fetchApi("/books/transactions/all");
    if (!res.error && Array.isArray(res.data)) {
      setData(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = data.filter((t) =>
    String(t.id).toLowerCase().includes(search.toLowerCase()) ||
    String(t.user_id).toLowerCase().includes(search.toLowerCase()) ||
    (t.book_title && t.book_title.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalTrx = data.length;
  const dipinjam = data.filter((t) => t.status === "borrowed").length;
  const pending = data.filter((t) => t.status === "pending_return").length;

  async function handleConfirmReturn(trx) {
    const res = await fetchApi("/books/confirm-return", {
      method: "POST",
      body: JSON.stringify({ transaction_id: trx.id, book_id: trx.book_id }),
    });
    if (res.error) {
      alert(res.error || "Gagal mengonfirmasi pengembalian.");
      return;
    }
    loadTransactions();
  }

  async function handleRejectReturn(trx) {
    const res = await fetchApi("/books/reject-return", {
      method: "POST",
      body: JSON.stringify({ transaction_id: trx.id }),
    });
    if (res.error) {
      alert(res.error || "Gagal menolak pengembalian.");
      return;
    }
    loadTransactions();
  }

  return (
    <div className="transaksi-page" onClick={() => {}}>
      <AdminNavbar active="Transaksi" />
      <main className="transaksi-main">
        <div className="page-header">
          <h1>Manajemen Transaksi</h1>
          <p>Kelola dan pantau seluruh aktivitas buku perpustakaan dengan efisien.</p>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-icon"><IconReceipt /></div>
            <div className="stat-info">
              <label>Total Transaksi</label>
              <strong>{totalTrx}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconBook /></div>
            <div className="stat-info">
              <label>Peminjaman Aktif</label>
              <strong>{dipinjam}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconAlert /></div>
            <div className="stat-info">
              <label>Menunggu Verifikasi</label>
              <strong>{pending}</strong>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <IconSearch />
            <input
              className="search-input"
              placeholder="Cari ID, Anggota, atau Judul..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="filter-btn">
            <IconFilter /> Filter
          </button>
        </div>

        <div className="table-card">
          {loading ? (
            <p style={{ textAlign: "center", padding: 32, color: "#aaa" }}>Memuat transaksi...</p>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Pinjam</th>
                    <th>User ID</th>
                    <th>Judul Buku</th>
                    <th>Tanggal Pinjam</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length > 0 ? paged.map((trx) => (
                    <tr key={trx.id}>
                      <td><span className="trx-id">TRX-{String(trx.id).padStart(4, "0")}</span></td>
                      <td><span className="member-name">{trx.user_id}</span></td>
                      <td><span className="book-title-cell">{trx.book_title}</span></td>
                      <td><span className="date-cell">{formatDate(trx.borrow_date)}</span></td>
                      <td>
                        <span className={`status-btn ${STATUS_CLASSES[trx.status] || "status-dipinjam"}`}>
                          {STATUS_LABELS[trx.status] || trx.status}
                        </span>
                      </td>
                      <td>
                        {trx.status === "pending_return" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="aksi-btn aksi-btn--kembalikan"
                              onClick={() => handleConfirmReturn(trx)}
                              title="Buku sudah dikembalikan fisik"
                            >
                              Terkembalikan
                            </button>
                            <button
                              className="aksi-btn aksi-btn--pinjam-lagi"
                              style={{ background: "#c0392b", color: "#fff" }}
                              onClick={() => handleRejectReturn(trx)}
                              title="Buku tidak ditemukan di rak"
                            >
                              Buku Tidak Ada
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="table-footer">
                <span className="table-info">
                  Menampilkan {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} data
                </span>
                <div className="pagination">
                  <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    <IconChevronLeft />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} className={`page-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                  ))}
                  <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <IconChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
