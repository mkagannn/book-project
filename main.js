/*const express = require('express');
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
    const book = books.find(b => b.id === req.params.id*1);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
});

app.post('/books', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 12000));
    const { title, author, isRead } = req.body;
    const newBook = new Book(books.length + 1, title, author, isRead); 
    books.push(newBook);
    await res.status(201).json(newBook);
});


app.put('/books/:id', (req, res) => {
    const book = books.find(b => b.id === req.params.id*1);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    const { title, author, isRead } = req.body;
    if (title === undefined || author === undefined || isRead === undefined) {
        return res.status(400).json({ message: 'All fields (title, author, isRead) must be provided for update' });
    }
    book.title = title;
    book.author = author; 
    book.isRead = isRead;
    res.json(book);
});

app.patch('/books/:id', (req, res) => {
    const book = books.find(b => b.id === req.params.id*1);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    const { title, author, isRead } = req.body;
    if (title !== undefined) {
        book.title = title;
    }
    if (author !== undefined) {
        book.author = author;
    }
    if (isRead !== undefined) {
        book.isRead = isRead;
    }
    res.json(book);
});
app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === req.params.id*1);
    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }
    books.splice(bookIndex, 1);
    res.status(204).send();
});
    
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
*/
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Book = require('./book');

const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://admin:KuQWWyPTmuD3Nbi@cluster0.5kbzau6.mongodb.net/bookdb?appName=Cluster0')
    .then(() => console.log('MongoDB bağlandı!'))
    .catch(err => console.log('Bağlantı hatası:', err));

// GET /books
app.get('/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

// GET /books/:id
app.get('/books/:id', async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
});

// POST /books
app.post('/books', async (req, res) => {
    const { title, author, isRead } = req.body;
    const book = await Book.create({ title, author, isRead });
    res.status(201).json(book);
});

// PUT /books/:id
app.put('/books/:id', async (req, res) => {
    const { title, author, isRead } = req.body;
    if (title === undefined || author === undefined || isRead === undefined) {
        return res.status(400).json({ message: 'All fields required' });
    }
    const book = await Book.findByIdAndUpdate(
        req.params.id,
        { title, author, isRead },
        { new: true }
    );
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
});

// PATCH /books/:id
app.patch('/books/:id', async (req, res) => {
    const book = await Book.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    );
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
});

// DELETE /books/:id
app.delete('/books/:id', async (req, res) => {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(204).send();
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});