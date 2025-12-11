import React, { createContext, useContext, useState, useEffect } from "react";
import config from "../../config";

const HotelManagerContext = createContext();

export const useHotelManager = () => useContext(HotelManagerContext);

export const HotelManagerProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalHotels, setTotalHotels] = useState(0);
const [propertiesbasicinfo, setPropertiesbasicinfo] = useState([]);
const [isLoadingbasicinfo, setIsLoadingbasicinfo] = useState(true);
const [totalHotelsbasicinfo, setTotalHotelsbasicinfo] = useState(0);
  useEffect(() => {
    // Fetch all properties only once
    const fetchAllProperties = async () => {
      setIsLoading(true);
      let allProperties = [];
      let currentPage = 1;
      let hasMorePages = true;
      let total = 0;

      while (hasMorePages) {
        const response = await fetch(
          `${config.API_HOST}/api/packagemaker/get-packagemaker?page=${currentPage}&limit=30`
        );
        const data = await response.json();

        if (data.success && data.data && Array.isArray(data.data)) {
          allProperties = [...allProperties, ...data.data];
          setProperties([...allProperties]); // <-- Update here after each page!
          if (data.pagination) {
            hasMorePages = data.pagination.hasNextPage;
            currentPage++;
            total = data.pagination.totalProperties;
          } else {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      }
      setTotalHotels(total || allProperties.length);
      setIsLoading(false);
    };

    fetchAllProperties();
  }, []);
  useEffect(() => {
    // Fetch all properties only once
    const fetchAllPropertiesbasicinfo = async () => {
      setIsLoadingbasicinfo(true);
      let allProperties = [];
      let currentPage = 1;
      let hasMorePages = true;
      let total = 0;

      while (hasMorePages) {
        const response = await fetch(
          `${config.API_HOST}/api/packagemaker//get-all-packagemaker-basic-info?page=${currentPage}&limit=200`
        );
        const data = await response.json();

        if (data.success && data.data && Array.isArray(data.data)) {
          allProperties = [...allProperties, ...data.data];
          setPropertiesbasicinfo([...allProperties]); // <-- Update here after each page!
          if (data.pagination) {
            hasMorePages = data.pagination.hasNextPage;
            currentPage++;
            total = data.pagination.totalProperties;
          } else {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      }
      setTotalHotelsbasicinfo(total || allProperties.length);
      setIsLoadingbasicinfo(false);
    };

    fetchAllPropertiesbasicinfo();
  }, []);

  return (
    <HotelManagerContext.Provider value={{ properties, isLoading, totalHotels, propertiesbasicinfo, isLoadingbasicinfo, totalHotelsbasicinfo }}>
      {children}
    </HotelManagerContext.Provider>
  );
};