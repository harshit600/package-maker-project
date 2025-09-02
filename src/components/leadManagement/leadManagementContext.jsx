import { createContext, useState, useContext } from "react";

const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}

export const LeadManagementContext = createContext();

export const LeadManagementProvider = ({ children }) => {
    const [isLeadManagementOpen, setIsLeadManagementOpen] = useState(false);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Auto-fetch all data state
    const [isFetchingAll, setIsFetchingAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch all leads automatically (all pages)
    const fetchAllLeads = async () => {
        setLoading(true);
        setError(null);
        setIsFetchingAll(true);
        
        try {
            let allLeads = [];
            let page = 1;
            let hasMorePages = true;
            
            
            while (hasMorePages) {
                console.log(`Fetching page ${page}...`);
                
                const response = await fetch(`${config.API_HOST}/api/leads/public/get-leads?page=${page}&limit=1000`);
                if (!response.ok) {
                    throw new Error('Failed to fetch leads');
                }
                
                const data = await response.json();
                
                if (data.leads && data.leads.length > 0) {
                    // Add leads from this page to our collection
                    allLeads = [...allLeads, ...data.leads];
                    
                    // Extract pagination info from the pagination object
                    const pagination = data.pagination || {};
                    setCurrentPage(pagination.currentPage || page);
                    setTotalPages(pagination.totalPages || 1);
                    
                    // Check if there are more pages using the pagination object
                    hasMorePages = pagination.hasNextPage !== undefined ? pagination.hasNextPage : false;
                    
               
                    
                    // Update the leads state with all data collected so far
                    setLeads([...allLeads]);
                    
                    // Small delay to prevent overwhelming the server
                    if (hasMorePages) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    page++;
                } else {
                    // No more data or unexpected response structure
                    hasMorePages = false;
                    console.log('No more data to fetch or unexpected response structure');
                }
            }
            
            
        } catch (err) {
            setError(err.message);
            console.error('Error fetching all leads:', err);
        } finally {
            setLoading(false);
            setIsFetchingAll(false);
        }
    };

    // Legacy function for backward compatibility
    const fetchLeads = async () => {
        await fetchAllLeads();
    };

    // Get single lead by ID
    const getLead = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${config.API_HOST}/api/leads/public/get-lead/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch lead');
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching lead:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update lead
    const updateLead = async (id, updatedData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${config.API_HOST}/api/leads/public/update-lead/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) {
                throw new Error('Failed to update lead');
            }
            const data = await response.json();
            // Update the leads list with the updated lead
            setLeads(prevLeads => 
                prevLeads.map(lead => 
                    lead._id === id ? data : lead
                )
            );
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error updating lead:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Delete lead
    const deleteLead = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${config.API_HOST}/api/leads/public/delete-lead/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete lead');
            }
            // Remove the deleted lead from the list
            setLeads(prevLeads => prevLeads.filter(lead => lead._id !== id));
            return true;
        } catch (err) {
            setError(err.message);
            console.error('Error deleting lead:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        isLeadManagementOpen,
        setIsLeadManagementOpen,
        leads,
        loading,
        isFetchingAll,
        error,
        // Auto-fetch state
        currentPage,
        totalPages,
        // Functions
        fetchLeads,
        fetchAllLeads,
        getLead,
        updateLead,
        deleteLead,
    };

    return (
        <LeadManagementContext.Provider value={value}>
            {children}
        </LeadManagementContext.Provider>
    );
};

// Custom hook to use the context
export const useLeadManagement = () => {
    const context = useContext(LeadManagementContext);
    if (!context) {
        throw new Error('useLeadManagement must be used within a LeadManagementProvider');
    }
    return context;
};