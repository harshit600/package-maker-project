import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import ListedProperites from "./components/hotelManager/ListedPoperties";
import StepperForm from "./components/hotelManager/StepperForm";
import InventoryUpdate from "./components/hotelManager/Inventory/InventoryUpdate";
import BulkUpdate from "./components/hotelManager/Inventory/BulkUpdate";
import { MaterialTailwindControllerProvider } from "./components/hotelManager/context";
import { AuthProvider } from "./components/hotelManager/context/AuthContext";
import Homee from "./components/hotelManager/homee";
import Property from "./components/hotelManager/property";
import { PackageProvider } from './context/PackageContext';
import MarginMaster from "./components/marginMaster";
import PackageApproval from "./components/PackageApproval";
import CabVendorDetails from "./components/cabVendor";
import PackageDownloadTracker from "./components/PacakageDownloadTracker";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { FinalcostingProvider } from "./context/FinalcostingContext";
import GlobalMaster from "./components/globalMaster";
import GlobalMasterData from "./components/globalMasterData";
import Dashboard from "./components/dashboard";
import { HotelManagerProvider } from "./context/HotelManagerContext";
import CrmLeads from "./components/crmLeads";
import AllLeadmanagement from "./components/leadManagement/allLeadmanagement";
import { LeadManagementProvider } from "./components/leadManagement/leadManagementContext";
import AddBank from "./components/bankManagement/addBank";
import BankList from "./components/bankManagement/bankList";
import BankReport from "./components/bankManagement/bankReport";
import { BankManagementProvider } from "./components/bankManagement/bankManagementContext";
import TransactionList from "./components/bankManagement/transactionList";
import ServiceReport from "./components/bankManagement/ServiceReport";
import ProfitLoss from "./components/bankManagement/profitLoss";
import OperationProfitLoss from "./components/bankManagement/operationProfit";
import HotelLedger from "./components/bankManagement/hotelLedger";
import TransportLedger from "./components/bankManagement/transportLedger";
import TeamLeaderApproval from "./components/teamLeaderApproval";
import SaleDashboard from "./components/SaleDashboard";
import GlobalNotification from "./components/GlobalNotification";
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <LeadManagementProvider>
        <BankManagementProvider>
        <HotelManagerProvider>
        <FinalcostingProvider>
          <MaterialTailwindControllerProvider>
            <CabProvider>
              <BrowserRouter>
                <AuthProvider>
                  <Header />
                  <GlobalNotification />
                  <ToastContainer />
                  <div
                    className="flex"
                    style={{ height: "calc(100vh - 70px)", overflow: "scroll" }}
                  >
                    <SideBar />
                    <div className="flex-1 rounded  border-red-100 bottom-2">
                      {" "}
                      {/* Main content area */}
                      <PackageProvider>
                        <Routes>
                          <Route path="/crm-leads" element={<CrmLeads />} />
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
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/create-itenary" element={<CreateItenary />} />
                            <Route path="/global-master" element={<GlobalMaster />} />
                            <Route path="/global-master-data" element={<GlobalMasterData />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/create-listing" element={<CreateListing />} />
                            <Route path="/create-package" element={<CreatePackage />} />
                            <Route path="/create-package/:packageId" element={<CreatePackage />} />
                            <Route path="/packages" element={<Packages />} />
                            <Route path="/cabmanager" element={<Cabmanager />} />
                            <Route
                              path="/property/:hotelName/:hotelId"
                              element={<InventoryUpdate />}
                            />
                            <Route
                              path="/update/:hotelName/:hotelId"
                              element={<StepperForm />}
                            />{" "}
                            <Route path="/property" element={<Property />} />
                            <Route
                              path="/onboarding/:hotelType"
                              element={<StepperForm />}
                            />
                            <Route
                              path="/bulkupdate/:hotelName/:hotelId"
                              element={<BulkUpdate />}
                            />
                            <Route
                              path="/createActivities"
                              element={<CreateActivities />}
                            />
                            <Route path="/hotel-manager" element={<Homee />} />
                            <Route path="/add-user" element={<AddUser />} />
                            <Route path="/user-list" element={<UserList />} />
                            <Route path="/user-profile" element={<UserProfile />} />
                            <Route path="/leads" element={<Leads />} />
                            <Route path="/all-leads" element={<AllLeads />} />
                            <Route path="/all-leads-admin" element={<AllLeadmanagement />} />
                            <Route path="/package-approval" element={<PackageApproval />} />
                            <Route path="//package-approve" element={<TeamLeaderApproval />} />
                            <Route path="/margin-master" element={<MarginMaster />} />
                            <Route path="/cab-vendor-details" element={<CabVendorDetails />} />
                            <Route path="/package-download-tracker" element={<PackageDownloadTracker />} />
                            <Route path="/add-bank" element={<AddBank />} />
                            <Route path="/bank-list" element={<BankList />} />
                            <Route path="/bank-report" element={<BankReport />} />
                            <Route path="/transaction-list" element={<TransactionList />} />
                            <Route path="/Service-report" element={<ServiceReport />} />
                            <Route path="/profit-loss-report" element={<ProfitLoss />} />
                            <Route path="/operation-profit-loss" element={<OperationProfitLoss />} />
                            <Route path="/hotel-ledger" element={<HotelLedger />} />
                            <Route path="/transport-ledger" element={<TransportLedger />} />
                            <Route path="/sale-dashboard" element={<SaleDashboard />} />
                          </Route>
                          <Route path="/about" element={<About />} />
                        </Routes>
                      </PackageProvider>
                    </div>
                  </div>
                </AuthProvider>
              </BrowserRouter>
            </CabProvider>
            </MaterialTailwindControllerProvider>
          </FinalcostingProvider>
          </HotelManagerProvider>
          </BankManagementProvider>
          </LeadManagementProvider>
          </PersistGate>
    </Provider>
  );
}
