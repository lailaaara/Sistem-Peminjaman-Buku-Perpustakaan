import { useEffect, useState } from "react";
import "./admin.css";
import AdminNavbar from "../components/adminnavbar";
import { fetchApi } from "../config/api";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_BADGE_CLASSES = {
  borrowed: "badge-pinjam",
  pending_return: "badge-terlambat",
  returned: "badge-kembali",
  not_returned: "badge-pinjam",
};

const STATUS_LABELS = {
  borrowed: "PINJAM",
  pending_return: "MENUNGGU",
  returned: "KEMBALI",
  not_returned: "HILANG",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalBooks: 0, totalTransactions: 0, pendingReturns: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        fetchApi("/books/stats"),
        fetchApi("/books/activity/recent"),
      ]);
      if (!statsRes.error && statsRes.data) {
        setStats(statsRes.data);
      }
      if (!activityRes.error && Array.isArray(activityRes.data)) {
        setActivity(activityRes.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="admin-root">
      <AdminNavbar active="Dashboard" />

      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Selamat Datang, Admin!</h1>
          <p className="admin-subtitle">Berikut adalah ringkasan perpustakaan Anda hari ini.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#c0306a" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="stat-label">TOTAL BUKU</div>
            <div className="stat-value">
              {stats.totalBooks} <span className="stat-unit">Buku</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#c0306a" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="stat-label">TOTAL TRANSAKSI</div>
            <div className="stat-value">
              {stats.totalTransactions} <span className="stat-unit">Transaksi</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#c0306a" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="stat-label">MENUNGGU VERIFIKASI</div>
            <div className="stat-value">
              {stats.pendingReturns || 0} <span className="stat-unit">Pengembalian</span>
            </div>
          </div>
        </div>

        <div className="activity-card">
          <div className="activity-header">
            <div>
              <h2 className="activity-title">Aktivitas Terbaru</h2>
              <p className="activity-desc">Pemantauan real-time perpustakaan</p>
            </div>
          </div>

          <div className="activity-table-wrap">
            {loading ? (
              <p style={{ textAlign: "center", padding: 24, color: "#999" }}>Memuat aktivitas...</p>
            ) : (
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>USER ID</th>
                    <th>JUDUL BUKU</th>
                    <th>STATUS</th>
                    <th>WAKTU</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: 24, color: "#999" }}>
                        Belum ada aktivitas.
                      </td>
                    </tr>
                  ) : (
                    activity.map((row) => (
                      <tr key={row.id}>
                        <td className="td-anggota">User #{row.user_id}</td>
                        <td className="td-buku">
                          <span className="buku-judul">{row.book_title}</span>
                          <span className="buku-penulis">{row.book_author}</span>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE_CLASSES[row.status] || "badge-pinjam"}`}>
                            {STATUS_LABELS[row.status] || row.status}
                          </span>
                        </td>
                        <td className="td-waktu">{formatDate(row.borrow_date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="activity-footer">
            Menampilkan {Math.min(activity.length, 10)} aktivitas terakhir dari {stats.totalTransactions} total data.
          </div>
        </div>
      </main>
    </div>
  );
}
