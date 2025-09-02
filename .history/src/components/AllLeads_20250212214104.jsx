import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./AllLeads.css";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

const AllLeads = () => {
  // State declarations
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("leadDetails");
  const [availablePackages, setAvailablePackages] = useState([]);
  // ... other state declarations ...

  // Make sure to export the component
  return (
    // ... your existing JSX ...
  );
};

// Make sure to export the component
export default AllLeads;
