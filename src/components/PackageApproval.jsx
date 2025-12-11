import React, { useState, useEffect } from "react";

const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}

const PackageApproval = () => {
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
		const limit = 40;
		let totalPages = 1; // default

		try {
			while (page <= totalPages) {
				const response = await fetch(`${config.API_HOST}/api/packageapproval/getapproval?page=${page}&limit=${limit}`);
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
			<h1 className="text-3xl font-bold mb-6 text-gray-800">Package Approval Data</h1>

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
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-2xl font-bold text-gray-800">{selectedPackage.package?.packageName}</h2>
							<button
								onClick={() => setIsModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						
						<div className="space-y-6">
							{/* Package Details */}
							<div className="border-b pb-4">
								<h3 className="font-semibold text-lg mb-2">Package Details</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<p><span className="font-medium">Duration:</span> {selectedPackage.package?.duration}</p>
									<p><span className="font-medium">Type:</span> {selectedPackage.package?.packageType}</p>
									<p><span className="font-medium">Pickup:</span> {selectedPackage.package?.pickupLocation}</p>
									<p><span className="font-medium">Drop:</span> {selectedPackage.package?.dropLocation}</p>
									{selectedPackage.package?.packageCategory && (
										<p><span className="font-medium">Category:</span> {selectedPackage.package.packageCategory}</p>
									)}
									{selectedPackage.package?.hotelCategory && (
										<p><span className="font-medium">Hotel Category:</span> {selectedPackage.package.hotelCategory}</p>
									)}
									{selectedPackage.package?.initialAmount && (
										<p><span className="font-medium">Initial Amount:</span> ₹{selectedPackage.package.initialAmount}</p>
									)}
									{selectedPackage.package?.priceTag && (
										<p><span className="font-medium">Price Tag:</span> {selectedPackage.package.priceTag}</p>
									)}
									{selectedPackage.package?.validTill && (
										<p><span className="font-medium">Valid Till:</span> {selectedPackage.package.validTill}</p>
									)}
									{selectedPackage.package?.displayOrder && (
										<p><span className="font-medium">Display Order:</span> {selectedPackage.package.displayOrder}</p>
									)}
								</div>
							</div>

							{/* Places */}
							{selectedPackage.package?.packagePlaces && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Places Covered</h3>
									<div className="grid grid-cols-2 gap-2">
										{selectedPackage.package.packagePlaces.map((place, index) => (
											<div key={index} className="bg-gray-50 p-2 rounded">
												<p className="font-medium">{place.placeCover}</p>
												<p className="text-sm text-gray-600">{place.nights} nights</p>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Package City Areas */}
							{selectedPackage.package?.cityArea && selectedPackage.package.cityArea.length > 0 && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">City Areas by Day</h3>
									<div className="space-y-2">
										{selectedPackage.package.cityArea.map((dayArea, index) => (
											<div key={index} className="bg-gray-50 p-3 rounded">
												<p className="font-medium">Day {dayArea.day}</p>
												{dayArea.cityArea && dayArea.cityArea.length > 0 ? (
													<div className="flex flex-wrap gap-1 mt-1">
														{dayArea.cityArea.map((area, i) => (
															<span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
																{area}
															</span>
														))}
													</div>
												) : (
													<p className="text-gray-500 text-sm">No specific areas mentioned</p>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Itinerary */}
							{selectedPackage.package?.itineraryDays && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Itinerary</h3>
									{selectedPackage.package.itineraryDays.map((day, index) => (
										<div key={index} className="mb-4 bg-gray-50 p-4 rounded">
											<h4 className="font-medium text-lg">Day {day.day}</h4>
											
											{day.selectedItinerary && (
												<div className="mt-3 space-y-3">
													{day.selectedItinerary.itineraryTitle && (
														<h5 className="font-semibold text-blue-800">{day.selectedItinerary.itineraryTitle}</h5>
													)}
													
													{day.selectedItinerary.cityName && (
														<p className="text-gray-700">
															<span className="font-medium">City:</span> {day.selectedItinerary.cityName}
														</p>
													)}
													
													{day.selectedItinerary.distance && (
														<p className="text-gray-600">
															<span className="font-medium">Distance:</span> {day.selectedItinerary.distance} km
														</p>
													)}
													
													{day.selectedItinerary.totalHours && (
														<p className="text-gray-600">
															<span className="font-medium">Duration:</span> {day.selectedItinerary.totalHours} hours
														</p>
													)}
													
													{day.selectedItinerary.cityArea && day.selectedItinerary.cityArea.length > 0 && (
														<div className="mt-2">
															<p className="font-medium text-sm text-gray-600">Areas to Visit:</p>
															<div className="flex flex-wrap gap-1 mt-1">
																{day.selectedItinerary.cityArea.map((area, i) => (
																	<span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
																		{area}
																	</span>
																))}
															</div>
														</div>
													)}
													
													{day.selectedItinerary.itineraryDescription && (
														<div className="mt-3">
															<p className="font-medium text-sm text-gray-600 mb-1">Description:</p>
															<div className="text-sm text-gray-700 bg-white p-3 rounded border" 
																 dangerouslySetInnerHTML={{ __html: day.selectedItinerary.itineraryDescription }} />
														</div>
													)}
													
													{day.selectedItinerary.inclusions && day.selectedItinerary.inclusions.length > 0 && (
														<div className="mt-3">
															<p className="font-medium text-sm text-gray-600 mb-1">Inclusions:</p>
															<ul className="text-sm text-gray-700 list-disc list-inside">
																{day.selectedItinerary.inclusions.map((inclusion, i) => (
																	<li key={i}>{inclusion}</li>
																))}
															</ul>
														</div>
													)}
													
													{day.selectedItinerary.exclusions && day.selectedItinerary.exclusions.length > 0 && (
														<div className="mt-3">
															<p className="font-medium text-sm text-gray-600 mb-1">Exclusions:</p>
															<ul className="text-sm text-gray-700 list-disc list-inside">
																{day.selectedItinerary.exclusions.map((exclusion, i) => (
																	<li key={i}>{exclusion}</li>
																))}
															</ul>
														</div>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							)}

							{/* Pricing */}
							{selectedPackage.finalCosting && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Price Details</h3>
									<p><span className="font-medium">Base Total:</span> ₹{selectedPackage.finalCosting.baseTotal}</p>
									<p><span className="font-medium">B2B Price:</span> ₹{selectedPackage.finalCosting.finalPrices?.b2b}</p>
									<p><span className="font-medium">Website Price:</span> ₹{selectedPackage.finalCosting.finalPrices?.website}</p>
								</div>
							)}

							{/* Package Inclusions */}
							{selectedPackage.package?.packageInclusions && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Package Inclusions</h3>
									<div className="bg-green-50 p-4 rounded" dangerouslySetInnerHTML={{ __html: selectedPackage.package.packageInclusions }} />
								</div>
							)}

							{/* Package Exclusions */}
							{selectedPackage.package?.packageExclusions && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Package Exclusions</h3>
									<div className="bg-red-50 p-4 rounded" dangerouslySetInnerHTML={{ __html: selectedPackage.package.packageExclusions }} />
								</div>
							)}

							{/* Custom Exclusions */}
							{selectedPackage.package?.customExclusions && selectedPackage.package.customExclusions.length > 0 && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Custom Exclusions</h3>
									<div className="space-y-3">
										{selectedPackage.package.customExclusions.map((exclusion, index) => (
											<div key={index} className="bg-yellow-50 p-3 rounded">
												<h4 className="font-medium text-yellow-800">{exclusion.name}</h4>
												<div className="text-sm text-yellow-700 mt-1" dangerouslySetInnerHTML={{ __html: exclusion.description }} />
											</div>
										))}
									</div>
								</div>
							)}

							{/* Amenities */}
							{selectedPackage.package?.amenities && selectedPackage.package.amenities.length > 0 && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Amenities</h3>
									<div className="flex flex-wrap gap-2">
										{selectedPackage.package.amenities.map((amenity, index) => (
											<span key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
												{amenity}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Tags and Themes */}
							{(selectedPackage.package?.tags?.length > 0 || selectedPackage.package?.themes?.length > 0) && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Tags & Themes</h3>
									<div className="space-y-2">
										{selectedPackage.package?.tags?.length > 0 && (
											<div>
												<p className="font-medium text-sm text-gray-600">Tags:</p>
												<div className="flex flex-wrap gap-1 mt-1">
													{selectedPackage.package.tags.map((tag, index) => (
														<span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
															{tag}
														</span>
													))}
												</div>
											</div>
										)}
										{selectedPackage.package?.themes?.length > 0 && (
											<div>
												<p className="font-medium text-sm text-gray-600">Themes:</p>
												<div className="flex flex-wrap gap-1 mt-1">
													{selectedPackage.package.themes.map((theme, index) => (
														<span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
															{theme}
														</span>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Additional Package Info */}
							<div className="border-b pb-4">
								<h3 className="font-semibold text-lg mb-2">Additional Information</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{selectedPackage.package?.state && (
										<p><span className="font-medium">State:</span> {selectedPackage.package.state}</p>
									)}
									{selectedPackage.package?.status && (
										<p><span className="font-medium">Status:</span> 
											<span className={`ml-2 px-2 py-1 rounded text-xs ${
												selectedPackage.package.status === 'enabled' 
													? 'bg-green-100 text-green-800' 
													: 'bg-red-100 text-red-800'
											}`}>
												{selectedPackage.package.status}
											</span>
										</p>
									)}
									{selectedPackage.package?.customizablePackage !== undefined && (
										<p><span className="font-medium">Customizable:</span> 
											<span className={`ml-2 px-2 py-1 rounded text-xs ${
												selectedPackage.package.customizablePackage 
													? 'bg-green-100 text-green-800' 
													: 'bg-gray-100 text-gray-800'
											}`}>
												{selectedPackage.package.customizablePackage ? 'Yes' : 'No'}
											</span>
										</p>
									)}
									{selectedPackage.package?.pickupTransfer !== undefined && (
										<p><span className="font-medium">Pickup Transfer:</span> 
											<span className={`ml-2 px-2 py-1 rounded text-xs ${
												selectedPackage.package.pickupTransfer 
													? 'bg-green-100 text-green-800' 
													: 'bg-gray-100 text-gray-800'
											}`}>
												{selectedPackage.package.pickupTransfer ? 'Yes' : 'No'}
											</span>
										</p>
									)}
								</div>
							</div>

							{/* Package Images */}
							{selectedPackage.package?.packageImages && selectedPackage.package.packageImages.length > 0 && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Package Images</h3>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
										{selectedPackage.package.packageImages.map((image, index) => (
											<div key={index} className="relative">
												<img 
													src={image} 
													alt={`Package image ${index + 1}`}
													className="w-full h-32 object-cover rounded-lg border"
													onError={(e) => {
														e.target.style.display = 'none';
														e.target.nextSibling.style.display = 'flex';
													}}
												/>
												<div className="hidden w-full h-32 bg-gray-200 rounded-lg border items-center justify-center">
													<span className="text-gray-500 text-sm">Image not available</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Description */}
							{selectedPackage.package?.packageDescription && (
								<div className="border-b pb-4">
									<h3 className="font-semibold text-lg mb-2">Description</h3>
									<div className="bg-gray-50 p-4 rounded" dangerouslySetInnerHTML={{ __html: selectedPackage.package.packageDescription }} />
								</div>
							)}

							{/* Approval Buttons */}
							<div className="flex justify-end space-x-4 pt-4">
								<button
									onClick={() => handleDelete(selectedPackage._id)}
									disabled={isLoading}
									className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
								>
									{isLoading ? 'Processing...' : 'Reject'}
								</button>
								<button
									onClick={() => handleApprove(selectedPackage)}
									disabled={isLoading}
									className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
								>
									{isLoading ? 'Processing...' : 'Approve'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default PackageApproval;