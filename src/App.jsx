import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Home from "./pages/home";
import KoleksiBuku from "./pages/koleksibuku";
import DetailBuku from "./pages/detailbuku";
import FormPeminjaman from "./pages/formpeminjaman";
import PinjamanSaya from "./pages/pinjamansaya";
import Notifikasi from "./pages/notifikasi";
import AdminDashboard from "./pages/admin";
import AdminAnggota from "./pages/adminanggota";
import AdminBuku from './pages/adminbuku';
import Transaksi from "./pages/transaksi";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, adminOnly = false }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const user = getUser();
  if (user) {
    // Already logged in — send to appropriate home
    return <Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />;
  }
  return children;
}

function HomeRoute() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Home />;
}

function NotFound() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>404 - Halaman tidak ditemukan</h1>
      <p style={{ color: "#666" }}>Route yang kamu minta belum tersedia.</p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — login page (redirect if already logged in) */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />

        {/* Main — root route checks auth */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/katalog" element={<HomeRoute />} />

        {/* Protected user routes */}
        <Route path="/koleksi-buku" element={
          <ProtectedRoute><KoleksiBuku /></ProtectedRoute>
        } />
        <Route path="/koleksi" element={
          <ProtectedRoute><KoleksiBuku /></ProtectedRoute>
        } />

        <Route path="/pinjaman" element={
          <ProtectedRoute><PinjamanSaya /></ProtectedRoute>
        } />
        <Route path="/notifikasi" element={
          <ProtectedRoute><Notifikasi /></ProtectedRoute>
        } />

        {/* Buku detail is public, but borrowing requires login */}
        <Route path="/buku/:id" element={<DetailBuku />} />
        <Route path="/buku/:id/pinjam" element={
          <ProtectedRoute><FormPeminjaman /></ProtectedRoute>
        } />

        {/* Admin — requires login + admin role */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/anggota" element={
          <ProtectedRoute adminOnly><AdminAnggota /></ProtectedRoute>
        } />
        <Route path="/admin/buku" element={
          <ProtectedRoute adminOnly><AdminBuku /></ProtectedRoute>
        } />
        <Route path="/admin/transaksi" element={
          <ProtectedRoute adminOnly><Transaksi /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
