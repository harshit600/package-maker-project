import React, { useState, useMemo } from 'react';
import './bankReport.css';
import { useBankManagement } from './bankManagementContext';

function BankReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('All');
  const [selectedBank, setSelectedBank] = useState('All Banks');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { bankReport, bankReportLoading, bankReportList } = useBankManagement();

  // Refresh function to clear data and fetch fresh data
  const handleRefresh = async () => {
    try {
      // Clear current data first
      setStartDate('');
      setEndDate('');
      setTransactionType('All');
      setSelectedBank('All Banks');
      
      // Fetch fresh data
      await bankReportList();
    } catch (error) {
      console.error('Error refreshing bank report:', error);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format amount function
  const formatAmount = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle view transaction details
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  // Get unique banks for filter
  const uniqueBanks = bankReport ? [...new Set(bankReport.map(item => item.bankName))] : [];

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    if (!bankReport) return [];

    let filtered = bankReport;

    // Filter by bank
    if (selectedBank !== 'All Banks') {
      filtered = filtered.filter(item => item.bankName === selectedBank);
    }

    // Filter by transaction type
    if (transactionType !== 'All') {
      filtered = filtered.filter(item => item.paymentType === transactionType);
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filtered = filtered.filter(item => {
        if (!item.clearDate) return false;
        const clearDate = new Date(item.clearDate);
        return clearDate >= start && clearDate <= end;
      });
    } else if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(item => {
        if (!item.clearDate) return false;
        const clearDate = new Date(item.clearDate);
        return clearDate >= start;
      });
    } else if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(item => {
        if (!item.clearDate) return false;
        const clearDate = new Date(item.clearDate);
        return clearDate >= end;
      });
    }

    return filtered;
  }, [bankReport, selectedBank, transactionType, startDate, endDate]);

  // Calculate totals for filtered transactions
  const filteredTotals = useMemo(() => {
    if (!filteredTransactions.length) return { in: 0, out: 0, total: 0 };
    
    return filteredTransactions.reduce((acc, transaction) => {
      if (transaction.paymentType === 'in') {
        acc.in += transaction.transactionAmount || 0;
      } else if (transaction.paymentType === 'out') {
        acc.out += transaction.transactionAmount || 0;
      }
      acc.total = acc.in - acc.out;
      return acc;
    }, { in: 0, out: 0, total: 0 });
  }, [filteredTransactions]);

  // Clear all filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setTransactionType('All');
    setSelectedBank('All Banks');
  };

  return (
    <div className="bank-report-container">
      {/* Header */}
  

      {/* Main Title */}
      <div className="main-title">
        <h1>Bank Transaction Report</h1>
        <p>Comprehensive overview of all banking transactions and financial activities</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-left">
          <div className="filter-group">
            <label>Start Date:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="date-range-input"
            />
          </div>
          
          <div className="filter-group">
            <label>End Date:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="date-range-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Transaction Type:</label>
            <select 
              value={transactionType} 
              onChange={(e) => setTransactionType(e.target.value)}
              className="transaction-type-select"
            >
              <option value="All">All Transactions</option>
              <option value="in">Incoming</option>
              <option value="out">Outgoing</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Select Bank:</label>
            <select 
              value={selectedBank} 
              onChange={(e) => setSelectedBank(e.target.value)}
              className="bank-select"
            >
              <option value="All Banks">All Banks</option>
              {uniqueBanks.map((bank, index) => (
                <option key={index} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="filters-right">
          <button 
            onClick={handleRefresh}
            disabled={bankReportLoading}
            className="refresh-btn"
            title="Refresh Bank Report"
          >
            {bankReportLoading ? (
              <span className="refresh-spinner">⟳</span>
            ) : (
              <span>⟳</span>
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-section">
     

        <div className="table-container">
          {bankReportLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="no-data-state">
              <p>No transactions found with the selected filters.</p>
              <button 
                onClick={clearFilters}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '15px'
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Payment Date</th>
                  <th>Received Date</th>
                  <th>Payment by</th>
                  <th>Payment To</th>
                  <th>Through Bank</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Balance</th>
                  <th>Gateway Charge</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction._id} className={index === 0 ? 'highlighted-row' : ''}>
                    <td>{formatDate(transaction.createdAt)}</td>
                    <td>{formatDate(transaction.clearDate)}</td>
                    <td className="payment-by-cell">
                      <div className="payment-by-info">
                        <div className="payer-name">{transaction.leadName}</div>
                        <div className="reference-numbers">
                          <span className="reference-number new-reference">
                            {transaction.transactionId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>Company</td>
                    <td>{transaction.bankName}</td>
                    <td className="amount-in">
                      {transaction.paymentType === 'in' ? formatAmount(transaction.transactionAmount) : '-'}
                    </td>
                    <td className="amount-out">
                      {transaction.paymentType === 'out' ? formatAmount(transaction.transactionAmount) : '-'}
                    </td>
                    <td className="balance">
                      {formatAmount(transaction.bankTotalsAtTransaction?.totalamount || 0)}
                    </td>
                    <td>₹0.00</td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => handleViewTransaction(transaction)}
                        title="View Details"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="transaction-details">
                <div className="detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{selectedTransaction.transactionId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Lead Name:</span>
                  <span className="detail-value">{selectedTransaction.leadName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Bank Name:</span>
                  <span className="detail-value">{selectedTransaction.bankName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account Number:</span>
                  <span className="detail-value">{selectedTransaction.accountNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Mode:</span>
                  <span className="detail-value">{selectedTransaction.paymentMode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Type:</span>
                  <span className="detail-value">
                    <span className={`payment-type ${selectedTransaction.paymentType}`}>
                      {selectedTransaction.paymentType === 'in' ? 'Incoming' : 'Outgoing'}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value amount">
                    {formatAmount(selectedTransaction.transactionAmount)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedTransaction.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created Date:</span>
                  <span className="detail-value">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Clear Date:</span>
                  <span className="detail-value">{formatDate(selectedTransaction.clearDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Bank Totals:</span>
                  <div className="bank-totals">
                    <div className="total-item">
                      <span>In: </span>
                      <span className="amount-in">{formatAmount(selectedTransaction.bankTotalsAtTransaction?.in || 0)}</span>
                    </div>
                    <div className="total-item">
                      <span>Out: </span>
                      <span className="amount-out">{formatAmount(selectedTransaction.bankTotalsAtTransaction?.out || 0)}</span>
                    </div>
                    <div className="total-item">
                      <span>Total: </span>
                      <span className="balance">{formatAmount(selectedTransaction.bankTotalsAtTransaction?.totalamount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BankReport;