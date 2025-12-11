import React, { useState } from 'react'
import { useBankManagement } from './bankManagementContext'
import { useFinalcosting } from '../../context/FinalcostingContext'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";
import { toast } from "react-toastify";

const TransactionList = () => {
  const {getLeadById,transactionDetail,transactionDetailLoading, transactionList, transactionListLoading, updateBankTransaction, transactionLists, bankReport, bankReportLoading, bankReportList } = useBankManagement();
  console.log(transactionDetail,"transactiodfsfdsfdsnDetail")
  const { banks, banksLoading } = useFinalcosting();
  const [editingTransactions, setEditingTransactions] = useState({});
  const [editedData, setEditedData] = useState({});
  const [updatingTransactions, setUpdatingTransactions] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [viewDetailTransaction, setViewDetailTransaction] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPreviousTransactionsModalOpen, setIsPreviousTransactionsModalOpen] = useState(false);
  const [previousTransactions, setPreviousTransactions] = useState([]);
  const [loadingPreviousTransactions, setLoadingPreviousTransactions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  console.log(transactionList);
  console.log(bankReport);

  // Handle refresh transactions
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'pending') {
        await transactionLists();
      } else {
        await bankReportList();
      }
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to handle image upload to Firebase
  const handleImageUpload = async (file) => {
    if (!file) return null;

    try {
      setUploadingImage(true);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, `payment-receipts/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            setUploadingImage(false);
            toast.error("Image upload failed: " + error.message);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setUploadingImage(false);
              resolve(downloadURL);
            });
          }
        );
      });
    } catch (error) {
      setUploadingImage(false);
      toast.error("Failed to upload image");
      return null;
    }
  };

  // Function to fetch previous transactions for a lead
  const fetchPreviousTransactions = async (leadId) => {
    if (!leadId) return;
    
    setLoadingPreviousTransactions(true);
    try {
      await getLeadById(leadId);
      // The transactionDetail will contain the previous transactions
      if (transactionDetail && transactionDetail) {
        const ok = transactionDetail.filter(item => item.accept === true);
        console.log(ok,"ok")
        setPreviousTransactions(ok);
        setIsPreviousTransactionsModalOpen(true);
      } else {
        toast.info("No previous transactions found for this lead");
      }
    } catch (error) {
      console.error('Error fetching previous transactions:', error);
      toast.error("Failed to fetch previous transactions");
    } finally {
      setLoadingPreviousTransactions(false);
    }
  };

  // Start editing a transaction
  const startEditing = (transaction) => {
    setEditingTransactions(prev => ({
      ...prev,
      [transaction._id]: true
    }));
    
    // Initialize edited data with current transaction values
    setEditedData(prev => ({
      ...prev,
      [transaction._id]: {
        leadName: transaction.leadName || '',

        paymentMode: transaction.paymentMode || '',
        paymentType: transaction.paymentType || '',
        operationId: transaction.operationId || '',
        transactionAmount: transaction.transactionAmount || '',
        transactionId: transaction.transactionId || '',
        transactionDate: transaction.transactionDate ? new Date(transaction.transactionDate).toISOString().split('T')[0] : '',
        toAccount: transaction.toAccount || '',
        bankId: transaction.bank?._id || '',
        bankName: transaction.bank?.bankName || transaction.bankName || '',
        accountNumber: transaction.accountNumber || '',
        description: transaction.description || '',
        clearDate: transaction.clearDate ? new Date(transaction.clearDate).toISOString().split('T')[0] : '',
        utrNumber: transaction.utrNumber || '',
        image: transaction.image || '',
        // Dual bank fields
        isDualBankTransaction: transaction.isDualBankTransaction || false,
        toBankId: transaction.toBank?._id || '',
        toBankName: transaction.toBank?.bankName || transaction.toBankName || '',
        toAccountNumber: transaction.toAccountNumber || '',
        toBankPaymentType: transaction.toBankPaymentType || 'IN',
      }
    }));
  };

  // Cancel editing
  const cancelEditing = (transactionId) => {
    setEditingTransactions(prev => ({
      ...prev,
      [transactionId]: false
    }));
    setEditedData(prev => {
      const newData = { ...prev };
      delete newData[transactionId];
      return newData;
    });
  };

  // Update edited field
  const updateField = (transactionId, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        [field]: value
      }
    }));
  };

  // Save edited transaction
  const saveTransaction = async (transactionId) => {
    setUpdatingTransactions(prev => ({ ...prev, [transactionId]: true }));
    
    try {
      const transaction = transactionList.find(t => t._id === transactionId);
      const updatedFields = editedData[transactionId];
      
      // Find selected bank details
      const selectedBank = banks.find(b => b._id === updatedFields.bankId);
      
      const updatePayload = {
        leadName: updatedFields.leadName,
        paymentMode: updatedFields.paymentMode,
        paymentType: updatedFields.paymentType,
        transactionAmount: parseFloat(updatedFields.transactionAmount),
        transactionId: updatedFields.transactionId,
        transactionDate: updatedFields.transactionDate,
        operationId: updatedFields.operationId,
        toAccount: updatedFields.toAccount,
        description: updatedFields.description,
        utrNumber: updatedFields.utrNumber,
        image: updatedFields.image,
      };

      // Add bank details if bank is selected
      if (selectedBank) {
        updatePayload.bank = {
          id: selectedBank._id,
          bankName: selectedBank.bankName,
          accountNumber: selectedBank.accountNumber,
        };
        updatePayload.bankName = selectedBank.bankName;
        updatePayload.accountNumber = selectedBank.accountNumber;
      }

      // Add clearDate if it exists
      if (updatedFields.clearDate) {
        updatePayload.clearDate = updatedFields.clearDate;
      }

      // For dual bank transactions, include required fields
      if (transaction.isDualBankTransaction || updatedFields.isDualBankTransaction) {
        updatePayload.isDualBankTransaction = true;
        
        // If transaction already has toBank (existing dual bank), use original values
        if (transaction.isDualBankTransaction && transaction.toBank) {
          updatePayload.toBank = transaction.toBank._id || transaction.toBank;
          updatePayload.toBankName = transaction.toBank.bankName || transaction.toBankName;
          updatePayload.toAccountNumber = transaction.toAccountNumber;
          updatePayload.toBankPaymentType = transaction.toBankPaymentType;
        } else {
          // Otherwise, use newly selected bank
          const selectedToBank = banks.find(b => b._id === updatedFields.toBankId);
          
          if (selectedToBank) {
            updatePayload.toBank = selectedToBank._id;
            updatePayload.toBankName = selectedToBank.bankName;
            updatePayload.toAccountNumber = selectedToBank.accountNumber;
            updatePayload.toBankPaymentType = updatedFields.toBankPaymentType;
          }
        }
      }
      
      await updateBankTransaction(transactionId, updatePayload);
      
      // Exit editing mode
      cancelEditing(transactionId);
      
      // Show success message
      alert('Transaction updated successfully!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    } finally {
      setUpdatingTransactions(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  // Handle accept transaction
  const handleAcceptTransaction = async (transactionId) => {
    setUpdatingTransactions(prev => ({ ...prev, [transactionId]: true }));
    
    try {
      const currentDate = new Date().toISOString();
      const transaction = transactionList.find(t => t._id === transactionId);
      
      // Prepare update payload
      const updatePayload = {
        accept: true,
        clearDate: currentDate
      };
      
      // For dual bank transactions, include required fields
      if (transaction?.isDualBankTransaction) {
        updatePayload.toBank = transaction.toBank?._id || transaction.toBank;
        updatePayload.toBankPaymentType = transaction.toBankPaymentType;
        updatePayload.toBankName = transaction.toBank?.bankName || transaction.toBankName;
        updatePayload.toAccountNumber = transaction.toAccountNumber;
        updatePayload.isDualBankTransaction = transaction.isDualBankTransaction;
      }
      
      await updateBankTransaction(transactionId, updatePayload);
      alert('Transaction accepted successfully!');
    } catch (error) {
      console.error('Error accepting transaction:', error);
      alert('Failed to accept transaction. Please try again.');
    } finally {
      setUpdatingTransactions(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  // Handle reject transaction - Delete transaction using DELETE API
  const handleRejectTransaction = async (transactionId) => {
    setUpdatingTransactions(prev => ({ ...prev, [transactionId]: true }));
    
    try {
      const config = {
        API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
      };
      
      const response = await fetch(
        `${config.API_HOST}/api/banktransactions/delete/${transactionId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Failed to delete transaction (${response.status})`);
      }

      alert('Transaction deleted successfully!');
      
      // Refresh the appropriate transaction list based on active tab
      if (activeTab === 'pending') {
        await transactionLists();
      } else {
        await bankReportList();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
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

  // Check if transaction is being edited
  const isEditing = (transactionId) => {
    return editingTransactions[transactionId];
  };

  // Get edited value or current value
  const getValue = (transactionId, field, currentValue) => {
    if (isEditing(transactionId) && editedData[transactionId]) {
      return editedData[transactionId][field];
    }
    return currentValue;
  };

  // Get current data based on active tab
  const rawCurrentData = activeTab === 'pending' ? transactionList : bankReport;
  const currentLoading = activeTab === 'pending' ? transactionListLoading : bankReportLoading;

  // Filter data based on search query (by lead name)
  const currentData = rawCurrentData?.filter(transaction => {
    if (!searchQuery.trim()) return true;
    const leadName = transaction.leadName || '';
    return leadName.toLowerCase().includes(searchQuery.toLowerCase().trim());
  }) || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
            <p className="text-gray-600 mt-1">View and manage all payment transactions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Total Transactions: </span>
              <span className="text-lg font-bold text-blue-600">{currentData?.length || 0}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
          >
            {refreshing ? (
              <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md p-1 inline-flex gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-md font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pending Transactions
            {transactionList && transactionList.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'pending' ? 'bg-white text-yellow-600' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {transactionList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 rounded-md font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed Transactions
            {bankReport && bankReport.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'completed' ? 'bg-white text-green-600' : 'bg-green-100 text-green-800'
              }`}>
                {bankReport.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by lead name in ${activeTab === 'pending' ? 'pending' : 'completed'} transactions...`}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {currentData.length} result{currentData.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {currentLoading && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading transactions...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentLoading && (!currentData || currentData.length === 0) && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-gray-500 text-lg">
              {searchQuery 
                ? `No ${activeTab === 'pending' ? 'pending' : 'completed'} transactions found matching "${searchQuery}"`
                : `No ${activeTab === 'pending' ? 'pending' : 'completed'} transactions found`
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {!currentLoading && currentData && currentData.length > 0 && (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Lead Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">UTR Number</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Mode</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"> Bank</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">To Bank</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Transaction Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((transaction, index) => {
                const editing = isEditing(transaction._id);
        const isUpdating = updatingTransactions[transaction._id];
        
        return (
                  <tr key={transaction._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors ${editing ? 'ring-2 ring-blue-400' : ''}`}>
                    {/* Lead Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <input
                          type="text"
                          value={getValue(transaction._id, 'leadName', transaction.leadName || '')}
                          onChange={(e) => updateField(transaction._id, 'leadName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:w-48 hover:h-10 transition-all duration-300 ease-in-out"
                          placeholder="Lead Name"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 hover:bg-blue-50 hover:px-2 hover:py-1 hover:rounded-md transition-all duration-200 cursor-pointer">{transaction.leadName || 'N/A'}</div>
                      )}
                    </td>

                    {/* Transaction ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <input
                          type="text"
                          value={getValue(transaction._id, 'transactionId', transaction.transactionId || '')}
                          onChange={(e) => updateField(transaction._id, 'transactionId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm hover:w-48 hover:h-10 transition-all duration-300 ease-in-out"
                          placeholder="TXN ID"
                        />
                      ) : (
                        <div className="text-sm font-mono text-gray-700 hover:bg-blue-50 hover:px-2 hover:py-1 hover:rounded-md transition-all duration-200 cursor-pointer">{transaction.transactionId || 'N/A'}</div>
                      )}
                    </td>

                    {/* UTR Number */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <input
                          type="text"
                          value={getValue(transaction._id, 'utrNumber', transaction.utrNumber || '')}
                          onChange={(e) => updateField(transaction._id, 'utrNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm hover:w-48 hover:h-10 transition-all duration-300 ease-in-out"
                          placeholder="UTR Number"
                        />
                      ) : (
                        <div className="text-sm font-mono text-gray-700 hover:bg-blue-50 hover:px-2 hover:py-1 hover:rounded-md transition-all duration-200 cursor-pointer">{transaction.utrNumber || 'N/A'}</div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <input
                          type="number"
                          value={getValue(transaction._id, 'transactionAmount', transaction.transactionAmount || '')}
                          onChange={(e) => updateField(transaction._id, 'transactionAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:w-48 hover:h-10 transition-all duration-300 ease-in-out"
                          placeholder="Amount"
                        />
                      ) : (
                        <div className={`text-sm font-bold hover:bg-blue-50 hover:px-2 hover:py-1 hover:rounded-md transition-all duration-200 cursor-pointer ${transaction.paymentType?.toLowerCase() === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.paymentType?.toLowerCase() === 'in' ? '+' : '-'}{formatAmount(transaction.transactionAmount)}
                        </div>
                      )}
                    </td>

                    {/* Payment Mode */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <select
                          value={getValue(transaction._id, 'paymentMode', transaction.paymentMode || '')}
                          onChange={(e) => updateField(transaction._id, 'paymentMode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:w-48 hover:h-10 transition-all duration-300 ease-in-out"
                        >
                          <option value="">Select Mode</option>
                          <option value="gpay">GPay</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize hover:bg-blue-100 hover:px-4 hover:py-2 transition-all duration-200 cursor-pointer">
                          {transaction.paymentMode?.replace('_', ' ') || 'N/A'}
                          </span>
                      )}
                    </td>

                    {/* Payment Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <select
                          value={getValue(transaction._id, 'paymentType', transaction.paymentType || '')}
                          onChange={(e) => updateField(transaction._id, 'paymentType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:w-48 hover:h-10 transition-all duration-300 ease-in-out"
                        >
                          <option value="">Select Type</option>
                          <option value="IN">IN (Credit)</option>
                          <option value="OUT">OUT (Debit)</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full hover:px-4 hover:py-2 transition-all duration-200 cursor-pointer ${transaction.paymentType?.toLowerCase() === 'in' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                          {transaction.paymentType?.toLowerCase() === 'in' ? 'Credit' : 'Debit'}
                        </span>
                      )}
                    </td>

                    {/* From Bank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <div className="space-y-2">
                          <select
                            value={getValue(transaction._id, 'bankId', transaction.bank?._id || '')}
                            onChange={(e) => {
                              const selectedBank = banks.find(b => b._id === e.target.value);
                              updateField(transaction._id, 'bankId', e.target.value);
                              if (selectedBank) {
                                updateField(transaction._id, 'bankName', selectedBank.bankName);
                                updateField(transaction._id, 'accountNumber', selectedBank.accountNumber);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select Bank</option>
                            {banksLoading ? (
                              <option disabled>Loading banks...</option>
                            ) : (
                              Array.isArray(banks) && banks.map((bank) => (
                                <option key={bank._id} value={bank._id}>
                                  {bank.bankName} - {bank.accountNumber}
                                </option>
                              ))
                            )}
                          </select>
                          {/* Checkbox for dual bank transaction */}
                          <label className="flex items-center gap-2 text-xs text-gray-600">
                            <input
                              type="checkbox"
                              checked={getValue(transaction._id, 'isDualBankTransaction', transaction.isDualBankTransaction || false)}
                              onChange={(e) => updateField(transaction._id, 'isDualBankTransaction', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Dual Bank Transaction
                          </label>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{transaction.bank?.bankName || transaction.bankName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{transaction.accountNumber || 'N/A'}</div>
                          {transaction.isDualBankTransaction && (
                            <span className="inline-flex mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                              Dual Bank
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* To Bank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <>
                          {/* If original transaction already has isDualBankTransaction and toBank, show it as read-only */}
                          {transaction.isDualBankTransaction && transaction.toBank ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 bg-gray-100 px-3 py-2 rounded-md border border-gray-300">
                                {transaction.toBank?.bankName || transaction.toBankName || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 px-3">
                                {transaction.toAccountNumber || 'N/A'}
                              </div>
                              <span className={`inline-flex mt-2 px-2 py-0.5 text-xs rounded-full ${transaction.toBankPaymentType?.toLowerCase() === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {transaction.toBankPaymentType?.toLowerCase() === 'in' ? 'Credit' : 'Debit'}
                              </span>
                              <div className="text-xs text-blue-600 mt-2 italic">✓ Dual Bank (Already Set)</div>
                            </div>
                          ) : getValue(transaction._id, 'isDualBankTransaction', transaction.isDualBankTransaction || false) ? (
                            <div className="space-y-2">
                              <select
                                value={getValue(transaction._id, 'toBankId', transaction.toBank?._id || '')}
                                onChange={(e) => {
                                  const selectedBank = banks.find(b => b._id === e.target.value);
                                  updateField(transaction._id, 'toBankId', e.target.value);
                                  if (selectedBank) {
                                    updateField(transaction._id, 'toBankName', selectedBank.bankName);
                                    updateField(transaction._id, 'toAccountNumber', selectedBank.accountNumber);
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                <option value="">Select To Bank</option>
                                {banksLoading ? (
                                  <option disabled>Loading banks...</option>
                                ) : (
                                  Array.isArray(banks) && banks.map((bank) => (
                                    <option key={bank._id} value={bank._id}>
                                      {bank.bankName} - {bank.accountNumber}
                                    </option>
                                  ))
                                )}
                              </select>
                              <select
                                value={getValue(transaction._id, 'toBankPaymentType', transaction.toBankPaymentType || 'IN')}
                                onChange={(e) => updateField(transaction._id, 'toBankPaymentType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                <option value="IN">IN (Credit)</option>
                                <option value="OUT">OUT (Debit)</option>
                              </select>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">Not a dual bank transaction</div>
                          )}
                        </>
                      ) : (
                        <>
                          {transaction.isDualBankTransaction ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{transaction.toBank?.bankName || transaction.toBankName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{transaction.toAccountNumber || 'N/A'}</div>
                              <span className={`inline-flex mt-1 px-2 py-0.5 text-xs rounded-full ${transaction.toBankPaymentType?.toLowerCase() === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {transaction.toBankPaymentType?.toLowerCase() === 'in' ? 'Credit' : 'Debit'}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">-</div>
                          )}
                        </>
                      )}
                    </td>

                    {/* Transaction Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editing ? (
                        <input
                          type="date"
                          value={getValue(transaction._id, 'transactionDate', transaction.transactionDate ? new Date(transaction.transactionDate).toISOString().split('T')[0] : '')}
                          onChange={(e) => updateField(transaction._id, 'transactionDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="text-sm text-gray-700">{formatDate(transaction.transactionDate)}</div>
                      )}
                    </td>

                    {/* Payment Receipt */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {/* Current Image Display */}
                        {transaction.image ? (
                          <div className="flex items-center gap-2">
                            <a 
                              href={transaction.image} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Receipt"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </a>
                            <img 
                              src={transaction.image} 
                              alt="Receipt" 
                              className="w-10 h-10 object-cover rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => window.open(transaction.image, '_blank')}
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No receipt</span>
                        )}

                        {/* Upload Button - Always Visible */}
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            id={`upload-${transaction._id}`}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const imageUrl = await handleImageUpload(file);
                                if (imageUrl) {
                                  updateField(transaction._id, 'image', imageUrl);
                                  toast.success("Image uploaded successfully!");
                                }
                              }
                            }}
                            disabled={uploadingImage}
                          />
                          <label
                            htmlFor={`upload-${transaction._id}`}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 cursor-pointer transition-colors shadow-md"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {uploadingImage ? 'UPLOADING...' : '📤 UPLOAD NEW IMAGE'}
                          </label>
                          {uploadingImage && (
                            <div className="mt-1 flex items-center gap-1 text-sm text-green-600 font-bold">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              UPLOADING...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.accept === true ? 'bg-green-100 text-green-800' : 
                        transaction.accept === false ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                          {transaction.accept === true ? '✓ Accepted' : 
                           transaction.accept === false ? '✗ Rejected' : 
                           '⏳ Pending'}
                        </span>
                        {transaction.clearDate && (
                          <span className="text-xs text-gray-500">
                            Cleared: {formatDate(transaction.clearDate)}
                      </span>
                        )}
                    </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {editing ? (
                          <>
                            <button
                              onClick={() => saveTransaction(transaction._id)}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                              {isUpdating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                '💾 Save'
                              )}
                            </button>
                            <button
                              onClick={() => cancelEditing(transaction._id)}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm font-medium"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setViewDetailTransaction(transaction);
                                setIsViewModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                              title="View Details"
                            >
                              👁️ View
                            </button>
                            {/* Show Edit button only for pending transactions */}
                            {activeTab === 'pending' && (
                              <button
                                onClick={() => startEditing(transaction)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                title="Edit Transaction"
                              >
                                ✏️ Edit
                              </button>
                            )}
                            {/* Show Accept/Reject only for pending transactions */}
                            {activeTab === 'pending' && transaction.accept !== true && transaction.accept !== false && (
                              <>
                                <button
                                  onClick={() => handleAcceptTransaction(transaction._id)}
                                  disabled={isUpdating}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                  title="Accept Transaction"
                                >
                                  {isUpdating ? '...' : '✓'}
                                </button>
                                <button
                                  onClick={() => handleRejectTransaction(transaction._id)}
                                  disabled={isUpdating}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                  title="Reject Transaction"
                                >
                                  {isUpdating ? '...' : '✗'}
                                </button>
                              </>
                            )}
                            {/* Show Delete button for completed transactions */}
                            {activeTab === 'completed' && (
                              <button
                                onClick={() => handleRejectTransaction(transaction._id)}
                                disabled={isUpdating}
                                className="ml-auto px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                title="Delete Transaction"
                              >
                                {isUpdating ? '...' : '🗑️ Delete'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && viewDetailTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsViewModalOpen(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Transaction Details
                  </h3>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Lead Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Lead Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lead Name:</span>
                          <span className="text-sm font-medium text-gray-900">{viewDetailTransaction.leadName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lead Duration:</span>
                          <span className="text-sm font-mono text-gray-900">{viewDetailTransaction.
duration || 'N/A'}</span>
                        </div>  
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lead Travel Date:</span>
                          <span className="text-sm font-mono text-gray-900">{formatDate(viewDetailTransaction.
travelDate) || 'N/A'}</span>
                        </div>                                              
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lead ID:</span>
                          <span className="text-sm font-mono text-gray-900">{viewDetailTransaction.leadId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lead total amount:</span>
                          <span className="text-sm font-mono text-gray-900">{viewDetailTransaction.
leadTotalAmount || 'N/A'}</span>
                        </div>                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lead remaining amount:</span>

                          <span className="text-sm font-mono text-gray-900">{viewDetailTransaction.leadRemainingAmount || 'N/A'}</span>
                        </div>
                        {/* Check Previous Transactions Button - Only show if leadId exists */}
                        {viewDetailTransaction.leadId && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => fetchPreviousTransactions(viewDetailTransaction.leadId)}
                              disabled={loadingPreviousTransactions}
                              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                            >
                              {loadingPreviousTransactions ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                  </svg>
                                  Check Previous Transactions
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Transaction Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Transaction ID:</span>
                          <span className="text-sm font-mono font-medium text-gray-900">{viewDetailTransaction.transactionId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">UTR Number:</span>
                          <span className="text-sm font-mono font-medium text-gray-900">{viewDetailTransaction.utrNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className={`text-sm font-bold ${viewDetailTransaction.paymentType?.toLowerCase() === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                            {viewDetailTransaction.paymentType?.toLowerCase() === 'in' ? '+' : '-'}{formatAmount(viewDetailTransaction.transactionAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment Type:</span>
                          <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${viewDetailTransaction.paymentType?.toLowerCase() === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {viewDetailTransaction.paymentType?.toLowerCase() === 'in' ? 'Credit' : 'Debit'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment Mode:</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{viewDetailTransaction.paymentMode?.replace('_', ' ') || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* From Bank Information */}
                    <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                         Bank Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Bank Name:</span>
                          <span className="text-sm font-medium text-gray-900">{viewDetailTransaction.bank?.bankName || viewDetailTransaction.bankName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Account Number:</span>
                          <span className="text-sm font-mono font-medium text-gray-900">{viewDetailTransaction.accountNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">To Account:</span>
                          <span className="text-sm font-medium text-gray-900">{viewDetailTransaction.toAccount || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* To Bank Information (Dual Bank) */}
                    {viewDetailTransaction.isDualBankTransaction && (
                      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                          </svg>
                          To Bank Information
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                            Dual Bank
                          </span>
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Bank Name:</span>
                            <span className="text-sm font-medium text-gray-900">{viewDetailTransaction.toBank?.bankName || viewDetailTransaction.toBankName || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Account Number:</span>
                            <span className="text-sm font-mono font-medium text-gray-900">{viewDetailTransaction.toAccountNumber || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Payment Type:</span>
                            <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${viewDetailTransaction.toBankPaymentType?.toLowerCase() === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {viewDetailTransaction.toBankPaymentType?.toLowerCase() === 'in' ? 'Credit' : 'Debit'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Timestamps
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Transaction Date:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(viewDetailTransaction.transactionDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Created:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(viewDetailTransaction.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Updated:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(viewDetailTransaction.updatedAt)}</span>
                        </div>
                        {viewDetailTransaction.clearDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Cleared Date:</span>
                            <span className="text-sm font-medium text-green-600">{formatDate(viewDetailTransaction.clearDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Status
                      </h4>
                      <div className="flex items-center justify-center">
                        <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                          viewDetailTransaction.accept === true ? 'bg-green-100 text-green-800' : 
                          viewDetailTransaction.accept === false ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {viewDetailTransaction.accept === true ? '✓ Accepted' : 
                           viewDetailTransaction.accept === false ? '✗ Rejected' : 
                           '⏳ Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Payment Receipt */}
                    {viewDetailTransaction.image && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Payment Receipt
                        </h4>
                        <div className="mt-2">
                          <img 
                            src={viewDetailTransaction.image} 
                            alt="Payment Receipt" 
                            className="w-full rounded-lg border-2 border-gray-300 cursor-pointer hover:border-purple-500 transition-colors"
                            onClick={() => window.open(viewDetailTransaction.image, '_blank')}
                          />
                          <a 
                            href={viewDetailTransaction.image} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {viewDetailTransaction.description && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Description
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{viewDetailTransaction.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction ID at Bottom */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 text-center font-mono">
                    Transaction ID: {viewDetailTransaction._id}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previous Transactions Modal */}
      {isPreviousTransactionsModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsPreviousTransactionsModalOpen(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Previous Transactions for Lead: {viewDetailTransaction?.leadName || 'N/A'}
                  </h3>
                  <button
                    onClick={() => setIsPreviousTransactionsModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
                {loadingPreviousTransactions ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading previous transactions...</span>
                  </div>
                ) : previousTransactions && previousTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-purple-600 to-purple-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Transaction ID</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">UTR Number</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Mode</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bank</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Transaction Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Receipt</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previousTransactions.map((transaction, index) => (
                          <tr key={transaction._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition-colors`}>
                            {/* Transaction ID */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-700">{transaction.transactionId || 'N/A'}</div>
                            </td>

                            {/* UTR Number */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-700">{transaction.utrNumber || 'N/A'}</div>
                            </td>

                            {/* Amount */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-bold ${transaction.paymentType?.toLowerCase() === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.paymentType?.toLowerCase() === 'in' ? '+' : '-'}{formatAmount(transaction.transactionAmount)}
                              </div>
                            </td>

                            {/* Payment Mode */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                                {transaction.paymentMode?.replace('_', ' ') || 'N/A'}
                              </span>
                            </td>

                            {/* Payment Type */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.paymentType?.toLowerCase() === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {transaction.paymentType?.toLowerCase() === 'in' ? 'Credit' : 'Debit'}
                              </span>
                            </td>

                            {/* Bank */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{transaction.bank?.bankName || transaction.bankName || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{transaction.accountNumber || 'N/A'}</div>
                              </div>
                            </td>

                            {/* Transaction Date */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{formatDate(transaction.transactionDate)}</div>
                            </td>

                            {/* Payment Receipt */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {transaction.image ? (
                                  <>
                                    <a 
                                      href={transaction.image} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 transition-colors"
                                      title="View Receipt"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </a>
                                    <img 
                                      src={transaction.image} 
                                      alt="Receipt" 
                                      className="w-10 h-10 object-cover rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                                      onClick={() => window.open(transaction.image, '_blank')}
                                    />
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400">No receipt</span>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.accept === true ? 'bg-green-100 text-green-800' : 
                                transaction.accept === false ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.accept === true ? '✓ Accepted' : 
                                 transaction.accept === false ? '✗ Rejected' : 
                                 '⏳ Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500 text-lg">No previous transactions found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setIsPreviousTransactionsModalOpen(false)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;