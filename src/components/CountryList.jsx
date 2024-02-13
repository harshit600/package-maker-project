// CountryList.js

import React, { useState } from 'react';
import StateList from './StateList';

const CountryList = ({ countries, addCountry, setCountries }) => {
  const [newCountry, setNewCountry] = useState('');

  const handleAddCountry = () => {
    if (newCountry.trim() !== '') {
      addCountry(newCountry);
      setNewCountry('');
    }
  };

  const updateCountryStates = (countryIndex, newState) => {
    const updatedCountries = [...countries];
    updatedCountries[countryIndex].states.push(newState);
    setCountries(updatedCountries);
  };

  return (
    <div>
      <h2>Country List</h2>
      <ul>
        {countries.map((country, index) => (
          <li key={index}>
            {country.name}
            <StateList states={country.states} countryIndex={index} updateCountryStates={updateCountryStates} />
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          placeholder="Enter new country"
          value={newCountry}
          onChange={(e) => setNewCountry(e.target.value)}
        />
        <button onClick={handleAddCountry}>Add Country</button>
      </div>
    </div>
  );
};

export default CountryList;
