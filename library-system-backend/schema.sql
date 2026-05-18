-- PostgreSQL Schema for Library Book Borrowing System

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  stock INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'borrowed',
  borrow_date TIMESTAMP DEFAULT NOW(),
  return_date TIMESTAMP NULL
);
