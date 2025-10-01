import React from 'react';
import { X } from 'lucide-react';

const ViewPackagePopup = ({ isOpen, onClose, packageData }) => {
    console.log(packageData,"packageData")
  if (!isOpen || !packageData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[rgb(45,45,68)] px-6 py-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-semibold">Package Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Package Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Package Name</p>
                <p className="font-medium text-gray-900">
                  {packageData.package?.packageName || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Package Type</p>
                <p className="font-medium text-gray-900">
                  {packageData.package?.packageType || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Category</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {packageData.package?.packageCategory || "N/A"}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {packageData.package?.duration ? `${packageData.package.duration} Days` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Package Description */}
          {packageData.package?.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {packageData.package.description}
                </p>
              </div>
            </div>
          )}


          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Inclusions */}
            {packageData.package?.inclusions && packageData.package.inclusions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inclusions</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    {packageData.package.inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">
                          {typeof inclusion === 'string' ? inclusion : inclusion.name || inclusion.description || JSON.stringify(inclusion)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Exclusions */}
            {packageData.package?.exclusions && packageData.package.exclusions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exclusions</h3>
                <div className="bg-red-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    {packageData.package.exclusions.map((exclusion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span className="text-gray-700">
                          {typeof exclusion === 'string' ? exclusion : exclusion.name || exclusion.description || JSON.stringify(exclusion)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>


          {/* Additional Package Details */}
          {packageData.package?.highlights && packageData.package.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {packageData.package.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-500 mr-2">★</span>
                      <span className="text-gray-700">
                        {typeof highlight === 'string' ? highlight : highlight.name || highlight.description || JSON.stringify(highlight)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Detailed Cab Information */}
          {packageData.cabs && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transportation Details</h3>
              
              {/* Travel Prices */}
              {packageData.cabs.travelPrices?.prices && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Travel Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Lowest On-Season Price</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(packageData.cabs.travelPrices.prices.lowestOnSeasonPrice)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Lowest Off-Season Price</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(packageData.cabs.travelPrices.prices.lowestOffSeasonPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Cabs */}
              {packageData.cabs.selectedCabs && (
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">Selected Vehicles</h4>
                  <div className="space-y-4">
                    {Object.entries(packageData.cabs.selectedCabs).map(([cabType, cabs]) => (
                      <div key={cabType} className="border rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                            {cabType}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {cabs.map((cab, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-gray-900">{cab.cabName}</p>
                              <p className="text-sm text-gray-600">{cab.seatingCapacity}</p>
                              <p className="text-sm text-gray-600">{cab.luggage}</p>
                              {cab.fuelType && (
                                <p className="text-sm text-gray-600">Fuel: {cab.fuelType}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Info */}
              {packageData.cabs.travelInfo && packageData.cabs.travelInfo.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Travel Information</h4>
                  <div className="space-y-2">
                    {packageData.cabs.travelInfo.map((info, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{info.from} → {info.to}</span>
                          {info.distance && (
                            <span className="text-sm text-gray-600">{info.distance} km</span>
                          )}
                        </div>
                        {info.duration && (
                          <p className="text-sm text-gray-600 mt-1">Duration: {info.duration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Hotel Information */}
          {packageData.hotels && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accommodation Details</h3>
              <div className="space-y-4">
                {Object.entries(packageData.hotels).map(([dayKey, hotelData]) => (
                  <div key={dayKey} className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        Day {dayKey}
                      </span>
                    </div>
                    
                    {hotelData.hotelInfo && (
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900 mb-2">Hotel Information</h5>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900">{hotelData.hotelInfo.name}</p>
                          {hotelData.hotelInfo.basicInfo?.starRating && (
                            <div className="flex items-center mt-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm text-gray-600 ml-1">{hotelData.hotelInfo.basicInfo.starRating} Star</span>
                            </div>
                          )}
                          {hotelData.hotelInfo.basicInfo?.location && (
                            <p className="text-sm text-gray-600 mt-1">{hotelData.hotelInfo.basicInfo.location}</p>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Itinerary with Full Details */}
          {packageData.package?.itineraryDays && packageData.package.itineraryDays.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Itinerary</h3>
              <div className="space-y-6">
                {packageData.package.itineraryDays.map((day, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        Day {day.day}
                      </span>
                      {day.selectedItinerary?.totalHours && (
                        <span className="text-sm text-gray-600">
                          Duration: {day.selectedItinerary.totalHours} hours
                        </span>
                      )}
                    </div>

                    {day.selectedItinerary?.itineraryTitle && (
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        {day.selectedItinerary.itineraryTitle}
                      </h4>
                    )}

                    {day.selectedItinerary?.cityName && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Destination</p>
                        <p className="font-medium text-gray-900">{day.selectedItinerary.cityName}</p>
                      </div>
                    )}

                    {day.selectedItinerary?.distance && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Distance</p>
                        <p className="font-medium text-gray-900">{day.selectedItinerary.distance} km</p>
                      </div>
                    )}

                    {day.selectedItinerary?.itineraryDescription && (
                      <div className="mb-4">
                        <h5 className="text-md font-medium text-gray-800 mb-2">Description</h5>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {day.selectedItinerary.itineraryDescription}
                          </p>
                        </div>
                      </div>
                    )}

                    {day.selectedItinerary?.cityArea && day.selectedItinerary.cityArea.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Places to Visit</p>
                        <div className="flex flex-wrap gap-2">
                          {day.selectedItinerary.cityArea.map((place, placeIndex) => (
                            <span
                              key={placeIndex}
                              className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md"
                            >
                              {place.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {day.selectedItinerary?.activities && day.selectedItinerary.activities.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Activities</p>
                        <div className="space-y-1">
                          {day.selectedItinerary.activities.map((activity, activityIndex) => (
                            <div key={activityIndex} className="flex items-center">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-gray-700">
                                {typeof activity === 'string' ? activity : activity.name || activity.description || JSON.stringify(activity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {day.selectedItinerary?.inclusions && day.selectedItinerary.inclusions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Day Inclusions</p>
                        <div className="space-y-1">
                          {day.selectedItinerary.inclusions.map((inclusion, inclusionIndex) => (
                            <div key={inclusionIndex} className="flex items-start">
                              <span className="text-green-500 mr-2 mt-0.5">✓</span>
                              <span className="text-gray-700 text-sm">
                                {typeof inclusion === 'string' ? inclusion : inclusion.name || inclusion.description || JSON.stringify(inclusion)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {day.selectedItinerary?.exclusions && day.selectedItinerary.exclusions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Day Exclusions</p>
                        <div className="space-y-1">
                          {day.selectedItinerary.exclusions.map((exclusion, exclusionIndex) => (
                            <div key={exclusionIndex} className="flex items-start">
                              <span className="text-red-500 mr-2 mt-0.5">✗</span>
                              <span className="text-gray-700 text-sm">
                                {typeof exclusion === 'string' ? exclusion : exclusion.name || exclusion.description || JSON.stringify(exclusion)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Package Description with HTML */}
          {packageData.package?.packageDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Overview</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div 
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: packageData.package.packageDescription }}
                />
              </div>
            </div>
          )}

          {/* Package Inclusions with HTML */}
          {packageData.package?.packageInclusions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Inclusions</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <div 
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: packageData.package.packageInclusions }}
                />
              </div>
            </div>
          )}

          {/* Package Exclusions with HTML */}
          {packageData.package?.packageExclusions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Exclusions</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <div 
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: packageData.package.packageExclusions }}
                />
              </div>
            </div>
          )}

          {/* Custom Exclusions */}
          {packageData.package?.customExclusions && packageData.package.customExclusions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Exclusions</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {packageData.package.customExclusions.map((exclusion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">✗</span>
                      <span className="text-gray-700">
                        {typeof exclusion === 'string' ? exclusion : exclusion.name || exclusion.description || JSON.stringify(exclusion)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Package Places */}
          {packageData.package?.packagePlaces && packageData.package.packagePlaces.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Places Covered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageData.package.packagePlaces.map((place, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">{place.placeCover}</h5>
                    <p className="text-sm text-gray-600">Nights: {place.nights}</p>
                    <p className="text-sm text-gray-600">Transfer: {place.transfer ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {packageData.package?.termsAndConditions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {packageData.package.termsAndConditions}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPackagePopup;
