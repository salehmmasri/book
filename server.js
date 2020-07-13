'use strict';

require('dotenv').config();

const pg = require('pg');

const express = require('express');

const client = new pg.Client(process.env.DATABASE_URL)

const cors = require('cors');



const superagent = require('superagent');

// const { Console } = require('console');
// const { url } = require('inspector');

const server = express();
server.use(cors());

server.set('view engine', 'ejs');


const PORT = process.env.PORT;

server.use(express.static('./public'));
// server.use(express.static('./views'));


server.use(express.json());
server.use(express.urlencoded({ extended: true }));


server.get('/', (req, res) => {
    let SQL = "SELECT * FROM books;";
    client.query(SQL)
        .then((data) => {
            res.render("pages/index", { theBook: data.rows});
        });
});

server.get('/search', (req, res) => {
    res.render('pages/searches/new');
});

server.post('/search', (req, res) => {
    let text = req.body.text;
    let choose = req.body.form1;

    if (choose == 'Author') {
        let url1 = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${text}`

        superagent.get(url1)
            .then(data => {
                // console.log(data.body);
                let books = data.body.items.map(val => {
                    let book = new Book(val);
                    return book;
                })
                console.log(books);
                res.render('pages/searches/show', { booksData: books });
            });
    } else {
        let url2 = `https://www.googleapis.com/books/v1/volumes?q=intitle:${text}`
        superagent.get(url2)
            .then(data => {
                // console.log(data.body);
                let books = data.body.items.map(val => {
                    let book = new Book(val);
                    return book;
                })
                res.render('pages/searches/show', { booksData: books });
            });
    }

});

function Book(book) {
    this.img_url = book.volumeInfo.imageLinks.thumbnail;
    this.title = book.volumeInfo.title;
    this.author = book.volumeInfo.authors;
    this.description = book.volumeInfo.description;
    this.isbn = book.volumeInfo.industryIdentifiers?`ISBN_13${book.volumeInfo.industryIdentifiers[0].identifier}`: "no isbn";
        console.log('this isbn',this.isbn);
        this.bookshelf = book.volumeInfo.categories ?
        book.volumeInfo.categories :"no bookshelf sorry";
}

server.post('/addbook', (req, res) => {
    let {img_url,title,author,description,isbn,book_shelf} = req.body;
    let SQL = `INSERT INTO books(img_url,title,author,description,isbn,book_shelf) VALUES ($1,$2,$3,$4,$5,$6);`;
    let values = [img_url,title,author,description,isbn,book_shelf];
    // console.log(req.body);
    client.query(SQL, values)
        .then(() => {
            res.redirect('/');
        })
})

// server.get('/details',(req,res) =>{
//     SQL = `SELECT * FROM books_info WHERE id = $1;`;

// });

server.get('/books/:id', (req, res) => {
    let SQL = `SELECT * FROM books WHERE id = $1;`;
    let value = [req.params.id];

    client.query(SQL, value)
        .then(result => {
            res.render('pages/books/detail', { book: result.rows[0]});
        })
});

client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`listening on PORT ${PORT}`);
        })
    });
