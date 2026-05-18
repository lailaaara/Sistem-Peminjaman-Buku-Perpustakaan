const express = require("express");
const router = express.Router();
const db = require("../../db");

// GET semua buku
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// GET stats (MUST come before /:id)
router.get("/stats", async (req, res) => {
  try {
    const booksResult = await db.query("SELECT COUNT(*) as total_books FROM books");
    const transResult = await db.query("SELECT COUNT(*) as total_transactions FROM transactions");
    const activeResult = await db.query("SELECT COUNT(*) as active_borrowings FROM transactions WHERE status = 'borrowed'");
    const pendingResult = await db.query("SELECT COUNT(*) as pending_returns FROM transactions WHERE status = 'pending_return'");

    res.json({
      totalBooks: parseInt(booksResult.rows[0].total_books, 10),
      totalTransactions: parseInt(transResult.rows[0].total_transactions, 10),
      activeBorrowings: parseInt(activeResult.rows[0].active_borrowings, 10),
      pendingReturns: parseInt(pendingResult.rows[0].pending_returns, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET recent activity (MUST come before /:id)
router.get("/activity/recent", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.user_id, t.status, t.borrow_date, t.return_date,
             b.title as book_title, b.author as book_author
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      ORDER BY t.borrow_date DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

// GET semua transaksi (admin) (MUST come before /:id)
router.get("/transactions/all", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.user_id, t.book_id, t.status, t.borrow_date, t.return_date,
             b.title as book_title, b.author as book_author
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      ORDER BY t.borrow_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// GET transaksi user tertentu (MUST come before /:id)
router.get("/transactions/user/:user_id", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.user_id, t.book_id, t.status, t.borrow_date, t.return_date,
             b.title as book_title, b.author as book_author
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      WHERE t.user_id = $1
      ORDER BY t.borrow_date DESC
    `, [req.params.user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user transactions" });
  }
});

// GET satu buku
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch book" });
  }
});

// Tambah buku
router.post("/", async (req, res) => {
  const { title, author, stock } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO books (title, author, stock) VALUES ($1, $2, $3) RETURNING id",
      [title, author, stock]
    );
    res.json({ message: "Book added", id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add book" });
  }
});

// Hapus buku
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM books WHERE id = $1", [req.params.id]);
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete book" });
  }
});

// Pinjam buku
router.post("/borrow", async (req, res) => {
  const { user_id, book_id } = req.body;

  try {
    await db.query("BEGIN");

    // Check stock
    const bookResult = await db.query("SELECT stock FROM books WHERE id = $1", [book_id]);
    if (bookResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "Book not found" });
    }
    if (bookResult.rows[0].stock <= 0) {
      await db.query("ROLLBACK");
      return res.status(400).json({ message: "Book out of stock" });
    }

    const transResult = await db.query(
      "INSERT INTO transactions (user_id, book_id, status, borrow_date) VALUES ($1, $2, $3, NOW()) RETURNING id",
      [user_id, book_id, "borrowed"]
    );

    await db.query(
      "UPDATE books SET stock = stock - 1 WHERE id = $1",
      [book_id]
    );

    await db.query("COMMIT");

    res.json({ message: "Book borrowed", transaction_id: transResult.rows[0].id });
  } catch (err) {
    await db.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({ message: "Failed to borrow book" });
  }
});

// Return buku — user mengajukan pengembalian, menunggu verifikasi admin
router.post("/return", async (req, res) => {
  const { transaction_id } = req.body;

  try {
    await db.query(
      "UPDATE transactions SET status = $1 WHERE id = $2",
      ["pending_return", transaction_id]
    );

    res.json({ message: "Return request submitted, waiting admin verification" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit return request" });
  }
});

// Admin konfirmasi pengembalian fisik — buku benar-benar dikembalikan
router.post("/confirm-return", async (req, res) => {
  const { transaction_id, book_id } = req.body;

  try {
    await db.query("BEGIN");

    await db.query(
      "UPDATE transactions SET status = $1, return_date = NOW() WHERE id = $2",
      ["returned", transaction_id]
    );

    await db.query(
      "UPDATE books SET stock = stock + 1 WHERE id = $1",
      [book_id]
    );

    await db.query("COMMIT");

    res.json({ message: "Return confirmed by admin" });
  } catch (err) {
    await db.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({ message: "Failed to confirm return" });
  }
});

// Admin menolak pengembalian — buku tidak ditemukan fisik
router.post("/reject-return", async (req, res) => {
  const { transaction_id } = req.body;

  try {
    await db.query(
      "UPDATE transactions SET status = $1 WHERE id = $2",
      ["not_returned", transaction_id]
    );

    res.json({ message: "Return rejected — book not physically returned" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject return" });
  }
});

module.exports = router;
