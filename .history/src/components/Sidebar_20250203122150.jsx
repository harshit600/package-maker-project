import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Add config object
const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

function SideBar() {
  const { currentUser, showSidebar } = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
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
      }
    };

    fetchUserData();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
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

  if (!showSidebar) return null;

  return (
    <aside
      id="logo-sidebar"
      className="sticky top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-4 py-6 overflow-y-auto bg-[#2d2d44] text-gray-200">
        {/* User Info Section - Updated styling */}
        {userData ? (
          <div className="mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl text-blue-400 font-bold">
                {userData.firstName ? userData.firstName.charAt(0) : "U"}
              </span>
            </div>
            <h2 className="text-lg font-medium text-gray-100">
              {`${userData.firstName || ""} ${
                userData.lastName || ""
              }`.trim() || "User"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">{userData.email}</p>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium text-blue-300 bg-blue-500/10 rounded-full backdrop-blur-sm">
              {userData.userType === "B2B sale"
                ? "B2B Sales Representative"
                : userData.userType || "Regular User"}
            </span>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-100/10 flex items-center justify-center">
              <span className="text-3xl text-white font-bold">?</span>
            </div>
            <h2 className="text-xl font-semibold">No User Login</h2>
          </div>
        )}

        {/* Navigation Links - Updated styling */}
        <nav className="space-y-1.5">
          {/* Profile Link */}
          {currentUser && (
            <Link
              to="/user-profile"
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                isActive("/user-profile")
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-gray-300 hover:bg-blue-500/10 hover:text-blue-300"
              }`}
            >
              <svg
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive("/user-profile")
                    ? "text-blue-300"
                    : "text-gray-400 group-hover:text-blue-300"
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
              <span className="font-medium">My Profile</span>
            </Link>
          )}

          {/* Main Navigation - Updated styling */}
          <div className="space-y-1.5">
            {userData?.userType === "For B2B Sale" ? (
              <>
                {/* B2B Sale specific menu items */}
                <div
                  onClick={() => handleNavigation("/leads")}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                    isActive("/leads")
                      ? "bg-[rgb(59,130,246,0.5)] text-white"
                      : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 transition duration-75 ${
                      isActive("/leads")
                        ? "text-blue-600"
                        : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v2H8v2h2v2h2v-2h2V7h-2z" />
                  </svg>
                  <span className="ml-3 font-medium">Add New Leads</span>
                </div>

                <div
                  onClick={() => handleNavigation("/all-leads")}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                    isActive("/all-leads")
                      ? "bg-[rgb(59,130,246,0.5)] text-white"
                      : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 transition duration-75 ${
                      isActive("/all-leads")
                        ? "text-blue-600"
                        : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M7 0a7 7 0 0 0-7 7v6a7 7 0 0 0 7 7h6a7 7 0 0 0 7-7V7a7 7 0 0 0-7-7H7zm0 2h6a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm1 3v4h4v2H8v4H6v-4H2V9h4V5h2z" />
                  </svg>
                  <span className="ml-3 font-medium">All Leads</span>
                </div>

                {/* Added Packages for B2B Sale */}
                <div
                  onClick={() => handleNavigation("/packages")}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                    isActive("/packages")
                      ? "bg-[rgb(59,130,246,0.5)] text-white"
                      : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 transition duration-75 ${
                      isActive("/packages")
                        ? "text-blue-600"
                        : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 20"
                  >
                    <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                  </svg>
                  <span className="ml-3 font-medium">Packages</span>
                </div>
              </>
            ) : (
              <>
                {/* Regular user menu items */}
                <div
                  onClick={() => handleNavigation("/")}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                    isActive("/")
                      ? "bg-[rgb(59,130,246,0.5)] text-white"
                      : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 transition duration-75 ${
                      isActive("/")
                        ? "text-blue-600"
                        : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 21"
                  >
                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                  </svg>
                  <span className="ml-3 font-medium">Dashboard</span>
                </div>

                {/* Only show these menu items if NOT B2B Sale */}
                {userData?.userType !== "For B2B Sale" && (
                  <>
                    {/* Destinations */}
                    <div
                      onClick={() => handleNavigation("/destinations")}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                        isActive("/destinations")
                          ? "bg-[rgb(59,130,246,0.5)] text-white"
                          : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 transition duration-75 ${
                          isActive("/destinations")
                            ? "text-blue-600"
                            : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 20"
                      >
                        <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                      </svg>
                      <span className="ml-3 font-medium">Destinations</span>
                    </div>

                    {/* Packages */}
                    <div
                      onClick={() => handleNavigation("/packages")}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                        isActive("/packages")
                          ? "bg-[rgb(59,130,246,0.5)] text-white"
                          : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 transition duration-75 ${
                          isActive("/packages")
                            ? "text-blue-600"
                            : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 20"
                      >
                        <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                      </svg>
                      <span className="ml-3 font-medium">Packages</span>
                    </div>

                    {/* Create Packages */}
                    <div
                      onClick={() => handleNavigation("/create-package")}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                        isActive("/create-package")
                          ? "bg-[rgb(59,130,246,0.5)] text-white"
                          : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 transition duration-75 ${
                          isActive("/create-package")
                            ? "text-blue-600"
                            : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 20"
                      >
                        <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                      </svg>
                      <span className="ml-3 font-medium">Create Packages</span>
                    </div>

                    {/* Itinerary */}
                    <div
                      onClick={() => handleNavigation("/create-itenary")}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                        isActive("/create-itenary")
                          ? "bg-[rgb(59,130,246,0.5)] text-white"
                          : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 transition duration-75 ${
                          isActive("/create-itenary")
                            ? "text-blue-600"
                            : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 20"
                      >
                        <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                      </svg>
                      <span className="ml-3 font-medium">Itinerary</span>
                    </div>

                    {/* Cab Manager */}
                    <div
                      onClick={() => handleNavigation("/cabmanager")}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                        isActive("/cabmanager")
                          ? "bg-[rgb(59,130,246,0.5)] text-white"
                          : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 transition duration-75 ${
                          isActive("/cabmanager")
                            ? "text-blue-600"
                            : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 20"
                      >
                        <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                      </svg>
                      <span className="ml-3 font-medium">Cab Manager</span>
                    </div>

                    {/* Activities - Only show if not B2B Sale */}
                    {console.log("User Type Check:", userData?.userType)}
                    {userData?.userType !== "For B2B Sale" ? (
                      <div
                        onClick={() => handleNavigation("/createActivities")}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/createActivities")
                            ? "bg-[rgb(59,130,246,0.5)] text-white"
                            : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 transition duration-75 ${
                            isActive("/createActivities")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                          }`}
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 18 20"
                        >
                          <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                        </svg>
                        <span className="ml-3 font-medium">Activities</span>
                      </div>
                    ) : null}

                    {/* Users Section */}
                    <div className="flex flex-col">
                      <div
                        onClick={() => setIsUsersOpen(!isUsersOpen)}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer group ${
                          isActive("/users")
                            ? "bg-[rgb(59,130,246,0.5)] text-white"
                            : "text-gray-300 hover:bg-[rgb(59,130,246,0.5)] hover:text-white"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 transition duration-75 ${
                            isActive("/users")
                              ? "text-blue-600"
                              : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                          }`}
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v2H8v2h2v2h2v-2h2V7h-2z" />
                        </svg>
                        <span className="ml-3 font-medium">Users</span>
                      </div>

                      {/* User submenu */}
                      {isUsersOpen && (
                        <div className="ml-4 space-y-2">
                          {/* Add User */}
                          <div
                            onClick={() => handleNavigation("/add-user")}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                              isActive("/add-user")
                                ? "bg-[rgb(59,130,246,0.5)] text-white"
                                : "text-gray-100"
                            }`}
                          >
                            <svg
                              className={`w-5 h-5 transition duration-75 ${
                                isActive("/add-user")
                                  ? "text-blue-600"
                                  : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                              }`}
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm1 15h-2v-2H7v-2h2V9h2v2h2v2h-2z" />
                              <path d="M12 8h-2V6h-2v2H6v2h2v2h2v-2h2V8z" />
                            </svg>
                            <span className="ml-3 font-medium">Add User</span>
                          </div>

                          {/* User List */}
                          <div
                            onClick={() => handleNavigation("/user-list")}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-[rgb(59,130,246,0.5)] hover:text-white group cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                              isActive("/user-list")
                                ? "bg-[rgb(59,130,246,0.5)] text-white"
                                : "text-gray-100"
                            }`}
                          >
                            <svg
                              className={`w-5 h-5 transition duration-75 ${
                                isActive("/user-list")
                                  ? "text-blue-600"
                                  : "text-white group-hover:text-blue-600 dark:group-hover:text-white"
                              }`}
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                            </svg>
                            <span className="ml-3 font-medium">User List</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </nav>

        {/* Bottom Section - Updated styling */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/30">
          {currentUser && !isLoggedOut && (
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 hover:text-blue-300 transition-all duration-200 backdrop-blur-sm"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default SideBar;
