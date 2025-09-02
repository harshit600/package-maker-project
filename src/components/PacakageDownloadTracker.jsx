import React, { useState, useEffect } from 'react';
const config = {
    API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

const PackageDownloadTracker = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterMargin, setFilterMargin] = useState('');
    const [filterState, setFilterState] = useState('');
    const [filterUserName, setFilterUserName] = useState('');
    const [expandedPackages, setExpandedPackages] = useState(new Set());

    const marginRanges = [
        { label: 'Less than 1 Lakh', value: 'less_than_1' },
        { label: '1-2 Lakh', value: '1_to_2' },
        { label: '2-3 Lakh', value: '2_to_3' },
        { label: '3-4 Lakh', value: '3_to_4' },
        { label: 'More than 4 Lakh', value: 'more_than_4' }
    ];

    const stateOptions = [
        { value: "Andhra Pradesh", label: "Andhra Pradesh" },
        { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
        { value: "assam", label: "Assam" },
        { value: "bihar", label: "Bihar" },
        { value: "chhattisgarh", label: "Chhattisgarh" },
        { value: "goa", label: "Goa" },
        { value: "gujarat", label: "Gujarat" },
        { value: "haryana", label: "Haryana" },
        { value: "Himachal Pradesh", label: "Himachal Pradesh" },
        { value: "jharkhand", label: "Jharkhand" },
        { value: "karnataka", label: "Karnataka" },
        { value: "kerala", label: "Kerala" },
        { value: "Madhya Pradesh", label: "Madhya Pradesh" },
        { value: "maharashtra", label: "Maharashtra" },
        { value: "manipur", label: "Manipur" },
        { value: "meghalaya", label: "Meghalaya" },
        { value: "mizoram", label: "Mizoram" },
        { value: "nagaland", label: "Nagaland" },
        { value: "odisha", label: "Odisha" },
        { value: "punjab", label: "Punjab" },
        { value: "rajasthan", label: "Rajasthan" },
        { value: "sikkim", label: "Sikkim" },
        { value: "tamil_nadu", label: "Tamil Nadu" },
        { value: "telangana", label: "Telangana" },
        { value: "tripura", label: "Tripura" },
        { value: "Uttar Pradesh", label: "Uttar Pradesh" },
        { value: "uttarakhand", label: "Uttarakhand" },
        { value: "West Bengal", label: "West Bengal" },
        { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
        { value: "chandigarh", label: "Chandigarh" },
        { value: "Dadra and Nagar Haveli", label: "Dadra and Nagar Haveli" },
        { value: "Daman and Diu", label: "Daman and Diu" },
        { value: "delhi", label: "Delhi" },
        { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
        { value: "ladakh", label: "Ladakh" },
        { value: "lakshadweep", label: "Lakshadweep" },
        { value: "puducherry", label: "Puducherry" },
        { value: "Telangana", label: "Telangana" },
        { value: "sri lanka", label: "sri lanka" }
    ];

    // Helper function to get state label from value
    const getStateLabel = (stateValue) => {
        const state = stateOptions.find(s => s.value === stateValue);
        return state ? state.label : stateValue;
    };

    // Helper function to get guest details
    const getGuestDetails = (user) => {
        const guestName = user.user?.leaddetails?.name || '';
        const guestMobile = user.user?.leaddetails?.mobile || '';
        const guestState =  user.user?.state || '';
        
        return {
            name: guestName,
            mobile: guestMobile,
            state: guestState,
            stateLabel: getStateLabel(guestState)
        };
    };

    // Helper functions for accordion state management
    const togglePackageExpansion = (packageId) => {
        setExpandedPackages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(packageId)) {
                newSet.delete(packageId);
            } else {
                newSet.add(packageId);
            }
            return newSet;
        });
    };

    const isPackageExpanded = (packageId) => {
        return expandedPackages.has(packageId);
    };

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(`${config.API_HOST}/api/packagetracker/packages`);
                if (!response.ok) {
                    throw new Error('Failed to fetch packages');
                }
                const data = await response.json();
                console.log("data", data);
                setPackages(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchPackages();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatTravelDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const filterPackages = (packages) => {
        if (!packages) return [];
        
        return packages.filter(pkg => {
            // Filter users within the package
            const filteredUsers = pkg.users?.filter(user => {
                const userMargin = parseFloat(user.user?.marginAmount) || 0;
                let marginMatch = true;

                if (filterMargin) {
                    switch(filterMargin) {
                        case 'less_than_1':
                            marginMatch = userMargin < 100000;
                            break;
                        case '1_to_2':
                            marginMatch = userMargin >= 100000 && userMargin < 200000;
                            break;
                        case '2_to_3':
                            marginMatch = userMargin >= 200000 && userMargin < 300000;
                            break;
                        case '3_to_4':
                            marginMatch = userMargin >= 300000 && userMargin < 400000;
                            break;
                        case 'more_than_4':
                            marginMatch = userMargin >= 400000;
                            break;
                    }
                }
                
                if (!marginMatch) return false;

                // User name filter
                if (filterUserName) {
                    const userName = user.user?.name || '';
                    if (!userName.toLowerCase().includes(filterUserName.toLowerCase())) {
                        return false;
                    }
                }

                // State filter
                if (filterState) {
                    const guestDetails = getGuestDetails(user);
                    if (guestDetails.state !== filterState) return false;
                }
                
                // Date range filter
                if (filterStartDate || filterEndDate) {
                    const hasMatchingDownloads = user.downloadHistory?.some(history => {
                        const historyDate = new Date(history.date);
                        const startDate = filterStartDate ? new Date(filterStartDate) : null;
                        const endDate = filterEndDate ? new Date(filterEndDate) : null;
                        
                        // If only start date is selected
                        if (startDate && !endDate) {
                            return historyDate >= startDate;
                        }
                        // If only end date is selected
                        if (!startDate && endDate) {
                            return historyDate <= endDate;
                        }
                        // If both dates are selected
                        if (startDate && endDate) {
                            return historyDate >= startDate && historyDate <= endDate;
                        }
                        
                        return true;
                    });
                    
                    if (!hasMatchingDownloads) return false;
                }
                
                return true;
            });

            // If no users match the filter, don't show the package
            if (!filteredUsers || filteredUsers.length === 0) return false;

            // Update the package's users with filtered users
            pkg.users = filteredUsers;

            // Update download counts based on filtered users
            const newDownloadCounts = {
                pluto: 0,
                'demand-setu': 0,
                total: 0
            };

            filteredUsers.forEach(user => {
                user.downloadHistory?.forEach(history => {
                    const historyDate = new Date(history.date);
                    const startDate = filterStartDate ? new Date(filterStartDate) : null;
                    const endDate = filterEndDate ? new Date(filterEndDate) : null;
                    
                    let dateInRange = true;
                    
                    // Check if date is in range
                    if (filterStartDate || filterEndDate) {
                        if (startDate && !endDate) {
                            dateInRange = historyDate >= startDate;
                        } else if (!startDate && endDate) {
                            dateInRange = historyDate <= endDate;
                        } else if (startDate && endDate) {
                            dateInRange = historyDate >= startDate && historyDate <= endDate;
                        }
                    }
                    
                    if (dateInRange) {
                        newDownloadCounts.pluto += history.counts?.pluto || 0;
                        newDownloadCounts['demand-setu'] += history.counts?.['demand-setu'] || 0;
                        newDownloadCounts.total += history.counts?.total || 0;
                    }
                });
            });

            pkg.downloadCounts = newDownloadCounts;
            return true;
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">
            <p>Error: {error}</p>
        </div>
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Package Download Tracker</h1>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                        <input
                            type="text"
                            value={filterUserName}
                            onChange={(e) => setFilterUserName(e.target.value)}
                            placeholder="Search by user name..."
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Margin Amount</label>
                        <select
                            value={filterMargin}
                            onChange={(e) => setFilterMargin(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="">All Margins</option>
                            {marginRanges.map((range) => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="">All States</option>
                            {stateOptions.map((state) => (
                                <option key={state.value} value={state.value}>
                                    {state.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                {filterPackages(packages).map((pkg) => {
                    const isExpanded = isPackageExpanded(pkg._id);
                    return (
                        <div key={pkg._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Package Header - Clickable Accordion Header */}
                            <div 
                                className="px-6 py-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => togglePackageExpansion(pkg._id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-gray-800">{pkg.packageName}</h2>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Created: {formatDate(pkg.createdAt)}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-purple-600">
                                                    <span className="font-medium">Pluto:</span> {pkg.downloadCounts?.pluto || 0}
                                                </div>
                                                <div className="text-orange-600">
                                                    <span className="font-medium">Demand Setu:</span> {pkg.downloadCounts?.['demand-setu'] || 0}
                                                </div>
                                                <div className="font-medium">
                                                    Total Downloads: {pkg.downloadCounts?.total || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <svg 
                                                className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accordion Content - Users Section */}
                            {isExpanded && (
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Download Details</h3>
                                    <div className="space-y-6">
                                        {pkg.users?.map((user, userIndex) => {
                                            const guestDetails = getGuestDetails(user);
                                            return (
                                                <div key={userIndex} className="bg-gray-50 rounded-lg p-4">
                                                    {/* User Info */}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-800">{user.user?.name || 'Anonymous User'}</h4>
                                                            <p className="text-sm text-gray-600">{user.user?.userType}</p>
                                                            <p className="text-lg text-gray-800">Amount: ₹{user.user?.marginAmount?.toLocaleString()}</p>
                                                            <p className="text-lg text-gray-800">Margin Percentage: {user.user?.marginPercentage}%</p>
                                                            <p className="text-xl text-gray-800 font-bold bg-blue-500 text-white p-2 rounded-lg">Travel Date: {formatTravelDate(user?.user?.travelDate)}</p>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <p className="font-medium">Total Downloads: {user.totalDownloads}</p>
                                                        </div>
                                                    </div>

                                                    {/* Guest Details Section */}
                                                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                                        <h5 className="font-medium text-blue-800 mb-2">Guest Details</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-600">Name:</span>
                                                                <p className="text-blue-900">{guestDetails.name}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-600">Mobile:</span>
                                                                <p className="text-blue-900">{guestDetails.mobile}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-600">State:</span>
                                                                <p className="text-blue-900">{guestDetails.stateLabel}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Download History */}
                                                    <div className="space-y-4">
                                                        {user.downloadHistory?.map((history, historyIndex) => (
                                                            <div key={historyIndex} className="bg-white rounded-lg p-4 shadow-sm">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <h5 className="font-medium">Date: {history.date}</h5>
                                                                    <div className="text-sm">
                                                                        <span className="text-purple-600 mr-3">Pluto: {history.counts?.pluto || 0}</span>
                                                                        <span className="text-orange-600 mr-3">Demand Setu: {history.counts?.['demand-setu'] || 0}</span>
                                                                        <span className="font-medium">Total: {history.counts?.total}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {history.downloads.map((download, downloadIndex) => (
                                                                        <div
                                                                            key={downloadIndex}
                                                                            className={`p-3 rounded-lg ${download.downloadType === 'pluto'
                                                                                    ? 'bg-purple-50 text-purple-700'
                                                                                    : 'bg-orange-50 text-orange-700'
                                                                                }`}
                                                                        >
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="font-medium">
                                                                                    {download.downloadType === 'pluto' ? 'Pluto PDF' : 'Demand Setu PDF'}
                                                                                </span>
                                                                                <span className="text-sm">
                                                                                    {formatDate(download.timestamp)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PackageDownloadTracker;



