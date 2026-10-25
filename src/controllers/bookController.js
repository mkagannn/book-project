const Book = require('../models/book');
const Author = require('../models/author');
const Loan = require('../models/loanStructure');

// GET /books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('author').lean();
    
    // Find active loans for today (including overdue ones)
    const today = new Date();
    const activeLoans = await Loan.find({
      status: 'Approved',
      requestedStartDate: { $lte: today }
    }).select('bookId userId');

    const activeLoanMap = {};
    activeLoans.forEach(loan => {
      activeLoanMap[loan.bookId.toString()] = loan.userId;
    });

    const enrichedBooks = books.map(book => ({
      ...book,
      borrowedBy: activeLoanMap[book._id.toString()] || null
    }));

    res.status(200).json(enrichedBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').lean();
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const today = new Date();
    const activeLoan = await Loan.findOne({
      bookId: book._id,
      status: 'Approved',
      requestedStartDate: { $lte: today }
    }).select('userId');

    book.borrowedBy = activeLoan ? activeLoan.userId : null;

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /books/:id/availability
const getBookAvailability = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const today = new Date();

    const occupiedLoans = await Loan.find({
      bookId: req.params.id,
      status: 'Approved'
    })
      .select('requestedStartDate endDate status -_id')
      .sort({ requestedStartDate: 1 });

    const availability = occupiedLoans.map((loan) => ({
      requestedStartDate: loan.requestedStartDate,
      endDate: loan.endDate,
      status: loan.status,
      overdue: loan.endDate < today
    }));

    // If there is ANY approved loan that started today or in the past, the physical book is still out.
    const isBorrowedToday = occupiedLoans.some(loan => 
      new Date(loan.requestedStartDate) <= today
    );

    res.status(200).json({
      bookId: book._id,
      title: book.title,
      currentlyBorrowed: isBorrowedToday,
      occupiedDateRanges: availability
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /books
const createBook = async (req, res) => {
  try {
    const { title, author } = req.body;

    const authorExists = await Author.findById(author);
    if (!authorExists) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const newBook = await Book.create({ title, author });

    authorExists.books.push(newBook._id);
    await authorExists.save();

    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /books/:id
const updateBook = async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /books/:id
const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await Author.findByIdAndUpdate(deletedBook.author, {
      $pull: { books: deletedBook._id }
    });

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  getBookAvailability,
  createBook,
  updateBook,
  deleteBook
};