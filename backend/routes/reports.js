const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if(err) return res.sendStatus(403);
    req.user = user;  // contains id and username
    next();
  });
}

router.get('/', authenticateToken, (req, res) => {
  const { analysis, startDate, endDate } = req.query;
  const userId = req.user.id;
  if (!analysis || !startDate || !endDate){
    return res.status(400).json({ message: 'Missing query parameters' });
  }
  if (!['day', 'month', 'year'].includes(analysis)){
    return res.status(400).json({ message: 'Invalid analysis parameter' });
  }

  const categorySql = `
    Select category, Sum(amount) as amount from expense 
    where user_id = ? and transaction_date between ? and ? and type='debited' group by category
  `;

  const totalsSql = `
    Select Sum(Case When type = 'debited' Then amount Else 0 End) as expenses, Sum(Case When type = 'credited' Then amount Else 0 End) as savings
    from expense where user_id = ? and transaction_date between ? AND ?
  `;

  let timeSeriesSql = '';
  if(analysis === 'day'){
    timeSeriesSql = `
      Select Date(transaction_date) as label, Sum(amount) as amount from expense
      where user_id = ? and transaction_date between ? and ? and type='debited'
      group by Date(transaction_date) order by Date(transaction_date)
    `;
  } 
  else if(analysis === 'month'){
    timeSeriesSql = `
      Select DATE_FORMAT(transaction_date, '%Y-%m') as label, Sum(amount) as amount
      from expense where user_id = ? and transaction_date between ? and ? and type='debited'
      group by label order by label `;
  } 
  else if(analysis === 'year'){
    timeSeriesSql = `
      Select year(transaction_date) as label, Sum(amount) as amount from expense
      where user_id = ? and transaction_date between ? and ? and type='debited'
      group by label order by label
    `;
  }

  pool.getConnection((err, connection) => {
    if(err) return res.status(500).json({ message: 'DB connection error' });
    Promise.all([
      new Promise((resolve, reject) => {
        connection.query(categorySql, [userId, startDate, endDate], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        connection.query(totalsSql, [userId, startDate, endDate], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      }),
      new Promise((resolve, reject) => {
        connection.query(timeSeriesSql, [userId, startDate, endDate], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
    ])
    .then(([categoryDistribution, totals, timeSeries]) => {
    connection.release();
    res.json({
    categoryDistribution,
    expenseVsSaving: {
      expenses: totals.expenses || 0,
      savings: (totals.savings || 0) - (totals.expenses || 0),
    },
    timeSeries,
  });
})
    .catch(error => {
      connection.release();
      res.status(500).json({ message: 'Database query error' });
    });
  });
});

module.exports = router;
