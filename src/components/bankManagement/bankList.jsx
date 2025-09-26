import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}

function BankList() {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [banksPerPage] = useState(10)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [editingBank, setEditingBank] = useState(null)
  const [editFormData, setEditFormData] = useState({
    bankName: '',
    accountNumber: ''
  })
  const [editErrors, setEditErrors] = useState({})
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    fetchBanks()
  }, [])

  const fetchBanks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${config.API_HOST}/api/bankaccountdetail/get-manual`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBanks(data?.data)
    } catch (error) {
      console.error('Error fetching banks:', error)
      toast.error('Failed to fetch banks')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bankId) => {
    if (!window.confirm('Are you sure you want to delete this bank?')) {
      return
    }

    try {
      setDeleteLoading(bankId)
      const response = await fetch(`${config.API_HOST}/api/bankaccountdetail/delete/${bankId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success('Bank deleted successfully')
      fetchBanks() // Refresh the list
    } catch (error) {
      console.error('Error deleting bank:', error)
      toast.error('Failed to delete bank')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleEdit = (bank) => {
    setEditingBank(bank)
    setEditFormData({
      bankName: bank.bankName || '',
      accountNumber: bank.accountNumber || ''
    })
    setEditErrors({})
    setEditModal(true)
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateEditForm = () => {
    const newErrors = {}
    
    if (!editFormData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required'
    } else if (editFormData.bankName.trim().length < 2) {
      newErrors.bankName = 'Bank name must be at least 2 characters'
    }
    
    if (!editFormData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required'
    } else if (!/^\d{8,20}$/.test(editFormData.accountNumber.trim())) {
      newErrors.accountNumber = 'Account number must be 8-20 digits'
    }
    
    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateBank = async (e) => {
    e.preventDefault()
    
    if (!validateEditForm()) {
      return
    }
    
    setEditLoading(true)
    
    try {
      const response = await fetch(`${config.API_HOST}/api/bankaccountdetail/update/${editingBank._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Bank updated successfully:', result)
      
      toast.success('Bank updated successfully!')
      setEditModal(false)
      setEditingBank(null)
      fetchBanks() // Refresh the list
    } catch (error) {
      console.error('Error updating bank:', error)
      toast.error('Failed to update bank. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  // Filter banks based on search term
  const filteredBanks = banks.filter(bank =>
    bank.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.accountNumber?.includes(searchTerm)
  )

  // Pagination
  const indexOfLastBank = currentPage * banksPerPage
  const indexOfFirstBank = indexOfLastBank - banksPerPage
  const currentBanks = filteredBanks.slice(indexOfFirstBank, indexOfLastBank)
  const totalPages = Math.ceil(filteredBanks.length / banksPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg font-medium text-gray-700">Loading banks...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Management</h1>
          <p className="text-gray-600">Manage your bank accounts and details</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Search and Actions Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search banks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchBanks}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                                 <Link
                   to="/add-bank"
                   className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                 >
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                   Add Bank
                 </Link>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBanks.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">No banks found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first bank'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentBanks.map((bank) => (
                    <tr key={bank._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{bank.bankName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{bank.accountNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {bank.createdAt ? new Date(bank.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex items-center justify-end space-x-2">
                           <button
                             onClick={() => handleEdit(bank)}
                             className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                           >
                             <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                             </svg>
                             Edit
                           </button>
                           <button
                             onClick={() => handleDelete(bank._id)}
                             disabled={deleteLoading === bank._id}
                             className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white transition-colors duration-200 ${
                               deleteLoading === bank._id
                                 ? 'bg-gray-400 cursor-not-allowed'
                                 : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                             }`}
                           >
                             {deleteLoading === bank._id ? (
                               <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                             ) : (
                               <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                             )}
                             {deleteLoading === bank._id ? 'Deleting...' : 'Delete'}
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
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
                    Showing <span className="font-medium">{indexOfFirstBank + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastBank, filteredBanks.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredBanks.length}</span> results
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

       {/* Edit Modal */}
       {editModal && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
             <div className="mt-3">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-medium text-gray-900">Edit Bank</h3>
                 <button
                   onClick={() => {
                     setEditModal(false)
                     setEditingBank(null)
                     setEditFormData({ bankName: '', accountNumber: '' })
                     setEditErrors({})
                   }}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
               
               <form onSubmit={handleUpdateBank} className="space-y-4">
                 {/* Bank Name Field */}
                 <div>
                   <label htmlFor="editBankName" className="block text-sm font-medium text-gray-700 mb-2">
                     Bank Name
                   </label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                       </svg>
                     </div>
                     <input
                       type="text"
                       id="editBankName"
                       name="bankName"
                       value={editFormData.bankName}
                       onChange={handleEditInputChange}
                       className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-sm transition-colors duration-200 ${
                         editErrors.bankName 
                           ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                           : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                       } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                       placeholder="Enter bank name"
                     />
                   </div>
                   {editErrors.bankName && (
                     <p className="mt-1 text-sm text-red-600 flex items-center">
                       <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                       </svg>
                       {editErrors.bankName}
                     </p>
                   )}
                 </div>

                 {/* Account Number Field */}
                 <div>
                   <label htmlFor="editAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                     Account Number
                   </label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                       </svg>
                     </div>
                     <input
                       type="text"
                       id="editAccountNumber"
                       name="accountNumber"
                       value={editFormData.accountNumber}
                       onChange={handleEditInputChange}
                       className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-sm transition-colors duration-200 ${
                         editErrors.accountNumber 
                           ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                           : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                       } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                       placeholder="Enter account number"
                     />
                   </div>
                   {editErrors.accountNumber && (
                     <p className="mt-1 text-sm text-red-600 flex items-center">
                       <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                       </svg>
                       {editErrors.accountNumber}
                     </p>
                   )}
                 </div>

                 {/* Action Buttons */}
                 <div className="flex items-center justify-end space-x-3 pt-4">
                   <button
                     type="button"
                     onClick={() => {
                       setEditModal(false)
                       setEditingBank(null)
                       setEditFormData({ bankName: '', accountNumber: '' })
                       setEditErrors({})
                     }}
                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     disabled={editLoading}
                     className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 ${
                       editLoading
                         ? 'bg-gray-400 cursor-not-allowed'
                         : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                     }`}
                   >
                     {editLoading ? (
                       <div className="flex items-center">
                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Updating...
                       </div>
                     ) : (
                       'Update Bank'
                     )}
                   </button>
                 </div>
               </form>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }

export default BankList
