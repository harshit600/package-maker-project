import React, { useEffect, useState } from "react";
import { useFinalcosting } from "../context/FinalcostingContext";
import { usePackage } from "../context/PackageContext";

const FinalCostingExample = ({ selectedLead }) => {
  const { packageSummary } = usePackage();
  
  // Destructure context methods and state
  const {
    loading,
    error,
    filteredHistory,
    downloadCounts,
    getHistoryForPackage,
    hasConvertedHistory,
    getDownloadStats,
    createHistory,
    updateHistory,
    deleteHistory,
    trackDownload,
    setPackageId,
    clearErrorMessage,
  } = useFinalcosting();

  // Local component state
  const [showMargin, setShowMargin] = useState(false);
  const [customMarginPercentage, setCustomMarginPercentage] = useState("");

  // Set package ID when component mounts or packageSummary changes
  useEffect(() => {
    if (packageSummary?.id) {
      setPackageId(packageSummary.id);
    }
  }, [packageSummary?.id, setPackageId]);

  // Handle creating new history entry
  const handleSendLink = async () => {
    if (!packageSummary?.id) return;

    const historyItem = {
      timestamp: new Date().toLocaleString(),
      total: packageSummary?.totals?.grandTotal || 0,
      marginPercentage: parseFloat(customMarginPercentage) || 0,
      discountPercentage: 0,
      finalTotal: (packageSummary?.totals?.grandTotal || 0) * (1 + parseFloat(customMarginPercentage || 0) / 100),
      id: packageSummary.id,
      activities: packageSummary.activities,
      hotels: packageSummary.hotels,
      transfer: packageSummary.transfer,
      totals: packageSummary.totals,
    };

    try {
      await createHistory(historyItem);
      console.log("History created successfully");
    } catch (error) {
      console.error("Error creating history:", error);
    }
  };

  // Handle deleting history entry
  const handleDeleteHistory = async (historyId) => {
    try {
      await deleteHistory(historyId);
      console.log("History deleted successfully");
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  // Handle converting quote
  const handleConvertQuote = async (historyId) => {
    try {
      await updateHistory(historyId, { converted: true });
      console.log("Quote converted successfully");
    } catch (error) {
      console.error("Error converting quote:", error);
    }
  };

  // Handle tracking downloads
  const handleTrackDownload = async (downloadType) => {
    if (!packageSummary?.id) return;
    
    try {
      await trackDownload(
        packageSummary.id,
        packageSummary.package,
        downloadType
      );
      console.log(`Download tracked: ${downloadType}`);
    } catch (error) {
      console.error("Error tracking download:", error);
    }
  };

  // Get current package history
  const currentHistory = getHistoryForPackage(packageSummary?.id);
  
  // Check if any quote is converted
  const hasConverted = hasConvertedHistory(packageSummary?.id);
  
  // Get download statistics
  const downloadStats = getDownloadStats(packageSummary?.id);

  if (loading) {
    return <div className="p-4">Loading final costing data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Error: {error}</p>
        <button
          onClick={clearErrorMessage}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear Error
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Final Costing</h2>
        
        {/* Package Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Package Summary</h3>
          <p>Package ID: {packageSummary?.id}</p>
          <p>Grand Total: ₹{packageSummary?.totals?.grandTotal || 0}</p>
        </div>

        {/* Margin Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Custom Margin Percentage:
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={customMarginPercentage}
              onChange={(e) => setCustomMarginPercentage(e.target.value)}
              className="border rounded px-3 py-2 w-32"
              placeholder="Enter %"
            />
            <button
              onClick={handleSendLink}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Quote
            </button>
          </div>
        </div>

        {/* Download Tracking */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Download PDF</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleTrackDownload('pluto')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Download Pluto PDF
            </button>
            <button
              onClick={() => handleTrackDownload('demand-setu')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Download Demand Setu PDF
            </button>
          </div>
          
          {/* Download Stats */}
          {downloadStats.total > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <p>Total Downloads: {downloadStats.total}</p>
              <p>Pluto: {downloadStats.pluto || 0}, Demand Setu: {downloadStats['demand-setu'] || 0}</p>
            </div>
          )}
        </div>

        {/* Quote History */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quote History</h3>
          
          {hasConverted && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              This package has converted quotes!
            </div>
          )}
          
          {currentHistory.length === 0 ? (
            <p className="text-gray-500">No quotes created yet.</p>
          ) : (
            <div className="space-y-4">
              {currentHistory.map((item, index) => (
                <div
                  key={item._id || index}
                  className="border rounded p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Quote #{index + 1}</p>
                      <p className="text-sm text-gray-600">{item.timestamp}</p>
                      <p>Base: ₹{item.total}, Final: ₹{item.finalTotal}</p>
                      <p>Margin: {item.marginPercentage}%</p>
                      {item.converted && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Converted
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {!item.converted && (
                        <button
                          onClick={() => handleConvertQuote(item._id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Convert
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteHistory(item._id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalCostingExample; 