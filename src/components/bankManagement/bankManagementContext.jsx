import { createContext, useContext,useState ,useEffect} from "react";
const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}

export const BankManagementContext = createContext(null);

export function BankManagementProvider({ children }) {
  const [transactionDetail, setTransactionDetail] = useState(null);
  const [transactionDetailLoading, setTransactionDetailLoading] = useState(false);
  const [transactionList, setTransactionList] = useState([]);
  const [bankReport, setBankReport] = useState([]);
  const [bankReportLoading, setBankReportLoading] = useState(false);
  const [transactionListLoading, setTransactionListLoading] = useState(false);
  const [serviceReport, setServiceReport] = useState([]);
  const [serviceReportLoading, setServiceReportLoading] = useState(false);
  const createBankTransaction = async (payload) => {
    const response = await fetch(
      `${config.API_HOST}/api/banktransactions/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `Failed to create bank transaction (${response.status})`);
    }

    return response.json();
  };

  const updateBankTransaction = async (transactionId, payload) => {
   
    const response = await fetch(
      `${config.API_HOST}/api/banktransactions/update/${transactionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `Failed to update bank transaction (${response.status})`);
    }

    // Update the local state after successful update
    const updatedData = await response.json();
    setTransactionList(prev => 
      prev.map(transaction => 
        transaction._id === transactionId 
          ? { ...transaction, ...payload }
          : transaction
      )
    );

    return updatedData;
  };

  const getLeadById = async (leadId) => {
    setTransactionDetailLoading(true);
    const response = await fetch(`${config.API_HOST}/api/banktransactions/lead/${encodeURIComponent(leadId)}`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `Failed to fetch lead (${response.status})`);
    }
    const data = await response.json();
    setTransactionDetail(data?.data);
    setTransactionDetailLoading(false);
    return data;
  };
  
  const transactionLists = async () => {
    setTransactionListLoading(true);
    const response = await fetch(`${config.API_HOST}/api/banktransactions/get`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `Failed to fetch lead (${response.status})`);
    }
    const data = await response.json();
    setTransactionList(data?.data);
    setTransactionListLoading(false);
    return data;
  };
  const bankReportList = async () => {
    setBankReportLoading(true);
    const response = await fetch(`${config.API_HOST}/api/banktransactions/get`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `Failed to fetch lead (${response.status})`);
    }
    const data = await response.json();
    const filteredData = data?.data?.filter(item => item.accept === true);
    const reversedData = filteredData?.reverse() || [];
    setBankReport(reversedData);
    setBankReportLoading(false);
    return data;
  };
  
  const serviceReportList = async () => {
    setServiceReportLoading(true);
    let allServiceReports = [];
    let currentPage = 1;
    let hasMorePages = true;
    let total = 0;

    try {
      while (hasMorePages) {
        console.log(`Fetching page ${currentPage}...`);
        const response = await fetch(
          `${config.API_HOST}/api/finalcosting/get-converted-details?page=${currentPage}&limit=5`
        );
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(errorText || `Failed to fetch service report (${response.status})`);
        }
        
        const data = await response.json();
        console.log(`Page ${currentPage} response:`, data);

        // Check if data exists and is an array - handle 'operations' field
        if (data && data.operations && Array.isArray(data.operations)) {
          console.log(`Page ${currentPage} has ${data.operations.length} items`);
          allServiceReports = [...allServiceReports, ...data.operations];
          setServiceReport([...allServiceReports]); // Update state after each page
          
          // Check for pagination info - use totalPages and currentPage
          if (data.pagination) {
            const { currentPage: apiCurrentPage, totalPages, totalItems } = data.pagination;
            console.log(`Current page: ${apiCurrentPage}, Total pages: ${totalPages}, Total items: ${totalItems}`);
            
            if (apiCurrentPage < totalPages) {
              hasMorePages = true;
              currentPage = apiCurrentPage + 1;
              total = totalItems;
              console.log(`More pages available. Next page: ${currentPage}`);
            } else {
              hasMorePages = false;
              total = totalItems;
              console.log('No more pages available - reached last page');
            }
          } else {
            hasMorePages = false;
            console.log('No pagination info available');
          }
        } else if (data && data.data && Array.isArray(data.data)) {
          // Handle case where API returns data.data array
          console.log(`Page ${currentPage} has ${data.data.length} items`);
          allServiceReports = [...allServiceReports, ...data.data];
          setServiceReport([...allServiceReports]);
          
          if (data.pagination) {
            const { currentPage: apiCurrentPage, totalPages, totalItems } = data.pagination;
            if (apiCurrentPage < totalPages) {
              hasMorePages = true;
              currentPage = apiCurrentPage + 1;
              total = totalItems;
            } else {
              hasMorePages = false;
              total = totalItems;
            }
          } else {
            hasMorePages = false;
          }
        } else if (data && Array.isArray(data)) {
          // Handle case where API returns array directly
          console.log(`API returned array directly with ${data.length} items`);
          allServiceReports = [...allServiceReports, ...data];
          setServiceReport([...allServiceReports]);
          hasMorePages = false;
        } else {
          console.log('Unexpected data structure:', data);
          hasMorePages = false;
        }
      }
      
      console.log(`Final result: ${allServiceReports.length} total items`);
      setServiceReport(allServiceReports);
      setServiceReportLoading(false);
      return { data: allServiceReports, total: total || allServiceReports.length };
    } catch (error) {
      console.error('Error in serviceReportList:', error);
      setServiceReportLoading(false);
      setServiceReport([]);
      throw error;
    }
  };

  const updateCabVerification = async (operationId, index, detailData) => {
    const response = await fetch(
      `${config.API_HOST}/api/finalcosting/update-transfer-detail/${operationId}`,
      {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, detailData }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `Failed to update cab verification (${response.status})`);
    }

    // Update local state after successful API call
    setServiceReport(prev => 
      prev.map(operation => {
        if (operation._id === operationId) {
          return {
            ...operation,
            transfer: {
              ...operation.transfer,
              details: operation.transfer.details.map((transfer, i) => 
                i === index ? { ...transfer, verified: true } : transfer
              )
            }
          };
        }
        return operation;
      })
    );

    return response.json();
  };

  const updateHotelVerification = async (operationId, day, hotelData) => {
    const response = await fetch(
      `${config.API_HOST}/api/finalcosting/update-hotel/${operationId}`,
      {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, hotelData }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || `Failed to update hotel verification (${response.status})`);
    }

    return response.json();
  };
  useEffect(() => {
    transactionLists()
    bankReportList()
    serviceReportList()
  }, [])
  
  return (
    <BankManagementContext.Provider
      value={{ 
        createBankTransaction, 
        updateBankTransaction,
        getLeadById, 
        transactionDetail, 
        transactionDetailLoading, 
        transactionList, 
        transactionListLoading,
        bankReport,
        bankReportList,
        bankReportLoading,
        transactionLists,
        serviceReport,
        serviceReportList,
        serviceReportLoading,
        updateCabVerification,
        updateHotelVerification
      }}
    >
      {children}
    </BankManagementContext.Provider>
  );
}

export function useBankManagement() {
  const context = useContext(BankManagementContext);
  if (!context) {
    throw new Error("useBankManagement must be used within a BankManagementProvider");
  }
  return context;
}
