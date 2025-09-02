// options.js

export const durationOptions = [
    { label: "Select Duration", value: "" },
    { label: "2D/1N", value: "2D/1N" },
    { label: "3D/2N", value: "3D/2N" },
    { label: "4D/3N", value: "4D/3N" },
    { label: "5D/4N", value: "5D/4N" },
    { label: "6D/5N", value: "6D/5N" },
    { label: "7D/6N", value: "7D/6N" },
    { label: "8D/7N", value: "8D/7N" },
    { label: "9D/8N", value: "9D/8N" },
    { label: "10D/9N", value: "10D/9N" },
    { label: "11D/10N", value: "11D/10N" },
    { label: "12D/11N", value: "12D/11N" },
    { label: "13D/12N", value: "13D/12N" },
    { label: "14D/13N", value: "14D/13N" },
    { label: "15D/14N", value: "15D/14N" },
    { label: "16D/15N", value: "16D/15N" },
    { label: "17D/16N", value: "17D/16N" },
    { label: "18D/17N", value: "18D/17N" },
    { label: "19D/18N", value: "19D/18N" },
    { label: "20D/19N", value: "20D/19N" },
    
    // Add more options as needed
  ];
  
  export const packageTypeOptions = [
    { label: "Select Type", value: "" },
    { label: "Family", value: "Family" },
    { label: "Friends", value: "Friends" },
    { label: "Honeymoon", value: "Honeymoon" },
    { label: "Corporate", value: "Corporate" },

  
    // Add more options...
  ];
  
  export const packageCategoryOptions = [
    { label: "Select Type", value: "" },
    { label: "Luxury", value: "Luxury" },
    { label: "Executive", value: "Executive" },
    // Add more options...
  ];
  
  export const statusOptions = [
    { label: "enabled", value: "enabled" },
    { label: "disabled", value: "disabled" },
  ];
  
  export const hotelCategoryOptions = [
    { label: "Select Hotel Category", value: "" },
    { label: "Standard", value: "Standard" },
    { label: "Deluxe", value: "Deluxe" },
    { label: "3 star", value: "3 star" },
    { label: "4 star", value: "4 star" },
    { label: "5 star", value: "5 star" },
  ];
  
  export const tourByOptions = [
    { label: "Select Tour By", value: "" },
    { label: "Volvo", value: "volvo" },
    { label: "Taxi/Cab", value: "taxi/cab" },
  ];
  
  export const agentPackageOptions = [
    { label: "Select Agent Package", value: "" },
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];
  
  export const amenitiesOptions = [
    "Meals",
    "Sightseeing",
    "Cab",
    "Hotel",
    "Wi-Fi",
    "Parking",
    "Breakfast",
    "Spa",
    "Pool",
    "Gym",
  ];
  
  export const TagOptions = [
    "Women Special",
    "Couple Friendly",
    "Family",
    "Friends",
    "Old Aged",
  ];
  
  export const themeOptions = [
    "Holiday",
    "Weekend",
    "Romantic",
    "Adventure",
  ];
  
  export const hotelPackageOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: '3star', label: '3 Star' },
    { value: '4star', label: '4 Star' },
    { value: '5star', label: '5 Star' },
  ];
  
  export const vehicleOptions = [
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'sedan', label: 'Sedan' },
    { value: 'sedan_premium', label: 'Sedan Premium' },
    { value: 'suv', label: 'SUV' },
    { value: 'suv_premium', label: 'SUV Premium' },
    { value: 'traveller', label: 'Traveller' },
  ];
  
  export const priceTagOptions = [
    { value: 'Per Person', label: 'Per Person' },
    { value: 'Family (4)', label: 'Family (4)' },
    { value: 'Couple', label: 'Couple' },
  ];
  // Add this to your existing exports
export const stateOptions = [
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" },
  { value: "andaman_and_nicobar_islands", label: "Andaman and Nicobar Islands" },
  { value: "chandigarh", label: "Chandigarh" },
  { value: "dadra_and_nagar_haveli", label: "Dadra and Nagar Haveli" },
  { value: "daman_and_diu", label: "Daman and Diu" },
  { value: "delhi", label: "Delhi" },
  { value: "jammu_and_kashmir", label: "Jammu and Kashmir" },
  { value: "ladakh", label: "Ladakh" },
  { value: "lakshadweep", label: "Lakshadweep" },
  { value: "puducherry", label: "Puducherry" }
];