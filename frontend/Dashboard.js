import './Dashboard.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard(){
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
      return;
    }
    setUsername(user.username);
    setUserId(user.id);
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/api/expense/${userId}?page=${page}`).then(res => {
        const data = res.data.data;
        setExpenses(data);
        setHasData(data.length > 0);
      }).catch(() => {
        setExpenses([]);
        setHasData(false);
        alert('Failed to load expenses');
      });
  }, [userId, page]);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const nextPage = () => setPage(page + 1);
  const prevPage = () => setPage(page > 1 ? page - 1 : 1);

  return(
    <div>
      {/* Navbar Section */}
      <div className="navbar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #ccc'
      }}>
        <span style={{ fontWeight: 'bold' }}>Welcome {username}</span>
        <div>
          <button onClick={() => navigate('/add-expense')} style={{ marginRight: '10px' }}>Add Expense</button>
          <button onClick={() => navigate('/reports')} style={{ marginRight: '10px' }}>Reports</button>
          <button onClick={() => navigate('/goals')} style={{ marginRight: '10px' }}>Goals</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '30px 20px' }}>
        <h2>Transactions</h2>
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Date</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {hasData ? (
              expenses.map((exp, index) => (
                <tr key={index}>
                  <td>{exp.amount}</td>
                  <td>{exp.type}</td>
                  <td>{exp.category}</td>
                  <td>{new Date(exp.transaction_date).toLocaleDateString()}</td>
                  <td>{exp.note}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No information available.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={prevPage} disabled={page === 1}>← Previous</button>
            <span style={{ margin: '0 10px' }}>Page {page}</span>
            <button onClick={nextPage} disabled={expenses.length < 10}>Next →</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
