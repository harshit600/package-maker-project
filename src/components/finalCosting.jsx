"use client";

import { useEffect, useState } from "react";
import { usePackage } from "../context/PackageContext";
import { Icons, pdfStyles } from "./newFile";
import { useFinalcosting } from "../context/FinalcostingContext";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
  Svg,
  Path,
  BlobProvider,
} from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";
import "./finalCosting.css";
import PlutoToursPDF from "./PlutoToursPDF";
import DemandSetuPDF from "./DemandSetuPDF";
import { toast } from "react-toastify";
import QuotePreviewDetails from "./QuotePreviewDetails";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};


const FinalCosting = ({ selectedLead, setActiveTab }) => {
  const { 
    loadings,
    loadingsss, 
    userData,
    createFinalcosting,
    deleteFinalcosting,
    updateFinalcosting,
    updateLead,
    trackDownload,
    fetchMarginByState,
    requestEditDiscount,
    fetchHistoryByPackageId,
    marginData,
    setMarginData
  } = useFinalcosting();
  const { packageSummary } = usePackage();
  const [showMargin, setShowMargin] = useState(false);
  const [history, setHistory] = useState([]);
  console.log(history,"history")
  const [showCustomMargin, setShowCustomMargin] = useState(false);
  const [customMarginPercentage, setCustomMarginPercentage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [activeMarginPercentage, setActiveMarginPercentage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [margins, setMargins] = useState({
    firstQuoteMargins: {},
    minimumQuoteMargins: {},
  });
  const [showDiscount, setShowDiscount] = useState(false);
  const [customDiscountPercentage, setCustomDiscountPercentage] = useState("");
  const [activeDiscountPercentage, setActiveDiscountPercentage] = useState(null);
  // Add new state for tracking downloads
  const [downloadCounts, setDownloadCounts] = useState({});

  // Move getCurrentMarginPercentage here, before it's used
  const getCurrentMarginPercentage = () => {
    if (activeMarginPercentage !== null) {
      return activeMarginPercentage;
    }

    if (!marginData || !marginData.firstQuoteMargins) {
      return 0;
    }

    const total = packageSummary?.totals?.grandTotal || 0;
    let marginPercentage = 0;

    if (total < 100000) {
      marginPercentage = Number(marginData.firstQuoteMargins.lessThan1Lakh);
    } else if (total >= 100000 && total < 200000) {
      marginPercentage = Number(marginData.firstQuoteMargins.between1To2Lakh);
    } else if (total >= 200000 && total < 300000) {
      marginPercentage = Number(marginData.firstQuoteMargins.between2To3Lakh);
    } else {
      marginPercentage = Number(marginData.firstQuoteMargins.moreThan3Lakh);
    }

    return marginPercentage;
  };

  const calculateMargin = (total, customPercentage = null) => {
    if (customPercentage !== null) {
      return total * (customPercentage / 100);
    }

    if (!marginData || !marginData.firstQuoteMargins) {
      return 0;
    }

    let marginPercentage = 0;

    if (total < 100000) {
      marginPercentage = Number(marginData.firstQuoteMargins.lessThan1Lakh);
    } else if (total >= 100000 && total < 200000) {
      marginPercentage = Number(marginData.firstQuoteMargins.between1To2Lakh);
    } else if (total >= 200000 && total < 300000) {
      marginPercentage = Number(marginData.firstQuoteMargins.between2To3Lakh);
    } else {
      marginPercentage = Number(marginData.firstQuoteMargins.moreThan3Lakh);
    }

    const calculatedMargin = total * (marginPercentage / 100);
    return calculatedMargin;
  };

  const calculateDiscount = (total, discountPercentage = null) => {
    if (discountPercentage !== null) {
      return total * (discountPercentage / 100);
    }
    return 0;
  };

  const marginAmount = calculateMargin(
    packageSummary?.totals?.grandTotal || 0,
    history.length === 0 ? activeMarginPercentage : getCurrentMarginPercentage()
  );

  const discountAmount = calculateDiscount(
    packageSummary?.totals?.grandTotal || 0,
    activeDiscountPercentage
  );

  const finalTotal = (packageSummary?.totals?.grandTotal || 0) + marginAmount - discountAmount;

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;
    
    const fetchData = async () => {
      try {
        if (!packageSummary?.id || !userData?._id || !packageSummary?.transfer?.selectedLead?._id) {
          return;
        }
        
        // Prevent multiple simultaneous fetches
        if (isFetching) return;
        isFetching = true;
        
        const operations = await fetchHistoryByPackageId(
          packageSummary.id,
          userData._id,
          packageSummary.transfer.selectedLead._id
        );
        
        // Only update state if component is still mounted
        if (isMounted) {
          setHistory(operations);
          if (operations.length > 0) {
            setShowCustomMargin(true);
            setShowDiscount(true);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        isFetching = false;
      }
    };
  
    if (packageSummary?.id && userData?._id && packageSummary?.transfer?.selectedLead?._id) {
      fetchData();
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [packageSummary?.id, userData?._id, packageSummary?.transfer?.selectedLead?._id]);



  useEffect(() => {
    const allData = {
      leadDetails: {
        personalInfo: {
          name: selectedLead?.name,
          email: selectedLead?.email,
          mobile: selectedLead?.mobile,
          from: selectedLead?.from,
          source: selectedLead?.source,
        },
        travelInfo: {
          destination: selectedLead?.destination,
          travelDate: selectedLead?.travelDate,
          nights: selectedLead?.nights,
          days: selectedLead?.days,
        },
        packageInfo: {
          type: selectedLead?.packageType,
          category: selectedLead?.packageCategory,
          mealPlan: selectedLead?.mealPlans,
          EP: selectedLead?.EP,
        },
        guestInfo: {
          adults: selectedLead?.adults,
          children: selectedLead?.kids,
          totalPersons: selectedLead?.persons,
          noOfRooms: selectedLead?.noOfRooms,
          extraBeds: selectedLead?.extraBeds,
        },
      },
      packageDetails: {
        activities: packageSummary?.activities,
        hotels: packageSummary?.hotels,
        transfer: packageSummary?.transfer,
        totals: packageSummary?.totals,
      },
    };
  }, [selectedLead, packageSummary]);


  // Refresh margin data periodically to check for new approved discounts
  useEffect(() => {
    const refreshMarginData = async () => {
      if (packageSummary?.package?.state) {
        try {
          const fullPackageState = packageSummary?.package?.state || "";
          const matchingStateMargin = await fetchMarginByState(fullPackageState);
          if (matchingStateMargin) {
            setMarginData(matchingStateMargin);
          }
        } catch (error) {
          console.error("Error refreshing margin data:", error);
        }
      }
    };

    // Refresh every 30 seconds to check for new approvals
    const interval = setInterval(refreshMarginData, 30000);
    return () => clearInterval(interval);
  }, [packageSummary?.package?.state, fetchMarginByState]);

 
  // Also add this useEffect to debug the margin calculation
  useEffect(() => {
    if (marginData) {
      const currentMargin = getCurrentMarginPercentage();
    }
  }, [marginData, packageSummary?.totals?.grandTotal]);
const[actionMessage,setActionMessage]=useState("")
  // Check for approved edit discounts
  useEffect(() => {
    console.log("marginData", marginData);
    const checkApprovedEditDiscounts = () => {
      // Only check if there is at least one history item
      if (!marginData?.minimumQuoteMargins?.editDiscount || !packageSummary?.id || history.length === 0) return;

      const currentUser = JSON.parse(localStorage.getItem('persist:root'))?.user;
      const userData = currentUser ? JSON.parse(currentUser)?.currentUser?.data : null;
      const userId = userData?._id;

    

      // Find approved edit discount for this user and package
      const approvedDiscount = marginData.minimumQuoteMargins.editDiscount.find(discount => {
       console.log("discount",discount)
        
        return discount.packageId === packageSummary.id && packageSummary?.transfer?.selectedLead?._id === discount?.package?.hotelData[0]?.selectedLead
         && userId==discount?.loginUserDetail?.userId &&     compareUserIds(discount.loginUserDetail?.userId, userId) &&
               discount.accept === "yes";
      });


      if (approvedDiscount) {
        setActiveDiscountPercentage(approvedDiscount.discountPercentage);
        setShowDiscount(true);
        
        // Show notification
        setActionMessage(`Approved discount of ${approvedDiscount.discountPercentage}% applied automatically! you can apply this discount by clicking on the add discount button
           dont add discount manually .Add manually if you don't want to add approved discount`);
      }
    };

    checkApprovedEditDiscounts();
  }, [marginData, packageSummary?.id, history]);

  const handleSendLink = async () => {
    const timestamp = new Date().toLocaleString();
    const taxAmount = finalTotal * 0.05; // Calculate 5% tax
    const totalWithTax = finalTotal + taxAmount; // Add tax to final total
  
    const historyItem = {
      timestamp,
      total: packageSummary?.totals?.grandTotal || 0,
      customerLeadId:packageSummary?.transfer?.selectedLead?._id,
      userId:userData?._id,
      marginPercentage: getCurrentMarginPercentage(),
      discountPercentage: showDiscount ? activeDiscountPercentage : 0,
      finalTotal: totalWithTax,
      id: packageSummary.id,
      activities: packageSummary.activities,
      hotels: packageSummary.hotels,
      transfer: {
        details: packageSummary.transfer.details,
        itineraryDays: packageSummary?.transfer?.itineraryDays,
        selectedLead: packageSummary?.transfer?.selectedLead,
        totalCost: packageSummary.transfer.totalCost,
        state: packageSummary?.package?.state,
        editprice:"",
        
      },
      totals: {
        transferCost: packageSummary.totals.transferCost,
        hotelCost: packageSummary.totals.hotelCost,
        activitiesCost: packageSummary.totals.activitiesCost,
        grandTotal: packageSummary.totals.grandTotal,
        discount: showDiscount ? discountAmount.toFixed(2) : 0,
      },
    };

    try {
      const result = await createFinalcosting(historyItem);
      setHistory([...history, result]);
      setShowDiscount(true);
    } catch (error) {
      console.error("Error saving history:", error);
    }
 
  };

  const handleCustomMarginSubmit = () => {
    const marginValue = Number.parseFloat(customMarginPercentage);
    const total = packageSummary?.totals?.grandTotal || 0;

    // Get minimum margin based on total amount
    let minimumMargin = 0;
    if (total < 100000) {
      minimumMargin = marginData?.minimumQuoteMargins?.lessThan1Lakh;
    } else if (total < 200000) {
      minimumMargin = marginData?.minimumQuoteMargins?.between1To2Lakh;
    } else if (total < 300000) {
      minimumMargin = marginData?.minimumQuoteMargins?.between2To3Lakh;
    } else {
      minimumMargin = marginData?.minimumQuoteMargins?.moreThan3Lakh;
    }

    if (marginValue < minimumMargin) {
      alert(
        `Margin cannot be less than ${minimumMargin}% for this package value`
      );
      return;
    }

    if (marginValue > 0) {
      setActiveMarginPercentage(marginValue);
      setCustomMarginPercentage("");
    } else {
      alert("Please enter a valid margin percentage");
    }
  };

  const handleCustomDiscountSubmit = async () => {
    const discountValue = Number.parseFloat(customDiscountPercentage);
    const total = packageSummary?.totals?.grandTotal || 0;

    // Get minimum margin (which will be maximum discount) based on total amount
    let maximumDiscount = 0;
    if (total < 100000) {
      maximumDiscount = marginData?.minimumQuoteMargins?.lessThan1Lakh;
    } else if (total < 200000) {
      maximumDiscount = marginData?.minimumQuoteMargins?.between1To2Lakh;
    } else if (total < 300000) {
      maximumDiscount = marginData?.minimumQuoteMargins?.between2To3Lakh;
    } else {
      maximumDiscount = marginData?.minimumQuoteMargins?.moreThan3Lakh;
    }

    if (discountValue > maximumDiscount) {
      // Show confirmation dialog for edit discount request
      const confirmRequest = window.confirm(
        `Discount cannot be more than ${maximumDiscount}% for this package value. Would you like to request approval for ${discountValue}% discount?`
      );

      if (confirmRequest) {
        try {
          const packageId = packageSummary?.id || "";
          const state = packageSummary?.package?.state || "";
          console.log("state",state)
          const packageName = packageSummary?.package?.packageName || "";
          const total= packageSummary?.totals?.grandTotal || 0;
          const cabData = packageSummary?.transfer?.details.map(item => ({
            cabName: item.cabName,
            price: item.price
          }));
          const hotelData = packageSummary?.hotels.map(item => ({
            propertyName: item.propertyName,
            cost: item.cost,
            extraAdultRate: item.extraAdultRate,
            selectedLead: packageSummary?.transfer?.selectedLead?._id,
          }));
          const result = await requestEditDiscount(
            packageId, 
            packageName, 
            state,
            discountValue, 
            cabData,
            hotelData,
            total,       
            marginAmount,
            getCurrentMarginPercentage()
          );
          
          if (result.temporary) {
            alert(`Edit discount request feature is being implemented. Your request for ${discountValue}% discount has been logged.`);
          } else {
            alert(`Edit discount request sent successfully! Your request for ${discountValue}% discount has been submitted for approval.`);
          }
          setCustomDiscountPercentage("");
        } catch (error) {
          console.error("Error requesting edit discount:", error);
          alert("Failed to send edit discount request. Please try again.");
        }
      }
      return;
    }

    if (discountValue > 0 && discountValue <= 100) {
      setActiveDiscountPercentage(discountValue);
      setCustomDiscountPercentage("");
    } else {
      alert("Please enter a valid discount percentage between 0 and 100");
    }
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      await deleteFinalcosting(historyId);
      // Remove the item from local history state
      setHistory(prev => prev.filter(item => item._id !== historyId));
    } catch (error) {
      console.error("Error deleting history:", error);
    }
    setTimeout(() => {
      setActiveTab("package")
    }, 2000);
  };

  // Add new function to check if any history item is converted
  const hasConvertedHistory = history.some((item) => item.converted === true);

  // Function to check if this is the first history item
  const isFirstHistory = (itemId) => {
    if (!history || history.length === 0) return false;
    return history[0]._id === itemId;
  };

  // Handle download tracking with context function
  const handleTrackDownload = async (packageId, packageName, downloadType) => {
    try {
      // Only track downloads for the first history item
      if (isFirstHistory(packageId)) {
        const result = await trackDownload(packageId, packageName, downloadType ,history);
        
        // Update local download counts with the returned data
        setDownloadCounts(prev => ({
          ...prev,
          [packageId]: result.downloadCounts
        }));

        // Show success message
        toast.success(`${downloadType === 'pluto' ? 'Pluto' : 'Demand Setu'} PDF downloaded successfully`);
      }
    } catch (error) {
      console.error('Error tracking download:', error);
      toast.error('Failed to track download');
    }
  };

  // Add download count badge component
  const DownloadBadge = ({ count }) => {
    if (!count || count === 0) return null;
    
    return (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {count}
      </span>
    );
  };

  // Function to get approved edit discount for current user and package
  const getApprovedEditDiscount = () => {
    if (!marginData?.editDiscount || !packageSummary?.id) return null;

    const currentUser = JSON.parse(localStorage.getItem('persist:root'))?.user;
    const userData = currentUser ? JSON.parse(currentUser)?.currentUser?.data : null;
    const userId = userData?._id;

    console.log("Looking for approved discount:");
    console.log("Package ID:", packageSummary.id);
    console.log("Current User ID:", userId);
    console.log("Available edit discounts:", marginData.editDiscount);

    const approvedDiscount = marginData.editDiscount.find(discount => {
      console.log("Checking discount:", discount);
      console.log("Package match:", discount.packageId === packageSummary.id);
      console.log("User match:", compareUserIds(discount.loginUserDetail?.userId, userId));
      console.log("Accept match:", discount.accept === "yes");
      
      return discount.packageId === packageSummary.id && 
             compareUserIds(discount.loginUserDetail?.userId, userId) &&
             discount.accept === "yes";
    });

    console.log("Found approved discount:", approvedDiscount);
    return approvedDiscount;
  };

  // Function to apply approved discount
  const applyApprovedDiscount = () => {
    const approvedDiscount = getApprovedEditDiscount();
    if (approvedDiscount) {
      setActiveDiscountPercentage(approvedDiscount.discountPercentage);
      setShowDiscount(true);
      toast.success(`Applied approved discount of ${approvedDiscount.discountPercentage}%!`);
    }
  };

  // Helper function to compare user IDs (handles different formats)
  const compareUserIds = (discountUserId, currentUserId) => {
    if (!discountUserId || !currentUserId) return false;
    
    // Convert both to strings and trim
    const discountId = String(discountUserId).trim();
    const currentId = String(currentUserId).trim();
    
    console.log("Comparing user IDs:", { discountId, currentId, match: discountId === currentId });
    
    return discountId === currentId;
  };

  return (
    <>
      <div className="p-6 flex gap-6 sm:flex-row flex-col">
        {/* Cost Breakdown Section - Wider */}
        <div className="flex-grow bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          {/* Enhanced Header */}
          <div
            className="relative overflow-hidden"
            style={{ backgroundColor: "#2d2d44" }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" className="text-white">
                <pattern
                  id="pattern-circles"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#pattern-circles)" />
              </svg>
            </div>

            {/* Header Content */}
            <div className="px-4 py-6 relative">
          
              <div className="pb-4 flex items-start gap-4">
                {/* Icon */}
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Cost Breakdown
                  </h3>
                  {actionMessage && (
        <div className="mb-4 p-3 rounded bg-blue-100 text-blue-900 text-center font-semibold">
          {actionMessage}
        </div>
      )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                    <p className="text-gray-300 text-sm">
                      Detailed pricing information
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                {/* Action Buttons */}
                {!hasConvertedHistory && (
                  <div className="flex items-center gap-3">
                    {showCustomMargin && (
                      <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                        {/* Toggle between Margin and Discount */}
                        <div className="flex bg-white/5 rounded-md p-1">
                          {/* <button
                            onClick={() => {
                              setShowDiscount(false);
                              setActiveDiscountPercentage(null);
                              setCustomDiscountPercentage("");
                            }}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                              !showDiscount
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-300 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            Margin
                          </button> */}
                          <button
                            onClick={() => {
                              setShowDiscount(true);
                              setActiveMarginPercentage(null);
                              setCustomMarginPercentage("");
                            }}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                              showDiscount
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-300 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            Discount
                          </button>
                        </div>

                        {/* Input field */}
                        <input
                          type="number"
                          value={
                            showDiscount
                              ? customDiscountPercentage
                              : customMarginPercentage
                          }
                          onChange={(e) =>
                            showDiscount
                              ? setCustomDiscountPercentage(e.target.value)
                              : setCustomMarginPercentage(e.target.value)
                          }
                          className="w-20 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="%"
                        />
                        <button
                          onClick={
                            showDiscount
                              ? handleCustomDiscountSubmit
                              : handleCustomMarginSubmit
                          }
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          Apply
                        </button>
                        
                        {/* Show pending edit discount requests */}
                        {showDiscount && marginData?.editDiscount && (() => {
                          const currentUser = JSON.parse(localStorage.getItem('persist:root'))?.user;
                          const userData = currentUser ? JSON.parse(currentUser)?.currentUser?.data : null;
                          const userId = userData?._id;
                          
                          const pendingRequests = marginData.editDiscount.filter(discount => 
                            discount.packageId === packageSummary?.id && 
                            discount.loginUserDetail?.userId === userId &&
                            discount.accept === "no"
                          );
                          
                          const approvedRequests = marginData.editDiscount.filter(discount => 
                            discount.packageId === packageSummary?.id && 
                            discount.loginUserDetail?.userId === userId &&
                            discount.accept === "yes"
                          );
                          
                          if (pendingRequests.length > 0) {
                            return (
                              <div className="ml-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
                                {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}
                              </div>
                            );
                          }
                          
                          if (approvedRequests.length > 0) {
                            return (
                              <div className="ml-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
                                {approvedRequests.length} approved discount{approvedRequests.length > 1 ? 's' : ''}
                              </div>
                            );
                          }
                          
                          return null;
                        })()}
                        
                        {/* Show approved discount message and apply button */}
                        {showDiscount && (() => {
                          const approvedDiscount = getApprovedEditDiscount();
                          if (approvedDiscount) {
                            return (
                              <div className="ml-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs">
                                <div className="text-green-300 mb-1">
                                  You can apply {approvedDiscount.discountPercentage}% discount
                                </div>
                                <button
                                  onClick={applyApprovedDiscount}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                >
                                  Apply Discount
                                </button>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Debug info - remove in production */}
                        {showDiscount && marginData?.editDiscount && (
                          <div className="ml-2 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs">
                            <div className="text-blue-300 text-xs">
                              Debug: {marginData.editDiscount.length} total edit discounts
                            </div>
                            <button
                              onClick={() => {
                                const approvedDiscount = getApprovedEditDiscount();
                                console.log("Manual check - Approved discount:", approvedDiscount);
                                if (approvedDiscount) {
                                  toast.info(`Found approved discount: ${approvedDiscount.discountPercentage}%`);
                                } else {
                                  toast.info("No approved discount found");
                                }
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors mt-1"
                            >
                              Check Discounts
                            </button>
                          
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show/Hide Margin Button */}
                    <button
                      onClick={() => setShowMargin(!showMargin)}
                      className="margin_my px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm"
                    >
                      {showMargin ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Hide {showDiscount ? "Discount" : "Margin"}
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Add {showDiscount ? "Discount" : "Margin"}
                        </>
                      )}
                    </button>

                    {/* Send Link Button */}
                    {showMargin && !loadings && (
                      <button
                        onClick={handleSendLink}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Send Link
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="space-y-5">
              {/* Cost Items */}
              <div className="grid gap-4">
                {/* Hotel Costs */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          Hotel Charges
                        </h4>
                        <p className="text-xs text-gray-500">
                          Accommodation costs
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">
                      ₹{packageSummary?.totals?.hotelCost || 0}
                    </span>
                  </div>
                </div>
                {/*  paid places cost */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          paid places cost
                        </h4>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">
                      ₹{packageSummary?.totals?.placesCost || 0}
                    </span>
                  </div>
                </div>
                {/* Transfer Costs */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          Transfer Charges
                        </h4>
                        <p className="text-xs text-gray-500">
                          Transportation costs
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      ₹{packageSummary?.totals?.transferCost || 0}
                    </span>
                  </div>
                </div>

                {/* Activity Costs */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          Activity Charges
                        </h4>
                        <p className="text-xs text-gray-500">
                          Entertainment & activities
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-purple-600">
                      ₹{packageSummary?.totals?.activitiesCost || 0}
                    </span>
                  </div>
                </div>

                {/* Taxes */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-orange-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">Taxes & Fees</h4>
                        <p className="text-xs text-gray-500">5% of total amount</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-orange-600">
                      ₹{((packageSummary?.totals?.grandTotal || 0) * 0.05).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Margin Section */}
              {showMargin && !hasConvertedHistory && (
                <div className="mt-6 space-y-4">
                  <div
                    className={`bg-${
                      showDiscount ? "green" : "yellow"
                    }-50 rounded-xl border border-${
                      showDiscount ? "green" : "yellow"
                    }-100 p-4`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 bg-${
                            showDiscount ? "green" : "yellow"
                          }-100 rounded-lg`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 text-${
                              showDiscount ? "green" : "yellow"
                            }-600`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-gray-700 font-medium">
                            {showDiscount
                              ? `Discount (${activeDiscountPercentage}%)`
                              : `Margin (${getCurrentMarginPercentage()}%)`}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {showDiscount
                              ? "Applied discount"
                              : "Additional profit margin"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-lg font-semibold text-${
                          showDiscount ? "green" : "yellow"
                        }-600`}
                      >
                        ₹
                        {showDiscount
                          ? discountAmount.toFixed(2)
                          : marginAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Rest of the section */}
                </div>
              )}

              {/* Grand Total */}
              <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-medium text-blue-100">Grand Total</h4>
                    <p className="text-sm text-blue-200">
                  with Margin & including 5% tax
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      ₹
                      { (finalTotal + finalTotal * 0.05).toFixed(2)}
                       
                    </span>
                    <p className="text-sm text-blue-200">Total package cost</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section - Narrower */}
        <div className=" bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          {/* Header */}
          <div
            className="px-6 py-4 border-b border-gray-200"
            style={{ backgroundColor: "#2d2d44" }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Quote History
                </h3>
                <p className="text-sm text-gray-300">
                  Previous quotations sent
                </p>
              </div>
            </div>
            
            {/* Add Download Statistics */}
            {packageSummary?.id && downloadCounts[packageSummary.id] && (
              <div className="mt-4 bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between text-white text-sm">
                  <span>Total Downloads:</span>
                  <span className="font-semibold">{downloadCounts[packageSummary.id].total || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>Pluto: {downloadCounts[packageSummary.id].pluto || 0}</span>
                  <span>Demand Setu: {downloadCounts[packageSummary.id]['demand-setu'] || 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="space-y-4">
              { loadingsss ? (
                <div className="text-center py-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium">
                      Loading...
                    </p>
                   
                  </div>
                </div>
              ) : (
                history
                  .filter((item) => item.id === packageSummary.id)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Quote Header */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-50 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Quote #{index + 1}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.timestamp}
                            </p>
                          </div>
                        </div>
                        {item.converted && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg
                              className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Converted
                          </span>
                        )}
                      </div>

                      {/* Quote Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Base Amount</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{item.total.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Final Amount</p>
                          <p className="text-sm font-semibold text-blue-900">
                            ₹{item.finalTotal.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Margin</p>
                          <p className="text-sm font-semibold text-purple-900">
                            {item.marginPercentage}%
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Discount</p>
                          <p className="text-sm font-semibold text-green-900">
                            {item.discountPercentage}%
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedHistoryItem(item);
                              setShowPdfPreview(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Preview Quote
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Download Buttons with tracking */}
                        <div className="grid grid-cols-2 gap-2">
                          <PDFDownloadLink
                            document={
                              <PlutoToursPDF
                                packageSummary={{
                                  ...item,
                                  package: packageSummary.package,
                                }}
                                showMargin={true}
                                marginAmount={item.finalTotal - item.total}
                                showDiscount={item.discountPercentage > 0}
                                discountAmount={item.discountPercentage > 0 ? (item.total * item.discountPercentage / 100) : 0}
                                activeDiscountPercentage={item.discountPercentage}
                                finalTotal={item.finalTotal}
                                getCurrentMarginPercentage={() =>
                                  item.marginPercentage
                                }
                                selectedLead={selectedLead}
                              />
                            }
                            fileName={`pluto-tours-package-${
                              item.id
                            }-${new Date(item.timestamp).getTime()}.pdf`}
                            onClick={() => handleTrackDownload(item._id,packageSummary.package, 'pluto')}
                          >
                            {({ loading }) => (
                              <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium relative">
                                {loading ? "Loading..." : "Pluto Tours PDF"}
                                <DownloadBadge count={downloadCounts[item.id]?.pluto} />
                              </button>
                            )}
                          </PDFDownloadLink>

                          <PDFDownloadLink
                            document={
                              <DemandSetuPDF
                                packageSummary={{
                                  ...item,
                                  package: packageSummary.package,
                                }}
                                showMargin={true}
                                showDiscount={item.discountPercentage > 0}
                                discountAmount={item.discountPercentage > 0 ? (item.total * item.discountPercentage / 100) : 0}
                                activeDiscountPercentage={item.discountPercentage}
                                marginAmount={item.finalTotal - item.total}
                                finalTotal={item.finalTotal}
                                getCurrentMarginPercentage={() =>
                                  item.marginPercentage
                                }
                                selectedLead={selectedLead}
                              />
                            }
                            fileName={`demand-setu-package-${
                              item.id
                            }-${new Date(item.timestamp).getTime()}.pdf`}
                            onClick={() => handleTrackDownload(item._id,packageSummary.package, 'demand-setu')}
                          >
                            {({ loading }) => (
                              <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium relative">
                                {loading ? "Loading..." : "Demand Setu PDF"}
                                <DownloadBadge count={downloadCounts[item.id]?.['demand-setu']} />
                              </button>
                            )}
                          </PDFDownloadLink>
                        </div>

                        {/* Convert Button */}
                        {!item.converted ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  // Compute amounts for lead update
                                  const baseTotal = Number(item.total) || 0;
                                  const marginPerc = Number(item.marginPercentage) || 0;
                                  const discountPerc = Number(item.discountPercentage) || 0;
                                  const computedMarginAmount = parseFloat(((baseTotal * marginPerc) / 100).toFixed(2));
                                  const computedDiscountAmount = parseFloat(((baseTotal * discountPerc) / 100).toFixed(2));
                                  const preTaxFinal = baseTotal + computedMarginAmount - computedDiscountAmount;
                                  const computedGstAmount = parseFloat((preTaxFinal * 0.05).toFixed(2));
                                  const computedTotalAmount = parseFloat((preTaxFinal + computedGstAmount).toFixed(2));

                                  const leadId = packageSummary?.transfer?.selectedLead?._id || item?.transfer?.selectedLead?._id;

                                  await updateFinalcosting(item._id, {
                                    ...item,
                                    converted: true,
                                    conversionType: 'ptw'
                                  });

                                  const updatedHistory = history.map(
                                    (historyItem) =>
                                      historyItem._id === item._id
                                        ? { ...historyItem, converted: true, conversionType: 'ptw' }
                                        : historyItem
                                  );
                                  setHistory(updatedHistory);

                                  if (leadId) {
                                    await updateLead(leadId, {
                                      totalAmount: computedTotalAmount,
                                      totalCost: computedTotalAmount,
                                      gstAmount: computedGstAmount,
                                      marginAmount: computedMarginAmount,
                                      marginPercentage: marginPerc,
                                      discountAmount: computedDiscountAmount,
                                      discountPercentage: discountPerc,
                                      converted: true,
                                    });
                                  }
                                } catch (error) {
                                  console.error("Error converting history:", error);
                                }
                              }}
                              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              Convert to PTW
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  // Compute amounts for lead update
                                  const baseTotal = Number(item.total) || 0;
                                  const marginPerc = Number(item.marginPercentage) || 0;
                                  const discountPerc = Number(item.discountPercentage) || 0;
                                  const computedMarginAmount = parseFloat(((baseTotal * marginPerc) / 100).toFixed(2));
                                  const computedDiscountAmount = parseFloat(((baseTotal * discountPerc) / 100).toFixed(2));
                                  const preTaxFinal = baseTotal + computedMarginAmount - computedDiscountAmount;
                                  const computedGstAmount = parseFloat((preTaxFinal * 0.05).toFixed(2));
                                  const computedTotalAmount = parseFloat((preTaxFinal + computedGstAmount).toFixed(2));

                                  const leadId = packageSummary?.transfer?.selectedLead?._id || item?.transfer?.selectedLead?._id;

                                  await updateFinalcosting(item._id, {
                                    ...item,
                                    converted: true,
                                    conversionType: 'demand setu'
                                  });

                                  const updatedHistory = history.map(
                                    (historyItem) =>
                                      historyItem._id === item._id
                                        ? { ...historyItem, converted: true, conversionType: 'demand setu' }
                                        : historyItem
                                  );
                                  setHistory(updatedHistory);

                                  if (leadId) {
                                    await updateLead(leadId, {
                                      totalAmount: computedTotalAmount,
                                      totalCost: computedTotalAmount,
                                      gstAmount: computedGstAmount,
                                      marginAmount: computedMarginAmount,
                                      marginPercentage: marginPerc,
                                      discountAmount: computedDiscountAmount,
                                      discountPercentage: discountPerc,
                                      converted: true,
                                    });
                                  }
                                } catch (error) {
                                  console.error("Error converting history:", error);
                                }
                              }}
                              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              Convert to Demand Setu
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full px-3 py-2 bg-gray-400 cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                            disabled={true}
                          >
                            {item.conversionType === 'ptw' ? 'Converted to PTW' : 'Converted to Demand Setu'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && selectedHistoryItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] h-[90%] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                Package Details -{" "}
                {new Date(selectedHistoryItem.timestamp).toLocaleDateString()}
              </h3>
              <button
                onClick={() => {
                  setShowPdfPreview(false);
                  setSelectedHistoryItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              {/* Replace PDFViewer with new details component */}
              <QuotePreviewDetails
                packageSummary={{
                  ...selectedHistoryItem,
                  package: packageSummary.package,
                }}
                showMargin={true}
                marginAmount={
                  selectedHistoryItem.finalTotal - selectedHistoryItem.total
                }
                showDiscount={selectedHistoryItem.discountPercentage > 0}
                discountAmount={selectedHistoryItem.discountPercentage > 0 ? (selectedHistoryItem.total * selectedHistoryItem.discountPercentage / 100) : 0}
                activeDiscountPercentage={selectedHistoryItem.discountPercentage}
                finalTotal={selectedHistoryItem.finalTotal}
                getCurrentMarginPercentage={() =>
                  selectedHistoryItem.marginPercentage
                }
                companyName="Pluto Tours and Travel"
                selectedLead={selectedLead}
                colorTheme="orange"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal/Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-semibold text-red-600 mb-4">Warning</h3>
            <p className="text-gray-700 mb-4">
              Below Margins require supervisor approval. Please adjust the
              margin percentage.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  ); 
};
export default FinalCosting;
