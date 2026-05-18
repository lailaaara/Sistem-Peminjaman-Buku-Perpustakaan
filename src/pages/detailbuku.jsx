import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import { fetchApi } from "../config/api";
import { mapBook } from "../utils/bookMapper";
import "./detailbuku.css";

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

export default function DetailBuku() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [buku, setBuku] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      const res = await fetchApi(`/books/${id}`);
      if (!res.error && res.data) {
        setBuku(mapBook(res.data));
      }
      setLoading(false);
    }
    if (id) loadBook();
  }, [id]);

  const isTersedia = buku?.status === "tersedia";

  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="detail-page">
          <p style={{ color: "var(--gray-400)", marginTop: 40 }}>Memuat buku...</p>
        </main>
      </div>
    );
  }

  if (!buku) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="detail-page">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft /> Kembali
          </button>
          <p style={{ color: "var(--gray-400)", marginTop: 40 }}>Buku tidak ditemukan.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar />
      <main className="detail-page">
        <div className="detail-content">
          <div className="detail-cover-col">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <span>Detail Buku</span>
            </button>
            <div className="detail-cover-container">
              <img src={buku.cover} alt={buku.judul} className="detail-cover-img" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
            </div>
            <span className={`detail-status-badge detail-status-badge--${isTersedia ? "tersedia" : "dipinjam"}`}>
              <CheckCircle />
              {isTersedia ? "Tersedia" : "Dipinjam"}
            </span>
          </div>

          <div className="detail-info-col">
            <div className="detail-header-inline">
              <h1 className="detail-judul">{buku.judul}</h1>
              <span className="detail-penulis">Oleh {buku.penulis}</span>
            </div>
            <div className="detail-meta">
              <span className="detail-kategori">Kategori : {buku.kategori}</span>
            </div>

            <button
              className="pinjam-btn"
              disabled={!isTersedia}
              onClick={() => navigate(`/buku/${buku.id}/pinjam`)}
            >
              <BookIcon />
              {isTersedia ? "Pinjam Sekarang" : "Sedang Dipinjam"}
            </button>

            <div className="sinopsis-card">
              <h2 className="sinopsis-title">Sinopsis</h2>
              <p className="sinopsis-text">{buku.sinopsis}</p>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">PENERBIT</span>
                <span className="info-value">{buku.penerbit}</span>
              </div>
              <div className="info-item">
                <span className="info-label">HALAMAN</span>
                <span className="info-value">{buku.halaman}</span>
              </div>
              <div className="info-item">
                <span className="info-label">BAHASA</span>
                <span className="info-value">{buku.bahasa}</span>
              </div>
              <div className="info-item">
                <span className="info-label">TAHUN</span>
                <span className="info-value">{buku.tahun}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
