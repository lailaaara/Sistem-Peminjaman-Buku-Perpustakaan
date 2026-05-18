import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { fetchApi } from "../config/api";
import "./pinjamansaya.css";

const HistoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function PinjamanSaya() {
  const navigate = useNavigate();
  const [modalBuku, setModalBuku] = useState(null);
  const [successBuku, setSuccessBuku] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  async function loadRiwayat() {
    if (!user?.id) return;
    setLoading(true);
    const res = await fetchApi(`/books/transactions/user/${user.id}`);
    if (!res.error && Array.isArray(res.data)) {
      setRiwayat(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRiwayat();
  }, []);

  const handleReturn = (item) => {
    setModalBuku(item);
  };

  const handleConfirmReturn = async () => {
    const res = await fetchApi("/books/return", {
      method: "POST",
      body: JSON.stringify({ transaction_id: modalBuku.id }),
    });
    if (res.error) {
      alert(res.error || "Gagal mengajukan pengembalian.");
      return;
    }
    setSuccessBuku(modalBuku);
    setModalBuku(null);
    loadRiwayat();
  };

  const getStatusLabel = (status) => {
    if (status === "borrowed") return "Dipinjam";
    if (status === "pending_return") return "Menunggu Konfirmasi Admin";
    if (status === "returned") return "Selesai";
    if (status === "not_returned") return "Buku Tidak Dikembalikan";
    return status;
  };

  const getStatusClass = (status) => {
    if (status === "borrowed") return "status-badge--dipinjam";
    if (status === "pending_return") return "status-badge--menunggu";
    if (status === "returned") return "status-badge--selesai";
    if (status === "not_returned") return "status-badge--terlambat";
    return "status-badge--dipinjam";
  };

  return (
    <div className="home-page">
      <Navbar />
      <main className="pinjaman-page">
        <div className="pinjaman-header">
          <h1 className="pinjaman-title">Pinjaman Saya</h1>
          <p className="pinjaman-subtitle">
            Lacak kemajuan membaca dan kelola tenggat waktu peminjaman buku Anda dengan tenang.
          </p>
        </div>

        <div className="riwayat-section">
          <h2 className="riwayat-heading">
            <HistoryIcon />
            Riwayat Pinjaman
          </h2>

          {loading ? (
            <p style={{ textAlign: "center", color: "#999", padding: 24 }}>Memuat riwayat...</p>
          ) : (
            <div className="riwayat-table-wrap">
              <table className="riwayat-table">
                <thead>
                  <tr>
                    <th>JUDUL BUKU</th>
                    <th>TANGGAL PINJAM</th>
                    <th>TANGGAL KEMBALI</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: 32, color: "#aaa" }}>
                        Belum ada riwayat peminjaman.
                      </td>
                    </tr>
                  ) : (
                    riwayat.map((item) => (
                      <tr key={item.id} className="riwayat-row">
                        <td className="riwayat-judul-cell">
                          <div className={`riwayat-cover-plain riwayat-cover-plain--${item.id}`}></div>
                          <span className="riwayat-judul">{item.book_title}</span>
                        </td>
                        <td className="riwayat-date">{formatDate(item.borrow_date)}</td>
                        <td className="riwayat-date">{formatDate(item.return_date)}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="riwayat-aksi-cell">
                          {item.status === "borrowed" ? (
                            <button className="aksi-btn aksi-btn--kembalikan" onClick={() => handleReturn(item)}>Kembalikan</button>
                          ) : item.status === "pending_return" ? (
                            <span style={{ fontSize: '11.5px', color: '#9b4163', fontWeight: 600 }}>Menunggu Admin</span>
                          ) : item.status === "not_returned" ? (
                            <span style={{ fontSize: '11.5px', color: '#c0392b', fontWeight: 600 }}>Tidak Dikembalikan</span>
                          ) : (
                            <button className="aksi-btn aksi-btn--pinjam-lagi" onClick={() => navigate(`/buku/${item.book_id}/pinjam`)}>
                              Pinjam Lagi
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Konfirmasi Pengembalian */}
        {modalBuku && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-icon-top">
                <InfoIcon />
              </div>
              <h3 className="modal-title">Konfirmasi Pengembalian</h3>
              <p className="modal-subtitle">
                Apakah Anda yakin ingin mengembalikan buku ini ke perpustakaan?
              </p>
              <div className="modal-book-card">
                <div className={`modal-book-cover riwayat-cover-plain--${modalBuku.id}`}></div>
                <div className="modal-book-info">
                  <span className="modal-badge">Sedang Dipinjam</span>
                  <h4 className="modal-book-title">{modalBuku.book_title}</h4>
                  <p className="modal-book-author">{modalBuku.book_author}</p>
                  <p className="modal-book-date">
                    <CalendarIcon />
                    Pinjam: {formatDate(modalBuku.borrow_date)}
                  </p>
                </div>
              </div>
              <div className="modal-actions">
                <button className="modal-btn modal-btn--primary" onClick={handleConfirmReturn}>Kembalikan Buku</button>
                <button className="modal-btn modal-btn--secondary" onClick={() => setModalBuku(null)}>Batal</button>
              </div>
              <div className="modal-info-box">
                <ShieldCheckIcon />
                <p>Buku akan diverifikasi secara fisik oleh pustakawan di meja layanan sebelum status peminjaman Anda dinyatakan selesai sepenuhnya.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Success */}
        {successBuku && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '420px', padding: '32px 28px' }}>
              <div className="modal-success-icon-wrap">
                <div className="modal-success-icon-inner">
                  <CheckIcon />
                </div>
              </div>
              <h3 className="modal-success-title">Pengembalian Diajukan!</h3>
              <p className="modal-success-subtitle">
                Terima kasih. Buku Anda sedang menunggu verifikasi admin.
              </p>
              <div className="modal-success-card">
                <div className="modal-success-item">
                  <BookIcon />
                  <div className="modal-success-text">
                    <span className="modal-success-label">JUDUL BUKU</span>
                    <span className="modal-success-value">{successBuku.book_title}</span>
                  </div>
                </div>
                <div className="modal-success-item">
                  <CalendarIcon />
                  <div className="modal-success-text">
                    <span className="modal-success-label">TANGGAL PENGAJUAN</span>
                    <span className="modal-success-value">{formatDate(new Date())}</span>
                  </div>
                </div>
              </div>
              <div className="modal-success-actions">
                <button className="modal-btn modal-btn--primary" onClick={() => setSuccessBuku(null)}>Kembali ke Riwayat</button>
                <button className="modal-btn modal-btn--outline" onClick={() => { setSuccessBuku(null); navigate("/katalog"); }}>Cari Buku Lagi</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
