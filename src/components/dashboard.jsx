import React, { useEffect, useState } from 'react';
import config from '../../config.jsx';
import { useSelector, useDispatch } from "react-redux";
import parse from 'html-react-parser';

function normalizeName(name) {
  return name?.replace(/\s+/g, ' ').trim().toLowerCase() || '';
}

function Dashboard() {
  const { currentUser } = useSelector((state) => state.user);
  console.log("currentUser", currentUser);
  const [margins, setMargins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  console.log("selectedPackage",selectedPackage)
  const [showPackageModal, setShowPackageModal] = useState(false);

  useEffect(() => {
    const fetchMargins = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${config.API_HOST}/api/margin/get-margin`);
        if (!response.ok) {
          throw new Error('Failed to fetch margin data');
        }
        const data = await response.json();
        console.log("data", data);
        setMargins(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMargins();
  }, []);

  const fullName = normalizeName(`${currentUser?.data?.firstName || ''} ${currentUser?.data?.lastName || ''}`);
  console.log("fullName", fullName);

  const handleAcceptReject = async (state, editDiscountId, value) => {
    try {
      if (value === 'no') {
        // Call delete API
        const response = await fetch(`${config.API_HOST}/api/margin/delete-edit-discount/${state}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ editDiscountId }),
        });
        if (!response.ok) throw new Error('Failed to delete edit discount');
        // Remove the editDiscount from local state
        setMargins(prev =>
          prev.map(margin =>
            margin.state === state
              ? {
                  ...margin,
                  minimumQuoteMargins: {
                    ...margin.minimumQuoteMargins,
                    editDiscount: margin.minimumQuoteMargins.editDiscount.filter(ed => ed._id !== editDiscountId),
                  },
                }
              : margin
          )
        );
      } else {
        // Accept logic (keep as before)
        const response = await fetch(`${config.API_HOST}/api/margin/update-edit-discount-field/${state}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            editDiscountId,
            updateFields: { accept: value }
          }),
        });
        if (!response.ok) throw new Error('Failed to update status');
        setMargins(prev =>
          prev.map(margin =>
            margin.state === state
              ? {
                  ...margin,
                  minimumQuoteMargins: {
                    ...margin.minimumQuoteMargins,
                    editDiscount: margin.minimumQuoteMargins.editDiscount.map(ed =>
                      ed._id === editDiscountId ? { ...ed, accept: value } : ed
                    ),
                  },
                }
              : margin
          )
        );
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleViewPackage = (packageData, discountPercentage) => {
    setSelectedPackage({
      ...packageData,
      discountPercentage: discountPercentage
    });
    setShowPackageModal(true);
  };

  const closePackageModal = () => {
    setShowPackageModal(false);
    setSelectedPackage(null);
  };

  const calculateFinalAmount = (packageData) => {
    if (!packageData) return 0;
    const { totals, marginAmount } = packageData;
    const grandTotal = totals?.grandTotal || 0;
    const margin = marginAmount || 0;
    const gst = (grandTotal + margin) * 0.05; // 5% GST
    return grandTotal + margin + gst;
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {loading && <p>Loading margin data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto my-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 tracking-wide">Request Edit Discount</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold text-xl">
                  <th className="px-4 py-3 border-b-2 border-r border-gray-700">Manager</th>
                  <th className="px-4 py-3 border-b-2 border-r border-gray-700">Discount</th>
                  <th className="px-4 py-3 border-b-2 border-r border-gray-700">Accept</th>
                  <th className="px-4 py-3 border-b-2 border-r border-gray-700">Username</th>
                  <th className="px-4 py-3 border-b-2 border-r border-gray-700">Role</th>
                  <th className="px-4 py-3 border-b-2 border-r border-gray-700">Package Name</th>
                  <th className="px-4 py-3 border-b-2 border-r border-gray-700">Package detail</th>
                  <th className="px-4 py-3 border-b-2 border-gray-700">Company Name</th>
                </tr>
              </thead>
              <tbody>
                {margins
                  .filter(
                    margin =>
                      margin.state &&
                      margin.minimumQuoteMargins &&
                      Array.isArray(margin.minimumQuoteMargins.editDiscount) &&
                      margin.minimumQuoteMargins.editDiscount.length > 0
                  )
                  .sort((a, b) => a.state.localeCompare(b.state))
                  .map((margin) => {
                    const filteredDiscounts = margin.minimumQuoteMargins.editDiscount
                      .filter(
                        ed =>
                          ed.loginUserDetail?.companyName === currentUser?.data?.companyName &&
                          normalizeName(ed.managerName) === fullName
                      );
                    if (filteredDiscounts.length === 0) return null;
                    return (
                      <React.Fragment key={margin._id}>
                        {/* State header row */}
                        <tr>
                          <td colSpan={8} className="bg-blue-100 text-blue-900 font-bold px-4 py-3 border-b text-xl border-t border-b-2 border-l border-r border-gray-700">
                            {margin.state}
                          </td>
                        </tr>
                        {/* All editDiscount rows for this state */}
                        {filteredDiscounts.map((ed, edIdx) => (
                          <React.Fragment key={ed._id || edIdx}>
                            <tr
                              className={
                                (ed.accept == 'yes'
                                  ? 'bg-green-600'
                                  : ed.accept == 'no'
                                  ? 'bg-red-600'
                                  : edIdx % 2 === 0
                                  ? 'bg-gray-50'
                                  : 'bg-white') +
                                ' hover:bg-blue-50 transition-colors duration-150 cursor-pointer text-lg'
                              }
                            >
                              <td className="px-4 py-3 border-b border-r border-gray-700 text-gray-800">{ed.managerName || 'N/A'}</td>
                              <td className="px-4 py-3 border-b border-r border-gray-700 text-gray-800">{ed.discountPercentage || 'N/A'}</td>
                              <td className="px-4 py-3 border-b border-r border-gray-700 text-gray-800">{ed.accept || 'no response '}</td>
                              <td className="px-4 py-3 border-b border-r border-gray-700 text-gray-800">{ed.loginUserDetail?.username || 'N/A'}</td>
                              <td className="px-4 py-3 border-b border-r border-gray-700 text-gray-800">{ed.loginUserDetail?.role || 'N/A'}</td>
                              <td className="px-4 py-3 border-b border-r border-gray-700 stext-gray-800">{ed.packageName || 'N/A'}</td>
                              <td className="px-4 py-3 border-b border-r border-gray-700 text-gray-800">
                                {ed.package && (
                                  <button
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                    onClick={() => handleViewPackage(ed.package, ed.discountPercentage)}
                                  >
                                    View Package
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3 border-b border-gray-700 text-gray-800">{ed.loginUserDetail?.companyName || 'N/A'}</td>
                            </tr>
                            {(!ed.accept || ed.accept === 'no response ') && (
                              <tr>
                                <td colSpan={8} className="px-4 py-3 border-b border-gray-300 text-center bg-yellow-50 text-gray-900">
                                  {ed.loginUserDetail?.Username || 'User'} asking for adjust the discount
                                  <div className="mt-2 flex justify-center gap-4">
                                    <button
                                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                      onClick={() => handleAcceptReject(margin.state, ed._id, 'yes')}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                      onClick={() => handleAcceptReject(margin.state, ed._id, 'no')}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {showPackageModal && selectedPackage && (
        
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Package Details</h2>
                <button
                  onClick={closePackageModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Package Basic Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Package Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Total Amount:</span> ₹{selectedPackage.total?.toLocaleString() || '0'}
                  </div>
                  <div>
                    <span className="font-medium">Margin Percentage:</span> {selectedPackage.marginPercentage || '0'}%
                  </div>
                  <div>
                    <span className="font-medium">Margin Amount:</span> ₹{selectedPackage.marginAmount?.toLocaleString() || '0'}
                  </div>
                  <div>
                    <span className="font-medium">Final Amount:</span> ₹{(selectedPackage.total + selectedPackage.marginAmount)?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>

              {/* Cab Data Section */}
              {selectedPackage.cabData && selectedPackage.cabData.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Cab Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 border border-gray-300">Cab Name</th>
                          <th className="px-4 py-2 border border-gray-300">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPackage.cabData.map((cab, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-2 border border-gray-300">{cab.cabName}</td>
                            <td className="px-4 py-2 border border-gray-300">₹{cab.price?.toLocaleString() || '0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Hotel Data Section */}
              {selectedPackage.hotelData && selectedPackage.hotelData.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Hotel Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 border border-gray-300">Property Name</th>
                          <th className="px-4 py-2 border border-gray-300">Cost</th>
                          <th className="px-4 py-2 border border-gray-300">Extra Adult Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPackage.hotelData.map((hotel, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-2 border border-gray-300">{hotel.propertyName}</td>
                            <td className="px-4 py-2 border border-gray-300">₹{hotel.cost?.toLocaleString() || '0'}</td>
                            <td className="px-4 py-2 border border-gray-300">₹{hotel.extraAdultRate?.toLocaleString() || '0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cost Summary */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Cost Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Total:</span>
                    <span>₹{selectedPackage.total?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin Amount ({selectedPackage.marginPercentage || 0}%):</span>
                    <span>₹{selectedPackage.marginAmount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal (Total + Margin):</span>
                    <span>₹{(selectedPackage.total + selectedPackage.marginAmount)?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span>₹{((selectedPackage.total + selectedPackage.marginAmount) * 0.05)?.toFixed(0)?.toLocaleString() || '0'}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Final Amount (with GST):</span>
                    <span>₹{((selectedPackage.total + selectedPackage.marginAmount) * 1.05)?.toFixed(0)?.toLocaleString() || '0'}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between">
                    <span>Discount Amount ({selectedPackage.discountPercentage || 0}%):</span>
                    <span>₹{((selectedPackage.total + selectedPackage.marginAmount) * 1.05 * (selectedPackage.discountPercentage || 0) / 100)?.toFixed(0)?.toLocaleString() || '0'}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between font-bold text-xl text-green-600">
                    <span>Amount After Discount:</span>
                    <span>₹{((selectedPackage.total + selectedPackage.marginAmount) * 1.05 * (1 - (selectedPackage.discountPercentage || 0) / 100))?.toFixed(0)?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;