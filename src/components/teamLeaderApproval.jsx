import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}

const TeamLeaderApproval = () => {
  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser.data)
	const [approvalData, setApprovalData] = useState([]);
	const [selectedPackage, setSelectedPackage] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		fetchApprovalData();
	}, []);

	const fetchApprovalData = async () => {
		setIsLoading(true);
		let allData = [];
		let page = 1;
		const limit = 10;
		let totalPages = 1; // default

		try {
			while (page <= totalPages) {
				const response = await fetch(`${config.API_HOST}/api/packageapproval/getpackagesbyteamleader/${currentUser.data._id                }?page=${page}&limit=${limit}`);
				const data = await response.json();
				console.log('Approval Data:', data);
				const pageData = Array.isArray(data.data) ? data.data : [];
				allData = allData.concat(pageData);

				// Update totalPages from API response
				totalPages = data.totalPages || 1;
				page += 1;
			}
			setApprovalData(allData);
		} catch (error) {
			console.error('Error fetching approval data:', error);
			setApprovalData([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleViewDetails = (pkg) => {
		setSelectedPackage(pkg);
		setIsModalOpen(true);
	};

	const handleApprove = async (pkg) => {
		setIsLoading(true);
		try {
			// First, try to create the package
			const response = await fetch(`${config.API_HOST}/api/add/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(pkg), // Send only the package data, not the entire approval object
			});

			if (!response.ok) {
				throw new Error('Failed to approve package');
			}

			// If creation was successful, then delete from approval list
			const deleteResponse = await fetch(`${config.API_HOST}/api/packageapproval/deleteapproval/${pkg._id}`, {
				method: 'DELETE',
			});

			if (!deleteResponse.ok) {
				throw new Error('Package created but failed to remove from approval list');
			}

			alert('Package approved successfully!');
			setIsModalOpen(false);
			fetchApprovalData(); // Refresh the list
		} catch (error) {
			console.error('Error approving package:', error);
			alert('Failed to approve package. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id) => {
		setIsLoading(true);
		try {
			const response = await fetch(`${config.API_HOST}/api/packageapproval/deleteapproval/${id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to reject package');
			}

			alert('Package rejected successfully!');
			setIsModalOpen(false);
			fetchApprovalData(); // Refresh the list
		} catch (error) {
			console.error('Error rejecting package:', error);
			alert('Failed to reject package. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-800">Package Approval Data</h1>
				<button
					onClick={fetchApprovalData}
					disabled={isLoading}
					className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
				>
					<svg 
						className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth="2" 
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
					{isLoading ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>

			{isLoading && (
			  <div className="flex justify-center items-center py-8">
			    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
			      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
			    </svg>
			    <span className="ml-3 text-blue-600 font-medium">Loading...</span>
			  </div>
			)}

			{!isLoading && (
			  <div className="grid grid-cols-3 gap-6">
			    {Array.isArray(approvalData) && approvalData
			      .map((item) => (
			        <div key={item._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-blue-500">
			          <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.package?.packageName}</h2>
			          <p className="text-gray-600 mb-4">{item.package?.duration}</p>
			          <button
			            onClick={() => handleViewDetails(item)}
			            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
			          >
			            View Details
			          </button>
			        </div>
			      ))}
			  </div>
			)}

			{/* Modal */}
			{isModalOpen && selectedPackage && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto p-6">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-3xl font-bold text-gray-800">{selectedPackage.package?.packageName}</h2>
							<button
								onClick={() => setIsModalOpen(false)}
								className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						
						<div className="space-y-8">
							{/* Package Status & Basic Info */}
							<div className=" p-6 rounded-lg border-l-4 border-blue-500">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<p className="text-sm text-gray-600">Package Status</p>
										<p className="font-semibold text-lg capitalize">{selectedPackage.packageStatus}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Team Leader</p>
										<p className="font-semibold text-lg">{selectedPackage.package?.teamLeader}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Created By</p>
										<p className="font-semibold text-lg">{selectedPackage.currentUser?.firstName} {selectedPackage.currentUser?.lastName}</p>
									</div>
								</div>
							</div>

							{/* Package Details */}
							<div className="bg-white border border-gray-200 rounded-lg p-6">
								<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Package Details</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<div className="bg-gray-50 p-3 rounded">
										<p className="text-sm text-gray-600">Duration</p>
										<p className="font-medium">{selectedPackage.package?.duration}</p>
									</div>
									<div className="bg-gray-50 p-3 rounded">
										<p className="text-sm text-gray-600">Package Type</p>
										<p className="font-medium">{selectedPackage.package?.packageType}</p>
									</div>
									<div className="bg-gray-50 p-3 rounded">
										<p className="text-sm text-gray-600">Pickup Location</p>
										<p className="font-medium capitalize">{selectedPackage.package?.pickupLocation}</p>
									</div>
									<div className="bg-gray-50 p-3 rounded">
										<p className="text-sm text-gray-600">Drop Location</p>
										<p className="font-medium capitalize">{selectedPackage.package?.dropLocation}</p>
									</div>
									<div className="bg-gray-50 p-3 rounded">
										<p className="text-sm text-gray-600">Customizable Package</p>
										<p className="font-medium">{selectedPackage.package?.customizablePackage ? 'Yes' : 'No'}</p>
									</div>
									<div className="bg-gray-50 p-3 rounded">
										<p className="text-sm text-gray-600">Pickup Transfer</p>
										<p className="font-medium">{selectedPackage.package?.pickupTransfer ? 'Yes' : 'No'}</p>
									</div>
								</div>
							</div>

							{/* Places Covered */}
							{selectedPackage.package?.packagePlaces && selectedPackage.package.packagePlaces.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Places Covered</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{selectedPackage.package.packagePlaces.map((place, index) => (
											<div key={index} className=" p-4 rounded-lg border border-green-200">
												<p className="font-semibold text-lg text-green-800">{place.placeCover}</p>
												<p className="text-green-600">{place.nights} nights</p>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Hotels Information */}
							{selectedPackage.hotels && Object.keys(selectedPackage.hotels).length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Hotel Information</h3>
									<div className="space-y-4">
										{Object.entries(selectedPackage.hotels).map(([key, hotel]) => (
											<div key={key} className=" p-4 rounded-lg border border-purple-200">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<h4 className="font-semibold text-lg text-purple-800 mb-2">Hotel Details</h4>
														<p className="font-medium">{hotel.hotelInfo?.name}</p>
														<p className="text-sm text-gray-600">ID: {hotel.hotelInfo?.id}</p>
													</div>
													
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Cab Information */}
							{selectedPackage.cabs && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Transportation Details</h3>
									
								
									
									{/* Travel Prices */}
									{selectedPackage.cabs.travelPrices && (
										<div className="mb-6">
											<h4 className="font-semibold text-lg mb-3 text-blue-800">Travel Prices</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="bg-blue-50 p-3 rounded border border-blue-200">
													<p className="text-sm text-blue-600">Lowest On Season Price</p>
													<p className="font-semibold text-lg">₹{selectedPackage.cabs.travelPrices.prices?.lowestOnSeasonPrice}</p>
												</div>
												<div className="bg-blue-50 p-3 rounded border border-blue-200">
													<p className="text-sm text-blue-600">Lowest Off Season Price</p>
													<p className="font-semibold text-lg">₹{selectedPackage.cabs.travelPrices.prices?.lowestOffSeasonPrice}</p>
												</div>
											</div>
										</div>
									)}

									{/* Selected Cabs */}
									{selectedPackage.cabs.travelPrices?.selectedCabs && Object.keys(selectedPackage.cabs.travelPrices.selectedCabs).length > 0 && (
										<div className="mb-6">
											<h4 className="font-semibold text-lg mb-3 text-blue-800">Selected Vehicles</h4>
											<div className="space-y-3">
												{Object.entries(selectedPackage.cabs.travelPrices.selectedCabs).map(([vehicleType, vehicles]) => (
													<div key={vehicleType} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
														<h5 className="font-semibold text-blue-800 mb-2">{vehicleType}</h5>
														{Array.isArray(vehicles) && vehicles.map((vehicle, index) => (
															<div key={index} className="bg-white p-3 rounded border border-blue-100 mb-2">
																<p className="font-medium">{vehicle.cabName}</p>
																<p className="text-sm text-gray-600">Type: {vehicle.cabType}</p>
																<p className="text-sm text-gray-600">Capacity: {vehicle.seatingCapacity}</p>
																<p className="text-sm text-gray-600">Luggage: {vehicle.luggage}</p>
																{vehicle.prices && (
																	<div className="mt-2">
																		<p className="text-sm text-gray-600">On Season: ₹{vehicle.prices.onSeasonPrice}</p>
																		<p className="text-sm text-gray-600">Off Season: ₹{vehicle.prices.offSeasonPrice}</p>
																	</div>
																)}
															</div>
														))}
													</div>
												))}
											</div>
										</div>
									)}

									{/* Travel Info */}
									{selectedPackage.cabs.travelInfo && selectedPackage.cabs.travelInfo.length > 0 && (
										<div>
											<h4 className="font-semibold text-lg mb-3 text-blue-800">Travel Routes</h4>
											<div className="space-y-2">
												{selectedPackage.cabs.travelInfo.map((route, index) => (
													<div key={index} className="bg-blue-50 p-3 rounded border border-blue-200">
														<p className="font-medium">Route {index + 1}: {route.from} → {route.to}</p>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}

							{/* Detailed Itinerary */}
							{selectedPackage.package?.itineraryDays && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Detailed Itinerary</h3>
									<div className="space-y-6">
										{selectedPackage.package.itineraryDays.map((day, index) => (
											<div key={index} className=" p-6 rounded-lg border border-orange-200">
												<div className="flex items-center mb-4">
													<div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
														{day.day}
													</div>
													<h4 className="text-xl font-semibold text-orange-800">{day.selectedItinerary?.itineraryTitle}</h4>
												</div>
												
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<p className="font-medium text-gray-800 mb-2">City: {day.selectedItinerary?.cityName}</p>
														{day.selectedItinerary?.distance && (
															<p className="text-sm text-gray-600">Distance: {day.selectedItinerary.distance}</p>
														)}
														{day.selectedItinerary?.totalHours && (
															<p className="text-sm text-gray-600">Duration: {day.selectedItinerary.totalHours}</p>
														)}
													</div>
													<div>
														{day.selectedItinerary?.cityArea && day.selectedItinerary.cityArea.length > 0 && (
															<div>
																<p className="font-medium text-gray-800 mb-2">Areas Covered:</p>
																<div className="flex flex-wrap gap-1">
																	{day.selectedItinerary.cityArea.map((area, i) => (
																		<span key={i} className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded">
																			{typeof area === 'object' ? area.name : area}
																		</span>
																	))}
																</div>
															</div>
														)}
													</div>
												</div>

												{day.selectedItinerary?.itineraryDescription && (
													<div className="mt-4">
														<p className="font-medium text-gray-800 mb-2">Description:</p>
														<p className="text-gray-700 whitespace-pre-line">{day.selectedItinerary.itineraryDescription}</p>
													</div>
												)}

												{day.selectedItinerary?.inclusions && day.selectedItinerary.inclusions.length > 0 && (
													<div className="mt-4">
														<p className="font-medium text-gray-800 mb-2">Inclusions:</p>
														<ul className="list-disc list-inside text-gray-700">
															{day.selectedItinerary.inclusions.map((inclusion, i) => (
																<li key={i}>{typeof inclusion === 'object' ? inclusion.name || inclusion.description : inclusion}</li>
															))}
														</ul>
													</div>
												)}

												{day.selectedItinerary?.exclusions && day.selectedItinerary.exclusions.length > 0 && (
													<div className="mt-4">
														<p className="font-medium text-gray-800 mb-2">Exclusions:</p>
														<ul className="list-disc list-inside text-gray-700">
															{day.selectedItinerary.exclusions.map((exclusion, i) => (
																<li key={i}>{typeof exclusion === 'object' ? exclusion.name || exclusion.description : exclusion}</li>
															))}
														</ul>
													</div>
												)}

												{day.selectedItinerary?.activities && day.selectedItinerary.activities.length > 0 && (
													<div className="mt-4">
														<p className="font-medium text-gray-800 mb-2">Activities:</p>
														<div className="flex flex-wrap gap-2">
															{day.selectedItinerary.activities.map((activity, i) => (
																<span key={i} className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
																	{typeof activity === 'object' ? activity.name || activity.description : activity}
																</span>
															))}
														</div>
													</div>
												)}

												{day.selectedItinerary?.sightseeing && day.selectedItinerary.sightseeing.length > 0 && (
													<div className="mt-4">
														<p className="font-medium text-gray-800 mb-2">Sightseeing:</p>
														<div className="flex flex-wrap gap-2">
															{day.selectedItinerary.sightseeing.map((sight, i) => (
																<span key={i} className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded">
																	{typeof sight === 'object' ? sight.name || sight.description : sight}
																</span>
															))}
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Activities */}
							{selectedPackage.activities && selectedPackage.activities.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Activities</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{selectedPackage.activities.map((activity, index) => (
											<div key={index} className="bg-green-50 p-3 rounded border border-green-200">
												<p className="font-medium text-green-800">{typeof activity === 'object' ? activity.name || activity.description : activity}</p>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Sightseeing */}
							{selectedPackage.sightseeing && selectedPackage.sightseeing.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Sightseeing</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{selectedPackage.sightseeing.map((sight, index) => (
											<div key={index} className="bg-purple-50 p-3 rounded border border-purple-200">
												<p className="font-medium text-purple-800">{typeof sight === 'object' ? sight.name || sight.description : sight}</p>
											</div>
										))}
									</div>
								</div>
							)}

						
							{/* Package Description */}
							{selectedPackage.package?.packageDescription && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Package Description</h3>
									<div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedPackage.package.packageDescription }} />
								</div>
							)}

							{/* Package Inclusions */}
							{selectedPackage.package?.packageInclusions && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Package Inclusions</h3>
									<div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedPackage.package.packageInclusions }} />
								</div>
							)}

							{/* Package Exclusions */}
							{selectedPackage.package?.packageExclusions && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Package Exclusions</h3>
									<div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedPackage.package.packageExclusions }} />
								</div>
							)}

							{/* Custom Exclusions */}
							{selectedPackage.package?.customExclusions && selectedPackage.package.customExclusions.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Custom Exclusions</h3>
									<div className="space-y-2">
										{selectedPackage.package.customExclusions.map((exclusion, index) => (
											<div key={index} className="bg-red-50 p-3 rounded border border-red-200">
												<p className="text-red-800">{typeof exclusion === 'object' ? exclusion.name || exclusion.description : exclusion}</p>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Amenities */}
							{selectedPackage.package?.amenities && selectedPackage.package.amenities.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Amenities</h3>
									<div className="flex flex-wrap gap-2">
										{selectedPackage.package.amenities.map((amenity, index) => (
											<span key={index} className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
												{typeof amenity === 'object' ? amenity.name || amenity.description : amenity}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Tags */}
							{selectedPackage.package?.tags && selectedPackage.package.tags.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Tags</h3>
									<div className="flex flex-wrap gap-2">
										{selectedPackage.package.tags.map((tag, index) => (
											<span key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
												{typeof tag === 'object' ? tag.name || tag.description : tag}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Themes */}
							{selectedPackage.package?.themes && selectedPackage.package.themes.length > 0 && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Themes</h3>
									<div className="flex flex-wrap gap-2">
										{selectedPackage.package.themes.map((theme, index) => (
											<span key={index} className="bg-pink-100 text-pink-800 text-sm px-3 py-1 rounded-full">
												{typeof theme === 'object' ? theme.name || theme.description : theme}
											</span>
										))}
									</div>
								</div>
							)}

							

							{/* Approval Buttons */}
							<div className="flex justify-end space-x-4 pt-6 border-t">
								<button
									onClick={() => handleDelete(selectedPackage._id)}
									disabled={isLoading}
									className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 font-semibold"
								>
									{isLoading ? 'Processing...' : 'Reject Package'}
								</button>
								<button
									onClick={() => handleApprove(selectedPackage)}
									disabled={isLoading}
									className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 font-semibold"
								>
									{isLoading ? 'Processing...' : 'Approve Package'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default TeamLeaderApproval;