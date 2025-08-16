import React, { useState } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Reports(){
  const [analysis, setAnalysis] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryData, setCategoryData] = useState(null);
  const [expenseSavingData, setExpenseSavingData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if(!startDate || !endDate){
      setError('Please select start and end dates');
      return;
    }
    setLoading(true);
    try{
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/reports', {
        params: { analysis, startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      }); 
      setCategoryData(res.data.categoryDistribution);
      setExpenseSavingData(res.data.expenseVsSaving);
      setTimeSeriesData(res.data.timeSeries);
    }
    catch(err){
      setError(err.response?.data?.message || 'Failed to fetch report');
    }
    setLoading(false);
  };

  const getCategoryChartData = () => {
    if(!categoryData) return null;
    return{
      labels: categoryData.map(c => c.category),
      datasets: [{
        data: categoryData.map(c => Number(c.amount) || 0),  // Ensure number
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF7043'],
        hoverOffset: 30
      }]
    };
  };

  const getExpenseSavingChartData = () => {
    if(!expenseSavingData) return null;
    return{
      labels: ['Expenses', 'Savings'],
      datasets: [{
        data: [
          Number(expenseSavingData.expenses) || 0,
          Number(expenseSavingData.savings) || 0
        ],
        backgroundColor: ['#FF6384', '#4CAF50'],
        hoverOffset: 30
      }]
    };
  };

  const getTimeSeriesChartData = () => {
    if(!timeSeriesData) return null;
    return{
      labels: timeSeriesData.map(item => item.label),  // date strings, month names, or years
      datasets: [{
        label: 'Expenses',
        data: timeSeriesData.map(item => Number(item.amount) || 0),
        backgroundColor: '#36A2EB'
      }]
    };
  };

  return(
    <div style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <h2>Reports</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <label>
          Analysis:
          <select value={analysis} onChange={e => setAnalysis(e.target.value)}>
            <option value="day">Per Day</option>
            <option value="month">Per Month</option>
            <option value="year">Per Year</option>
          </select>
        </label>
            
        <label style={{ marginLeft: '20px' }}>
          Start Date:
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>

        <label style={{ marginLeft: '20px' }}>
          End Date:
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>

        <button type="submit" style={{ marginLeft: '20px' }} disabled={loading}>
          {loading ? 'Loading...' : 'Get Report'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {categoryData && (
        <>
          <h3>Expense Distribution by Category</h3>
          <div style={{ width: '400px', height: '400px', margin: 'auto' }}><Pie
            key={JSON.stringify(categoryData)} // force remount on data change to avoid canvas reuse errors
            data={getCategoryChartData()}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  labels: {
                    generateLabels: (chart) => {
                      const data = chart.data;
                      if (!data) return [];
                      return data.labels.map((label, i) => {
                        const amountRaw = data.datasets[0].data[i];
                        const amount = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw);
                        const displayAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount.toFixed(2) : '0.00';
                        return{
                          text: `${label}: ${displayAmount}`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          strokeStyle: '#fff',
                          hidden: false,
                          index: i
                        };
                      });
                    }
                  }
                }
              }
            }}
          />
        </div>
        </>
      )}

      {expenseSavingData && (
        <>
          <h3>Expenses vs Savings</h3>
          <div style={{ width: '400px', height: '400px', margin: 'auto' }}><Pie
            key={JSON.stringify(expenseSavingData)}
            data={getExpenseSavingChartData()}
          />
          </div>
        </>
      )}

      {timeSeriesData && (
        <>
          <h3>Expenses Over Time ({analysis})</h3>
          <div style={{ width: '400px', height: '400px', margin: 'auto' }}><Bar
            key={JSON.stringify(timeSeriesData)}
            data={getTimeSeriesChartData()}
            options={{ scales: { y: { beginAtZero: true }}}}
          />
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
