const Loan = require('../models/loanStructure');
const Book = require('../models/book');

// POST /loans
const createLoan = async (req, res) => {
  try {
    const {bookId, requestedStartDate, endDate } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const newStart = new Date(requestedStartDate);
    const newEnd = new Date(endDate);

    if (newStart > newEnd) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const overlappingLoan = await Loan.findOne({
      bookId,
      status: { $in: ['Approved', 'Retrieved'] },
      requestedStartDate: { $lte: newEnd },
      endDate: { $gte: newStart }
    });

    if (overlappingLoan) {
      return res.status(400).json({
        message: 'This book is already reserved for this time period. Please choose a different time range.'
      });
    }

    const newLoan = await Loan.create({
      userId,
      bookId,
      requestedStartDate,
      endDate
    });

    res.status(201).json(newLoan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /loans
const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .sort({ createdAt: 1 })
      .populate('bookId')
      .populate('userId');
    res.status(200).json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /loans/:id
const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('bookId').populate('userId');
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.status(200).json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /loans/:id/approve
const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'Requested') {
      return res.status(400).json({ message: `Cannot approve a loan with status "${loan.status}"` });
    }

    const overlappingApprovedLoan = await Loan.findOne({
      _id: { $ne: loan._id },
      bookId: loan.bookId,
      status: { $in: ['Approved', 'Retrieved'] },
      requestedStartDate: { $lte: loan.endDate },
      endDate: { $gte: loan.requestedStartDate }
    });

    if (overlappingApprovedLoan) {
      return res.status(400).json({
        message: 'Another loan for this book has already been approved for an overlapping date range'
      });
    }

    loan.status = 'Approved';
    await loan.save();

    res.status(200).json(loan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /loans/:id/retrieve
const retrieveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'Approved') {
      return res.status(400).json({ message: `Cannot retrieve a loan with status "${loan.status}"` });
    }

    const book = await Book.findById(loan.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.borrowedBy = loan.userId;
    await book.save();

    loan.status = 'Retrieved';
    await loan.save();

    res.status(200).json(loan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /loans/:id/return
const returnLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'Retrieved') {
      return res.status(400).json({ message: `Cannot return a loan with status "${loan.status}"` });
    }

    const book = await Book.findById(loan.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.borrowedBy = null;
    await book.save();

    loan.status = 'Returned';
    await loan.save();

    res.status(200).json(loan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  approveLoan,
  retrieveLoan,
  returnLoan
};