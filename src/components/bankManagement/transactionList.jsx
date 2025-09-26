import React, { useState } from 'react'
import { useBankManagement } from './bankManagementContext'

const TransactionList = () => {
  const { transactionList, transactionListLoading, updateBankTransaction, transactionLists } = useBankManagement();
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [updatingTransactions, setUpdatingTransactions] = useState({});
  const [refreshing, setRefreshing] = useState(false);
console.log(transactionList);
  // Toggle accordion state for a specific transaction
  const toggleTransactionExpansion = (transactionId) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  // Check if a transaction is expanded
  const isTransactionExpanded = (transactionId) => {
    return expandedTransactions[transactionId];
  };

  // Handle refresh transactions
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await transactionLists();
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle accept transaction
  const handleAcceptTransaction = async (transactionId) => {
    setUpdatingTransactions(prev => ({ ...prev, [transactionId]: true }));
    
    try {
      const currentDate = new Date().toISOString();
      const transaction = transactionList.find(t => t._id === transactionId);
      
      console.log('Transaction found:', transaction);
      console.log('Is dual bank transaction:', transaction?.isDualBankTransaction);
      console.log('toBank:', transaction?.toBank);
      console.log('toBankPaymentType:', transaction?.toBankPaymentType);
      
      // Prepare update payload
      const updatePayload = {
        accept: true,
        clearDate: currentDate
      };
      
      // For dual bank transactions, include required fields
      if (transaction?.isDualBankTransaction) {
        updatePayload.toBank = transaction.toBank?._id || transaction.toBank;
        updatePayload.toBankPaymentType = transaction.toBankPaymentType;
        // Include additional fields that might be required
        updatePayload.toBankName = transaction.toBank?.bankName || transaction.toBankName;
        updatePayload.toAccountNumber = transaction.toAccountNumber;
        updatePayload.isDualBankTransaction = transaction.isDualBankTransaction;
        console.log('Added dual bank fields:', {
          toBank: updatePayload.toBank,
          toBankPaymentType: updatePayload.toBankPaymentType,
          toBankName: updatePayload.toBankName,
          toAccountNumber: updatePayload.toAccountNumber,
          isDualBankTransaction: updatePayload.isDualBankTransaction
        });
      }
      
      console.log('Final update payload:', updatePayload);
      
      await updateBankTransaction(transactionId, updatePayload);
    } catch (error) {
      console.error('Error accepting transaction:', error);
      alert('Failed to accept transaction. Please try again.');
    } finally {
      setUpdatingTransactions(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  // Handle reject transaction
  const handleRejectTransaction = async (transactionId) => {
    setUpdatingTransactions(prev => ({ ...prev, [transactionId]: true }));
    
    try {
      const transaction = transactionList.find(t => t._id === transactionId);
      
      // Prepare update payload
      const updatePayload = {
        accept: false,
        clearDate: null
      };
      
      // For dual bank transactions, include required fields
      if (transaction?.isDualBankTransaction) {
        updatePayload.toBank = transaction.toBank?._id || transaction.toBank;
        updatePayload.toBankPaymentType = transaction.toBankPaymentType;
        // Include additional fields that might be required
        updatePayload.toBankName = transaction.toBank?.bankName || transaction.toBankName;
        updatePayload.toAccountNumber = transaction.toAccountNumber;
        updatePayload.isDualBankTransaction = transaction.isDualBankTransaction;
      }
      
      await updateBankTransaction(transactionId, updatePayload);
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Failed to reject transaction. Please try again.');
    } finally {
      setUpdatingTransactions(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format amount with currency
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get status color based on payment type
  const getStatusColor = (paymentType) => {
    return paymentType?.toLowerCase() === 'in' ? 'text-green-600' : 'text-red-600';
  };

  // Get status badge
  const getStatusBadge = (paymentType) => {
    const isCredit = paymentType?.toLowerCase() === 'in';
    const color = isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {isCredit ? 'Credit' : 'Debit'}
      </span>
    );
  };

  if (transactionListLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transactionList || transactionList.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 text-lg">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Transaction List</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total Transactions: {transactionList.length}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {transactionList.map((transaction) => {
        const isExpanded = isTransactionExpanded(transaction._id);
        const isUpdating = updatingTransactions[transaction._id];
        
        return (
          <div key={transaction._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Transaction Header - Clickable Accordion Header */}
            <div 
              className="px-6 py-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleTransactionExpansion(transaction._id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {transaction.leadName || 'Unnamed Lead'}
                    </h3>
                    {getStatusBadge(transaction.paymentType)}
                    {/* Dual Bank Transaction Badge */}
                    {transaction.isDualBankTransaction && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Dual Bank
                      </span>
                    )}
                    {/* Status Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.accept === true ? 'bg-green-100 text-green-800' : 
                      transaction.accept === false ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.accept === true ? 'Accepted' : 
                       transaction.accept === false ? 'Rejected' : 
                       'Pending'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Transaction ID: {transaction.transactionId}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getStatusColor(transaction.paymentType)}`}>
                      {transaction.paymentType?.toLowerCase() === 'in' ? '+' : '-'}{formatAmount(transaction.transactionAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.transactionDate)}
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Content - Transaction Details */}
            {isExpanded && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Lead Information</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lead Name:</span>
                          <span className="font-medium">{transaction.leadName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lead ID:</span>
                          <span className="font-medium font-mono text-sm">{transaction.leadId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Transaction Details</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium font-mono">{transaction.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className={`font-bold ${getStatusColor(transaction.paymentType)}`}>
                            {formatAmount(transaction.transactionAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Type:</span>
                          <span className="font-medium">{transaction.paymentType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Mode:</span>
                          <span className="font-medium capitalize">{transaction.paymentMode?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {transaction.isDualBankTransaction ? 'From Bank Information' : 'Bank Information'}
                      </h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bank Name:</span>
                          <span className="font-medium">{transaction.bank?.bankName || transaction.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Number:</span>
                          <span className="font-medium font-mono">{transaction.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">To Account:</span>
                          <span className="font-medium">{transaction.toAccount || transaction.toAccountNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dual Bank Transaction - To Bank Information */}
                    {transaction.isDualBankTransaction && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">To Bank Information</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bank Name:</span>
                            <span className="font-medium">{transaction.toBank?.bankName || transaction.toBankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Number:</span>
                            <span className="font-medium font-mono">{transaction.toAccountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Type:</span>
                            <span className={`font-medium ${getStatusColor(transaction.toBankPaymentType)}`}>
                              {transaction.toBankPaymentType?.toLowerCase() === 'in' ? 'Credit' : 'Debit'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Timestamps</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction Date:</span>
                          <span className="font-medium">{formatDate(transaction.transactionDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{formatDate(transaction.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Updated:</span>
                          <span className="font-medium">{formatDate(transaction.updatedAt)}</span>
                        </div>
                        {transaction.clearDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cleared Date:</span>
                            <span className="font-medium text-green-600">{formatDate(transaction.clearDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                {transaction.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {transaction.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        transaction.accept === true ? 'bg-green-100 text-green-800' : 
                        transaction.accept === false ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.accept === true ? 'Accepted' : 
                         transaction.accept === false ? 'Rejected' : 
                         'Pending'}
                      </span>
                    </div>
                    
                    {/* Action Buttons - Only show when accept field is not true or false */}
                    {transaction.accept !== true && transaction.accept !== false && (
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptTransaction(transaction._id);
                          }}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Accepting...
                            </>
                          ) : (
                            'Accept'
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectTransaction(transaction._id);
                          }}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Rejecting...
                            </>
                          ) : (
                            'Reject'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2">
                    ID: {transaction._id}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;