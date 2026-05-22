import { useState, useEffect } from "react";
import "./adminbuku.css";
import AdminNavbar from "../components/adminnavbar";
import { fetchApi } from "../config/api";

const BookIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="8" width="48" height="48" rx="4" fill="currentColor" opacity="0.15" />
    <path d="M14 16h20v32H14V16zM34 16h16v32H34V16z" fill="currentColor" opacity="0.3" />
    <path d="M14 16h20v2H14zM34 16h16v2H34z" fill="currentColor" opacity="0.5" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = ({ dir = "right" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const BookCoverPlaceholder = ({ id }) => {
  const colors = ["#e8c4a0", "#2c2c2c", "#d4d0c8", "#1a3a5c", "#5a3a2c", "#3a5c1a", "#3a1a5c", "#1a5c3a"];
  const bg = colors[(id - 1) % colors.length] || "#ccc";
  return (
    <div className="book-cover-placeholder" style={{ background: bg }}>
      <div className="book-cover-lines"><div /><div /><div /></div>
    </div>
  );
};

function DeleteModal({ book, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-icon modal-icon--delete">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <h2 className="modal-title">Hapus Koleksi Buku?</h2>
        <p className="modal-desc">
          Apakah Anda yakin ingin menghapus buku <strong>'{book?.title}'</strong> dari koleksi? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="modal-actions">
          <button className="btn-batal" onClick={onCancel}>Batal</button>
          <button className="btn-hapus" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

function TambahBukuModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", author: "", stok: 0 });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.author) return;
    setSaving(true);
    const res = await fetchApi("/books", {
      method: "POST",
      body: JSON.stringify({ title: form.title, author: form.author, stock: Number(form.stok) || 0 }),
    });
    setSaving(false);
    if (res.error) {
      alert(res.error || "Gagal menambah buku.");
      return;
    }
    onSave();
    setSaved(true);
  };

  const handleKembali = () => {
    onClose();
  };

  if (saved) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={e => e.stopPropagation()}>
          <div className="modal-icon modal-icon--success">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h2 className="modal-title">Data Buku Berhasil<br />Disimpan ke Katalog.</h2>
          <div className="modal-actions" style={{ justifyContent: "center" }}>
            <button className="btn-hapus" onClick={handleKembali}>Kembali ke Data Buku</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tambah-page-overlay">
      <AdminNavbar active="Buku" />
      <div className="tambah-content">
        <h1 className="tambah-title">Tambah Buku Baru</h1>
        <p className="tambah-sub">Lengkapi informasi di bawah ini untuk menambahkan koleksi ke dalam perpustakaan.</p>

        <div className="tambah-form-card">
          <div className="tambah-form-right" style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
            <div className="form-group">
              <label>Judul Buku</label>
              <input placeholder="Masukkan judul lengkap buku" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Penulis</label>
              <input placeholder="Nama penulis" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Jumlah Stok</label>
              <input
                type="number"
                min="0"
                value={form.stok}
                onChange={e => setForm({ ...form, stok: e.target.value })}
              />
            </div>
            <div className="tambah-form-actions">
              <button className="btn-batal" onClick={onClose}>Batal</button>
              <button className="btn-simpan" onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Buku"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBuku() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showTambah, setShowTambah] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBooks: 0, activeBorrowings: 0 });

  const booksPerPage = 8;

  async function loadBooks() {
    setLoading(true);
    const [booksRes, statsRes] = await Promise.all([
      fetchApi("/books"),
      fetchApi("/books/stats"),
    ]);
    if (!booksRes.error && Array.isArray(booksRes.data)) {
      setBooks(booksRes.data);
    }
    if (!statsRes.error && statsRes.data) {
      setStats(statsRes.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBooks();
  }, []);

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / booksPerPage) || 1;
  const paged = filtered.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);

  const handleDelete = async () => {
    const res = await fetchApi(`/books/${deleteTarget.id}`, { method: "DELETE" });
    if (res.error) {
      alert(res.error || "Gagal menghapus buku.");
      return;
    }
    setDeleteTarget(null);
    loadBooks();
  };

  const getStatusClass = (status) => {
    if (status === "TERSEDIA") return "badge badge--tersedia";
    if (status === "HAMPIR HABIS") return "badge badge--hampir";
    if (status === "DIPINJAM SEMUA") return "badge badge--dipinjam";
    return "badge";
  };

  const getStatusLabel = (stock) => {
    if (stock === 0) return "DIPINJAM SEMUA";
    if (stock <= 3) return "HAMPIR HABIS";
    return "TERSEDIA";
  };

  if (showTambah) {
    return <TambahBukuModal onClose={() => { setShowTambah(false); loadBooks(); }} onSave={loadBooks} />;
  }

  return (
    <div className="ab-root">
      <AdminNavbar active="Buku" />
      <main className="ab-main">
        <div className="ab-header">
          <div>
            <h1 className="ab-page-title">Manajemen Data Buku</h1>
            <p className="ab-page-sub">Kelola koleksi pustaka panel kontrol terpadu yang modern dan intuitif.</p>
          </div>
          <button className="btn-tambah" onClick={() => setShowTambah(true)}>
            <PlusIcon /> Tambah Buku
          </button>
        </div>

        <div className="ab-stats">
          <div className="stat-card stat-card--pink">
            <div className="stat-info">
              <div className="stat-label">TOTAL KOLEKSI AKTIF</div>
              <div className="stat-value">{stats.totalBooks.toLocaleString("id-ID")} <span>Buku</span></div>
            </div>
            <div className="stat-icon"><BookIcon /></div>
          </div>
          <div className="stat-card stat-card--white">
            <div className="stat-info">
              <div className="stat-label">SEDANG DIPINJAM</div>
              <div className="stat-value">{stats.activeBorrowings}</div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${stats.totalBooks ? (stats.activeBorrowings / stats.totalBooks) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="ab-toolbar">
          <div className="ab-search-wrap">
            <SearchIcon />
            <input className="ab-search" placeholder="Cari judul, penulis..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>

        <div className="ab-table-card">
          {loading ? (
            <p style={{ textAlign: "center", padding: 24, color: "#999" }}>Memuat buku...</p>
          ) : (
            <>
              <table className="ab-table">
                <thead>
                  <tr>
                    <th>ID BUKU</th>
                    <th>INFORMASI BUKU</th>
                    <th>STOK</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((book) => (
                    <tr key={book.id}>
                      <td className="td-id">BUK-{String(book.id).padStart(3, "0")}</td>
                      <td className="td-info">
                        <BookCoverPlaceholder id={book.id} />
                        <div className="td-text">
                          <div className="td-title">{book.title}</div>
                          <div className="td-author">{book.author}</div>
                        </div>
                      </td>
                      <td className="td-stok">
                        <span className="stok-val">{String(book.stock).padStart(2, "0")}</span>
                      </td>
                      <td>
                        <span className={getStatusClass(getStatusLabel(book.stock))}>{getStatusLabel(book.stock)}</span>
                      </td>
                      <td>
                        <button className="btn-trash" onClick={() => setDeleteTarget(book)}>
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ab-pagination">
                <span className="pagination-info">
                  Menampilkan <strong>{paged.length}</strong> dari <strong>{filtered.length}</strong> buku
                </span>
                <div className="pagination-controls">
                  <button className="pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronIcon dir="left" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={`pg-btn ${currentPage === p ? "pg-btn--active" : ""}`} onClick={() => setCurrentPage(p)}>
                      {p}
                    </button>
                  ))}
                  <button className="pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronIcon dir="right" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {deleteTarget && (
        <DeleteModal book={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
