const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const {authenticateUser, adminMiddleware } = require('../middleware/authorization');

router.post('/', authenticateUser, loanController.createLoan);
router.get('/', authenticateUser, adminMiddleware, loanController.getAllLoans);
router.get('/:id', authenticateUser, loanController.getLoanById);
router.put('/:id/approve', authenticateUser, adminMiddleware, loanController.approveLoan);
router.put('/:id/retrieve', authenticateUser, adminMiddleware, loanController.retrieveLoan);
router.put('/:id/return', authenticateUser, adminMiddleware, loanController.returnLoan);

module.exports = router;