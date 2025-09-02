import React, { useState, useEffect } from 'react';
import { useLeadManagement } from './leadManagementContext';
import { toast } from 'react-toastify';
import '../AllLeads.css';

function AllLeadmanagement() {
  const { 
    leads, 
    loading, 
    isFetchingAll,
    error, 
    currentPage,
    totalPages,
    hasLoadedData,
    fetchLeads, 
    refreshLeads,
    updateLead, 
    deleteLead 
  } = useLeadManagement();

  const [searchName, setSearchName] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Status options
  const statusOptions = [
    "New Lead",
    "Work in Progress", 
    "Lost",
    "Quote Sent",
    "Converted",
    "Follow Up"
  ];

  useEffect(() => {
    // Automatically fetch all leads when component mounts
    fetchLeads();
  }, []);

  // Debug auto-fetch state
  useEffect(() => {
    console.log('Auto-fetch State in Component:', {
      currentPage,
      totalPages,
      isFetchingAll,
      leadsCount: leads.length
    });
  }, [currentPage, totalPages, isFetchingAll, leads.length]);

  // Get unique categories from leads
  const uniqueCategories = [...new Set(leads.map(lead => lead.packageCategory).filter(Boolean))];

  // Filter leads based on search criteria
  const getFilteredLeads = () => {
    return leads.filter(lead => {
      const nameMatch = lead.name?.toLowerCase().includes(searchName.toLowerCase()) || !searchName;
      const mobileMatch = lead.mobile?.includes(searchMobile) || !searchMobile;
      const categoryMatch = lead.packageCategory === searchCategory || !searchCategory;
      
      return nameMatch && mobileMatch && categoryMatch;
    });
  };

  // Get filtered leads
  const currentLeads = getFilteredLeads();

  // Handle status dropdown toggle
  const handleStatusDropdownToggle = (leadId) => {
    setOpenStatusDropdown(openStatusDropdown === leadId ? null : leadId);
  };

  // Handle status selection
  const handleStatusSelect = async (status, lead) => {
    try {
      const updatedLead = await updateLead(lead._id, { ...lead, status });
      if (updatedLead) {
        toast.success('Status updated successfully');
        setOpenStatusDropdown(null);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Handle view lead
  const handleViewClick = (lead) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  // Handle delete lead
  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const success = await deleteLead(leadId);
      if (success) {
        toast.success('Lead deleted successfully');
      } else {
        toast.error('Failed to delete lead');
      }
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'New Lead':
        return 'bg-blue-100 text-blue-800';
      case 'Work in Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      case 'Quote Sent':
        return 'bg-purple-100 text-purple-800';
      case 'Converted':
        return 'bg-green-100 text-green-800';
      case 'Follow Up':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle search
  const handleSearch = () => {
    console.log('Search:', { searchName, searchMobile, searchCategory });
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchMobile("");
    setSearchName("");
    setSearchCategory("");
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={() => fetchLeads()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Lead Management</h2>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
          <input
            type="search"
            placeholder="Search by name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <input
            type="search"
            placeholder="Search by mobile number"
            value={searchMobile}
            onChange={(e) => setSearchMobile(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={handleClearSearch}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            Clear
          </button>
          <button
            onClick={refreshLeads}
            disabled={loading}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-visible bg-white rounded-lg shadow">
        {/* Title section */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[rgb(45,45,68)] text-white">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-lg font-medium">Leads Overview</h2>
        </div>

        {/* Status Filter Tabs */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 text-xl font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              All Leads
            </button>
            {statusOptions.map((status) => (
              <button
                key={status}
                className="px-3 py-1.5 text-xl font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-full overflow-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[rgb(45,45,68)]">
              <tr>
                <th scope="col" className="px-4 py-3 text-left min-w-[120px]">
                  <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Name</span>
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left min-w-[100px] hidden md:table-cell">
                  <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Going To/ Travel From </span>
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left min-w-[150px] hidden lg:table-cell">
                  <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Travel Date</span>
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left min-w-[120px]">
                  <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>Mobile</span>
                  </div>
                </th>
               
                <th scope="col" className="px-4 py-3 text-left min-w-[120px]">
                  <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Actions</span>
                  </div>
                </th>
              
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-2"></div>
                      <div className="text-sm text-gray-600">
                        {isFetchingAll ? 'Loading all leads automatically...' : 'Loading leads...'}
                      </div>
                      {isFetchingAll && (
                        <div className="text-xs text-gray-500 mt-1">
                          Page {currentPage} of {totalPages} • {leads.length} leads loaded so far
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : currentLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead, index) => (
                  <tr
                    key={lead._id || `lead-${index}`}
                    style={{
                      backgroundColor: lead.converted ? "#bbf7d0" : "white",
                    }}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`h-6 w-6 rounded-full ${
                            lead.converted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200"
                          } flex items-center justify-center`}
                        >
                          {lead.name?.charAt(0) || '?'}
                        </div>
                        <div className="ml-2">
                          <div
                            className={`text-sm font-medium ${
                              lead.converted ? "text-green-800" : "text-gray-900"
                            }`}
                          >
                            {lead.name || 'N/A'}
                          </div>
                          {/* Show email on mobile when hidden */}
                          <div className="text-xs text-gray-500 lg:hidden">
                            {lead?.travelDate
                              ? new Date(lead.travelDate).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">
                        Going to: {lead?.destination || 'N/A'}
                        <br />
                        Travel From: {lead?.from || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-[rgb(45,45,68)]">
                        travel date: {lead?.travelDate
                          ? new Date(lead.travelDate).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <div className="text-sm text-[rgb(45,45,68)]">
                        category: {lead?.packageCategory || 'N/A'}
                      </div>
                      <div className="text-sm text-[rgb(45,45,68)]">
                        adults: {lead?.adults || 0}
                        <br />
                        kids: {lead?.kids || 0}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {lead.mobile || 'N/A'}
                    </td>
               
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleViewClick(lead)}
                          className="text-gray-600 hover:text-blue-600 p-1"
                          title="View Details"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead._id)}
                          className="text-gray-600 hover:text-red-600 p-1"
                          title="Delete Lead"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Auto-fetch progress info */}
        {isFetchingAll && (
          <div className="px-4 py-3 border-t border-gray-200 bg-blue-50">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-sm text-blue-700">
                Automatically loading all leads... Page {currentPage} of {totalPages} • {leads.length} leads loaded
              </span>
            </div>
          </div>
        )}

      
      </div>

      {/* View Lead Modal */}
      {isViewModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Lead Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-sm text-gray-900">{selectedLead.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <p className="text-sm text-gray-900">{selectedLead.mobile || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900">{selectedLead.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                <p className="text-sm text-gray-900">
                  {selectedLead.travelDate ? new Date(selectedLead.travelDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <p className="text-sm text-gray-900">{selectedLead.from || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <p className="text-sm text-gray-900">{selectedLead.destination || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Category</label>
                <p className="text-sm text-gray-900">{selectedLead.packageCategory || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                <p className="text-sm text-gray-900">{selectedLead.adults || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kids</label>
                <p className="text-sm text-gray-900">{selectedLead.kids || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className="text-sm text-gray-900">{selectedLead.status || 'No Status'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-sm text-gray-900">
                  {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            {selectedLead.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-sm text-gray-900">{selectedLead.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AllLeadmanagement; 