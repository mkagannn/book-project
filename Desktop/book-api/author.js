// JavaScript Class Version
/* class Author {
    constructor(id, name, birthYear) {
        this.id = id;
        this.name = name;
        this.birthYear = birthYear;
        this.books = []; // Yazarın kitapları
    }

    // Yazara kitap ekle
    addBook(book) {
        if (!this.books.includes(book)) {
            this.books.push(book);
        }
    }

    // Yazarın tüm kitaplarını getir
    getBooks() {
        return this.books;
    }

    // Yazarın kitap sayısı
    getBookCount() {
        return this.books.length;
    }
}

module.exports = Author;
*/
/* ==================== MONGOOSE SCHEMA VERSION ==================== */

const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    birthYear: { type: Number, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

module.exports = mongoose.model('Author', authorSchema);

