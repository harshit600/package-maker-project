import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function HotelSideBar() {
    const { currentUser } = useSelector((state) => state.user);
    const [expandedMenu, setExpandedMenu] = useState(null);

    const handleMenuClick = (menuName) => {
        setExpandedMenu(expandedMenu === menuName ? null : menuName);
    };

    const isMenuExpanded = (menuName) => {
        return expandedMenu === menuName;
    };

    return (
        <aside id="logo-sidebar" className="fixed asidepluto top-0 left-0 z-12 w-64 h-screen pt-20 transition-transform -translate-x-full bg-gray-800 border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
            <div className="h-full px-3 pb-4 overflow-y-auto  dark:bg-gray-800">
                <ul className="space-y-2 font-medium">
                    <li>
                        <Link to="/" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                            </svg>
                            <span className="ms-3">Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <div className="flex flex-col">
                            <button onClick={() => handleMenuClick("ratesInventory")} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group focus:outline-none">
                                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Rates & Inventory</span>
                                <svg className={`w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 ${isMenuExpanded("ratesInventory") ? "transform rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            {isMenuExpanded("ratesInventory") && (
                                <ul className="pl-4">
                                    <li className='mt-3 mb-3'>
                                        <Link to="/managehotel/manage-rates" className="text-gray-900 text-xs dark:text-white hover:text-gray-700 dark:hover:text-gray-200">Manage Rates and Inventory</Link>
                                    </li>
                                   
                                </ul>
                            )}
                        </div>
                    </li>

                    <li>
                        <div className="flex flex-col">
                            <button onClick={() => handleMenuClick("property")} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group focus:outline-none">
                                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Property</span>
                                <svg className={`w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 ${isMenuExpanded("property") ? "transform rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            {isMenuExpanded("property") && (
                                <ul className="pl-4">
                                    <li className='mt-3 mb-3'>
                                        <Link to="/managehotel/basic-info" className="text-gray-900 text-xs dark:text-white hover:text-gray-700 dark:hover:text-gray-200">Basic Info</Link>
                                    </li>
                                    <li className='mt-3 mb-3'>
                                        <Link to="/managehotel/amenities-services" className="text-gray-900 text-xs dark:text-white hover:text-gray-700 dark:hover:text-gray-200">Amenities & Services</Link>
                                    </li>
                                    <li className='mt-3 mb-3'>
                                        <Link to="/managehotel/rooms" className="text-gray-900 dark:text-white text-xs hover:text-gray-700 dark:hover:text-gray-200">Rooms</Link>
                                    </li>
                                    <li className='mt-3 mb-3'>
                                        <Link to="/inclusions" className="text-gray-900 dark:text-white text-xs hover:text-gray-700 dark:hover:text-gray-200">Inclusions</Link>
                                    </li>
                                    <li className='mt-3 mb-3'>
                                        <Link to="/photos" className="text-gray-900 dark:text-white text-xs hover:text-gray-700 dark:hover:text-gray-200">Photos</Link>
                                    </li>
                                    <li className='mt-3 mb-3'>
                                        <Link to="/videos" className="text-gray-900 dark:text-white text-xs hover:text-gray-700 dark:hover:text-gray-200">Videos</Link>
                                    </li>
                                    <li className='mt-3 mb-3'>
                                        <Link to="/policies" className="text-gray-900 dark:text-white text-xs hover:text-gray-700 dark:hover:text-gray-200">Policies</Link>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </li>
                </ul>
            </div>
        </aside>
    )
}

export default HotelSideBar;
