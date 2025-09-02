import { FaSearch, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { signOut } from "../redux/user/userSlice"; // Make sure this path matches your Redux slice location

export default function Header() {
  const { currentUser } = useSelector((state) => state.user); // Fetch current user from Redux store
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      dispatch(signOut());
      navigate("/signin");
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="w-full bg-[#2d2d44] shadow-lg">
      <div className="bg-white/5 backdrop-blur-sm">
        <nav className="px-4 py-3">
          <div className="flex items-center justify-between max-w-[90vw] mx-auto">
            {/* Logo Section */}
            <Link to="/" className="flex items-center group">
              <span className="text-xl text-gray-100 group-hover:text-blue-300 transition-all duration-300">
                {currentUser ? (
                  <div className="flex items-center space-x-2">
                    <span>
                      Welcome,{" "}
                      {`${currentUser.firstName || ""} ${
                        currentUser.lastName || ""
                      }`.trim() || "User"}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({currentUser.userType || "Regular User"})
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

              <div className="flex items-center space-x-3">
                {currentUser ? (
                  <>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-blue-300 transition-all duration-200">
                      {currentUser.firstName || currentUser.name || "User"}
                    </span>
                    <div className="relative">
                      {currentUser.avatar ? (
                        <img
                          className="w-10 h-10 rounded-lg object-cover ring-2 ring-gray-700/30 group-hover:ring-blue-500/50 transition-all duration-200"
                          src={currentUser.avatar}
                          alt="Profile"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-700/30 ring-2 ring-gray-700/30 group-hover:ring-blue-500/50 transition-all duration-200 flex items-center justify-center backdrop-blur-sm">
                          <FaUserCircle className="w-6 h-6 text-gray-300 group-hover:text-blue-300" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1a1b2e]"></div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-100 bg-[rgb(59,130,246,0.2)] rounded-lg hover:bg-[rgb(59,130,246,0.3)] hover:text-blue-300 transition-all duration-200 backdrop-blur-sm"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signin"
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-100 bg-[rgb(59,130,246,0.2)] rounded-lg hover:bg-[rgb(59,130,246,0.3)] hover:text-blue-300 transition-all duration-200 backdrop-blur-sm"
                  >
                    <FaUserCircle className="w-5 h-5" />
                    <span>Sign in</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
