import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
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
import { ToastContainer } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "./components/SideBar";
import Packages from "./pages/Packages";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <ToastContainer />
      <div className="flex" style={{ height: 'calc(100vh - 70px)', overflow: 'scroll' }}>
        <SideBar /> 
        <div className="flex-1 rounded  border-red-100 bottom-2">
          {" "}
          {/* Main content area */}
          <Routes>
            <Route path="/" element={<Home />} />
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
              <Route path="/create-packages" element={<CreatePackage />} />
              <Route path="/packages" element={<Packages />} />
              
              
            </Route>
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
