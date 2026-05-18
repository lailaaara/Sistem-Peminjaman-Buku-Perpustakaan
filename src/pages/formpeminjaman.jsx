import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import { fetchApi } from "../config/api";
import { mapBook } from "../utils/bookMapper";
import "./formpeminjaman.css";

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const DURASI_OPTIONS = ["7 hari", "14 hari", "21 hari", "30 hari"];

function hitungEstimasi(tanggal, durasi) {
  if (!tanggal) return null;
  const hari = parseInt(durasi);
  const tgl = new Date(tanggal);
  tgl.setDate(tgl.getDate() + hari);
  return tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function FormPeminjaman() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [buku, setBuku] = useState(null);
  const [loading, setLoading] = useState(true);
  const [durasi, setDurasi] = useState("7 hari");
  const [tanggal, setTanggal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const estimasi = hitungEstimasi(tanggal, durasi);

  async function handleKonfirmasi() {
    if (!tanggal) {
      alert("Silakan pilih tanggal peminjaman terlebih dahulu.");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.id) {
      alert("Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }
    setSubmitting(true);
    const res = await fetchApi("/books/borrow", {
      method: "POST",
      body: JSON.stringify({ user_id: user.id, book_id: Number(id) }),
    });
    setSubmitting(false);
    if (res.error) {
      alert(res.error || "Gagal meminjam buku.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => navigate("/pinjaman"), 2000);
  }

  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="form-page">
          <p style={{ textAlign: "center", color: "#999" }}>Memuat buku...</p>
        </main>
      </div>
    );
  }

  if (!buku) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="form-page">
          <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft /> Kembali</button>
          <p style={{ color: "var(--gray-400)", marginTop: 40 }}>Buku tidak ditemukan.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar />
      <main className="form-page">
        <div className="form-header">
          <h1 className="form-title">Formulir Peminjaman Buku</h1>
          <p className="form-subtitle">Silakan lengkapi detail peminjaman di bawah ini untuk melanjutkan.</p>
        </div>

        <div className="form-body">
          <div className="form-book-card">
            <h2 className="form-book-card__heading">Buku yang Dipinjam</h2>
            <div className="form-book-card__cover-wrap">
              <img src={buku.cover} alt={buku.judul} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
            </div>
            <span className="form-book-card__badge">TERSEDIA</span>
            <h3 className="form-book-card__title">{buku.judul}</h3>
            <p className="form-book-card__author">{buku.penulis}</p>
          </div>

          <div className="form-fields">
            <div className="field-group">
              <label className="field-label">Durasi Pinjam</label>
              <div className="select-wrap">
                <select className="field-select" value={durasi} onChange={(e) => setDurasi(e.target.value)}>
                  {DURASI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <span className="select-icon"><ChevronDown /></span>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Tanggal Peminjaman</label>
              <div className="input-wrap" onClick={() => document.getElementById("tanggal-peminjaman")?.showPicker?.()}>
                <input
                  id="tanggal-peminjaman"
                  type="date"
                  className="field-input"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
                <span className="input-icon"><CalendarIcon /></span>
              </div>
            </div>

            <div className="estimasi-box">
              <span className="estimasi-label">Estimasi Pengembalian</span>
              <span className="estimasi-value">
                {estimasi ?? <span className="estimasi-placeholder">Pilih tanggal dulu</span>}
              </span>
            </div>

            <button
              className={`konfirmasi-btn${submitted ? " konfirmasi-btn--success" : ""}`}
              onClick={handleKonfirmasi}
              disabled={submitted || submitting}
            >
              <CheckCircle />
              {submitted ? "Peminjaman Dikonfirmasi!" : submitting ? "Memproses..." : "Konfirmasi Pinjaman"}
            </button>

            <button className="batal-btn" onClick={() => navigate(-1)} disabled={submitted}>
              Batal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
