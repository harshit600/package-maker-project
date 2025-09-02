import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { demoLeads } from "../scripts/createDemoLeads";
import "./AllLeads.css";
import axios from "axios";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

const AllLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("leadDetails");
  const [searchMobile, setSearchMobile] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [sharingMethod, setSharingMethod] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [isPackageInfoOpen, setIsPackageInfoOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageInfoTab, setPackageInfoTab] = useState("package");
  const [selectedCabs, setSelectedCabs] = useState({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      // Extract token from the nested data structure
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(`${config.API_HOST}/api/leads/get-leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLeads = () => {
    return leads.filter((lead) => {
      const mobileMatch = lead.mobile
        ?.toLowerCase()
        .includes(searchMobile.toLowerCase());
      const nameMatch = lead.name
        ?.toLowerCase()
        .includes(searchName.toLowerCase());
      const categoryMatch =
        !searchCategory ||
        lead.packageCategory?.toLowerCase() === searchCategory.toLowerCase();
      return mobileMatch && nameMatch && categoryMatch;
    });
  };

  // Update pagination logic to use filtered leads
  const filteredLeads = getFilteredLeads();
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  // Get unique categories from leads instead of packages
  const uniqueCategories = [
    ...new Set(leads.map((lead) => lead.packageCategory)),
  ].filter(Boolean);

  const getStatusColor = (status) => {
    switch (status) {
      case "Yes":
        return "bg-green-100 text-green-800";
      case "No":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Modify fetchPackages to accept lead as parameter
  const fetchPackages = async (lead) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      // Get destination from passed lead parameter
      const destination = lead?.destination;
      console.log("Current destination in fetchPackages:", destination); // Debug log

      if (!destination) {
        console.warn("No destination available in lead:", lead); // Warning log
        return [];
      }

      const response = await fetch(`${config.API_HOST}/api/add/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();
      console.log("All packages received:", data); // Debug log

      // Filter packages where lead destination matches package name
      const filteredPackages = data.filter((pkg) => {
        const searchTerm = destination.toLowerCase().trim();
        const packageName = (pkg.package?.packageName || "")
          .toLowerCase()
          .trim();

        console.log(`Comparing:
          Search term: "${searchTerm}"
          Package name: "${packageName}"
          Match: ${packageName.includes(searchTerm)}`);

        return packageName.includes(searchTerm);
      });

      console.log("Filtered packages:", filteredPackages); // Debug log
      return filteredPackages;
    } catch (error) {
      console.error("Error in fetchPackages:", error);
      toast.error(`Failed to load packages: ${error.message}`);
      return [];
    }
  };

  // Modify handleEditClick to pass the lead directly
  const handleEditClick = async (lead) => {
    console.log("Selected lead:", lead); // Debug log

    if (!lead) {
      console.warn("No lead provided to handleEditClick");
      return;
    }

    // Set the lead first
    setSelectedLead(lead);
    setIsEditPanelOpen(true);

    if (lead?.destination) {
      console.log("Fetching packages for destination:", lead.destination); // Debug log
      const packages = await fetchPackages(lead); // Pass lead directly
      console.log(
        `Found ${packages.length} matching packages for ${lead.destination}`
      );
      setAvailablePackages(packages);
    } else {
      console.warn("No destination found in lead:", lead); // Warning log
      setAvailablePackages([]); // Clear any existing packages
      toast.warning("No destination specified for this lead");
    }
  };

  const handleClosePanel = () => {
    setIsEditPanelOpen(false);
    setSelectedLead(null);
  };

  // Add this function to handle sharing
  const handleShare = async (method) => {
    if (!selectedLead?.assignedPackage) {
      toast.error("No package assigned to share");
      return;
    }

    try {
      setIsSharing(true);
      setSharingMethod(method);

      switch (method) {
        case "whatsapp":
          // Format the message for WhatsApp
          const whatsappMessage = encodeURIComponent(
            `*Package Details*\n` +
              `Package: ${selectedLead.assignedPackage.packageName}\n` +
              `Duration: ${selectedLead.assignedPackage.duration} Days\n` +
              `Price: ₹${selectedLead.assignedPackage.price}`
          );

          // Log sharing attempt
          await fetch(`${config.API_HOST}/api/leads/log-share`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              leadId: selectedLead._id,
              packageId: selectedLead.assignedPackage._id,
              shareMethod: "whatsapp",
            }),
          });

          // Open WhatsApp in new window
          window.open(
            `https://wa.me/${selectedLead.mobile}?text=${whatsappMessage}`
          );
          toast.success("WhatsApp opened with package details");
          break;

        case "email":
          const emailResponse = await fetch(
            `${config.API_HOST}/api/leads/send-package-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                leadId: selectedLead._id,
                packageId: selectedLead.assignedPackage._id,
              }),
            }
          );

          if (!emailResponse.ok) throw new Error("Failed to send email");
          toast.success("Package details sent via email");
          break;

        case "sms":
          const smsResponse = await fetch(
            `${config.API_HOST}/api/leads/send-package-sms`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                leadId: selectedLead._id,
                packageId: selectedLead.assignedPackage._id,
              }),
            }
          );

          if (!smsResponse.ok) throw new Error("Failed to send SMS");
          toast.success("Package details sent via SMS");
          break;

        default:
          throw new Error("Invalid sharing method");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSharing(false);
      setSharingMethod(null);
    }
  };

  // Add this function to handle package editing
  const handleEditPackage = async (packageId) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

      console.log("Attempting to edit package:", packageId);
      console.log("Using token:", localUser.token);

      const response = await fetch(
        `${config.API_HOST}/api/packages/getpackage/${packageId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localUser.token}`,
          },
        }
      );

      if (!response.ok) {
        const rawResponse = await response.text();
        throw new Error(
          `Failed to fetch package details: ${response.status} - ${rawResponse}`
        );
      }

      const packageData = await response.json();
      console.log("Package data received:", packageData);

      setEditingPackageData(packageData);
      setIsEditingPackage(true);
    } catch (error) {
      console.error("Error editing package:", error);
      toast.error(`Error editing package: ${error.message}`);
    }
  };

  // Add new function to handle view click
  const handleViewClick = (lead) => {
    setViewLead(lead);
    setIsViewModalOpen(true);
  };

  // Add function to handle lead deletion
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${config.API_HOST}/api/leads/delete-lead/${leadId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete lead");

      toast.success("Lead deleted successfully");
      fetchLeads(); // Refresh the leads list
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add function to handle lead update
  const handleUpdateLead = async (leadId, updatedData) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${config.API_HOST}/api/leads/update-lead/${leadId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Failed to update lead");

      toast.success("Lead updated successfully");
      fetchLeads(); // Refresh the leads list
      return true;
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to save changes. Please try again.");
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">All Leads</h2>
        <div className="flex items-center space-x-2">
          <input
            type="search"
            placeholder="Search by name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="search"
            placeholder="Search by mobile number"
            value={searchMobile}
            onChange={(e) => setSearchMobile(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchMobile("");
              setSearchName("");
              setSearchCategory("");
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentLeads.map((lead, index) => (
              <tr
                key={lead._id || `demo-${index}`}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-[rgb(59,130,246,0.2)]"
                }`}
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {lead.packageType}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-[rgb(45,45,68)]">
                    {lead.email}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {lead.mobile}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      lead.publish
                    )}`}
                  >
                    {lead.publish}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(lead)}
                      className="text-gray-600 hover:text-blue-600"
                      title="View Details"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditClick(lead)}
                      className="text-gray-600 hover:text-blue-600"
                      title="Edit"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead._id)}
                      className="text-gray-600 hover:text-red-600"
                      title="Delete"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-2 bg-white border-t border-gray-200 sm:px-4">
        <div className="flex justify-center flex-1 sm:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="relative ml-2 inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstLead + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastLead, filteredLeads.length)}
              </span>{" "}
              of <span className="font-medium">{filteredLeads.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`relative inline-flex items-center px-3 py-1 border text-sm font-medium ${
                      currentPage === number
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Edit Panel Slide-over */}
      {isEditPanelOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-in-out z-40 ${
              isEditPanelOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClosePanel}
          />

          {/* Side Panel - Updated width from w-1/2 to w-[70%] */}
          <div
            className={`fixed inset-y-0 right-0 w-[70%] bg-[rgb(45,45,68)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
              isEditPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 bg-[rgb(45,45,68)] text-white flex justify-between items-center">
                <h2 className="text-xl font-semibold">Lead Information</h2>
                <button
                  onClick={handleClosePanel}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex px-3" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("leadDetails")}
                    className={`${
                      activeTab === "leadDetails"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Lead Details</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("createPackage")}
                    className={`${
                      activeTab === "createPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit Lead</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("viewPackage")}
                    className={`${
                      activeTab === "viewPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>View Package</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("sendPackage")}
                    className={`${
                      activeTab === "sendPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>Send Package</span>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "leadDetails" && (
                  <div className="p-3 bg-white">
                    <div className="space-y-3">
                      {/* Lead Header Section */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {selectedLead?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {selectedLead?.name}
                            </h2>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <span>{selectedLead?.email}</span>
                              <span>•</span>
                              <span>{selectedLead?.mobile}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lead Information Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Lead owner
                          </div>
                          <div className="font-medium text-gray-900">
                            Sales Team
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Package Category
                          </div>
                          <div className="font-medium text-gray-900">
                            {selectedLead?.packageCategory || "N/A"}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Annual Revenue
                          </div>
                          <div className="font-medium text-gray-900">
                            ₹{selectedLead?.budget || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Status Tabs */}
                      <div className="flex space-x-2 mb-4">
                        <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          New
                        </div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Open
                        </div>
                        <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          In Progress
                        </div>
                      </div>

                      {/* Lead Details Section */}
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Travel Details
                            </h3>
                          </div>
                          <div className="p-3 grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                From
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.from || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Destination
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.destination || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Travel Date
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.travelDate
                                  ? new Date(
                                      selectedLead.travelDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Duration
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.days
                                  ? `${selectedLead.days} Days, ${selectedLead.nights} Nights`
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Guest Information Card */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Guest Information
                            </h3>
                          </div>
                          <div className="p-3 grid grid-cols-3 gap-3">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Adults
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.adults || "0"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Kids
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.kids || "0"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Total Guests
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.persons || "0"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Recent Activity
                            </h3>
                          </div>
                          <div className="p-3">
                            <div className="space-y-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Lead created
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Today at {new Date().toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "createPackage" && selectedLead && (
                  <div className="p-6 bg-white">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateLead(selectedLead._id, selectedLead);
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                value={selectedLead.name}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    name: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                value={selectedLead.email}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    email: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Mobile
                              </label>
                              <input
                                type="text"
                                value={selectedLead.mobile}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    mobile: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Travel Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Travel Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                From
                              </label>
                              <input
                                type="text"
                                value={selectedLead.from}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    from: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Destination
                              </label>
                              <input
                                type="text"
                                value={selectedLead.destination}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    destination: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Travel Date
                              </label>
                              <input
                                type="date"
                                value={
                                  selectedLead.travelDate
                                    ? new Date(selectedLead.travelDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    travelDate: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Duration & Guests */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Duration & Guests
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Days
                              </label>
                              <input
                                type="number"
                                value={selectedLead.days}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    days: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Nights
                              </label>
                              <input
                                type="number"
                                value={selectedLead.nights}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    nights: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Adults
                              </label>
                              <input
                                type="number"
                                value={selectedLead.adults}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    adults: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Kids
                              </label>
                              <input
                                type="number"
                                value={selectedLead.kids}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    kids: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Package Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Package Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Package Type
                              </label>
                              <select
                                value={selectedLead.packageType}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    packageType: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Type</option>
                                <option value="family">Family</option>
                                <option value="honeymoon">Honeymoon</option>
                                <option value="adventure">adventure</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Package Category
                              </label>
                              <select
                                value={selectedLead.packageCategory}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    packageCategory: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Category</option>
                                <option value="luxury">Luxury</option>

                                <option value="standard">Standard</option>
                                <option value="budget">Budget</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Meal Plans
                              </label>
                              <select
                                value={selectedLead.mealPlans}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    mealPlans: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Meal Plan</option>
                                <option value="breakfast">
                                  Breakfast Only
                                </option>
                                <option value="halfboard">Half Board</option>
                                <option value="fullboard">Full Board</option>
                                <option value="allinclusive">
                                  All Inclusive
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Room Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Number of Rooms
                              </label>
                              <input
                                type="number"
                                value={selectedLead.noOfRooms}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    noOfRooms: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Extra Beds
                              </label>
                              <input
                                type="number"
                                value={selectedLead.extraBeds}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    extraBeds: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === "viewPackage" && (
                  <div className="p-6 bg-white relative">
                    <div className="space-y-6">
                      {/* Debug Info */}
                      <div className="mb-4 p-2 bg-gray-100 rounded">
                        <p>
                          Available Packages: {availablePackages?.length || 0}
                        </p>
                        <p>
                          Selected Lead Destination:{" "}
                          {selectedLead?.destination || "None"}
                        </p>
                      </div>

                      {/* Lead Destination Info */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          Selected Destination
                        </h3>
                        <p className="text-blue-700">
                          {selectedLead?.destination ||
                            "No destination selected"}
                        </p>
                      </div>

                      {/* Packages Table */}
                      <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Package Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Type
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Category
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Duration
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Price
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(availablePackages) &&
                            availablePackages.length > 0 ? (
                              availablePackages.map((pkg, index) => (
                                <tr
                                  key={pkg._id || index}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {pkg.package?.packageName || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                      {pkg.package?.packageType || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                      {pkg.package?.packageCategory || "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {pkg.package?.duration
                                      ? `${pkg.package.duration} Days`
                                      : "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-green-600">
                                      ₹
                                      {pkg.finalCosting?.finalPrices
                                        ?.grandTotal || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      onClick={() => {
                                        setSelectedPackage(pkg);
                                        setIsPackageInfoOpen(true);
                                      }}
                                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                                    >
                                      Select Package
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="px-6 py-4 text-center text-gray-500"
                                >
                                  {Array.isArray(availablePackages)
                                    ? "No packages available for this destination"
                                    : "Loading packages..."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Package Info Slide-over */}
                    <div
                      className={`fixed inset-y-0 right-0 w-[90%] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
                        isPackageInfoOpen ? "translate-x-0" : "translate-x-full"
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="bg-[rgb(45,45,68)] text-white">
                          <div className="px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                              Package Details
                            </h2>
                            <button
                              onClick={() => setIsPackageInfoOpen(false)}
                              className="text-white hover:text-gray-200"
                            >
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Tabs */}
                          <div className="flex w-full">
                            {[
                              {
                                id: "package",
                                label: "Package Info",
                                icon: "📦",
                              },
                              { id: "cab", label: "Cab Info", icon: "🚗" },
                              { id: "hotel", label: "Hotel Info", icon: "🏨" },
                              {
                                id: "costing",
                                label: "Final Costing",
                                icon: "💰",
                              },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setPackageInfoTab(tab.id)}
                                className={`
                                  flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all flex-1
                                  ${
                                    packageInfoTab === tab.id
                                      ? "bg-white text-[rgb(45,45,68)] shadow-[0_0_10px_rgba(0,0,0,0.1)] relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-[rgb(45,45,68)]"
                                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                                  }
                                `}
                              >
                                <span className="text-lg">{tab.icon}</span>
                                <span className="whitespace-nowrap">
                                  {tab.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                          {selectedPackage && (
                            <>
                              {/* Package Info Tab */}
                              {packageInfoTab === "package" && (
                                <div className="space-y-6">
                                  {/* Header Card */}
                                  <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                                    <h3 className="text-2xl font-bold mb-4">
                                      {selectedPackage.package?.packageName}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="bg-white/10 rounded-lg p-4">
                                        <p className="text-sm opacity-75">
                                          Duration
                                        </p>
                                        <p className="text-lg font-medium">
                                          {selectedPackage.package?.duration}{" "}
                                          Days
                                        </p>
                                      </div>
                                      <div className="bg-white/10 rounded-lg p-4">
                                        <p className="text-sm opacity-75">
                                          Category
                                        </p>
                                        <p className="text-lg font-medium">
                                          {
                                            selectedPackage.package
                                              ?.packageCategory
                                          }
                                        </p>
                                      </div>
                                      <div className="bg-white/10 rounded-lg p-4">
                                        <p className="text-sm opacity-75">
                                          Package Type
                                        </p>
                                        <p className="text-lg font-medium">
                                          {selectedPackage.package?.packageType}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Overview Section */}
                                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                      Overview
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Pickup Location
                                        </p>
                                        <p className="text-base font-medium">
                                          {
                                            selectedPackage.package
                                              ?.pickupLocation
                                          }
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Drop Location
                                        </p>
                                        <p className="text-base font-medium">
                                          {
                                            selectedPackage.package
                                              ?.dropLocation
                                          }
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Start Date
                                        </p>
                                        <p className="text-base font-medium">
                                          {selectedPackage.package?.startDate
                                            ? new Date(
                                                selectedPackage.package.startDate
                                              ).toLocaleDateString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          End Date
                                        </p>
                                        <p className="text-base font-medium">
                                          {selectedPackage.package?.endDate
                                            ? new Date(
                                                selectedPackage.package.endDate
                                              ).toLocaleDateString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detailed Itinerary */}
                                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                      Day-wise Itinerary
                                    </h4>
                                    <div className="space-y-6">
                                      {selectedPackage.package?.itineraryDays?.map(
                                        (day, index) => (
                                          <div
                                            key={index}
                                            className="relative pl-8 pb-6 last:pb-0"
                                          >
                                            {/* Timeline dot and line */}
                                            <div className="absolute left-0 top-0 h-full">
                                              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                                              {index !==
                                                selectedPackage.package
                                                  .itineraryDays.length -
                                                  1 && (
                                                <div className="absolute top-4 left-2 w-[1px] h-[calc(100%-16px)] bg-blue-200"></div>
                                              )}
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                              <h5 className="text-lg font-semibold text-blue-600 mb-2">
                                                Day {day.day}
                                              </h5>
                                              <div className="space-y-4">
                                                {day.selectedItinerary
                                                  ?.itineraryTitle && (
                                                  <p className="font-medium text-gray-900">
                                                    {
                                                      day.selectedItinerary
                                                        .itineraryTitle
                                                    }
                                                  </p>
                                                )}
                                                <p className="text-gray-700 whitespace-pre-line">
                                                  {
                                                    day.selectedItinerary
                                                      ?.itineraryDescription
                                                  }
                                                </p>

                                                {/* Location Details */}
                                                <div className="flex flex-wrap gap-4 mt-3">
                                                  <div className="flex items-center gap-2">
                                                    <svg
                                                      className="w-4 h-4 text-gray-500"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                      />
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                      />
                                                    </svg>
                                                    <span className="text-sm text-gray-700">
                                                      {
                                                        day.selectedItinerary
                                                          ?.cityName
                                                      }
                                                      ,{" "}
                                                      {
                                                        day.selectedItinerary
                                                          ?.country
                                                      }
                                                    </span>
                                                  </div>
                                                  {day.selectedItinerary
                                                    ?.distance && (
                                                    <div className="flex items-center gap-2">
                                                      <svg
                                                        className="w-4 h-4 text-gray-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                                        />
                                                      </svg>
                                                      <span className="text-sm text-gray-700">
                                                        {
                                                          day.selectedItinerary
                                                            .distance
                                                        }{" "}
                                                        km
                                                      </span>
                                                    </div>
                                                  )}
                                                  {day.selectedItinerary
                                                    ?.totalHours && (
                                                    <div className="flex items-center gap-2">
                                                      <svg
                                                        className="w-4 h-4 text-gray-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                      </svg>
                                                      <span className="text-sm text-gray-700">
                                                        {
                                                          day.selectedItinerary
                                                            .totalHours
                                                        }{" "}
                                                        hours
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* Inclusions */}
                                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                      Package Inclusions
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedPackage.package?.inclusions?.map(
                                        (inclusion, index) => (
                                          <div
                                            key={index}
                                            className="flex items-start gap-3 bg-green-50 p-3 rounded-lg"
                                          >
                                            <span className="text-green-500 mt-0.5">
                                              <svg
                                                className="w-5 h-5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            </span>
                                            <p className="text-gray-700">
                                              {inclusion}
                                            </p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* Exclusions */}
                                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                      Package Exclusions
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedPackage.package?.exclusions?.map(
                                        (exclusion, index) => (
                                          <div
                                            key={index}
                                            className="flex items-start gap-3 bg-red-50 p-3 rounded-lg"
                                          >
                                            <span className="text-red-500 mt-0.5">
                                              <svg
                                                className="w-5 h-5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            </span>
                                            <p className="text-gray-700">
                                              {exclusion}
                                            </p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* Terms and Conditions */}
                                  {selectedPackage.package
                                    ?.termsAndConditions && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Terms & Conditions
                                      </h4>
                                      <div className="space-y-3">
                                        {selectedPackage.package.termsAndConditions.map(
                                          (term, index) => (
                                            <div
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <span className="text-blue-500 mt-1">
                                                <svg
                                                  className="w-4 h-4"
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                              </span>
                                              <p className="text-gray-700">
                                                {term}
                                              </p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Cancellation Policy */}
                                  {selectedPackage.package
                                    ?.cancellationPolicy && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Cancellation Policy
                                      </h4>
                                      <div className="space-y-4">
                                        {selectedPackage.package.cancellationPolicy.map(
                                          (policy, index) => (
                                            <div
                                              key={index}
                                              className="bg-yellow-50 p-4 rounded-lg"
                                            >
                                              <div className="flex items-start gap-3">
                                                <span className="text-yellow-600 mt-1">
                                                  <svg
                                                    className="w-5 h-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path
                                                      fillRule="evenodd"
                                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                      clipRule="evenodd"
                                                    />
                                                  </svg>
                                                </span>
                                                <p className="text-gray-700">
                                                  {policy}
                                                </p>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Package Description */}
                                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                      Package Description
                                    </h4>
                                    <div
                                      className="prose prose-sm max-w-none text-gray-700"
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          selectedPackage.package
                                            ?.packageDescription ||
                                          "No description available",
                                      }}
                                    />
                                  </div>

                                  {/* Package Exclusions */}
                                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                      <svg
                                        className="w-5 h-5 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      <h4 className="text-lg font-semibold text-gray-900">
                                        Package Exclusions
                                      </h4>
                                    </div>
                                    <div
                                      className="prose prose-sm max-w-none text-gray-700 [&>p]:mb-2 [&>p:last-child]:mb-0
                                        [&_strong]:text-gray-900 [&_span]:text-gray-700"
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          selectedPackage.package
                                            ?.packageExclusions ||
                                          "No exclusions listed",
                                      }}
                                    />
                                  </div>

                                  {/* Add these styles to your CSS or tailwind config */}
                                  <style jsx>{`
                                    .prose strong {
                                      font-weight: 600;
                                    }
                                    .prose p {
                                      margin-bottom: 0.5rem;
                                    }
                                    .prose p:last-child {
                                      margin-bottom: 0;
                                    }
                                  `}</style>
                                </div>
                              )}

                              {/* Cab Info Tab */}
                              {packageInfoTab === "cab" && (
                                <div className="space-y-6">
                                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-3 mb-6">
                                      <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                                        🚗
                                      </span>
                                      <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                                        Cab Details
                                      </h4>
                                    </div>
                                    {Object.entries(
                                      selectedPackage.cabs?.travelPrices
                                        ?.selectedCabs || {}
                                    ).map(([cabType, cabs]) => (
                                      <div key={cabType} className="mb-6">
                                        <h5 className="font-semibold text-lg text-gray-800 mb-4">
                                          {cabType}
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {cabs.map((cab, index) => (
                                            <div
                                              key={index}
                                              className={`border border-gray-200 rounded-lg p-4 relative ${
                                                selectedPackage.selectedCab?.cabName === cab.cabName
                                                  ? 'ring-2 ring-blue-500'
                                                  : ''
                                              }`}
                                            >
                                              <div className="absolute top-4 right-4">
                                                <input
                                                  type="radio"
                                                  name="selectedCab"
                                                  checked={selectedPackage.selectedCab?.cabName === cab.cabName}
                                                  onChange={() => {
                                                    setSelectedPackage({
                                                      ...selectedPackage,
                                                      selectedCab: cab
                                                    });
                                                  }}
                                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                              className="border border-gray-200 rounded-lg p-4"
                                            >
                                              <div className="flex justify-between items-center mb-2">
                                                <h6 className="font-medium text-gray-700">
                                                  {cab.cabName}
                                                </h6>
                                                <span className="text-green-600 font-semibold">
                                                  ₹{cab.prices?.onSeasonPrice}
                                                </span>
                                              </div>
                                              <div className="space-y-2">
                                                <p className="text-sm text-gray-500">
                                                  Seating: {cab.seatingCapacity}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                  AC: {cab.ac ? "Yes" : "No"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                  Luggage Capacity:{" "}
                                                  {cab.luggageCapacity}
                                                </p>
                                                {cab.amenities && (
                                                  <div className="pt-2">
                                                    <p className="text-sm text-gray-500 mb-1">
                                                      Amenities:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                      {cab.amenities.map(
                                                        (amenity, i) => (
                                                          <span
                                                            key={i}
                                                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                                                          >
                                                            {amenity}
                                                          </span>
                                                        )
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Hotel Info Tab */}
                              {packageInfoTab === "hotel" && (
                                <div className="space-y-6">
                                  <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                                    <div className="flex items-center justify-between mb-6">
                                      <h3 className="text-2xl font-bold">
                                        Hotel Details
                                      </h3>
                                      <div className="flex gap-4">
                                        <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                          <span className="text-sm font-medium">
                                            Total Nights:{" "}
                                          </span>
                                          <span className="font-mono">
                                            {selectedPackage?.hotels
                                              ?.totalNights || "0"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {Object.entries(
                                    selectedPackage?.hotels || {}
                                  ).map(([location, hotelInfo]) => (
                                    <div
                                      key={location}
                                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                                    >
                                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        {location}
                                      </h4>
                                      <div className="grid grid-cols-2 gap-6">
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            Hotel Name
                                          </p>
                                          <p className="text-base font-medium">
                                            {hotelInfo.hotelName}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            Room Type
                                          </p>
                                          <p className="text-base font-medium">
                                            {hotelInfo.roomType}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            Check In
                                          </p>
                                          <p className="text-base font-medium">
                                            {hotelInfo.checkIn
                                              ? new Date(
                                                  hotelInfo.checkIn
                                                ).toLocaleDateString()
                                              : "N/A"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            Check Out
                                          </p>
                                          <p className="text-base font-medium">
                                            {hotelInfo.checkOut
                                              ? new Date(
                                                  hotelInfo.checkOut
                                                ).toLocaleDateString()
                                              : "N/A"}
                                          </p>
                                        </div>
                                      </div>
                                      {hotelInfo.amenities && (
                                        <div className="mt-4">
                                          <p className="text-sm text-gray-500 mb-2">
                                            Amenities
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {hotelInfo.amenities.map(
                                              (amenity, index) => (
                                                <span
                                                  key={index}
                                                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                                                >
                                                  {amenity}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Final Costing Tab */}
                              {packageInfoTab === "costing" && (
                                <div className="space-y-6">
                                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-3 mb-6">
                                      <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                                        💰
                                      </span>
                                      <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                                        Final Costing Details
                                      </h4>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <p className="text-sm text-gray-500">
                                            Hotel Cost
                                          </p>
                                          <p className="text-xl font-semibold text-gray-900">
                                            ₹
                                            {selectedPackage.finalCosting
                                              ?.breakdown?.hotelCost || 0}
                                          </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <p className="text-sm text-gray-500">
                                            Transport Cost
                                          </p>
                                          <p className="text-xl font-semibold text-gray-900">
                                            ₹
                                            {selectedPackage.finalCosting
                                              ?.breakdown?.transportCost || 0}
                                          </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <p className="text-sm text-gray-500">
                                            Activities Cost
                                          </p>
                                          <p className="text-xl font-semibold text-gray-900">
                                            ₹
                                            {selectedPackage.finalCosting
                                              ?.breakdown
                                              ?.activitiesTotalCost || 0}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Base Total */}
                                      <div className="border-t border-gray-200 pt-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                          <p className="text-sm text-blue-600">
                                            Base Total
                                          </p>
                                          <p className="text-2xl font-bold text-blue-600">
                                            ₹
                                            {selectedPackage.finalCosting
                                              ?.baseTotal || 0}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Margins */}
                                      <div className="border-t border-gray-200 pt-4">
                                        <h5 className="text-lg font-semibold text-gray-900 mb-4">
                                          Margins
                                        </h5>
                                        <div className="grid grid-cols-3 gap-4">
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">
                                              B2B Margin
                                            </p>
                                            <p className="text-lg font-medium text-gray-900">
                                              {selectedPackage.finalCosting
                                                ?.margins?.b2b || 0}
                                              %
                                            </p>
                                          </div>
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">
                                              Internal Margin
                                            </p>
                                            <p className="text-lg font-medium text-gray-900">
                                              {selectedPackage.finalCosting
                                                ?.margins?.internal || 0}
                                              %
                                            </p>
                                          </div>
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">
                                              Website Margin
                                            </p>
                                            <p className="text-lg font-medium text-gray-900">
                                              {selectedPackage.finalCosting
                                                ?.margins?.website || 0}
                                              %
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Final Prices */}
                                      <div className="border-t border-gray-200 pt-4">
                                        <h5 className="text-lg font-semibold text-gray-900 mb-4">
                                          Final Prices
                                        </h5>
                                        <div className="grid grid-cols-3 gap-4">
                                          <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-sm text-green-600">
                                              B2B Price
                                            </p>
                                            <p className="text-xl font-bold text-green-600">
                                              ₹
                                              {selectedPackage.finalCosting
                                                ?.finalPrices?.b2b || 0}
                                            </p>
                                          </div>
                                          <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-sm text-green-600">
                                              Internal Price
                                            </p>
                                            <p className="text-xl font-bold text-green-600">
                                              ₹
                                              {selectedPackage.finalCosting
                                                ?.finalPrices?.internal || 0}
                                            </p>
                                          </div>
                                          <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-sm text-green-600">
                                              Website Price
                                            </p>
                                            <p className="text-xl font-bold text-green-600">
                                              ₹
                                              {selectedPackage.finalCosting
                                                ?.finalPrices?.website || 0}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Grand Total */}
                                      <div className="border-t border-gray-200 pt-4">
                                        <div className="bg-green-50 rounded-lg p-4">
                                          <p className="text-sm text-green-600">
                                            Grand Total
                                          </p>
                                          <p className="text-3xl font-bold text-green-600">
                                            ₹
                                            {selectedPackage.finalCosting
                                              ?.grandTotal || 0}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <button
                            onClick={async () => {
                              try {
                                const success = await handleUpdateLead(
                                  selectedLead._id,
                                  {
                                    ...selectedLead,
                                    assignedPackage: selectedPackage,
                                  }
                                );
                                if (success) {
                                  toast.success(
                                    "Package assigned successfully!"
                                  );
                                  setIsPackageInfoOpen(false);
                                  setActiveTab("sendPackage");
                                }
                              } catch (error) {
                                toast.error("Failed to assign package");
                              }
                            }}
                            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Confirm Selection
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "sendPackage" && (
                  <div className="p-6 bg-gray-50">
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                        {/* Header with gradient background */}
                        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                          <h3 className="text-2xl font-bold">Share Package</h3>
                          <p className="mt-2 text-blue-100">
                            Choose your preferred method to share the package
                            details
                          </p>
                        </div>

                        <div className="p-8">
                          {/* Package Summary Card */}
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                            <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                Package Details
                              </h4>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">
                                  Package Name
                                </span>
                                <span className="font-medium text-gray-900">
                                  {selectedLead?.assignedPackage?.packageName ||
                                    "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Duration</span>
                                <span className="font-medium text-gray-900">
                                  {selectedLead?.assignedPackage?.duration ||
                                    "N/A"}{" "}
                                  Days
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600">Price</span>
                                <span className="font-medium text-gray-900">
                                  ₹
                                  {selectedLead?.assignedPackage?.price ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Share Options */}
                          <div className="grid grid-cols-3 gap-6">
                            {/* WhatsApp Share */}
                            <button
                              onClick={() => handleShare("whatsapp")}
                              disabled={isSharing}
                              className={`group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500 transition-all duration-300 ${
                                isSharing && sharingMethod === "whatsapp"
                                  ? "opacity-75 cursor-wait"
                                  : ""
                              }`}
                            >
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isSharing && sharingMethod === "whatsapp" ? (
                                  <svg
                                    className="w-5 h-5 text-green-500 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-5 h-5 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div
                                className={`w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform ${
                                  isSharing && sharingMethod === "whatsapp"
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              >
                                <svg
                                  className="w-8 h-8 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.48-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.198-.198-.198-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                WhatsApp
                              </h3>
                              <p className="text-sm text-center text-gray-500">
                                {isSharing && sharingMethod === "whatsapp"
                                  ? "Opening WhatsApp..."
                                  : "Share instantly via WhatsApp"}
                              </p>
                            </button>

                            {/* Email Share */}
                            <button
                              onClick={() => handleShare("email")}
                              className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-500 transition-all duration-300"
                            >
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-5 h-5 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                <svg
                                  className="w-8 h-8 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                Email
                              </h3>
                              <p className="text-sm text-center text-gray-500">
                                Send via email
                              </p>
                            </button>

                            {/* SMS Share */}
                            <button
                              onClick={() => handleShare("sms")}
                              className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-500 transition-all duration-300"
                            >
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-5 h-5 text-purple-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                <svg
                                  className="w-8 h-8 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                SMS
                              </h3>
                              <p className="text-sm text-center text-gray-500">
                                Share via SMS
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleClosePanel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                {activeTab === "leadDetails" && (
                  <button
                    onClick={() => setActiveTab("createPackage")}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Next
                  </button>
                )}
                {activeTab === "createPackage" && (
                  <button
                    onClick={async () => {
                      try {
                        const success = await handleUpdateLead(
                          selectedLead._id,
                          selectedLead
                        );
                        if (success) {
                          // Check if the update was successful
                          toast.success("Changes saved successfully!");
                          setActiveTab("viewPackage"); // Move to next tab
                        }
                      } catch (error) {
                        console.error("Error updating lead:", error);
                        toast.error(
                          "Failed to save changes. Please try again."
                        );
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors"
                  >
                    Save Changes
                  </button>
                )}
                {activeTab === "viewPackage" && (
                  <button
                    onClick={() => setActiveTab("sendPackage")}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Next
                  </button>
                )}
                {activeTab === "sendPackage" && (
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Send Package
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add a success modal or notification */}
      {isSharing && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-gray-600">
            Sharing package via {sharingMethod}...
          </span>
        </div>
      )}

      {/* Premium View Modal with Updated Header Background */}
      {isViewModalOpen && viewLead && (
        <>
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity z-40"
            onClick={() => setIsViewModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-3">
              <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl">
                {/* Header with New Background Color */}
                <div className="bg-[rgb(45,45,68)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xl font-semibold text-white">
                          {viewLead.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white mb-0.5">
                          {viewLead.name}
                        </h2>
                        <p className="text-sm text-gray-300">
                          {viewLead.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="rounded-full p-1 hover:bg-white/10 transition-colors"
                    >
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content Area with Reduced Spacing */}
                <div className="px-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Contact Information
                          </h3>
                        </div>
                      </div>
                      <div className="p-3 space-y-2.5">
                        {/* Contact details with reduced spacing */}
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {viewLead.mobile}
                            </p>
                            <p className="text-xs text-gray-500">Mobile</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {viewLead.email}
                            </p>
                            <p className="text-xs text-gray-500">Email</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Travel Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 104 0 2 2 0 012-2v-2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Travel Details
                          </h3>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              From
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {viewLead.from || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              Destination
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {viewLead.destination || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              Travel Date
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {viewLead.travelDate
                                ? new Date(
                                    viewLead.travelDate
                                  ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              Duration
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {viewLead.days
                                ? `${viewLead.days}D/${viewLead.nights}N`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guest Information Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Guest Information
                          </h3>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <p className="text-xl font-bold text-blue-600 mb-0.5">
                              {viewLead.adults || "0"}
                            </p>
                            <p className="text-xs font-medium text-blue-600">
                              Adults
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <p className="text-xl font-bold text-green-600 mb-0.5">
                              {viewLead.kids || "0"}
                            </p>
                            <p className="text-xs font-medium text-green-600">
                              Kids
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 text-center">
                            <p className="text-xl font-bold text-purple-600 mb-0.5">
                              {viewLead.persons || "0"}
                            </p>
                            <p className="text-xs font-medium text-purple-600">
                              Total
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Information Card */}
                    {viewLead.assignedPackage && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <svg
                              className="h-4 w-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Package Details
                            </h3>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="space-y-2.5">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-0.5">
                                Package Name
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {viewLead.assignedPackage.packageName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-0.5">
                                Category
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {viewLead.packageCategory || "N/A"}
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <p className="text-xs font-medium text-green-600 mb-0.5">
                                Package Price
                              </p>
                              <p className="text-xl font-bold text-green-600">
                                ₹{viewLead.assignedPackage.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Reduced Spacing */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleEditClick(viewLead)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Edit Lead
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllLeads;
