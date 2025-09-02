import React, { useEffect } from "react";
import { Typography, Checkbox } from "@material-tailwind/react";

export default function Step2({ formData, setFormData }) {
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  return (
    <>
      <div className="px-2 ">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          Property Location Details
        </Typography>
        <Typography variant="body2" color="gray" className="mb-4">
          Please fill in the location details of your property.
        </Typography>

        <div
          style={{
            backgroundColor: '#e8f0fe',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <i className="material-icons" style={{ marginRight: '8px' }}>info</i>
          <Typography variant="caption" color="blue-gray">
            To avoid rejection, please enter the address as per the registration or lease document.
          </Typography>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ flex: '1', maxWidth: '40%' }}>
            <input
              type="text"
              name="search"
              placeholder="Search here"
              value={formData.location?.search || ""}
              onChange={handleChange}
              style={{
                padding: '10px',
                width: '100%',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <a href="#" style={{ color: '#1976D2', textDecoration: 'none', display: 'block', marginBottom: '16px' }}>
              Or Use My Current Location
            </a>

            <input
              type="text"
              name="address"
              placeholder="House/Building/Apartment No."
              value={formData.location?.address || ""}
              onChange={handleChange}
              style={{
                padding: '10px',
                width: '100%',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <input
              type="text"
              name="locality"
              placeholder="Locality/Area/Street/Sector"
              value={formData.location?.locality || ""}
              onChange={handleChange}
              style={{
                padding: '10px',
                width: '100%',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                name="pincode"
                placeholder="Enter Pincode"
                value={formData.location?.pincode || ""}
                onChange={handleChange}
                style={{
                  padding: '10px',
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.location?.country || ""}
                onChange={handleChange}
                style={{
                  padding: '10px',
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>

            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.location?.state || ""}
              onChange={handleChange}
              style={{
                padding: '10px',
                width: '100%',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.location?.city || ""}
              onChange={handleChange}
              style={{
                padding: '10px',
                width: '100%',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ flex: '1', maxWidth: '60%' }}>
            <div style={{ width: '100%', height: '400px' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14009.489134301046!2d77.030717!3d28.6750347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0341af89a7a9%3A0x39e68a907e739a05!2sSadar%20bazar%20gurugram!5e0!3m2!1sen!2sin!4v1633015369562!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: '0' }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <Checkbox
        label="I agree to the terms and conditions and confirm the address provided here is as per the registration or lease document"
        name="agreeToTerms"
        checked={formData.location?.agreeToTerms || false}
        onChange={handleChange}
        containerProps={{ className: "mt-2" }}
      />
    </>
  );
}
