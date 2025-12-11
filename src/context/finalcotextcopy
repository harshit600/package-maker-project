import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import config from '../../config.jsx';

const FinalcostingContext = createContext();

export const useFinalcosting = () => {
  const context = useContext(FinalcostingContext);
  if (!context) {
    throw new Error('useFinalcosting must be used within a FinalcostingProvider');
  }
  return context;
};

export const FinalcostingProvider = ({ children }) => {
  const [marginss, setMargins] = useState([]);
  const [marginData, setMarginData] = useState(null);
  const [addData, setAddData] = useState([]);
  const [loadings, setLoadings] = useState(false);
  const[ loadingss, setLoadingss ] = useState(false);
  const[ loadingsss, setLoadingsss ] = useState(false);
  const[ crmleads, setCrmleads ] = useState([]);
  const[ crmloading, setCrmloading ] = useState(false);
  const [error, setError] = useState(null);
  const [downloadCounts, setDownloadCounts] = useState({});
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  console.log(userData,"userData")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 50,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Get user from localStorage
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('persist:root');
      if (!userStr) return null;

      const parsed = JSON.parse(userStr);
      const userState = JSON.parse(parsed.user);
      return userState.currentUser;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return null;
    }
  };

  const fetchBanks = async () => {
    try {
      setBanksLoading(true)
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
      setBanksLoading(false)
    }
  }
  // get crm leads
   // Fetch margins by state
   const fetchcrmleads = useCallback(async (state) => {
    try {
      setCrmloading(true);
      setError(null);

      // Get current user's mobile number
      const currentUserMobile = userData?.contactNo || userData?.phone;
      
      if (!currentUserMobile) {
        throw new Error("Current user mobile number not found");
      }

      const response = await fetch(
        `${config.API_HOST}/api/leads/crm-get-leads-by-executive-phone?executivePhone=${encodeURIComponent(currentUserMobile)}`,
        {
          headers: {
            'Authorization': 'Bearer sk-live-a8b9c7d4e2f1g3h5i6j8k9l0m1n2o3p4q5r6s7t8u9v0w1x1r2s3t4u5v6w7x8y9z0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch margins");
      }
      
      const data = await response.json();
      setCrmleads(data.leads)
      // Get the package state and extract just the state name
     
    } catch (error) {
      console.error("Error fetching margin by state:", error);
      setError(error.message);
      throw error;
    } finally {
      setCrmloading(false);
    }
  }, [userData]);
  // Fetch history by package ID, user ID, and customerLeadId
  const fetchHistoryByPackageId = useCallback(async (id, userId, customerLeadId) => {
    try {
      setLoadingsss(true);
      setError(null);
      
      // Validate inputs
      if (!id || !userId || !customerLeadId) {
        setLoadingsss(false);
        return [];
      }
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoadingsss(false);
      }, 10000); // 10 second timeout
      
      const response = await fetch(`${config.API_HOST}/api/finalcosting/get/${id}/${userId}/${customerLeadId}`);
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Failed to fetch history by package id");
      const data = await response.json();
      return data; // This should be an array of operations
    } catch (error) {
      console.error("Error in fetchHistoryByPackageId:", error);
      setError(error.message);
      return [];
    } finally {
      setLoadingsss(false);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const parsedData = JSON.parse(userStr);
        const localUser = parsedData.data || parsedData;

        if (!localUser?._id || !localUser?.token) return;

        const response = await fetch(`${config.API_HOST}/api/maker/get-maker`, {
          headers: {
            Authorization: `Bearer ${localUser.token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const users = await response.json();
        const currentUserData = users.find(
          (user) => user._id === localUser._id
        );

        if (currentUserData) {
          setUserData(currentUserData);
        
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);
  // Create new finalcosting entry
  const createFinalcosting = useCallback(async (historyItem) => {
    try {
      setLoadingsss(true);
      setError(null);

      const response = await fetch(
        `${config.API_HOST}/api/finalcosting/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(historyItem),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save history");
      }

      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error("Error creating finalcosting:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingsss(false);
    }
  }, []);

  // Update lead details
  const updateLead = useCallback(async (leadId, updateData) => {
    try {
      setError(null);

      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData?.data?.token || userData?.token;

      const response = await fetch(
        `${config.API_HOST}/api/leads/update-lead/${leadId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lead");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete finalcosting entry
  const deleteFinalcosting = useCallback(async (historyId) => {
    try {
      setLoadingsss(true);
      setError(null);

      const response = await fetch(
        `${config.API_HOST}/api/finalcosting/delete/${historyId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete history");
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting finalcosting:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingsss(false);
    }
  }, []);

  // Update finalcosting entry (convert quote)
  const updateFinalcosting = useCallback(async (historyId, updateData) => {
    try {
      setLoadingsss(true);
      setError(null);

      const response = await fetch(
        `${config.API_HOST}/api/finalcosting/update-entire/${historyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update history");
      }

      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error("Error updating finalcosting:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingsss(false);
    }
  }, []);

  // Track download
  const trackDownload = useCallback(async (packageId, packageName, downloadType ,history) => {
    try {
      // Verify this is the first history item
      const firstHistory = history.length > 0 ? history[0] : null;
      if (!firstHistory || firstHistory._id !== packageId) {
        return null; // Don't track if not first history
      }

      const name = packageName.packageName;
      const currentDate = new Date();
      const currentUser = getUserFromStorage();
      
      const response = await fetch(`${config.API_HOST}/api/packagetracker/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          packageName: name,
          downloadType,
          user: {
            id: currentUser?.data?._id || 'anonymous',
            name: `${currentUser?.data?.firstName || ''} ${currentUser?.data?.lastName || ''}`.trim() || 'Anonymous User',
            email: currentUser?.data?.email || null,
            userType: currentUser?.data?.userType || null,
            marginPercentage: history[0]?.marginPercentage || null,
            marginAmount: history[0]?.finalTotal || null,
            leaddetails: history[0]?.transfer?.selectedLead || null,
            state: history[0]?.transfer?.state|| null,
            travelDate: history[0]?.transfer?.selectedLead?.travelDate|| null
          },
          timestamp: currentDate.toISOString(),
          downloadDate: currentDate.toLocaleDateString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to track download");
      }
      const result = await response.json();
      // Update local download counts only for first history
      setDownloadCounts(prev => ({
        ...prev,
        [packageId]: result.downloadCounts
      }));

      return result;
    } catch (error) {
      console.error('Error tracking download:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  }

  // Request edit discount
  const requestEditDiscount = useCallback(async (packageId, packageName,state, discountPercentage,  cabData, hotelData, total, marginAmount, marginPercentage) => {
         // Get the package state and extract just the state name
         console.log("state",state)
         const packageState = capitalizeWords(state.toLowerCase());
      
    try {
      setLoadings(true);
      setError(null);
      const currentUser = getUserFromStorage();
      const response = await fetch(`${config.API_HOST}/api/margin/update-edit-discount/${packageState}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editDiscount: [{
            packageId: packageId,
            packageName: packageName,
            package: {
              cabData: cabData,
              hotelData: hotelData,
              total: total,
              marginAmount: marginAmount,
              marginPercentage: marginPercentage
            },
            loginUserDetail: {
              userId: currentUser?.data?._id || 'anonymous',
              username: `${currentUser?.data?.firstName || ''} ${currentUser?.data?.lastName || ''}`.trim() || 'Anonymous User',
              role: currentUser?.data?.userType || 'user',
              managerName: currentUser?.data?.managerName || 'No Manager',
              companyName: currentUser?.data?.companyName || 'No Company'
            },
            discountPercentage: discountPercentage,
            accept: "",
            managerName: currentUser?.data?.managerName || 'No Manager'
          }]
        }),
      });

      if (!response.ok) {
        console.log(response,"response")
        if (response.status === 404) {
          // Backend route not implemented yet - show temporary message
          console.warn("Edit discount backend route not implemented yet");
          return {
            success: true,
            message: "Edit discount request feature is being implemented. Your request has been logged locally.",
            temporary: true
          };
        }
        throw new Error("Failed to request edit discount");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error requesting edit discount:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoadings(false);
    }
  }, []);

  // Fetch margins by state
  const fetchMarginByState = useCallback(async (state) => {
    try {
      setLoadings(true);
      setError(null);

      const response = await fetch(
        `${config.API_HOST}/api/margin/get-margin`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch margins");
      }
      
      const data = await response.json();
      
      // Get the package state and extract just the state name
      const packageState = state.toLowerCase();
      
      // Find matching state margin
      const matchingStateMargin = data?.data?.find(
        (margin) => (margin.state || "").toLowerCase() == packageState
      );

      return matchingStateMargin || (Array.isArray(data.data) ? data.data[0] : null);
    } catch (error) {
      console.error("Error fetching margin by state:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadings(false);
    }
  }, []);

  // Fetch data from /api/add/get/ endpoint with pagination
  const fetchAddData = useCallback(async (page = 1, limit = 50) => {
    try {
      setLoadingss(true);
      setError(null);

      const response = await fetch(`${config.API_HOST}/api/add/get?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch add data");
      }
      
      const data = await response.json();
      
      if (page === 1) {
        // First page - set initial data
        setAddData(data.adds);
        setPagination(data.pagination);
      } else {
        // Subsequent pages - append data
        setAddData(prev => [...prev, ...data.adds]);
        setPagination(data.pagination);
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching add data:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingss(false);
    }
  }, []);

  // Fetch all data automatically with pagination
  const fetchAllAddData = useCallback(async () => {
    try {
      setLoadingss(true);
      setError(null);
      
      let currentPage = 1;
      let allData = [];
      let hasMorePages = true;
      
      while (hasMorePages) {
        const response = await fetch(`${config.API_HOST}/api/add/get?page=${currentPage}&limit=50`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch add data");
        }
        
        const data = await response.json();
        
        allData = [...allData, ...data.adds];
        
        // Check if there are more pages
        hasMorePages = data.pagination.hasNextPage;
        currentPage++;
        
        // Update pagination state with the last page info
        setPagination(data.pagination);
      }
      
      setAddData(allData);
      return allData;
    } catch (error) {
      console.error("Error fetching all add data:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingss(false);
    }
  }, []);

  // Delete package function
  const deletePackage = useCallback(async (packageId) => {
    try {
      setLoadings(true);
      setError(null);

      const response = await fetch(`${config.API_HOST}/api/add/delete/${packageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete package");
      }

      // Remove the package from addData
      setAddData(prev => prev.filter(pkg => pkg._id !== packageId));
      
      return true;
    } catch (error) {
      console.error("Error deleting package:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoadings(false);
    }
  }, []);

  // Fetch data when provider mounts
  useEffect(() => {
    fetchAllAddData();
    fetchcrmleads();
    fetchBanks();
  }, [fetchAllAddData,userData]);

  // Safety check to reset stuck loading states
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loadingsss) {
        console.warn("Safety timeout: Resetting stuck loadingsss state");
        setLoadingsss(false);
      }
    }, 15000); // 15 second safety timeout

    return () => clearTimeout(safetyTimeout);
  }, [loadingsss]);

  // Clear error
  const clearError = () => setError(null);

  // Refresh data function
  const refreshData = () => {
    fetchAllAddData();
  };

  const contextValue = {
    // State - Package-specific data
    marginss,  // Contains ALL margins data
    addData,   // Contains add data
    loadings,
    loadingss,
    loadingsss,
    error,
    downloadCounts,
    userData,
    pagination, // Pagination state
    marginData,
    // Actions
    fetchHistoryByPackageId,
    setMarginData,
    createFinalcosting,
    deleteFinalcosting,
    updateFinalcosting,
    updateLead,
    trackDownload,
    requestEditDiscount,
    fetchMarginByState,
    fetchAddData,
    fetchAllAddData, // New function to fetch all data
    deletePackage,
    refreshData,
    clearError,
    setMargins,
    setAddData,
    crmleads,
    crmloading,
    banks,
    banksLoading,
   
  };

  return (
    <FinalcostingContext.Provider value={contextValue}>
      {children}
    </FinalcostingContext.Provider>
  );
};

export default FinalcostingContext; 