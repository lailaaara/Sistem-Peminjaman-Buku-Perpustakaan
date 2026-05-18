import { useState, useEffect } from "react";
import BookCard from "../components/bookcard";
import Navbar from "../components/navbar";
import { fetchApi } from "../config/api";
import { mapBook } from "../utils/bookMapper";
import "./koleksibuku.css";

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function KoleksiBuku() {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      const res = await fetchApi("/books");
      if (!res.error && Array.isArray(res.data)) {
        setBooks(res.data.map(mapBook));
      }
      setLoading(false);
    }
    loadBooks();
  }, []);

  const filtered = books.filter((b) => {
    const q = query.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
    );
  });

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="home-page">
      <Navbar />
      <main className="koleksi-page">
        <div className="koleksi-header">
          <div className="koleksi-header__text">
            <h1 className="koleksi-title">Koleksi Buku</h1>
            <p className="koleksi-subtitle">
              Temukan koleksi bacaan berkualitas untuk memperluas cakrawala pengetahuan Anda.
            </p>
          </div>
          <div className="search-bar">
            <SearchIcon />
            <input
              type="text"
              className="search-input"
              placeholder="Cari judul, penulis, atau ISBN..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(8);
              }}
              aria-label="Cari buku"
            />
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#999" }}>Memuat buku...</p>
        ) : displayed.length > 0 ? (
          <div className="book-grid">
            {displayed.map((buku) => (
              <BookCard key={buku.id} {...buku} />
            ))}
          </div>
        ) : (
          <p className="koleksi-empty">Buku tidak ditemukan.</p>
        )}

        {!loading && hasMore && (
          <div className="load-more-wrap">
            <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 4)}>
              Muat Lebih Banyak <ChevronDown />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
