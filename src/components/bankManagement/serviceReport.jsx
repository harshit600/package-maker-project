import React, { useState } from 'react'
import { useBankManagement } from './bankManagementContext'
import { useFinalcosting } from '../../context/FinalcostingContext'
function ServiceReport() {
  const {createBankTransaction, serviceReport, serviceReportLoading, serviceReportList, updateCabVerification, updateHotelVerification } = useBankManagement()
  const [expandedRows, setExpandedRows] = useState({})
  const [activeMainTab, setActiveMainTab] = useState('tomorrow')
  const [activeSubTab, setActiveSubTab] = useState('checkinHotel')
  const [verificationStates, setVerificationStates] = useState({})
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentData, setSelectedPaymentData] = useState(null)
  
  const [paymentFormData, setPaymentFormData] = useState({
    paymentMode: '',
    toAccount: '',
    paymentType: 'Payment',
    transactionAmount: '',
    transactionId: '',
    transactionDate: '',
    transactionDescription: ''
  })
  const { banks,banksLoading} = useFinalcosting()
  // Refresh data function
  const handleRefresh = () => {
    serviceReportList();
  };

  // Handle payment modal
  const handleOpenPaymentModal = (item) => {
    setSelectedPaymentData(item);
    // Set default form data when opening modal
    setPaymentFormData({
      paymentMode: '',
      toAccount: '',
      paymentType: 'Payment',
      transactionAmount: item.leadata?.remainingAmount || 0,
      transactionId: '',
      transactionDate: new Date().toISOString().slice(0, 16), // Format for datetime-local input
      transactionDescription: ''
    });
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentData(null);
    // Reset form data when closing modal
    setPaymentFormData({
      paymentMode: '',
      toAccount: '',
      paymentType: 'Payment',
      transactionAmount: '',
      transactionId: '',
      transactionDate: '',
      transactionDescription: ''
    });
  };

  const handleFormInputChange = (field, value) => {
    setPaymentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

    const handleSubmitPayment = async () => {
    try {
      // Get selected bank details
      const selectedBank = banks?.find(bank => bank._id === paymentFormData.toAccount);
      
      // Create payload similar to AllLeads.jsx structure
      const payload = {
        leadId: selectedPaymentData?.leadata?._id || null,
        leadName: selectedPaymentData?.leadata?.name || null,
        paymentMode: paymentFormData.paymentMode,
        paymentType: paymentFormData.paymentType,
        transactionAmount: paymentFormData.transactionAmount,
        transactionId: paymentFormData.transactionId,
        transactionDate: paymentFormData.transactionDate ? new Date(paymentFormData.transactionDate).toISOString().split('T')[0] : '',
        toAccount: selectedBank ? `${selectedBank.bankName} (${selectedBank.accountNumber})` : paymentFormData.toAccount,
        description: paymentFormData.transactionDescription,
        bank: selectedBank
          ? {
              id: selectedBank._id,
              bankName: selectedBank.bankName,
              accountNumber: selectedBank.accountNumber,
            }
          : null,
        // Additional data for service report
        submittedAt: new Date().toISOString()
      };
      
     
      
      // Send data to createBankTransaction API
      console.log('Sending data to createBankTransaction...');
      const response = await createBankTransaction(payload);
      console.log('Bank transaction created successfully:', response);
      
      // Handle payment submission logic here
      handleClosePaymentModal();
      
    } catch (error) {
      console.error('Error creating bank transaction:', error);
      // You can add error handling here (show error message to user)
      alert('Failed to create bank transaction: ' + error.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Toggle accordion row
  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Handle hotel verification
  const handleHotelVerification = (hotelGroup, groupIndex) => {
    const key = `hotel_${groupIndex}`;
    setVerificationStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle transfer verification
  const handleTransferVerification = (transfer, index) => {
    const key = `transfer_${index}`;
    setVerificationStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle verification response
  const handleVerificationResponse = async (type, isVerified, item, index, operationId) => {
    const key = `${type}_${index}`;
    setVerificationStates(prev => ({
      ...prev,
      [key]: false
    }));
    
    if (isVerified) {
      console.log(`${type} verified:`, item, 'at index:', index);
      
      if (type === 'transfer') {
        try {
          // Update the cab verification status
          const updatedDetailData = {
            ...item,
            verified: true
          };
          
          await updateCabVerification(operationId, index, updatedDetailData);
          
          console.log('Cab verification updated successfully');
        } catch (error) {
          console.error('Error updating cab verification:', error);
          // You might want to show an error message to the user here
        }
      } else if (type === 'hotel') {
        try {
          // For grouped hotels, we need to update each day separately
          if (item.hotels && item.hotels.length > 0) {
            // Update each hotel day separately
            for (const hotel of item.hotels) {
              const hotelData = {
                verified: true
              };
              
              await updateHotelVerification(operationId, hotel.day, hotelData);
              console.log(`Hotel day ${hotel.day} verification updated successfully`);
            }
            
            console.log('Hotel verification updated successfully');
          }
        } catch (error) {
          console.error('Error updating hotel verification:', error);
          // You might want to show an error message to the user here
        }
      }
    } else {
      console.log(`${type} rejected:`, item, 'at index:', index);
      // Add your rejection logic here
    }
  };

  // Tab management functions
  const handleMainTabChange = (tab) => {
    setActiveMainTab(tab);
    // Reset sub-tab to default when main tab changes
    if (tab === 'tomorrow' || tab === 'today' || tab === 'nextTenDays') {
      setActiveSubTab('checkinHotel');
    } else if (tab === 'unverified') {
      setActiveSubTab('hotel');
    } else if (tab === 'nonReceiptPayment' || tab === 'allReport' || tab === 'driverAssign') {
      // These tabs don't have sub-tabs, so reset to empty
      setActiveSubTab('');
    }
  };

  const handleSubTabChange = (subTab) => {
    setActiveSubTab(subTab);
  };

    // Filter data based on active tabs
  const filterDataByTabs = (data) => {
    if (!data || data.length === 0) return [];
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const nextTenDays = new Date();
    nextTenDays.setDate(today.getDate() + 10);
    
    return data.filter(item => {
      const travelDate = item.leadata?.travelDate;
      
      // For All Report, show all items regardless of travel date
      if (activeMainTab === 'allReport') {
        return true;
      }
      
      // For Non Receipt Payment, only show items with remaining amount > 0
      if (activeMainTab === 'nonReceiptPayment') {
        const remainingAmount = item.leadata?.remainingAmount || 0;
        return remainingAmount > 0;
      }
      
      // For other tabs, require travel date
      if (!travelDate) return false;
      
      const travelDateTime = new Date(travelDate);
      
      // Filter based on main tab
      if (activeMainTab === 'today') {
      
        
        // If Check Out Hotel is selected, only show reports with hotels that have check-out dates matching today
        if (activeSubTab === 'checkoutHotel') {
          if (item.hotels && item.hotels.length > 0) {
            for (const hotel of item.hotels) {
              const checkOutDate = new Date(travelDate);
              checkOutDate.setDate(checkOutDate.getDate() + hotel.day);
              const normalizedCheckOutDate = normalize(checkOutDate);
              const normalizedToday = normalize(today);
              if (normalizedCheckOutDate.getTime() === normalizedToday.getTime() ) {
                return true;
              }
            }
          }
          return false; // Don't show reports without relevant hotels
        }
        // For other sub-tabs, show reports with travel date matching today and verified items
        if (activeSubTab === 'checkinHotel') {
          // Check if any hotels have check-in date matching today and are verified
          if (item.hotels && item.hotels.length > 0) {
            for (const hotel of item.hotels) {
              const checkInDate = new Date(travelDate);
              checkInDate.setDate(checkInDate.getDate() + (hotel.day - 1));
              if (checkInDate.toDateString() === today.toDateString() ) {
                return true;
              }
            }
          }
          return false; // Don't show reports without relevant hotels
        } else if (activeSubTab === 'checkinCab') {
          // Check if any transfers have date matching today and are verified
          if (item.transfer?.details && item.transfer.details.length > 0) {
            for (const transfer of item.transfer.details) {
              const transferDate = new Date(travelDate);
              transferDate.setDate(transferDate.getDate() + (transfer.day - 1));
              if (transferDate.toDateString() === today.toDateString() ) {
                return true;
              }
            }
          }
          return false; // Don't show reports without relevant transfers
        }
        return travelDateTime.toDateString() === today.toDateString();
      } else if (activeMainTab === 'tomorrow') {
       
        
        // If Check Out Hotel is selected, only show reports with hotels that have check-out dates matching tomorrow
        if (activeSubTab === 'checkoutHotel') {
          if (item.hotels && item.hotels.length > 0) {
            for (const hotel of item.hotels) {
              const checkOutDate = new Date(travelDate);
              checkOutDate.setDate(checkOutDate.getDate() + hotel.day);
              const normalizedCheckOutDate = normalize(checkOutDate);
              const normalizedTomorrow = normalize(tomorrow);
              if (normalizedCheckOutDate.getTime() === normalizedTomorrow.getTime() ) {
                return true;
              }
            }
          }
          return false; // Don't show reports without relevant hotels
        }
        // For other sub-tabs, show reports with travel date matching tomorrow and verified items
        if (activeSubTab === 'checkinHotel') {
          // Check if any hotels have check-in date matching tomorrow and are verified
          if (item.hotels && item.hotels.length > 0) {
            for (const hotel of item.hotels) {
              const checkInDate = new Date(travelDate);
              checkInDate.setDate(checkInDate.getDate() + (hotel.day - 1));
              if (checkInDate.toDateString() === tomorrow.toDateString() ) {
                return true;
              }
            }
          }
          return false; // Don't show reports without relevant hotels
        } else if (activeSubTab === 'checkinCab') {
          // Check if any transfers have date matching tomorrow and are verified
          if (item.transfer?.details && item.transfer.details.length > 0) {
            for (const transfer of item.transfer.details) {
              const transferDate = new Date(travelDate);
              transferDate.setDate(transferDate.getDate() + (transfer.day - 1));
              if (transferDate.toDateString() === tomorrow.toDateString() ) {
                return true;
              }
            }
          }
          return false; // Don't show reports without relevant transfers
        }
        return travelDateTime.toDateString() === tomorrow.toDateString();
      } else if (activeMainTab === 'nextTenDays') {
       
        
        // For Next Ten Days, check if any service dates fall within the range
        // Check if travel date is within next 10 days
        if (travelDateTime >= today && travelDateTime <= nextTenDays) {
          // If Check In Cab is selected, only show reports with transfers within next 10 days (including today)
          if (activeSubTab === 'checkinCab') {
            if (item.transfer?.details && item.transfer.details.length > 0) {
              for (const transfer of item.transfer.details) {
                const transferDate = new Date(travelDate);
                transferDate.setDate(transferDate.getDate() + (transfer.day - 1));
                // Normalize dates to start of day for accurate comparison
                const normalizedTransferDate = normalize(transferDate);
                const normalizedToday = normalize(today);
                const normalizedNextTenDays = normalize(nextTenDays);
                
                if (normalizedTransferDate >= normalizedToday && normalizedTransferDate <= normalizedNextTenDays ) {
                  return true;
                }
              }
            }
            return false; // Don't show reports without relevant transfers
          }
          
          // If Check In Hotel is selected, only show reports with hotels within next 10 days
          if (activeSubTab === 'checkinHotel') {
            if (item.hotels && item.hotels.length > 0) {
              for (const hotel of item.hotels) {
                const checkInDate = new Date(travelDate);
                checkInDate.setDate(checkInDate.getDate() + (hotel.day - 1));
                // Normalize dates to start of day for accurate comparison
                const normalizedCheckInDate = normalize(checkInDate);
                const normalizedToday = normalize(today);
                const normalizedNextTenDays = normalize(nextTenDays);
                
                if (normalizedCheckInDate >= normalizedToday && normalizedCheckInDate <= normalizedNextTenDays ) {
                  return true;
                }
              }
            }
            return false; // Don't show reports without relevant hotels
          }
          
          // If Check Out Hotel is selected, only show reports with hotels within next 10 days
          if (activeSubTab === 'checkoutHotel') {
            if (item.hotels && item.hotels.length > 0) {
              for (const hotel of item.hotels) {
                const checkOutDate = new Date(travelDate);
                checkOutDate.setDate(checkOutDate.getDate() + hotel.day);
                // Normalize dates to start of day for accurate comparison
                const normalizedCheckOutDate = normalize(checkOutDate);
                const normalizedToday = normalize(today);
                const normalizedNextTenDays = normalize(nextTenDays);
                
                if (normalizedCheckOutDate >= normalizedToday && normalizedCheckOutDate <= normalizedNextTenDays ) {
                  return true;
                }
              }
            }
            return false; // Don't show reports without relevant hotels
          }
          
          // If no specific sub-tab is selected, show all items within next 10 days
          return true;
        }
        
        return false;
      } else if (activeMainTab === 'driverAssign') {
        // Show all data for driver assign
        return true;
      } else if (activeMainTab === 'unverified') {
        // Show only items that have verified: false
        if (activeSubTab === 'hotel') {
          // For hotel sub-tab, check if any hotels are unverified
          if (item.hotels && item.hotels.length > 0) {
            for (const hotel of item.hotels) {
              if (hotel?.verified === false) {
                return true;
              }
            }
          }
          return false;
        } else if (activeSubTab === 'cab') {
          // For cab sub-tab, check if any transfers are unverified
          if (item.transfer?.details && item.transfer.details.length > 0) {
            for (const transfer of item.transfer.details) {
              if (transfer?.verified === false) {
                return true;
              }
            }
          }
          return false;
        }
        return false;
      } else if (activeMainTab === 'allReport') {
        // Show all data for all report
        return true;
      } else if (activeMainTab === 'nonReceiptPayment') {
        // Show only reports where remainingAmount > 0
        const remainingAmount = item.leadata?.remainingAmount || 0;
        return remainingAmount > 0;
      }
      
      return true;
    });
  };

    // Filter hotels based on sub-tab
  const filterHotelsBySubTab = (hotels, travelDate) => {
    if (!hotels || hotels.length === 0) return [];
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const nextTenDays = new Date();
    nextTenDays.setDate(today.getDate() + 10);
    
    // For Non Receipt Payment and All Report, show all hotels
    if (activeMainTab === 'nonReceiptPayment' || activeMainTab === 'allReport') {
      return hotels;
    }
    
    if (activeSubTab === 'checkinHotel') {
      // Show hotels with check-in date matching the main tab
      if (activeMainTab === 'today') {
        return hotels.filter(hotel => {
          const checkInDate = new Date(travelDate);
          checkInDate.setDate(checkInDate.getDate() + (hotel.day - 1));
          return checkInDate.toDateString() === today.toDateString() ;
        });
      } else if (activeMainTab === 'tomorrow') {
        return hotels.filter(hotel => {
          const checkInDate = new Date(travelDate);
          checkInDate.setDate(checkInDate.getDate() + (hotel.day - 1));
          return checkInDate.toDateString() === tomorrow.toDateString() ;
        });
             } else if (activeMainTab === 'nextTenDays') {
         // Show all hotels with check-in dates within next 10 days (including today)
         return hotels.filter(hotel => {
           const checkInDate = new Date(travelDate);
           checkInDate.setDate(checkInDate.getDate() + (hotel.day - 1));
           // Normalize dates to start of day for accurate comparison
           const normalizedCheckInDate = normalize(checkInDate);
           const normalizedToday = normalize(today);
           const normalizedNextTenDays = normalize(nextTenDays);
           
           return normalizedCheckInDate >= normalizedToday && normalizedCheckInDate <= normalizedNextTenDays ;
         });
       }
    } else if (activeSubTab === 'checkoutHotel') {
      // Show hotels with check-out date matching the main tab
      if (activeMainTab === 'today') {
                 return hotels.filter(hotel => {
           const checkOutDate = normalize(new Date(travelDate));
           checkOutDate.setDate(checkOutDate.getDate() + hotel.day);
           return checkOutDate.toDateString() === today.toDateString();
         });
       } else if (activeMainTab === 'tomorrow') {
         return hotels.filter(hotel => {
           const checkOutDate = normalize(new Date(travelDate));
           checkOutDate.setDate(checkOutDate.getDate() + hotel.day);
           return checkOutDate.toDateString() === tomorrow.toDateString() ;
         });
               } else if (activeMainTab === 'nextTenDays') {
          // Show all hotels with check-out dates within next 10 days (including today)
          return hotels.filter(hotel => {
            const checkOutDate = normalize(new Date(travelDate));
            checkOutDate.setDate(checkOutDate.getDate() + hotel.day);
            // Normalize dates to start of day for accurate comparison
            const normalizedCheckOutDate = normalize(checkOutDate);
            const normalizedToday = normalize(today);
            const normalizedNextTenDays = normalize(nextTenDays);
            
            return normalizedCheckOutDate >= normalizedToday && normalizedCheckOutDate <= normalizedNextTenDays ;
          });
        }
    } else if (activeMainTab === 'unverified') {
      // For unverified tab, show hotels based on sub-tab selection
      if (activeSubTab === 'hotel') {
        // Show only unverified hotels
        return hotels.filter(hotel => hotel?.verified === false);
      }
    }
    
    return hotels;
  };
  function normalize(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // reset time to midnight
    return d;
  }
  // Filter transfers based on sub-tab
  const filterTransfersBySubTab = (transfers, travelDate) => {
    if (!transfers || transfers.length === 0) return [];
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const nextTenDays = new Date();
    nextTenDays.setDate(today.getDate() + 10);
    
      // For Non Receipt Payment and All Report, show all transfers
    if (activeMainTab === 'nonReceiptPayment' || activeMainTab === 'allReport') {
      return transfers;
    }
    
    if (activeSubTab === 'checkinCab') {
      // Show cabs with date matching the main tab
      if (activeMainTab === 'today') {
        return transfers.filter(transfer => {
          const cabDate = new Date(travelDate);
          cabDate.setDate(cabDate.getDate() + (transfer.day - 1));
          return cabDate.toDateString() === today.toDateString() ;
        });
      } else if (activeMainTab === 'tomorrow') {
        return transfers.filter(transfer => {
          const cabDate = new Date(travelDate);
          cabDate.setDate(cabDate.getDate() + (transfer.day - 1));
          return cabDate.toDateString() === tomorrow.toDateString() ;
        });
      } else if (activeMainTab === 'nextTenDays') {
        // Show all cabs with dates within next 10 days
        return transfers.filter(transfer => {
            let cabDate = normalize(new Date(travelDate));
            cabDate.setDate(cabDate.getDate() + (transfer.day - 1));
          
            return cabDate >= normalize(today) && cabDate <= normalize(nextTenDays) ;
          });
          
             }
     } else if (activeMainTab === 'unverified') {
       // For unverified tab, show transfers based on sub-tab selection
       if (activeSubTab === 'cab') {
         // Show only unverified transfers
         return transfers.filter(transfer => transfer?.verified === false);
       }
     }
     
     return transfers;
  };

  // Group consecutive hotels with same city and property name
  const groupConsecutiveHotels = (hotels, travelDate) => {
    if (!hotels || hotels.length === 0) return [];
    
    const grouped = [];
    let currentGroup = null;
    
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      const key = `${hotel.cityName}-${hotel.propertyName}`;
      
      if (!currentGroup || currentGroup.key !== key) {
        // Start new group
        if (currentGroup) {
          grouped.push(currentGroup);
        }
        currentGroup = {
          key,
          cityName: hotel.cityName,
          propertyName: hotel.propertyName,
          startDay: hotel.day,
          endDay: hotel.day,
          hotels: [hotel],
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut
        };
      } else {
        // Add to current group
        currentGroup.endDay = hotel.day;
        currentGroup.hotels.push(hotel);
        // Update checkOut if this hotel has a later date
        if (hotel.checkOut && (!currentGroup.checkOut || hotel.checkOut > currentGroup.checkOut)) {
          currentGroup.checkOut = hotel.checkOut;
        }
      }
    }
    
    // Add the last group
    if (currentGroup) {
      grouped.push(currentGroup);
    }
    
    // Calculate check-in and check-out dates based on travel date and day numbers
    if (travelDate) {
      const baseDate = new Date(travelDate);
      grouped.forEach(group => {
        // Check-in: travel date + (start day - 1) days
        const checkInDate = new Date(baseDate);
        checkInDate.setDate(baseDate.getDate() + (group.startDay - 1));
        
        // Check-out: travel date + end day days (since it's the day they leave)
        const checkOutDate = new Date(baseDate);
        checkOutDate.setDate(baseDate.getDate() + group.endDay);
        
        group.checkIn = checkInDate.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        
        group.checkOut = checkOutDate.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      });
    }
    
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold  bg-clip-text text-black">
              Service Report
            </h1>
            <p className="text-gray-600 text-lg">Lead conversion and service tracking dashboard</p>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={serviceReportLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
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
        
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">{serviceReport?.length || 0}</p>
              </div>
            </div>
          </div>
                 </div>
       </div>

       {/* Tabs Section */}
       <div className="mb-8">
         {/* Main Tabs */}
         <div className="flex flex-wrap gap-2 mb-4">
           <button
             onClick={() => handleMainTabChange('tomorrow')}
             className={`px-6  h-10 rounded-lg font-medium transition-all duration-200 ${
               activeMainTab === 'tomorrow'
                 ? 'bg-blue-600 text-white shadow-lg'
                 : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
             }`}
           >
             Tomorrow
           </button>
           <button
             onClick={() => handleMainTabChange('today')}
             className={`px-6  h-10 rounded-lg font-medium transition-all duration-200 ${
               activeMainTab === 'today'
                 ? 'bg-blue-600 text-white shadow-lg'
                 : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
             }`}
           >
             Today
           </button>
           <button
             onClick={() => handleMainTabChange('nextTenDays')}
             className={`px-6  h-10 rounded-lg font-medium transition-all duration-200 ${
               activeMainTab === 'nextTenDays'
                 ? 'bg-blue-600 text-white shadow-lg'
                 : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
             }`}
           >
             Next Ten Days
           </button>
           <button
             onClick={() => handleMainTabChange('driverAssign')}
             className={`px-6  h-10 rounded-lg font-medium transition-all duration-200 ${
               activeMainTab === 'driverAssign'
                 ? 'bg-blue-600 text-white shadow-lg'
                 : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
             }`}
           >
             Driver Assign Report
           </button>
                       <button
              onClick={() => handleMainTabChange('unverified')}
              className={`px-6  h-10 rounded-lg font-medium transition-all duration-200 ${
                activeMainTab === 'unverified'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Unverified
            </button>
            <button
              onClick={() => handleMainTabChange('allReport')}
              className={`px-6  h-10 rounded-lg font-medium transition-all duration-200 ${
                activeMainTab === 'allReport'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Report
            </button>
            <button
              onClick={() => handleMainTabChange('nonReceiptPayment')}
              className={`px-6  h-10 rounded-lg font-medium transition-all duration-200 ${
                activeMainTab === 'nonReceiptPayment'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Non Receipt Payment
            </button>
         </div>

                   {/* Sub Tabs */}
           {(activeMainTab === 'tomorrow' || activeMainTab === 'today' || activeMainTab === 'nextTenDays') && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSubTabChange('checkinHotel')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSubTab === 'checkinHotel'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Check In Hotel
              </button>
              <button
                onClick={() => handleSubTabChange('checkinCab')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSubTab === 'checkinCab'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Check In Cab
              </button>
              <button
                onClick={() => handleSubTabChange('checkoutHotel')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSubTab === 'checkoutHotel'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Check Out Hotel
              </button>

            </div>
          )}

          {/* Sub Tabs for Unverified */}
          {activeMainTab === 'unverified' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSubTabChange('hotel')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSubTab === 'hotel'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Hotel
              </button>
              <button
                onClick={() => handleSubTabChange('cab')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSubTab === 'cab'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Cab
              </button>
            </div>
          )}
       </div>

              {/* Main Content */}
       {/* Tab Content Indicator */}
       <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2 text-sm text-gray-600">
             <span className="font-medium">Active Tab:</span>
                           <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                 {activeMainTab === 'tomorrow' && 'Tomorrow'}
                 {activeMainTab === 'today' && 'Today'}
                 {activeMainTab === 'nextTenDays' && 'Next Ten Days'}
                 {activeMainTab === 'driverAssign' && 'Driver Assign Report'}
                 {activeMainTab === 'unverified' && 'Unverified'}
                 {activeMainTab === 'allReport' && 'All Report'}
                 {activeMainTab === 'nonReceiptPayment' && 'Non Receipt Payment'}
              </span>
                           {activeMainTab !== 'driverAssign' && activeMainTab !== 'allReport' && activeMainTab !== 'nonReceiptPayment' && (
               <>
                 <span className="text-gray-400">•</span>
                 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium ">
                   {activeSubTab === 'checkinHotel' && 'Check In Hotel'}
                   {activeSubTab === 'checkinCab' && 'Check In Cab'}
                   {activeSubTab === 'checkoutHotel' && 'Check Out Hotel'}
                   {activeSubTab === 'hotel' && 'Hotel'}
                   {activeSubTab === 'cab' && 'Cab'}
                 </span>
               </>
             )}
           </div>
           
           {/* Filter Summary */}
           <div className="text-sm text-gray-600">
             <span className="font-medium">Showing:</span>
             <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded">
               {filterDataByTabs(serviceReport).length} of {serviceReport?.length || 0} reports
             </span>
           </div>
         </div>
       </div>

       {serviceReportLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative">
              <svg className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-xl text-gray-600 font-medium">Loading service report data...</p>
            <p className="text-gray-500 mt-2">Please wait while we fetch the latest information</p>
          </div>
        </div>
      ) : serviceReport && serviceReport.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 ">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Lead Conversion Reports
            </h2>
            <p className="text-gray-600 mt-1">Detailed view of all lead conversion activities</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer Details
                  </th>
                 
                
                 
                      <th className="px-6 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Payment Staus
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Completed Amount %
                      </th>
                      {activeMainTab === 'nonReceiptPayment' && (
                    <>
                      <th className="px-6 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Add Payment
                      </th>

                    </>
                  )}
                  <th className="px-6 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                                 {filterDataByTabs(serviceReport).map((item, index) => (
                  <React.Fragment key={item._id || index}>
                    <tr className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-2 py-2">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                              <span className="text-lg font-bold text-blue-700">
                                {item.leadata?.name?.charAt(0) || 'G'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 space-y-2">
                            <div className="text-base font-semibold text-gray-900">
                              {item.leadata?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {item.leadata?.mobile || 'N/A'}
                            </div>
                           
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {item.leadata?.travelDate 
                                ? new Date(item.leadata.travelDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : 'No date available'
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      
                   
                     
                      
                   
                          <td className="px-6 py-6">
                            <div className="text-sm text-gray-900">
                              <div className="font-semibold text-base text-red-600">
                                <div>
                                  Total Amount: ₹ <span className="font-bold text-black">{item.leadata?.totalAmount || 0}</span>
                                </div>
                                <div>
                                  Remaining Amount: ₹ <span className="font-bold text-black">{item.leadata?.remainingAmount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="text-sm text-gray-900">
                              {(() => {
                                const totalAmount = parseFloat(item.leadata?.totalAmount) || 0;
                                const remainingAmount = parseFloat(item.leadata?.remainingAmount) || 0;
                                const completedAmount = totalAmount - remainingAmount;
                                const completedPercentage = totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0;
                                
                                return (
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                      {completedPercentage}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ₹{completedAmount.toFixed(2)} completed
                                    </div>
                                  
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                          {activeMainTab === 'nonReceiptPayment' && (
                          <td className="px-6 py-6" style={{width:"300px"}}>
                            <div className="text-sm text-gray-900">
                              <button 
                                onClick={() => handleOpenPaymentModal(item)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Payment Request
                              </button>
                            </div>
                          </td>
                          )}                     
                     
                      
                      <td className="px-6 py-6 text-sm font-medium" style={{width:"250px"}}>
                        <button
                          onClick={() => toggleRow(index)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          {expandedRows[index] ? (
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
                    
                    {/* Accordion Row */}
                    {expandedRows[index] && (
                      <tr className="bg-gray-50" >
                        <td colSpan={activeMainTab === 'nonReceiptPayment' ? "8" : "8"} className="px-6 py-6">
                          <div className="space-y-6" >
                          

                                                           {/* Hotels - Show when Check In Hotel, Check Out Hotel is selected, when All Report is active, or when Unverified tab with hotel sub-tab is active */}
                              {item.hotels && item.hotels.length > 0 && (activeSubTab === 'checkinHotel' || activeSubTab === 'checkoutHotel' || activeMainTab === 'allReport' || activeMainTab === 'nonReceiptPayment' || (activeMainTab === 'unverified' && activeSubTab === 'hotel')) && (
                                <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm">
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Hotel Bookings
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Days
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            City
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Hotel Name
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Check In
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Check Out
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Nights
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-100">
                                                                        {groupConsecutiveHotels(filterHotelsBySubTab(item.hotels, item.leadata?.travelDate), item.leadata?.travelDate).map((hotelGroup, groupIndex) => (
                                          <tr key={groupIndex} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                {hotelGroup.startDay === hotelGroup.endDay 
                                                  ? `Day ${hotelGroup.startDay}` 
                                                  : `Day ${hotelGroup.startDay} - Day ${hotelGroup.endDay}`
                                                }
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-sm font-medium text-gray-700">{hotelGroup.cityName}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-sm font-semibold text-gray-900">{hotelGroup.propertyName || 'Hotel Name'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-sm text-gray-600">{hotelGroup.checkIn || 'N/A'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-sm text-gray-600">{hotelGroup.checkOut || 'N/A'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                                                {hotelGroup.hotels.length} {hotelGroup.hotels.length === 1 ? 'night' : 'nights'}
                                              </span>
                                            </td>
                                                                                                                                      <td className="px-4 py-3 whitespace-nowrap">
                                                {activeMainTab === 'unverified' ? (
                                                  verificationStates[`hotel_${groupIndex}`] ? (
                                                    <div className="flex gap-1">
                                                                                                             <button
                                                         className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                         onClick={() => handleVerificationResponse('hotel', true, hotelGroup, groupIndex, item._id)}
                                                       >
                                                         Yes
                                                       </button>
                                                       <button
                                                         className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                         onClick={() => handleVerificationResponse('hotel', false, hotelGroup, groupIndex, item._id)}
                                                       >
                                                         No
                                                       </button>
                                                    </div>
                                                  ) : (
                                                    <button
                                                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
                                                      onClick={() => handleHotelVerification(hotelGroup, groupIndex)}
                                                    >
                                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                      </svg>
                                                      Verify
                                                    </button>
                                                  )
                                                ) : (activeMainTab === 'today' || activeMainTab === 'tomorrow' || activeMainTab === 'nextTenDays') ? (
                                                  // Show verification status for today, tomorrow, and next ten days tabs
                                                  hotelGroup.hotels.some(hotel => hotel.verified === true) ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                      </svg>
                                                      Verified
                                                    </span>
                                                  ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                      </svg>
                                                      Not Verified
                                                    </span>
                                                  )
                                                ) : (
                                                  <button
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
                                                    onClick={() => handleHotelVerification(hotelGroup, groupIndex)}
                                                  >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Verified
                                                  </button>
                                                )}
                                              </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                                                          {/* Transfers - Show when Check In Cab is selected, when All Report is active, or when Unverified tab with cab sub-tab is active */}
                              {item.transfer?.details && item.transfer.details.length > 0 && (activeSubTab === 'checkinCab' || activeMainTab === 'allReport' || activeMainTab === 'nonReceiptPayment' || (activeMainTab === 'unverified' && activeSubTab === 'cab')) && (
                               <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
                                 <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                   <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                   </svg>
                                   Transfer Details
                                 </h4>
                                 <div className="overflow-x-auto">
                                   <table className="min-w-full divide-y divide-gray-200">
                                     <thead className="bg-gray-50">
                                       <tr>
                                                                                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Day
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Date
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Cab Type
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Cab Name
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                          </th>
                                       </tr>
                                     </thead>
                                     <tbody className="bg-white divide-y divide-gray-100">
                                                                               {filterTransfersBySubTab(item.transfer.details, item.leadata?.travelDate).map((transfer, transferIndex) => {
                                          // Calculate date for this transfer day
                                          let transferDate = 'N/A';
                                          if (item.leadata?.travelDate) {
                                            const baseDate = new Date(item.leadata.travelDate);
                                            const transferDayDate = new Date(baseDate);
                                            transferDayDate.setDate(baseDate.getDate() + (transfer.day - 1));
                                            transferDate = transferDayDate.toLocaleDateString('en-US', {
                                              day: '2-digit',
                                              month: 'short',
                                              year: 'numeric'
                                            });
                                          }
                                          
                                          return (
                                            <tr key={transferIndex} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                                  Day {transfer.day}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 font-medium">{transferDate}</span>
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-700">{transfer.cabType || 'N/A'}</span>
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900">{transfer.cabName || 'Cab Service'}</span>
                                              </td>
                                                                                                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                  {activeMainTab === 'unverified' ? (
                                                    verificationStates[`transfer_${transferIndex}`] ? (
                                                      <div className="flex gap-1">
                                                        <button
                                                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                          onClick={() => handleVerificationResponse('transfer', true, transfer, transferIndex, item._id)}
                                                        >
                                                          Yes
                                                        </button>
                                                        <button
                                                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                          onClick={() => handleVerificationResponse('transfer', false, transfer, transferIndex, item._id)}
                                                        >
                                                          No
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <button
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
                                                        onClick={() => handleTransferVerification(transfer, transferIndex)}
                                                      >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Verify
                                                      </button>
                                                    )
                                                  ) : (activeMainTab === 'today' || activeMainTab === 'tomorrow' || activeMainTab === 'nextTenDays') ? (
                                                    // Show verification status for today, tomorrow, and next ten days tabs
                                                    transfer.verified === true ? (
                                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Verified
                                                      </span>
                                                    ) : (
                                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Not Verified
                                                      </span>
                                                    )
                                                  ) : (
                                                    <button
                                                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
                                                      onClick={() => handleTransferVerification(transfer, transferIndex)}
                                                    >
                                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Verified
                                                      </button>
                                                  )}
                                                </td>
                                            </tr>
                                          );
                                        })}
                                     </tbody>
                                   </table>
                                 </div>
                               </div>
                             )}

                           
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports available</h3>
          <p className="text-gray-500 mb-6">No service report data found. Try refreshing or check back later.</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Refresh Data
          </button>
        </div>
      )}

             {/* Payment Modal */}
       {showPaymentModal && selectedPaymentData && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
             {/* Header */}
             <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
               <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-gray-900">
                   Unreceived Payment Report 
                 </h3>
                 <button
                   onClick={handleClosePaymentModal}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             </div>

             <div className="p-6 space-y-6">
               {/* Customer and Cost Overview */}
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                 
                   <div>
                     <span className="font-semibold text-gray-700">Name:</span>
                     <div className="font-bold text-blue-900">Mr. Nitish</div>
                   </div>
                   <div>
                     <span className="font-semibold text-gray-700">Total Package Cost:</span>
                     <div className="font-bold text-blue-900">₹ {selectedPaymentData.leadata?.totalAmount || '0'}</div>
                   </div>
                   <div>
                     <span className="font-semibold text-gray-700">Total Paid Amount:</span>
                     <div className="font-bold text-blue-900">₹ {(selectedPaymentData.leadata?.totalAmount || 0) - (selectedPaymentData.leadata?.remainingAmount || 0)}</div>
                   </div>
                   <div>
                     <span className="font-semibold text-gray-700">Total Due Amount:</span>
                     <div className="font-bold text-blue-900">₹ {selectedPaymentData.leadata?.remainingAmount || '0'}</div>
                   </div>
                 </div>
               </div>

               {/* Payment Details Input */}
               <div className="space-y-4">
                 <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Payment Details</h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                     <select 
                       value={paymentFormData.paymentMode}
                       onChange={(e) => handleFormInputChange('paymentMode', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     >
                       <option value="">Select</option>
                                        <option value="gpay">GPay</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="cash">Cash</option>
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                     <select 
                       value={paymentFormData.toAccount}
                       onChange={(e) => handleFormInputChange('toAccount', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     >
                       <option value="">Select To Account</option>
                       {banks && banks.map((bank, index) => (
                         <option key={bank._id || index} value={bank._id}>
                           {bank.bankName} - {bank.accountNumber}
                         </option>
                       ))}
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                     <select 
                       value={paymentFormData.paymentType}
                       onChange={(e) => handleFormInputChange('paymentType', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     >
                       <option value="Payment">Payment</option>
                       <option value="IN">In</option>
                       <option value="OUT">Out</option>
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Amount</label>
                     <input
                       type="number"
                       value={paymentFormData.transactionAmount}
                       onChange={(e) => handleFormInputChange('transactionAmount', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Id/Check No.</label>
                     <input
                       type="text"
                       value={paymentFormData.transactionId}
                       onChange={(e) => handleFormInputChange('transactionId', e.target.value)}
                       placeholder="Transaction Id/Check No."
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
                     <input
                       type="datetime-local"
                       value={paymentFormData.transactionDate}
                       onChange={(e) => handleFormInputChange('transactionDate', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                   
                 
                   
                   <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Description</label>
                     <textarea
                       value={paymentFormData.transactionDescription}
                       onChange={(e) => handleFormInputChange('transactionDescription', e.target.value)}
                       placeholder="Description"
                       rows="3"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                     <input
                       type="text"
                       value={selectedPaymentData.leadata?.totalAmount || '45500'}
                       readOnly
                       className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Total Due</label>
                     <input
                       type="text"
                       value={selectedPaymentData.leadata?.remainingAmount || '0'}
                       readOnly
                       className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                     />
                   </div>
                 </div>
               </div>

             
             </div>

             {/* Action Button */}
             <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
               <div className="flex justify-center">
                 <button
                   onClick={handleSubmitPayment}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                 >
                   Submit
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

export default ServiceReport;