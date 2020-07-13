DROP TABLE IF EXISTS books;
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    img_url VARCHAR(255),
    title VARCHAR(255),
    author VARCHAR(255),
    description TEXT,
    isbn TEXT,
    book_shelf VARCHAR(255)
);