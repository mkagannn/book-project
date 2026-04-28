const express = require('express');
const Book = require('./book');


const app = express();
app.use(express.json());

let books = [
    new Book(1, 'The Great Gatsby', 'F. Scott Fitzgerald', true),
    new Book(2, 'To Kill a Mockingbird', 'Harper Lee', false),
    new Book(3, '1984', 'George Orwell', true)
];

app.get('/books', (req, res) => {
    res.json(books);
});

app.get('/books/:id', (req, res) => {
    const requestedId = parseInt(req.params.id);
    const book = books.find(b => b.id === requestedId);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
});

app.post('/books', (req, res) => {
    const { title, author, isRead } = req.body;
    const newBook = new Book(books.length + 1, title, author, isRead);
    books.push(newBook);
    res.status(201).json(newBook);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});