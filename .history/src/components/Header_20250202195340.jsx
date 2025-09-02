import { FaSearch, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [localUser, setLocalUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsedData = JSON.parse(userStr);
        // Extract user data from the data property, similar to UserProfile.jsx
        setLocalUser(parsedData.data || parsedData);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  // Default avatar URL - replace with your default image
  const defaultAvatar =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocalUser(null);
    setShowDropdown(false);
    // Add any additional logout logic here (e.g., Redux dispatch)
  };

  return (
    <header className="w-full bg-[#2d2d44] shadow-lg">
      <div className="bg-white/5 backdrop-blur-sm">
        <nav className="px-4 py-3">
          <div className="flex items-center justify-between max-w-[90vw] mx-auto">
            {/* Logo Section */}
            <Link to="/" className="flex items-center group">
              <span className="text-xl text-gray-100 group-hover:text-blue-300 transition-all duration-300">
                {localUser ? (
                  <div className="flex items-center space-x-2">
                    <span>Welcome, {localUser.firstName || "User"}</span>
                    <span className="text-sm text-gray-400">
                      (
                      {localUser.userType === "B2B sale"
                        ? "B2B Sales Representative"
                        : localUser.userType || "Regular User"}
                      )
                    </span>
                  </div>
                ) : (
                  "Package Maker Pluto Tours"
                )}
              </span>
            </Link>

            {/* Profile Section */}
            <div className="flex items-center space-x-6">
              {/* Search Button */}
              <button className="p-2 text-gray-300 hover:text-blue-300 rounded-lg hover:bg-gray-700/30 transition-all duration-200 backdrop-blur-sm">
                <FaSearch className="w-5 h-5" />
              </button>

              <div className="relative">
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="cursor-pointer"
                >
                  {localUser ? (
                    <div className="flex items-center space-x-3">
                      <span className="hidden md:block text-sm font-medium text-gray-300 group-hover:text-blue-300 transition-all duration-200">
                        {localUser.name || "User"}
                      </span>
                      <div className="relative">
                        {localUser.avatar ? (
                          <img
                            className="w-10 h-10 rounded-lg object-cover ring-2 ring-gray-700/30 group-hover:ring-blue-500/50 transition-all duration-200"
                            src={localUser.avatar}
                            alt="Profile"
                            onError={(e) => {
                              e.target.src = defaultAvatar;
                              e.target.onerror = null;
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-700/30 ring-2 ring-gray-700/30 group-hover:ring-blue-500/50 transition-all duration-200 flex items-center justify-center backdrop-blur-sm">
                            <FaUserCircle className="w-6 h-6 text-gray-300 group-hover:text-blue-300" />
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1a1b2e]"></div>
                      </div>
                    </div>
                  ) : (
                    <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-100 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 hover:text-blue-300 transition-all duration-200 backdrop-blur-sm">
                      <FaUserCircle className="w-5 h-5" />
                      <span>Sign in</span>
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#2d2d44] rounded-lg shadow-lg py-1 z-50">
                    {localUser ? (
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/30 hover:text-blue-300 text-left"
                      >
                        Logout
                      </button>
                    ) : (
                      <Link
                        to="/signin"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/30 hover:text-blue-300"
                        onClick={() => setShowDropdown(false)}
                      >
                        Sign in
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
