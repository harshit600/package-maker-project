import React, { useState } from "react";
import { toast } from "react-toastify";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

const Leads = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    adults: "",
    kids: "",
    persons: "",
    packageCategory: "",
    packageType: "",
    from: "",
    destination: "",
    days: "",
    nights: "",
    noOfRooms: "",
    extraBeds: "",
    mealPlans: "",
    EP: "",
    travelDate: "",
    source: "",
    publish: "Yes",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

      // Validate required fields
      const requiredFields = ["name", "email", "mobile"];
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(
            `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
          );
        }
      }

      const response = await fetch(`${config.API_HOST}/api/leads/create-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localUser.token}`,
        },
        body: JSON.stringify({
          ...formData,
          userId: localUser._id, // Add userId to the request
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create lead");
      }

      toast.success("Lead created successfully!");
      setFormData({
        name: "",
        email: "",
        mobile: "",
        adults: "",
        kids: "",
        persons: "",
        packageCategory: "",
        packageType: "",
        from: "",
        destination: "",
        days: "",
        nights: "",
        noOfRooms: "",
        extraBeds: "",
        mealPlans: "",
        EP: "",
        travelDate: "",
        source: "",
        publish: "Yes",
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Premium Header with increased padding */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-10 py-8">
            <h2 className="text-4xl font-bold text-white">Add New Lead</h2>
            <p className="mt-3 text-lg text-blue-100">Enter the lead details below</p>
          </div>

          <form onSubmit={handleSubmit} className="px-10 py-12 space-y-12">
            {/* Basic Information Section */}
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-5">
                <h3 className="text-2xl font-semibold text-gray-800">Basic Information</h3>
                <p className="mt-2 text-sm text-gray-500">Please fill in the basic details of the lead</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Travel Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Adults
                    </label>
                    <input
                      type="number"
                      name="adults"
                      value={formData.adults}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kids
                    </label>
                    <input
                      type="number"
                      name="kids"
                      value={formData.kids}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Persons
                    </label>
                    <select
                      name="persons"
                      value={formData.persons}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                    >
                      <option value="">Select Persons</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details Section */}
            <div className="space-y-8 pt-6">
              <div className="border-b border-gray-200 pb-5">
                <h3 className="text-2xl font-semibold text-gray-800">Package Details</h3>
                <p className="mt-2 text-sm text-gray-500">Select the package preferences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Package Category
                  </label>
                  <select
                    name="packageCategory"
                    value={formData.packageCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  >
                    <option value="">Select Package Category</option>
                    <option value="luxury">Luxury</option>
                    <option value="standard">Standard</option>
                    <option value="budget">Budget</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Package Type
                  </label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  >
                    <option value="">Select Package Type</option>
                    <option value="honeymoon">Honeymoon</option>
                    <option value="family">Family</option>
                    <option value="adventure">Adventure</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Details Section */}
            <div className="space-y-8 pt-6">
              <div className="border-b border-gray-200 pb-5">
                <h3 className="text-2xl font-semibold text-gray-800">Location Details</h3>
                <p className="mt-2 text-sm text-gray-500">Specify the travel locations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    From
                  </label>
                  <select
                    name="from"
                    value={formData.from}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  >
                    <option value="">Select Location</option>
                    {/* Add your locations */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Destination
                  </label>
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  >
                    <option value="">Select Destination</option>
                    {/* Add your destinations */}
                  </select>
                </div>
              </div>
            </div>

            {/* Trip Details Section */}
            <div className="space-y-8 pt-6">
              <div className="border-b border-gray-200 pb-5">
                <h3 className="text-2xl font-semibold text-gray-800">Trip Details</h3>
                <p className="mt-2 text-sm text-gray-500">Enter the trip specifications</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Days
                  </label>
                  <input
                    type="number"
                    name="days"
                    value={formData.days}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nights
                  </label>
                  <input
                    type="number"
                    name="nights"
                    value={formData.nights}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    No Of Rooms
                  </label>
                  <input
                    type="number"
                    name="noOfRooms"
                    value={formData.noOfRooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="space-y-8 pt-6">
              <div className="border-b border-gray-200 pb-5">
                <h3 className="text-2xl font-semibold text-gray-800">Additional Details</h3>
                <p className="mt-2 text-sm text-gray-500">Specify any additional requirements</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Extra Beds
                  </label>
                  <input
                    type="number"
                    name="extraBeds"
                    value={formData.extraBeds}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Meal Plans
                  </label>
                  <input
                    type="text"
                    name="mealPlans"
                    value={formData.mealPlans}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    EP
                  </label>
                  <select
                    name="EP"
                    value={formData.EP}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                  >
                    <option value="">Select EP</option>
                    <option value="EP1">EP1</option>
                    <option value="EP2">EP2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Final Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Travel Date
                </label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                >
                  <option value="">Select Source</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Publish
                </label>
                <select
                  name="publish"
                  value={formData.publish}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-200"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {/* Submit Buttons with better spacing */}
            <div className="pt-10 flex flex-col sm:flex-row gap-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 sm:flex-none sm:min-w-[200px] px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-semibold rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                Submit Lead
              </button>
              <button
                type="button"
                onClick={() => setFormData({})}
                className="flex-1 sm:flex-none sm:min-w-[200px] px-8 py-4 bg-gray-50 text-gray-700 text-base font-semibold rounded-xl border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Leads;
