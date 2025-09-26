import React, { useState, useEffect } from 'react';
import { useBankManagement } from './bankManagementContext';

function OperationProfitLoss() {
  const { serviceReport, serviceReportLoading,serviceReportList } = useBankManagement();
  const [expandedPackages, setExpandedPackages] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Helper function to get cab price based on priority logic
  const getCabPrice = (operation) => {
    const cabBookingData = operation.cabBookingData;
    
    // If cabBookingData is empty or doesn't exist, use the current transferCost
    if (!cabBookingData) {
      return operation.totals?.transferCost || 0;
    }
    
    // Priority 1: Check responseDetails for negotiateAmount
    if (cabBookingData.responseDetails && Array.isArray(cabBookingData.responseDetails)) {
      for (const response of cabBookingData.responseDetails) {
        if (response.negotiateAmount && response.negotiateAmount > 0) {
          return response.negotiateAmount;
        }
      }
      
      // Priority 2: Check responseDetails for amount
      for (const response of cabBookingData.responseDetails) {
        if (response.amount && response.amount > 0) {
          return response.amount;
        }
      }
    }
    
    // Priority 3: Use editprice
    if (cabBookingData.editprice && cabBookingData.editprice > 0) {
      return cabBookingData.editprice;
    }
    
    // Priority 4: Use cost
    if (cabBookingData.cost && cabBookingData.cost > 0) {
      return cabBookingData.cost;
    }
    
    // Fallback to current transferCost
    return operation.totals?.transferCost || 0;
  };

  // Filter data based on selected date range, month, and year
  const getFilteredData = () => {
    if (!serviceReport || !Array.isArray(serviceReport)) return [];
    
    return serviceReport.filter(operation => {
      if (!operation.leadata?.travelDate) return true;
      
      const travelDate = new Date(operation.leadata.travelDate);
      const travelMonth = travelDate.getMonth() + 1; // getMonth() returns 0-11
      const travelYear = travelDate.getFullYear();
      
      // Month filter
      if (selectedMonth && selectedMonth !== travelMonth.toString()) return false;
      
      // Year filter
      if (selectedYear && selectedYear !== travelYear.toString()) return false;
      
      // Date range filter
      if (startDate && travelDate < new Date(startDate)) return false;
      if (endDate && travelDate > new Date(endDate)) return false;
      
      return true;
    });
  };

  // Calculate totals from filtered service report data
  const calculateTotals = () => {
    const filteredData = getFilteredData();
    if (!filteredData || filteredData.length === 0) return {
      totalRevenue: 0,
      totalCosts: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      netProfit: 0
    };

    const totals = filteredData.reduce((acc, operation) => {
      console.log(acc);
      // Base costs - use editdetail if available, otherwise fall back to totals
      const activitiesCost = (operation.editdetail?.activities && operation.editdetail.activities.length > 0) 
        ? (operation.editdetail.activities[0]?.finaltotalActivitiesCost || 0)
        : (operation.totals?.activitiesCost || 0);
      
      const hotelCost = (operation.editdetail?.hotels && operation.editdetail.hotels.length > 0) 
        ? (operation.editdetail.hotels[0]?.finaltotalHotelCost || 0)
        : (operation.totals?.hotelCost || 0);
      
      const transferCost = getCabPrice(operation);
      const baseCost = activitiesCost + hotelCost + transferCost;
      
      // Use finalTotal as the total package cost (already includes margin + GST)
      const totalPackageCost = operation.finalTotal || 0;
      
      // Margin percentage from operation
      const marginPercentage = operation.marginPercentage || 0;
      
      // Discount percentage from operation
      const discountPercentage = operation.discountPercentage || 0;
      
      // Calculate margin amount on base cost
      const marginAmount = baseCost * (marginPercentage / 100);
      
      // Base cost + margin amount
      const baseCostWithMargin = baseCost + marginAmount;
      
      // Calculate discount amount on base cost + margin
      const discountAmount = baseCostWithMargin * (discountPercentage / 100);
      
      // Calculate GST amount (5% on base cost + margin - discount)
      const gstAmount = (baseCostWithMargin - discountAmount) * 0.05;
      
      // Profit is the margin amount minus discount amount
      const profit = marginAmount - discountAmount;
     
     return {
       totalRevenue: acc.totalRevenue + totalPackageCost,
       totalCosts: acc.totalCosts + baseCost,
       grossProfit: acc.grossProfit + profit,
       operatingExpenses: acc.operatingExpenses + baseCost,
       netProfit: acc.netProfit + profit
     };
   }, {
     totalRevenue: 0,
     totalCosts: 0,
     grossProfit: 0,
     operatingExpenses: 0,
     netProfit: 0
   });

   return totals;
 };

  const currentData = calculateTotals();
  const filteredData = getFilteredData();

  // Debug: Log the service report data structure
  console.log('Service Report Data:', serviceReport);


  // Toggle package expansion
  const togglePackage = (packageId) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value, total) => {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  const handleRefresh = () => {
    serviceReportList();
  };

  // Calculate cost breakdown percentages
  const getCostBreakdown = (operation) => {
    if (!operation) return { hotelCost: 0, transferCost: 0, activitiesCost: 0 };
    
    // Use editdetail if available, otherwise fall back to totals
    const activitiesCost = (operation.editdetail?.activities && operation.editdetail.activities.length > 0) 
      ? (operation.editdetail.activities[0]?.finaltotalActivitiesCost || 0)
      : (operation.totals?.activitiesCost || 0);
    
    const hotelCost = (operation.editdetail?.hotels && operation.editdetail.hotels.length > 0) 
      ? (operation.editdetail.hotels[0]?.finaltotalHotelCost || 0)
      : (operation.totals?.hotelCost || 0);
    
    const transferCost = getCabPrice(operation);
    const baseCost = activitiesCost + hotelCost + transferCost;
    
    if (baseCost === 0) return { hotelCost: 0, transferCost: 0, activitiesCost: 0 };
    
    return {
      hotelCost: (hotelCost / baseCost) * 100,
      transferCost: (transferCost / baseCost) * 100,
      activitiesCost: (activitiesCost / baseCost) * 100
    };
  };

  if (serviceReportLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-6">
          {/* Beautiful Animated Loader */}
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-20 h-20 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          
          {/* Loading Text with Animation */}
          <div className="text-center space-y-2">
            <div className="text-xl font-semibold text-gray-700 animate-pulse">Loading Profit & Loss Report</div>
            <div className="text-sm text-gray-500">Analyzing financial data...</div>
          </div>
          
          {/* Animated Dots */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold ">
              Profit & Loss Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Comprehensive financial analysis and package profitability tracking</p>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={serviceReportLoading}
            className="h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
          >
            {serviceReportLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Data</span>
              </>
            )}
          </button>
          
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue */}
        {/* <div className="  bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-green-600 mb-1">Total  Revenue</p>
              <p className="text-sm font-medium text-green-600 mb-1">(hotel+ cab+activities+ gst+margin)</p>
              <p className="text-3xl font-bold text-green-800">{formatCurrency(currentData.totalRevenue)}</p>
                             <p className="text-sm text-green-600 mt-1">From {filteredData?.length || 0} packages</p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div> */}

        {/* Total Costs */}
        <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 shadow-lg border border-red-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-red-600 mb-1">Total Costs</p>
              <p className="text-sm font-medium text-red-600 mb-1">(Hotel + Cab + Activities)</p>

              <p className="text-3xl font-bold text-red-800">{formatCurrency(currentData.totalCosts)}</p>
              <p className="text-sm text-red-600 mt-1">{formatPercentage(currentData.totalCosts, currentData.totalRevenue)}% of revenue</p>
            </div>
            <div className="p-3 bg-red-200 rounded-xl">
              <svg className="w-8 h-8 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

     

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Net Profit</p>
              <p className="text-3xl font-bold text-purple-800">{formatCurrency(currentData.netProfit)}</p>
              <p className="text-sm text-purple-600 mt-1">{formatPercentage(currentData.netProfit, currentData.totalRevenue)}% margin</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

             {/* Package Details Table */}
       <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
         <div className="px-6 py-6 border-b border-gray-200">
           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
             <div>
               <h3 className="text-2xl font-bold text-gray-900">Package Profitability Details</h3>
               <p className="text-gray-600 mt-1">Detailed breakdown of each package's costs and profitability</p>
             </div>
             
                           {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Month Filter */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                
                {/* Year Filter */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>
                
                {/* Start Date Filter */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* End Date Filter */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Clear Filters Button */}
                {(selectedMonth || selectedYear || startDate || endDate) && (
                  <button
                    onClick={() => {
                      setSelectedMonth('');
                      setSelectedYear('');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-200 self-end"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
           </div>
         </div>
        
                 {!filteredData || filteredData.length === 0 ? (
           <div className="px-6 py-12 text-center">
             <div className="text-gray-500 text-lg">No package data available for selected filters</div>
           </div>
         ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr >
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Package Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Revenue
                  </th>
                 
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-100">
                                 {filteredData.map((operation) => {
                  // Base costs - use editdetail if available, otherwise fall back to totals
                  const activitiesCost = (operation.editdetail?.activities && operation.editdetail.activities.length > 0) 
                    ? (operation.editdetail.activities[0]?.finaltotalActivitiesCost || 0)
                    : (operation.totals?.activitiesCost || 0);
                  
                  const hotelCost = (operation.editdetail?.hotels && operation.editdetail.hotels.length > 0) 
                    ? (operation.editdetail.hotels[0]?.finaltotalHotelCost || 0)
                    : (operation.totals?.hotelCost || 0);
                  
                  const transferCost = getCabPrice(operation);
                  const baseCost = activitiesCost + hotelCost + transferCost;
                  
                  // Use finalTotal as the total package cost (already includes margin + GST)
                  const totalPackageCost = operation.finalTotal || 0;
                  
                  // Margin percentage from operation
                  const marginPercentage = operation.marginPercentage || 0;
                  
                  // Discount percentage from operation
                  const discountPercentage = operation.discountPercentage || 0;
                  
                  // Calculate margin amount on base cost
                  const marginAmount = baseCost * (marginPercentage / 100);
                  
                  // Base cost + margin amount
                  const baseCostWithMargin = baseCost + marginAmount;
                  
                  // Calculate discount amount on base cost + margin
                  const discountAmount = baseCostWithMargin * (discountPercentage / 100);
                  
                  // Calculate GST amount (5% on base cost + margin - discount)
                  const gstAmount = (baseCostWithMargin - discountAmount) * 0.05;
                  
                  // Profit is the margin amount minus discount amount
                  const profit = marginAmount - discountAmount;
                  
                  // Calculate margin percentage for display
                  const marginDisplay = baseCost > 0 ? ((profit / baseCost) * 100).toFixed(1) : 0;
                  const costBreakdown = getCostBreakdown(operation);
                  
                  return (
                    <React.Fragment key={operation._id}>
                      <tr className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                              <span className="font-bold">destination: </span> {operation.leadata?.destination || 'Package'} - {operation.leadata?.packageType || 'Standard'}
                              </div>
                              <div className="text-sm text-gray-900"> <span className="font-bold">name: </span>{operation.leadata?.name || 'Customer'}</div>
                              <div className="text-xs text-gray-900">
                                <span className="font-bold">travel date: </span>
                                {operation.leadata?.travelDate ? new Date(operation.leadata.travelDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(totalPackageCost)}
                          </div>
                        </td>
                        
                       
                        
                        <td className="px-6 py-4">
                          <div className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`text-sm font-semibold ${marginDisplay >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {operation?.marginPercentage}%
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <button
                            onClick={() => togglePackage(operation._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                          >
                            {expandedPackages[operation._id] ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                Hide Details
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                View Details
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Package Details */}
                      {expandedPackages[operation._id] && (
                        <tr className="bg-gray-50">
                          <td colSpan="6" className="px-6 py-6">
                            <div className="space-y-6 ">
                              {/* Cost Breakdown Chart */}
                              <div className="bg-white p-2 rounded-xl border border-gray-200 ">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown Analysis</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Pie Chart Visualization */}
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-center">
                                      <div className="relative w-24 h-24">
                                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                          {/* Hotels */}
                                          <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#3B82F6"
                                            strokeWidth="20"
                                            strokeDasharray={`${(costBreakdown.hotelCost / 100) * 251.2} 251.2`}
                                            strokeDashoffset="0"
                                          />
                                          {/* Transfer */}
                                          <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#10B981"
                                            strokeWidth="20"
                                            strokeDasharray={`${(costBreakdown.transferCost / 100) * 251.2} 251.2`}
                                            strokeDashoffset={`-${(costBreakdown.hotelCost / 100) * 251.2}`}
                                          />
                                          {/* Activities */}
                                          <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#8B5CF6"
                                            strokeWidth="20"
                                            strokeDasharray={`${(costBreakdown.activitiesCost / 100) * 251.2} 251.2`}
                                            strokeDashoffset={`-${((costBreakdown.hotelCost + costBreakdown.transferCost) / 100) * 251.2}`}
                                          />
                                        </svg>
                                        
                                        {/* Center Label */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="text-center">
                                            <div className="text-xs font-bold text-gray-700">Total</div>
                                            <div className="text-xs text-gray-500">Costs</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-xs text-gray-600">Hotels</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-gray-600">Transfer</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span className="text-xs text-gray-600">Activities</span>
                                      </div>
                                    </div>
                                  </div>
                                              
                                  {/* Cost Details */}
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-blue-700">Hotels</span>
                                          <span className="text-sm font-bold text-blue-800">{costBreakdown.hotelCost.toFixed(1)}%</span>
                                        </div>
                                        <div className="text-lg font-bold text-blue-900 mt-1">{formatCurrency(hotelCost)}</div>
                                      </div>
                                      
                                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-green-700">Transfer</span>
                                          <span className="text-sm font-bold text-green-800">{costBreakdown.transferCost.toFixed(1)}%</span>
                                        </div>
                                        <div className="text-lg font-bold text-green-900 mt-1">{formatCurrency(transferCost)}</div>
                                      </div>
                                      
                                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-purple-700">Activities</span>
                                          <span className="text-sm font-bold text-purple-800">{costBreakdown.activitiesCost.toFixed(1)}%</span>
                                        </div>
                                        <div className="text-lg font-bold text-purple-900 mt-1">{formatCurrency(activitiesCost)}</div>
                                      </div>
                                      
                                                                             <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                         <div className="flex items-center justify-between">
                                           <span className="text-sm font-medium text-gray-700">Total</span>
                                           <span className="text-sm font-bold text-gray-800">100%</span>
                                         </div>
                                         <div className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(baseCost)}</div>
                                       </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                                                             {/* Profitability Metrics */}
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
                                   <h5 className="text-sm font-medium text-green-600 mb-2">Total Package Cost</h5>
                                   <p className="text-2xl font-bold text-green-800">{formatCurrency(totalPackageCost)}</p>
                                 </div>
                                 
                                 <div className="bg-gradient-to-br from-red-50 to-pink-100 p-4 rounded-xl border border-red-200">
                                   <h5 className="text-sm font-medium text-red-600 mb-2">Base Costs</h5>
                                   <p className="text-2xl font-bold text-red-800">{formatCurrency(baseCost)}</p>
                                 </div>
                                 
                                 <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-xl border border-blue-200">
                                   <h5 className="text-sm font-medium text-blue-600 mb-2">Profit (Margin)</h5>
                                   <p className="text-2xl font-bold text-blue-800">{formatCurrency(profit)}</p>
                                 </div>
                               </div>

                                                             {/* Calculation Breakdown */}
                               <div className="bg-white p-6 rounded-xl border border-gray-200">
                                 <h4 className="text-lg font-semibold text-gray-900 mb-4">Profit Calculation Breakdown</h4>
                                 <div className="space-y-4">
                                 
                                   
                                                                       <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                      <div className="text-center">
                                        <h5 className="text-lg font-semibold text-green-800 mb-2">Profit Calculation</h5>
                                        <p className="text-sm text-green-600">
                                          Final Package Cost: {formatCurrency(totalPackageCost)} - Base Costs: {formatCurrency(baseCost)} = 
                                          <span className="font-bold text-green-800 ml-2">Profit: {formatCurrency(profit)}</span>
                                        </p>
                                                                                                                          <p className="text-xs text-green-600 mt-1">
                                            Breakdown: Base Cost ({formatCurrency(baseCost)}) + Margin ({formatCurrency(marginAmount)}) - Discount ({formatCurrency(discountAmount)}) + GST ({formatCurrency(gstAmount)}) = Final Cost ({formatCurrency(totalPackageCost)})
                                          </p>
                                      </div>
                                    </div>
                                 </div>
                               </div>

                               
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OperationProfitLoss;
