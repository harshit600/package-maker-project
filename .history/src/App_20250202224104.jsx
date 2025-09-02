import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import About from "./pages/About";
import SignIn from "./components/SignIn";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import PrivateRoutes from "./components/PrivateRoutes";
import CreateListing from "./pages/createListing";
import Destinations from "./pages/Destinations";
import CreatePackage from "./pages/CreatePackage";
import CountryStates from "./components/CountryStates";
import StatesCities from "./components/StatesCities";
import CitiesPlaces from "./components/CitiesPlaces";
import CreateItenary from "./pages/CreateItenary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "./components/SideBar";
import Packages from "./pages/Packages";
import Cabmanager from "./pages/cabmanager";
import CreateActivities from "./pages/createActivities";
import { CabProvider } from "./context/CabContext";
import AddUser from "./components/AddUser";
import UserList from "./components/userList";
import UserProfile from "./components/UserProfile";
import Leads from "./components/Leads";
import AllLeads from "./components/AllLeads";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <CabProvider>
      <BrowserRouter>
        <Header />
        <ToastContainer />
        <div
          className="flex"
          style={{ height: "calc(100vh - 70px)", overflow: "scroll" }}
        >
          <SideBar />
          <div className="flex-1 rounded  border-red-100 bottom-2">
            {" "}
            {/* Main content area */}
            <Routes>
              <Route path="/" element={<Navigate to="/signin" replace />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route element={<PrivateRoutes />}>
                <Route path="/destinations" element={<Destinations />} />
                <Route
                  path="/destinations/:country"
                  element={<CountryStates />}
                />
                <Route
                  path="/destinations/:country/:state"
                  element={<StatesCities />}
                />
                <Route
                  path="/destinations/:country/:state/:city"
                  element={<CitiesPlaces />}
                />
                <Route path="/create-itenary" element={<CreateItenary />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/create-package" element={<CreatePackage />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/cabmanager" element={<Cabmanager />} />
                <Route
                  path="/createActivities"
                  element={<CreateActivities />}
                />
                <Route path="/add-user" element={<AddUser />} />
                <Route path="/user-list" element={<UserList />} />
                <Route path="/user-profile" element={<UserProfile />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/all-leads" element={<AllLeads />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </CabProvider>
  );
}
