const express = require('express');
const path = require('path');
const bookRoutes = require('./routes/bookRoutes');
const authorRoutes = require('./routes/authorRoutes');
const loanRoutes = require('./routes/loanRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());

// public klasörünü statik olarak sun
// localhost:3000/auth.html → public/auth.html
app.use(express.static(path.join(__dirname, '../public')));

app.use('/books', bookRoutes);
app.use('/authors', authorRoutes);
app.use('/loans', loanRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Library API is running' });
});

module.exports = app;