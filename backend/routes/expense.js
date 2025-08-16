const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const sql = `
  Select amount, type, category, transaction_date, note from expense 
  where user_id = ? order by transaction_date DESC limit ? offset ?
  `;

  pool.query(sql, [userId, limit, offset], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ data: results });
  });
});

router.post('/add-expense', (req, res) => {
  const { user_id, amount, type, category, transaction_date, note } = req.body;
  if(!user_id || !amount || !type || !category || !transaction_date){
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const sql = 'Insert into expense (user_id, amount, type, category, transaction_date, note) values (?, ?, ?, ?, ?, ?)';
  pool.query(sql, [user_id, amount, type, category, transaction_date, note], (err) => {
    if(err) return res.status(500).json({ message: 'Database error' });
    res.status(201).json({ message: 'Expense added successfully' });
  });
});

module.exports = router;
