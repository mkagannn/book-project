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
const Author = require('./author');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./user');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB bağlandı!'))
    .catch(err => console.log('Bağlantı hatası:', err));




// Gümrük Memuru (Auth Middleware)
const authenticateToken = (req, res, next) => {
    // 1. İstek başlığından (header) token'ı al
    const authHeader = req.headers['authorization'];
    // Gelen veri genelde "Bearer eyJhb..." şeklindedir. Bize sadece 2. kısım (token) lazım.
    const token = authHeader && authHeader.split(' ')[1]; 

    // 2. Token yoksa kapıdan çevir (401 Yetkisiz)
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token not found or not logged in.' });
    }

    // 3. Token var ama bizim mi? Geçerli mi? (İmza ve süre kontrolü)
    jwt.verify(token, process.env.JWT_SECRET || 'super_gizli_anahtar', (err, decodedData) => {
        if (err) {
            // Token değiştirilmiş veya süresi dolmuşsa 403 (Yasak) döndür
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // 4. Token geçerliyse, içindeki kullanıcı bilgisini (payload) isteğe (req) ekle
        req.user = decodedData;
        
        // 5. Her şey yolunda, bir sonraki işleme (asıl rotaya) geçiş izni ver
        next(); 
    });
};

// GET /authors - tüm yazarları getir
app.get('/authors', async (req, res) => {
    try {
        const authors = await Author.find().populate('books');
        res.json(authors);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});

// GET /authors/:id - tek yazar getir
app.get('/authors/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id).populate('books');
        if (!author) return res.status(404).json({ message: 'Author not found' });
        res.json(author);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});

// GET /authors/:id/books - yazarın kitaplarını getir
app.get('/authors/:id/books', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id).populate('books');
        if (!author) return res.status(404).json({ message: 'Author not found' });
        res.json(author.books);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});

// POST /authors - yeni yazar ekle
app.post('/authors', async (req, res) => {
    try {
        const { name, birthYear } = req.body;
        if (!name || !birthYear) {
            return res.status(400).json({ message: 'name and birthYear are required' });
        }
        const author = await Author.create({ name, birthYear, books: [] });
        res.status(201).json(author);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});

// GET /books - tüm kitapları getir
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find().populate('author');
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});

// GET /books/:id - tek kitap getir
app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author');
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});

// POST /books - yeni kitap ekle
/*app.post('/books', async (req, res) => {
    try {
        const { title, author, isRead } = req.body;
        if (!title || !author) {
            return res.status(400).json({ message: 'title and author (ID) are required' });
        }

        const authorExists = await Author.findById(author);
        if (!authorExists) return res.status(404).json({ message: 'Author not found' });

        const book = await Book.create({ title, author, isRead: isRead || false });

        // Yazarın books listesine ekle
        authorExists.books.push(book._id);
        await authorExists.save();

        const populatedBook = await Book.findById(book._id).populate('author');
        res.status(201).json(populatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});
*/

// POST /books - Yeni kitap ekle (Korumalı Rota)
app.post('/books', authenticateToken, async (req, res) => {
    try {
        const { title, author, isRead } = req.body;
        if (!title || !author) {
            return res.status(400).json({ message: 'title and author (ID) are required' });
        }

        const authorExists = await Author.findById(author);
        if (!authorExists) return res.status(404).json({ message: 'Author not found' });

        // YENİ: Kitabı oluştururken işlemi yapan kullanıcının ID'sini ekliyoruz
        const book = await Book.create({ 
            title, 
            author, 
            isRead: isRead || false,
            userId: req.user.userId // Gümrük memurunun (middleware) bizim için req objesine koyduğu ID
        });

        // Yazarın books listesine ekle
        authorExists.books.push(book._id);
        await authorExists.save();

        const populatedBook = await Book.findById(book._id).populate('author');
        res.status(201).json(populatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Error:', error: error.message });
    }
});

// PUT /books/:id - kitabı güncelle
app.put('/books/:id', authenticateToken, async (req, res) => {
    try {
        const { title, author, isRead } = req.body;
        if (title === undefined || author === undefined || isRead === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, isRead },
            { new: true }
        ).populate('author');
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});

// PATCH /books/:id - kitabı kısmi güncelle
app.patch('/books/:id', async (req, res) => {
    try {
        const { title, isRead } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (isRead !== undefined) updateData.isRead = isRead;

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('author');
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});

// DELETE /books/:id - kitabı sil
/*app.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        // Yazarın listesinden çıkar
        await Author.findByIdAndUpdate(
            book.author,
            { $pull: { books: book._id } }
        );

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Hata:', error: error.message });
    }
});
*/
// DELETE /books/:id - Kitabı sil (Korumalı Rota)
app.delete('/books/:id', authenticateToken, async (req, res) => {
    try {
        // 1. Önce kitabı veritabanından bulalım (Hemen silmiyoruz!)
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        // 2. Güvenlik Kontrolü: İsteği yapan kişi ile kitabı ekleyen kişi aynı mı?
        // MongoDB Object ID'lerini karşılaştırırken güvenli olması için ikisini de String'e çeviririz
        if (book.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized operation: You can only delete books you added.' });
        }

        // 3. Kullanıcı yetkiliyse kitabı sil
        await Book.findByIdAndDelete(req.params.id);

        // 4. Yazarın listesinden çıkar
        await Author.findByIdAndUpdate(
            book.author,
            { $pull: { books: book._id } }
        );

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error:', error: error.message });
    }
});

// POST /register - Yeni kullanıcı kaydı
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Tüm alanların dolu olduğundan emin olalım
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, e-mail and password are required.' });
        }

        // 1. Bu e-posta ile daha önce kayıt olunmuş mu kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'This e-mail address is already in use.' });
        }

        // 2. Şifreyi Hashleme (Bcrypt)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Yeni kullanıcıyı veritabanına kaydetme
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // 4. Başarılı yanıt döndürme (Güvenlik için şifreyi geri döndürmüyoruz)
        res.status(201).json({ 
            message: 'User created successfully.', 
            userId: newUser._id 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error:', error: error.message });
    }
});

// POST /login - Kullanıcı girişi
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // E-posta veya şifre boş mu diye kontrol et
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail and password are required.' });
        }

        // 1. Veritabanında bu e-postaya sahip bir kullanıcı var mı?
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this e-mail address.' });
        }

        // 2. Şifre Doğrulama (Bcrypt ile)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // 3. JWT (Token) Üretimi
        // Not: Gerçek projelerde "super_gizli_anahtar" metni .env dosyasından çekilir.
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || 'super_gizli_anahtar', 
            { expiresIn: '1h' } 
        );

        // 4. Başarılı giriş ve token'ın kullanıcıya gönderilmesi
        res.status(200).json({ 
            message: 'Login successful!', 
            token: token 
        });

    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası:', error: error.message });
    }
});

// SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
});