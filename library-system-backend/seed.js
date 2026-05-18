require("dotenv").config();
const db = require("./backend/config/db");

const books = [
  { title: "Seni Menenangkan Hati", author: "Andi Wijaya", stock: 5 },
  { title: "Alam Semesta & Kita", author: "Dr. Sarah Fitri", stock: 3 },
  { title: "Petualangan Si Kecil", author: "Bunda Maya", stock: 8 },
  { title: "Ruang Tenang", author: "Rania Putri", stock: 4 },
  { title: "Mencari Makna Hidup", author: "Viktor Frankl", stock: 6 },
  { title: "Masa Depan AI", author: "Budi Santoso", stock: 2 },
  { title: "Nusantara Berjaya", author: "Prof. Ahmad", stock: 7 },
  { title: "Strategi Digital", author: "Linda Sari", stock: 9 },
];

async function seed() {
  try {
    console.log("Seeding database...");

    for (const book of books) {
      await db.query(
        "INSERT INTO books (title, author, stock) VALUES ($1, $2, $3)",
        [book.title, book.author, book.stock]
      );
    }

    console.log(`Inserted ${books.length} books.`);
    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seed();
