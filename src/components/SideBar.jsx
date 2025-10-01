import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toggleSidebar } from "../redux/user/userSlice";

// Add config object
const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

function SideBar() {
  const { currentUser, showSidebar } = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
console.log(userData)
const [isUsersOpen, setIsUsersOpen] = useState(false);
const [isAccountOpen, setIsAccountOpen] = useState(false);
const [isLeadManagementOpen, setIsLeadManagementOpen] = useState(false);
const [isProfitLossOpen, setIsProfitLossOpen] = useState(false);
const [isLoggedOut, setIsLoggedOut] = useState(false);
const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const parsedData = JSON.parse(userStr);
        const localUser = parsedData.data || parsedData;

        if (!localUser?._id || !localUser?.token) return;

        const response = await fetch(`${config.API_HOST}/api/maker/get-maker`, {
          headers: {
            Authorization: `Bearer ${localUser.token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const users = await response.json();
        const currentUserData = users.find(
          (user) => user._id === localUser._id
        );

        if (currentUserData) {
          setUserData(currentUserData);
          console.log("Current User Type:", currentUserData.userType);
          console.log(
            "Current User Type for Activities:",
            currentUserData.userType
          );
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserData(null);
    setIsLoggedOut(true);
    navigate("/");
    window.location.reload();
  };

  const handleOverlayClick = () => {
    dispatch(toggleSidebar());
  };

  if (!showSidebar || isLoading) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        onClick={handleOverlayClick}
      />
      
      <aside
        id="logo-sidebar"
        className="fixed lg:sticky top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out bg-[#2d2d44] shadow-xl lg:shadow-none"
        style={{
          transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)'
        }}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto bg-[#2d2d44] text-gray-200">
          {/* Close button for mobile */}
          <div className="flex justify-end lg:hidden mb-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
       
          {/* User Info Section - Updated styling with responsive design */}
          {userData ? (
            <div className="mb-4 sm:mb-6 text-center p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-[#fff] flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg sm:text-2xl text-blue-400 font-bold">
                  {userData.firstName ? userData.firstName.charAt(0) : "U"}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-medium text-gray-100 truncate">
                {`${userData.firstName || ""} ${
                  userData.lastName || ""
                }`.trim() || "User"}
              </h2>
              <p className="text-xs text-gray-400 mt-1 truncate">{userData.email}</p>
              <span className="inline-block mt-2 px-2 sm:px-3 py-1 text-xs font-medium text-blue-900 bg-[#fff] rounded-full backdrop-blur-sm">
                {userData.userType === "B2B sale"
                  ? "B2B Sales Representative"
                  : userData.userType || "Regular User"}
              </span>
            </div>
          ) : (
            <div className="mb-4 sm:mb-6 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 rounded-full bg-gray-100/10 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl text-white font-bold">P</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">Manager</h2>
            </div>
          )}

          {/* Navigation Links - Updated styling with responsive design */}
          <nav className="space-y-1 sm:space-y-1.5">
            {/* Dashboard Link - Only visible for managers */}
            { userData?.designation == "manager"  && (
              <div
                onClick={() => handleNavigation("/dashboard")}
                className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                  isActive("/dashboard")
                    ? "bg-white text-[#2d2d44]"
                    : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                }`}
              >
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                    isActive("/dashboard")
                      ? "text-blue-600"
                      : "text-white group-hover:text-blue-600"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                  />
                </svg>
                <span className="ml-2 sm:ml-3 font-medium truncate">Dashboard</span>
              </div>
            )}

            {/* Profile Link - Conditionally render based on currentUser and username check */}
            {currentUser &&
              userData?.firstName !== "Manager" &&
              userData?.username !== "digvijay chauhan" && (
                <Link
                  to="/user-profile"
                  className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 group ${
                    isActive("/user-profile")
                      ? "bg-white text-[#2d2d44]"
                      : "text-white hover:bg-[rgb(255,255,255,0.5)]"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-colors ${
                      isActive("/user-profile")
                        ? "text-[#2d2d44]"
                        : "text-white group-hover:text-blue-600"
                    }`}
                    fill="currentColor"
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
                  <span className="font-medium truncate">My Profile</span>
                </Link>
              )}

            {/* Main Navigation - Updated styling with responsive design */}
            <div className="space-y-1 sm:space-y-1.5">
              {userData?.userType === "For B2B Sale" || userData?.userType === "For Internal sale" ? (
                <>
                
                <div
                        onClick={() => handleNavigation("/sale-dashboard")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/sale-dashboard")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/sale-dashboard")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate"> Dashboard </span>
                      </div>
                 {  userData?.designation == "team leader" && (
          <div
                        onClick={() => handleNavigation("/package-approve")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/hotel-manager")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/package-approve")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Package Approval </span>
                      </div>
                      )}
                  {/* B2B Sale and Internal Sale specific menu items */}
                  <div
                    onClick={() => handleNavigation("/leads")}
                    className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                      isActive("/leads")
                        ? "bg-white text-[#2d2d44]"
                        : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                        isActive("/leads")
                          ? "text-blue-600"
                          : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="ml-2 sm:ml-3 font-medium truncate">Add New Leads</span>
                  </div>
   {/* B2B Sale and Internal Sale specific menu items */}
   <div
                    onClick={() => handleNavigation("/crm-leads")}
                    className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                      isActive("/crm-leads")
                        ? "bg-white text-[#2d2d44]"
                        : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                        isActive("/crm-leads")
                          ? "text-blue-600"
                          : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="ml-2 sm:ml-3 font-medium truncate">Crm Leads</span>
                  </div>
                  <div
                    onClick={() => handleNavigation("/all-leads")}
                    className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                      isActive("/all-leads")
                        ? "bg-white text-[#2d2d44]"
                        : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                        isActive("/all-leads")
                          ? "text-blue-600"
                          : "text-white group-hover:text-blue-600"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="ml-2 sm:ml-3 font-medium truncate">All Leads</span>
                  </div>
                
                 
                </>
              ) : (
                <>
                  {/* Regular user menu items */}
                  {userData?.userType !== "For B2B Sale" && userData?.userType !== "For Internal sale" && (
                    <>
                     <div className="flex flex-col">
                        <div
                          onClick={() => setIsLeadManagementOpen(!isLeadManagementOpen)}
                          className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                            isActive("/lead-management")
                              ? "bg-white text-[#2d2d44]"
                              : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                              isActive("/lead-management")
                                ? "text-blue-600"
                                : "text-white group-hover:text-blue-600"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="ml-2 sm:ml-3 font-medium truncate">Lead Management</span>
                        </div>

                        {/* User submenu */}
                        {isLeadManagementOpen && (
                          <div className="ml-3 sm:ml-4 space-y-1 sm:space-y-2">
                            {/* Add User - Updated with user-plus icon */}
                            <div
                              onClick={() => handleNavigation("/all-leads-admin")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/all-leads-admin")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/all-leads-admin")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate">All Leads</span>
                            </div>

                          </div>
                        )}
                      </div>
                      {/* Destinations - Map/Location icon */}
                      <div
                        onClick={() => handleNavigation("/destinations")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/destinations")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/destinations")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Destinations</span>
                      </div>
             {/* Global Master - Map/Location icon */}
             <div
                        onClick={() => handleNavigation("/global-master")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/global-master")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/global-master")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Global Master</span>
                      </div>
                      <div
                        onClick={() => handleNavigation("/global-master-data")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/global-master-data")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/global-master-data")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                          />
                          </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Global Master Data</span>
                      </div>
                      {/* Packages - Package/Gift icon */}
                      <div
                        onClick={() => handleNavigation("/packages")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/packages")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/packages")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Packages</span>
                      </div>

                      {/* Create Package - Plus Package icon */}
                      <div
                        onClick={() => handleNavigation("/create-package")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/create-package")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/create-package")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Create Packages</span>
                      </div>

                      {/* Itinerary - Calendar/Schedule icon */}
                      <div
                        onClick={() => handleNavigation("/create-itenary")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/create-itenary")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/create-itenary")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Itinerary</span>
                      </div>

                      {/* Cab Manager - Car icon */}
                      <div
                        onClick={() => handleNavigation("/cabmanager")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/cabmanager")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/cabmanager")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Cab Manager</span>
                      </div>

                      {/* Activities - Running/Activity icon */}
                      <div
                        onClick={() => handleNavigation("/createActivities")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/createActivities")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/createActivities")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Activities</span>
                      </div>

                      {/* Hotel Manager - Updated with hotel icon */}
                      <div
                        onClick={() => handleNavigation("/hotel-manager")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/hotel-manager")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/hotel-manager")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Hotel Manager</span>
                      </div>
                      <div
                    onClick={() => handleNavigation("/convert-lead")}
                    className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                      isActive("/convert-lead")
                        ? "bg-white text-[#2d2d44]"
                        : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                        isActive("/convert-lead")
                          ? "text-blue-600"
                          : "text-white group-hover:text-blue-600"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="ml-2 sm:ml-3 font-medium truncate">Convert Leads</span>
                  </div>
                  <div
                        onClick={() => handleNavigation("/cab-vendor-details")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/cab-vendor-details")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/cab-vendor-details")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">cab vendor details</span>
                      </div>
                      <div
                        onClick={() => handleNavigation("/package-download-tracker")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/package-download-tracker")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/package-download-tracker")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Package Tracker</span>
                      </div>
                       {/* ACCOUNTS - Bank icon */}
                         <div className="flex flex-col">
                        <div
                          onClick={() => setIsAccountOpen(!isAccountOpen)}
                          className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                            isActive("/account")
                              ? "bg-white text-[#2d2d44]"
                              : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                              isActive("/account")
                                ? "text-blue-600"
                                : "text-white group-hover:text-blue-600"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="ml-2 sm:ml-3 font-medium truncate">Account</span>
                        </div>

                        {/* User submenu */}
                        {isAccountOpen && (
                          <div className="ml-3 sm:ml-4 space-y-1 sm:space-y-2">
                            {/* Add User - Updated with user-plus icon */}
                            <div
                              onClick={() => handleNavigation("/add-bank")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/add-bank")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/add-bank")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate">Add Bank account</span>
                            </div>
                            <div
                              onClick={() => handleNavigation("/bank-list")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/bank-list")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/bank-list")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate"> Bank List</span>
                            </div>
                            <div
                              onClick={() => handleNavigation("/hotel-ledger")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/hotel-ledger")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/hotel-ledger")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate"> Hotel Ledger</span>
                            </div>
                            <div
                              onClick={() => handleNavigation("/transport-ledger")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/transport-ledger")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/transport-ledger")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate"> Transport Ledger</span>
                            </div>
                            <div
                              onClick={() => handleNavigation("/transaction-list")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/transaction-list")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/transaction-list")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate"> Transaction List</span>
                            </div>
                            <div
                              onClick={() => handleNavigation("/bank-report")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/bank-report")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/bank-report")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate"> Bank Report</span>
                            </div>
                            <div
                              onClick={() => setIsProfitLossOpen(!isProfitLossOpen)}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/profit-loss-report") || isActive("/operation-profit-loss")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/profit-loss-report") || isActive("/operation-profit-loss")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate">Profit & Loss Report</span>
                              <svg
                                className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                                  isProfitLossOpen ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>

                            {/* Profit & Loss submenu */}
                            {isProfitLossOpen && (
                              <div className="ml-6 sm:ml-8 space-y-1 sm:space-y-2">
                                {/* General Profit & Loss */}
                                <div
                                  onClick={() => handleNavigation("/profit-loss-report")}
                                  className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.3)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                    isActive("/profit-loss-report")
                                      ? "bg-[rgb(59,130,246,0.3)] text-white"
                                      : "text-gray-300"
                                  }`}
                                >
                                  <svg
                                    className={`w-3 h-3 sm:w-4 sm:h-4 transition duration-75 ${
                                      isActive("/profit-loss-report")
                                        ? "text-blue-400"
                                        : "text-gray-400 group-hover:text-blue-400"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                  </svg>
                                  <span className="ml-2 sm:ml-3 font-medium truncate">sales P&L</span>
                                </div>

                                {/* Operation Profit Loss */}
                                <div
                                  onClick={() => handleNavigation("/operation-profit-loss")}
                                  className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.3)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                    isActive("/operation-profit-loss")
                                      ? "bg-[rgb(59,130,246,0.3)] text-white"
                                      : "text-gray-300"
                                  }`}
                                >
                                  <svg
                                    className={`w-3 h-3 sm:w-4 sm:h-4 transition duration-75 ${
                                      isActive("/operation-profit-loss")
                                        ? "text-blue-400"
                                        : "text-gray-400 group-hover:text-blue-400"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                  </svg>
                                  <span className="ml-2 sm:ml-3 font-medium truncate">Operation P&L</span>
                                </div>
                              </div>
                            )}
                            <div
                              onClick={() => handleNavigation("/Service-report")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/Service-report")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/Service-report")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate"> Service Report</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Users - People icon */}
                      <div className="flex flex-col">
                        <div
                          onClick={() => setIsUsersOpen(!isUsersOpen)}
                          className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                            isActive("/users")
                              ? "bg-white text-[#2d2d44]"
                              : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                              isActive("/users")
                                ? "text-blue-600"
                                : "text-white group-hover:text-blue-600"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="ml-2 sm:ml-3 font-medium truncate">Users</span>
                        </div>

                        {/* User submenu */}
                        {isUsersOpen && (
                          <div className="ml-3 sm:ml-4 space-y-1 sm:space-y-2">
                            {/* Add User - Updated with user-plus icon */}
                            <div
                              onClick={() => handleNavigation("/add-user")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/add-user")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/add-user")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate">Add User</span>
                            </div>

                            {/* User List */}
                            <div
                              onClick={() => handleNavigation("/user-list")}
                              className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                isActive("/user-list")
                                  ? "bg-[rgb(59,130,246,0.5)] text-white"
                                  : "text-white"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                                  isActive("/user-list")
                                    ? "text-blue-600"
                                    : "text-white group-hover:text-blue-600"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                />
                              </svg>
                              <span className="ml-2 sm:ml-3 font-medium truncate">User List</span>
                            </div>
                          </div>
                        )}
                      </div>
                        
                      <div
                        onClick={() => handleNavigation("/package-approval")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/hotel-manager")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/hotel-manager")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Package Approval </span>
                      </div>
                      <div
                        onClick={() => handleNavigation("/margin-master")}
                        className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/destinations")
                            ? "bg-white text-[#2d2d44]"
                            : "text-white hover:bg-[rgb(59,130,246,0.5)]"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition duration-75 ${
                            isActive("/margin-master")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="ml-2 sm:ml-3 font-medium truncate">Margin Master</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          
          
         
          </nav>

     
        </div>
      </aside>
    </>
  );
}

export default SideBar;
