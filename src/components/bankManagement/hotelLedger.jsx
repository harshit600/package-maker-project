import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}

function HotelLedger() {
  const [hotelLedger, setHotelLedger] = useState([])
  console.log(hotelLedger)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [toBankFilter, setToBankFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')  
  const [toDate, setToDate] = useState('')
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [selectedTransactionForPayment, setSelectedTransactionForPayment] = useState(null)
  const [manualBanks, setManualBanks] = useState([])
  const [loadingManualBanks, setLoadingManualBanks] = useState(false)
  const [paymentData, setPaymentData] = useState({
    bank: "",
    toBank: "",
    isDualBankTransaction: true,
    operationId: "",
    leadName: "",
    leadData: "",
    paymentMode: "RTGS",
    paymentType: "out",
    toBankPaymentType: "in",
    transactionAmount: "",
    transactionId: "",
    transactionDate: "",
    description: "",
    utrNumber: "",
    image: ""
  })
  const [addPaymentData, setAddPaymentData] = useState({
    bank: "",
    toBank: "",
    isDualBankTransaction: true,
    operationId: "",
    leadName: "",
    paymentMode: "RTGS",
    paymentType: "out",
    toBankPaymentType: "in",
    transactionAmount: "",
    transactionId: "",
    transactionDate: "",
    description: "",
    utrNumber: "",
    image: ""
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [viewModal, setViewModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [propertyBank, setPropertyBank] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingPropertyBank, setLoadingPropertyBank] = useState(true);
  const [propertyBankSearchTerm, setPropertyBankSearchTerm] = useState('');
  const [showPropertyBankDropdown, setShowPropertyBankDropdown] = useState(false);


  useEffect(() => {
    fetchAllHotelData()
    fetchpropertybank()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPropertyBankDropdown && !event.target.closest('.property-bank-dropdown')) {
        setShowPropertyBankDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPropertyBankDropdown])
  const fetchpropertybank= async()=>{
    setLoadingPropertyBank(true);
    try {
      const response = await fetch(`${config.API_HOST}/api/bankaccountdetail/get-auto-created`);
      const data =  await response.json();
      console.log(data?.data);
      setPropertyBank(data?.data);
    } catch (error) {
      console.error(error.message);
    }
    finally{
      setLoadingPropertyBank(false);
    }
  }

  // Merged function to fetch data from both APIs
  const fetchAllHotelData = async () => {
    try {
      setLoading(true)
      
      // Fetch dual-bank transactions
      const dualBankResponse = await fetch(`${config.API_HOST}/api/banktransactions/dual-bank`)
      const dualBankData = await dualBankResponse.json()
      console.log('Dual bank data:', dualBankData)
      
      // Filter dual bank data to show only accepted transactions
      const filteredDualBankData = (dualBankData?.data?.reverse() || []).filter(item => 
        item.accept === true 
      )
      
      // Fetch automatic hotel transactions
      const automaticHotelResponse = await fetch(`${config.API_HOST}/api/banktransactions/automatic-hotel`)
      const automaticHotelData = await automaticHotelResponse.json()
      console.log('Automatic hotel data:', automaticHotelData)
      
      // Merge both datasets
      const mergedData = [
        ...filteredDualBankData,
        ...(automaticHotelData?.data || [])
      ]
      
      console.log('Merged hotel ledger data:', mergedData)
      setHotelLedger(mergedData)
    }
    catch (error) {
      console.error('Error fetching hotel ledger:', error)
      toast.error('Failed to fetch hotel ledger')
    }
    finally {
      setLoading(false)
    }
  }

  // Filter property banks based on search term
  const filteredPropertyBanks = propertyBank.filter(bank =>
    bank.bankName?.toLowerCase().includes(propertyBankSearchTerm.toLowerCase()) ||
    bank.accountNumber?.toLowerCase().includes(propertyBankSearchTerm.toLowerCase())
  )

  const fetchManualBanks = async () => {
    try {
      setLoadingManualBanks(true)
      const response = await fetch(`${config.API_HOST}/api/bankaccountdetail/get-manual`)
      const data = await response.json()
      console.log('Manual banks:', data)
      if (data.success) {
        setManualBanks(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching manual banks:', error)
    } finally {
      setLoadingManualBanks(false)
    }
  }

  // Get unique banks for filter dropdowns
  const getUniqueBanks = () => {
    // Extract toBankName from both direct field and nested toBank.bankName
    const toBanks = [...new Set(hotelLedger.map(item => {
      return item.toBankName || item.toBank?.bankName
    }).filter(Boolean))]
    return { toBanks }
  }

  const { toBanks } = getUniqueBanks()

  // Filter data based on search and filter criteria
  const filteredData = hotelLedger.filter(item => {
    const matchesSearch = !searchTerm || 
      item.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Check both toBankName and toBank.bankName for compatibility with both data structures
    const itemToBankName = item.toBankName || item.toBank?.bankName
    const matchesToBank = !toBankFilter || itemToBankName === toBankFilter
    const matchesStatus = !statusFilter || 
      (statusFilter === 'pending' && item.accept === undefined) ||
      (statusFilter === 'accepted' && item.accept === true) ||
      (statusFilter === 'rejected' && item.accept === false)

    // Date filtering based on clearDate or transactionDate
    const itemDate = item.clearDate || item.transactionDate
    const matchesDate = !fromDate && !toDate || 
      (!fromDate || new Date(itemDate) >= new Date(fromDate)) &&
      (!toDate || new Date(itemDate) <= new Date(toDate))

    return matchesSearch && matchesToBank && matchesStatus && matchesDate
  }).sort((a, b) => {
    // First sort by hotel name
    const aHotelName = (a.toBankName || a.toBank?.bankName || '').toLowerCase()
    const bHotelName = (b.toBankName || b.toBank?.bankName || '').toLowerCase()
    
    if (aHotelName !== bHotelName) {
      return aHotelName.localeCompare(bHotelName)
    }
    
    // Then sort by date (oldest first for correct running balance)
    const aDate = new Date(a.clearDate || a.transactionDate || 0)
    const bDate = new Date(b.clearDate || b.transactionDate || 0)
    return aDate - bDate
  })

  // Helper function to get unique credit amount for operationId + toBank.bankName combination
  const getUniqueCreditAmount = (item, allItems) => {
    const itemBankName = (item.toBankName || item.toBank?.bankName || '').trim().toLowerCase()
    const sameOperationItems = allItems.filter(otherItem => {
      const otherItemBankName = (otherItem.toBankName || otherItem.toBank?.bankName || '').trim().toLowerCase()
      return otherItem.operationId === item.operationId && otherItemBankName === itemBankName
    })
    
    // If this is the first occurrence of this operationId + toBank.bankName combination, return credit amount
    // Otherwise, return 0 for credit (but still show debit)
    const isFirstOccurrence = sameOperationItems[0]?._id === item._id
    return isFirstOccurrence ? (item.totalHotelamount?.totalamount || 0) : 0
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateRange = () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      const to = new Date(toDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      return `from ${from} to ${to}`
    } else if (fromDate) {
      const from = new Date(fromDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      return `from ${from}`
    } else if (toDate) {
      const to = new Date(toDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      return `to ${to}`
    } else {
      return 'from 01-September-2025 to 30-September-2025'
    }
  }

  // Payment modal handlers
  const handleOpenPaymentModal = (transaction) => {
    setSelectedTransactionForPayment(transaction)
    // Handle toBank - it can be an object with _id (automatic-hotel data) or a string ID (dual-bank data)
    const toBankValue = typeof transaction.toBank === 'object' ? transaction.toBank?._id : transaction.toBank || ""
    
    setPaymentData({
      bank: "",
      toBank: toBankValue,
      isDualBankTransaction: true,
      operationId: transaction.operationId || "",
      leadName: transaction.leadName || "",
      leadData: transaction.totalHotelamount || {},
      paymentMode: "RTGS",
      paymentType: "out",
      toBankPaymentType: "in",
      transactionAmount: "",
      transactionId: "",
      transactionDate: new Date().toISOString().split('T')[0],
      description: "",
      utrNumber: "",
      image: ""
    })
    // Fetch manual banks when opening the modal
    fetchManualBanks()
    setShowPaymentModal(true)
  }

  const handlePaymentDataChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddPaymentDataChange = (field, value) => {
    setAddPaymentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Function to handle image upload to Firebase
  const handleImageUpload = async (file) => {
    if (!file) return null;

    try {
      setUploadingImage(true);
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
            console.error("Upload failed:", error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploadingImage(false);
              resolve(downloadURL);
            } catch (error) {
              setUploadingImage(false);
              console.error("Error getting download URL:", error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setUploadingImage(false);
      console.error("Upload error:", error);
      return null;
    }
  };

  const handlePropertyBankSearch = (searchTerm) => {
    setPropertyBankSearchTerm(searchTerm)
    setShowPropertyBankDropdown(true)
  }

  const handlePropertyBankSelect = (bank) => {
    setAddPaymentData(prev => ({
      ...prev,
      toBank: bank._id
    }))
    setPropertyBankSearchTerm(`${bank.bankName} - ${bank.accountNumber}`)
    setShowPropertyBankDropdown(false)
  }

  const handleOpenAddPaymentModal = () => {
    setAddPaymentData({
      bank: "",
      toBank: "",
      isDualBankTransaction: true,
      operationId: "",
      leadName: "",
      paymentMode: "RTGS",
      paymentType: "out",
      toBankPaymentType: "in",
      transactionAmount: "",
      transactionId: "",
      transactionDate: new Date().toISOString().split('T')[0],
      description: "",
      utrNumber: "",
      image: ""
    })
    setPropertyBankSearchTerm('')
    setShowPropertyBankDropdown(false)
    // Fetch manual banks when opening the modal
    fetchManualBanks()
    setShowAddPaymentModal(true)
  }

  const handleSubmitAddPayment = async () => {
    try {
      // Validate required fields
      if ( !addPaymentData.toBank || !addPaymentData.transactionAmount) {
        alert('Please fill in all required fields (From Bank, To Bank, and Transaction Amount)')
        return
      }

      console.log("Add Payment data:", addPaymentData)
      
      // Prepare the payment request data
      const paymentRequestData = {
        // bank: addPaymentData.bank,
        toBank: addPaymentData.toBank,
        operationId: addPaymentData.operationId,
        leadName: addPaymentData.leadName,
        paymentMode: addPaymentData.paymentMode,
        paymentType: addPaymentData.paymentType,
        toBankPaymentType: addPaymentData.toBankPaymentType,
        transactionAmount: parseFloat(addPaymentData.transactionAmount),
        transactionId: addPaymentData.transactionId,
        transactionDate: addPaymentData.transactionDate,
        description: addPaymentData.description,
        isDualBankTransaction: addPaymentData.isDualBankTransaction,
        utrNumber: addPaymentData.utrNumber,
        image: addPaymentData.image
      }

      console.log("Sending add payment request:", paymentRequestData)

      // Make API call to create bank transaction
      const response = await fetch(
        `${config.API_HOST}/api/banktransactions/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentRequestData)
        }
      )
      console.log("Add Payment API Response:", response)

      if (!response.ok) {
        // Parse the error response to get the actual error message
        const errorResult = await response.json()
        console.log("Error response:", errorResult)
        
        // Check if it's an insufficient balance error
        if (errorResult.message === "Insufficient balance") {
          alert(`Warning: your bank has ${errorResult.message}`)
          return // Don't throw error, just show warning and return
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success || result.message) {
        alert('Payment added successfully!')
        // Close modal after successful submission
        setShowAddPaymentModal(false)
        setAddPaymentData({
          // bank: "",
          toBank: "",
          isDualBankTransaction: true,
          operationId: "",
          leadName: "",
          paymentMode: "RTGS",
          paymentType: "out",
          toBankPaymentType: "in",
          transactionAmount: "",
          transactionId: "",
          transactionDate: "",
          description: "",
          utrNumber: "",
          image: ""
        })
        // Refresh the data
        fetchAllHotelData()
      } else {
        alert('Failed to add payment. Please try again.')
      }
    } catch (error) {
      console.error("Error adding payment:", error)
      alert(`Failed to add payment: ${error.message}`)
    }
  }

  const handleSubmitPayment = async () => {
    try {
      // Validate required fields
      if ( !paymentData.toBank || !paymentData.transactionAmount) {
        alert('Please fill in all required fields (From Bank, To Bank, and Transaction Amount)')
        return
      }

      console.log("Payment data:", paymentData)
      
      // Prepare the payment request data
      const paymentRequestData = {
        // bank: paymentData.bank,
        toBank: paymentData.toBank,
        operationId: paymentData.operationId,
        leadName: paymentData.leadName,
        paymentMode: paymentData.paymentMode,
        paymentType: paymentData.paymentType,
        toBankPaymentType: paymentData.toBankPaymentType,
        transactionAmount: parseFloat(paymentData.transactionAmount),
        transactionId: paymentData.transactionId,
        transactionDate: paymentData.transactionDate,
        description: paymentData.description,
        isDualBankTransaction: paymentData.isDualBankTransaction,
        totalHotelamount: paymentData.leadData,
        utrNumber: paymentData.utrNumber,
        image: paymentData.image
      }

      console.log("Sending payment request:", paymentRequestData)

      // Make API call to create bank transaction
      const response = await fetch(
        `${config.API_HOST}/api/banktransactions/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentRequestData)
        }
      )
      console.log("Payment API Response:", response)

      if (!response.ok) {
        // Parse the error response to get the actual error message
        const errorResult = await response.json()
        console.log("Error response:", errorResult)
        
        // Check if it's an insufficient balance error
        if (errorResult.message === "Insufficient balance") {
          alert(`Warning: your bank has ${errorResult.message}`)
          return // Don't throw error, just show warning and return
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success || result.message) {
        alert('Payment request submitted successfully!')
        // Close modal after successful submission
        setShowPaymentModal(false)
        setPaymentData({
          bank: "",
          toBank: "",
          isDualBankTransaction: true,
          operationId: "",
          leadName: "",
          leadData: "",
          paymentMode: "RTGS",
          paymentType: "out",
          toBankPaymentType: "in",
          transactionAmount: "",
          transactionId: "",
          transactionDate: "",
          description: "",
          utrNumber: "",
          image: ""
        })
        // Refresh the data
        fetchAllHotelData()
      } else {
        alert('Failed to submit payment request. Please try again.')
      }
    } catch (error) {
      console.error("Error submitting payment:", error)
      alert(`Failed to submit payment request: ${error.message}`)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (item) => {
    if (item.accept === undefined) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Pending
        </span>
      )
    }
    if (item.accept === true) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Accepted
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Rejected
      </span>
    )
  }

  const getPaymentTypeBadge = (type) => {
    const colors = {
      'in': 'bg-green-100 text-green-800',
      'out': 'bg-red-100 text-red-800'
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type?.toUpperCase() || 'N/A'}
      </span>
    )
  }

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction)
    setViewModal(true)
  }

  const closeViewModal = () => {
    setViewModal(false)
    setSelectedTransaction(null)
  }

  // Excel export function
  const exportToExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = filteredData.map((item, index) => {
        const srNo = index + 1
        const displayDate = item.clearDate ? formatDate(item.clearDate) : formatDate(item.transactionDate)
        const creditAmount = getUniqueCreditAmount(item, filteredData)
        const debitAmount = item.transactionAmount || 0
        
        // Calculate running balance for this specific hotel (toBankName)
        const currentHotel = (item.toBankName || item.toBank?.bankName || '').trim().toLowerCase()
        const hotelItems = filteredData.filter(hotelItem => {
          const hotelItemName = (hotelItem.toBankName || hotelItem.toBank?.bankName || '').trim().toLowerCase()
          return hotelItemName === currentHotel
        })
        const currentItemIndex = hotelItems.findIndex(hotelItem => hotelItem._id === item._id)
        const itemsUpToCurrent = hotelItems.slice(0, currentItemIndex + 1)
        const totalCredit = itemsUpToCurrent.reduce((sum, hotelItem) => sum + getUniqueCreditAmount(hotelItem, filteredData), 0)
        const totalDebit = itemsUpToCurrent.reduce((sum, hotelItem) => sum + (hotelItem.transactionAmount || 0), 0)
        const balance = totalCredit - totalDebit

        return {
          'Sr.No.': srNo,
          'Hotel Name': item.toBankName || item.toBank?.bankName || 'N/A',
          'Remarks': item.description || '-',
          'Date': displayDate,
          'Payment Mode': item.paymentMode || '-',
          'Credit': creditAmount > 0 ? creditAmount : '-',
          'Debit': debitAmount > 0 ? debitAmount : '-',
          'Balance': balance,
          'Status': item.accept === undefined ? 'Pending' : item.accept === true ? 'Accepted' : 'Rejected',
          'Operation ID': item.operationId || '',
          'Transaction ID': item.transactionId || '',
          'Customer Name': item.totalHotelamount?.name || 'N/A',
          'Travel Date': item.totalHotelamount?.travelDate ? formatDate(item.totalHotelamount.travelDate) : 'N/A',
          'Destination': item.totalHotelamount?.destination || 'N/A',
          'Days': item.totalHotelamount?.days || 'N/A',
          'Nights': item.totalHotelamount?.nights || 'N/A'
        }
      })

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      const colWidths = [
        { wch: 8 },   // Sr.No.
        { wch: 20 },  // Hotel Name
        { wch: 30 },  // Remarks
        { wch: 12 },  // Date
        { wch: 15 },  // Payment Mode
        { wch: 15 },  // Credit
        { wch: 15 },  // Debit
        { wch: 15 },  // Balance
        { wch: 12 },  // Status
        { wch: 20 },  // Operation ID
        { wch: 20 },  // Transaction ID
        { wch: 25 },  // Customer Name
        { wch: 12 },  // Travel Date
        { wch: 20 },  // Destination
        { wch: 8 },   // Days
        { wch: 8 }    // Nights
      ]
      ws['!cols'] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Hotel Ledger')

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `Hotel_Ledger_${currentDate}.xlsx`

      // Save file
      XLSX.writeFile(wb, filename)
      
      toast.success('Excel file downloaded successfully!')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Failed to export data to Excel')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700 mb-1">Loading Hotel Ledger</div>
                  <div className="text-sm text-gray-500">Please wait while we fetch the data...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hotels Ledger</h1>
       
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by lead name, transaction ID, or description"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Payment Date</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="From Date"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="To Date"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">To Bank</label>
              <select
                value={toBankFilter}
                onChange={(e) => setToBankFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All To Banks</option>
                {toBanks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700 invisible">Actions</label>
              <button className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Add Payment Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleOpenAddPaymentModal}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Payment
              </button>
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to Excel
              </button>
              <button
                onClick={fetchAllHotelData}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Ledger Title and Balance */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Agent Hotel Ledger {formatDateRange()}
              </h2>
              <div className="text-lg font-semibold text-gray-900">
                Main Head Balance: {formatCurrency(
                  filteredData.reduce((sum, item) => sum + getUniqueCreditAmount(item, filteredData), 0) - 
                  filteredData.reduce((sum, item) => sum + (item.transactionAmount || 0), 0)
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Sr.No.
                  </th>
                  
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Hotel Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Remarks
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Payment Mode
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Credit
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Debit
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 bg-gray-50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center border-r border-gray-300">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">No transactions found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm || toBankFilter || statusFilter 
                            ? 'Try adjusting your search filters' 
                            : 'No hotel ledger transactions available'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => {
                    const srNo = indexOfFirstItem + index + 1
                    const displayDate = item.clearDate ? formatDate(item.clearDate) : formatDate(item.transactionDate)
                    const creditAmount = item.totalHotelamount?.totalamount || 0
                    const debitAmount = item.transactionAmount || 0
                    
                    // Calculate running balance for this specific hotel (toBankName)
                    const currentHotel = (item.toBankName || item.toBank?.bankName || '').trim().toLowerCase()
                    const hotelItems = filteredData.filter(hotelItem => {
                      const hotelItemName = (hotelItem.toBankName || hotelItem.toBank?.bankName || '').trim().toLowerCase()
                      return hotelItemName === currentHotel
                    })
                    const currentItemIndex = hotelItems.findIndex(hotelItem => hotelItem._id === item._id)
                    const itemsUpToCurrent = hotelItems.slice(0, currentItemIndex + 1)
                    
                    // Calculate total credit and debit up to current item
                    const totalCredit = itemsUpToCurrent.reduce((sum, hotelItem) => {
                      const credit = getUniqueCreditAmount(hotelItem, filteredData)
                      return sum + credit
                    }, 0)
                    const totalDebit = itemsUpToCurrent.reduce((sum, hotelItem) => {
                      const debit = hotelItem.transactionAmount || 0
                      return sum + debit
                    }, 0)
                    const balance = totalCredit - totalDebit
                    
                    // Debug logging for first few items
                    if (index < 3) {
                      console.log(`Row ${srNo}:`, {
                        hotel: item.toBankName || item.toBank?.bankName,
                        operationId: item.operationId,
                        credit: getUniqueCreditAmount(item, filteredData),
                        debit: item.transactionAmount || 0,
                        totalCredit,
                        totalDebit,
                        balance
                      })
                    }
                    
                    return (
                      <tr key={item._id} className="border-b border-gray-300 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          {srNo}
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          {item.toBankName || item.toBank?.bankName || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          {item.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          {displayDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          {item.paymentMode || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          {getUniqueCreditAmount(item, filteredData) > 0 ? formatCurrency(getUniqueCreditAmount(item, filteredData)) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          {debitAmount > 0 ? formatCurrency(debitAmount) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                          {formatCurrency(balance)}
                        </td>
                        <td className="px-4 py-3 border-r border-gray-300">
                          {getStatusBadge(item)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewTransaction(item)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={() => handleOpenPaymentModal(item)}
                              className=" inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Add Payment
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {/* Total Row */}
              {currentItems.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-gray-900" colSpan="5">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                      {formatCurrency(filteredData.reduce((sum, item) => sum + getUniqueCreditAmount(item, filteredData), 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                      {formatCurrency(filteredData.reduce((sum, item) => sum + (item.transactionAmount || 0), 0))}
                    </td>
                   
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                      -
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      -
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredData.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredData.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Transaction Modal */}
      {viewModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Hotel Booking Details</h3>
                    <p className="text-sm text-gray-500">Complete hotel booking information</p>
                  </div>
                </div>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
             <div className="space-y-6">
                {/* Hotel Booking Details */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Hotel Booking Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-medium text-gray-800 border-b border-blue-200 pb-2">Customer Information</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-semibold">{selectedTransaction.totalHotelamount?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Travel Date</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTransaction.totalHotelamount?.travelDate ? formatDate(selectedTransaction.totalHotelamount.travelDate) : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-medium text-gray-800 border-b border-blue-200 pb-2">Trip Details</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Destination</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedTransaction.totalHotelamount?.destination || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Days</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTransaction.totalHotelamount?.days || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nights</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTransaction.totalHotelamount?.nights || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hotel Information */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-medium text-gray-800 border-b border-blue-200 pb-2">Hotel Information</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-semibold">{selectedTransaction.totalHotelamount?.hotelName || 'N/A'}</p>
                      </div>
                     
                    </div>


                  </div>

                
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // You can add print functionality here
                    window.print()
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Request Modal */}
      {showPaymentModal && selectedTransactionForPayment && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowPaymentModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  💳 Payment Request
                </h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Lead Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Lead Information</h4>
                  <p><span className="font-medium">Operation ID:</span> {paymentData.operationId}</p>
                  <p><span className="font-medium">Lead Name:</span> {paymentData.leadName}</p>
                  <p><span className="font-medium">Hotel Name:</span> {selectedTransactionForPayment.toBankName || selectedTransactionForPayment.toBank?.bankName}</p>
                  <p><span className="font-medium">Hotel Amount:</span> ₹{selectedTransactionForPayment.totalHotelamount?.totalamount?.toLocaleString() || '0'}</p>
                </div>

                {/* Bank Information */}
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Bank ID
                    </label>
                    <select
                      value={paymentData.bank}
                      onChange={(e) => handlePaymentDataChange('bank', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingManualBanks}
                    >
                      <option value="">
                        {loadingManualBanks ? 'Loading banks...' : 'Select Bank'}
                      </option>
                      {manualBanks.map((bank) => (
                        <option key={bank._id} value={bank._id}>
                          {bank.bankName} - {bank.accountNumber}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Bank ID (Property Bank)
                    </label>
                    <input
                      type="text"
                      value={selectedTransactionForPayment.toBankName || selectedTransactionForPayment.toBank?.bankName || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentData.paymentMode}
                      onChange={(e) => handlePaymentDataChange('paymentMode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="gpay">GPay</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="RTGS">RTGS</option>
                      <option value="NEFT">NEFT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Amount
                    </label>
                    <input
                      type="number"
                      value={paymentData.transactionAmount}
                      onChange={(e) => handlePaymentDataChange('transactionAmount', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type
                    </label>
                    <select
                      value={paymentData.paymentType}
                      onChange={(e) => handlePaymentDataChange('paymentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="out">Out</option>
                      <option value="in">In</option>
                    </select>
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Bank Payment Type
                    </label>
                    <select
                      value={paymentData.toBankPaymentType}
                      onChange={(e) => handlePaymentDataChange('toBankPaymentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in">In</option>
                      <option value="out">Out</option>
                    </select>
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={paymentData.transactionId}
                    onChange={(e) => handlePaymentDataChange('transactionId', e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={paymentData.transactionDate}
                    onChange={(e) => handlePaymentDataChange('transactionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={paymentData.description}
                    onChange={(e) => handlePaymentDataChange('description', e.target.value)}
                    placeholder="Enter transaction description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UTR Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.utrNumber}
                    onChange={(e) => handlePaymentDataChange('utrNumber', e.target.value.trim())}
                    placeholder="Enter UTR number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Receipt Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const imageUrl = await handleImageUpload(file);
                        if (imageUrl) {
                          handlePaymentDataChange('image', imageUrl);
                          toast.success("Image uploaded successfully!");
                        }
                      }
                    }}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                  )}
                  {paymentData.image && (
                    <div className="mt-2">
                      <img 
                        src={paymentData.image} 
                        alt="Payment receipt" 
                        className="w-32 h-32 object-cover rounded border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPayment}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Submit Payment Request
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAddPaymentModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  💳 Add Payment
                </h3>
                <button 
                  onClick={() => setShowAddPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Bank Information */}
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Bank ID
                    </label>
                    <select
                      value={addPaymentData.bank}
                      onChange={(e) => handleAddPaymentDataChange('bank', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingManualBanks}
                    >
                      <option value="">
                        {loadingManualBanks ? 'Loading banks...' : 'Select Bank'}
                      </option>
                      {manualBanks.map((bank) => (
                        <option key={bank._id} value={bank._id}>
                          {bank.bankName} - {bank.accountNumber}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  <div className="relative property-bank-dropdown">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Bank ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={propertyBankSearchTerm}
                        onChange={(e) => handlePropertyBankSearch(e.target.value)}
                        onFocus={() => setShowPropertyBankDropdown(true)}
                        placeholder={loadingPropertyBank ? 'Loading banks...' : 'Search and select property bank...'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingPropertyBank}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Dropdown */}
                    {showPropertyBankDropdown && !loadingPropertyBank && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredPropertyBanks.length > 0 ? (
                          filteredPropertyBanks.map((bank) => (
                            <div
                              key={bank._id}
                              onClick={() => handlePropertyBankSelect(bank)}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{bank.bankName}</div>
                              <div className="text-sm text-gray-500">Account: {bank.accountNumber}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No banks found matching "{propertyBankSearchTerm}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={addPaymentData.paymentMode}
                      onChange={(e) => handleAddPaymentDataChange('paymentMode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="gpay">GPay</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="RTGS">RTGS</option>
                      <option value="NEFT">NEFT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Amount
                    </label>
                    <input
                      type="number"
                      value={addPaymentData.transactionAmount}
                      onChange={(e) => handleAddPaymentDataChange('transactionAmount', e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type
                    </label>
                    <select
                      value={addPaymentData.paymentType}
                      onChange={(e) => handleAddPaymentDataChange('paymentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="out">Out</option>
                      <option value="in">In</option>
                    </select>
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Bank Payment Type
                    </label>
                    <select
                      value={addPaymentData.toBankPaymentType}
                      onChange={(e) => handleAddPaymentDataChange('toBankPaymentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in">In</option>
                      <option value="out">Out</option>
                    </select>
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operation ID
                  </label>
                  <input
                    type="text"
                    value={addPaymentData.operationId}
                    onChange={(e) => handleAddPaymentDataChange('operationId', e.target.value)}
                    placeholder="Enter operation ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Name
                  </label>
                  <input
                    type="text"
                    value={addPaymentData.leadName}
                    onChange={(e) => handleAddPaymentDataChange('leadName', e.target.value)}
                    placeholder="Enter lead name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={addPaymentData.transactionId}
                    onChange={(e) => handleAddPaymentDataChange('transactionId', e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={addPaymentData.transactionDate}
                    onChange={(e) => handleAddPaymentDataChange('transactionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={addPaymentData.description}
                    onChange={(e) => handleAddPaymentDataChange('description', e.target.value)}
                    placeholder="Enter transaction description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UTR Number
                  </label>
                  <input
                    type="text"
                    value={addPaymentData.utrNumber}
                    onChange={(e) => handleAddPaymentDataChange('utrNumber', e.target.value.trim())}
                    placeholder="Enter UTR number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Receipt Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const imageUrl = await handleImageUpload(file);
                        if (imageUrl) {
                          handleAddPaymentDataChange('image', imageUrl);
                          toast.success("Image uploaded successfully!");
                        }
                      }
                    }}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                  )}
                  {addPaymentData.image && (
                    <div className="mt-2">
                      <img 
                        src={addPaymentData.image} 
                        alt="Payment receipt" 
                        className="w-32 h-32 object-cover rounded border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAddPayment}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Payment
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default HotelLedger