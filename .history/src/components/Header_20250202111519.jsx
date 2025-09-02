import { FaSearch, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);

  // Default avatar URL - replace with your default image
  const defaultAvatar =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60";

  return (
    <header style={{ backgroundColor: "#2B6887" }} className="w-full">
      <div className="bg-white/10 backdrop-blur-sm">
        <nav className="px-2 py-2">
          <div className="flex items-center justify-between max-w-\[90vw\] mx-auto">
            {/* Logo Section */}
            <Link to="/" className="flex items-center group">
              <span className="text-2xl text-white group-hover:text-gray-100 transition-all duration-300">
                {currentUser ? `Welcome, ${currentUser.firstName || 'User'}` : 'Package Maker Pluto Tours'}
              </span>
            </Link>

            {/* Profile Section */}
            <div className="flex items-center space-x-6">
              {/* Search Button */}
              <button className="p-2.5 text-white/90 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200">
                <FaSearch className="w-5 h-5" />
              </button>

              <Link to="/profile" className="relative group">
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    <span className="hidden md:block text-sm font-medium text-white">
                      {currentUser.name || "User"}
                    </span>
                    <div className="relative">
                      {currentUser.avatar ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30 group-hover:ring-white/70 transition-all duration-200"
                          src={currentUser.avatar}
                          alt="Profile"
                          onError={(e) => {
                            e.target.src = defaultAvatar;
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 ring-2 ring-white/30 group-hover:ring-white/70 transition-all duration-200 flex items-center justify-center">
                          <FaUserCircle className="w-8 h-8 text-white/90" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white/90"></div>
                    </div>
                  </div>
                ) : (
                  <button className="flex items-center space-x-2 px-6 py-2.5 text-sm font-semibold text-indigo-600 bg-white rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-white/20">
                    <FaUserCircle className="w-5 h-5" />
                    <span>Sign in</span>
                  </button>
                )}
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
