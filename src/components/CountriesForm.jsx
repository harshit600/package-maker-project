import React from "react";
import { Modal, Button } from "react-bootstrap";

const CountriesForm = ({ formData, setFormData, onSubmit }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      <label>
        Country:
        <input
          type="text"
          name="countryName"
          value={formData.countryName}
          onChange={handleChange}
          required
        />
      </label>
      {/* <Button variant="primary" type="submit">
        Save
      </Button> */}
    </form>
  );
};

export default CountriesForm;
