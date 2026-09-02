const Author = require('../models/author');

// GET /authors
const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find().populate('books');
    res.status(200).json(authors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /authors/:id
const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id).populate('books');
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.status(200).json(author);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /authors
const createAuthor = async (req, res) => {
  try {
    const { name, birthYear } = req.body;

    const newAuthor = await Author.create({ name, birthYear });

    res.status(201).json(newAuthor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /authors/:id
const updateAuthor = async (req, res) => {
  try {
    const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedAuthor) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.status(200).json(updatedAuthor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /authors/:id
const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    if (author.books.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete an author who still has books. Delete or reassign their books first.'
      });
    }

    await Author.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Author deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
};