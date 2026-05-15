/*class Book{


    constructor(id, title, author, isRead){
        this.id = id;
        this.title = title;
        this.author = author;
        this.isRead = isRead;
    }
}
module.exports = Book;
*/
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Book', bookSchema);