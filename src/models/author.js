const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    birthYear: {
      type: Number,
      required: true
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Author', authorSchema);