import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "../components/Destinations.css";
import { useNavigate } from 'react-router-dom';
import config from '../../config';

const CountryStates = () => {
  const params = useParams();
  const [states, setStates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${config.API_HOST}/api/states/getstates/${params?.country}`)
      .then(response => response.json())
      .then(data => setStates(data))
      .catch(error => console.error('Error fetching states:', error));
  }, [params?.country]);

  const handleAddState = async () => {
    const stateName = prompt("Enter the name of the new state:");
    if (stateName) {
      try {
        const response = await fetch(`${config.API_HOST}/api/states/createstate/${params?.country}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stateName }),
        });

        const newState = await response.json();
        setStates((prevStates) => [...prevStates, newState]);
      } catch (error) {
        console.error('Error adding state:', error);
      }
    }
  };

  const handleEdit = (state) => {
    const newStateName = prompt('Enter the new state name:', state.stateName);
    if (newStateName !== null) {
      editState(state._id, newStateName);
    }
  }

  const handleDelete = (stateId) => {
    if (window.confirm('Are you sure you want to delete this state?')) {
      deleteState(stateId);
    }
  }

  const editState = async (stateId, newStateName) => {
    try {
      const response = await fetch(`${config.API_HOST}/api/states/edit/${stateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stateName: newStateName }),
      });

      if (response.ok) {
        const updatedStates = states.map(state =>
          state._id === stateId ? { ...state, stateName: newStateName } : state
        );

        setStates(updatedStates);
      } else {
        console.error('Error editing state:', response.statusText);
      }
    } catch (error) {
      console.error('Error editing state:', error);
    }
  };

  const deleteState = async (stateId) => {
    try {
      const response = await fetch(`${config.API_HOST}/api/states/delete/${stateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedStates = states.filter(state => state._id !== stateId);
        setStates(updatedStates);
      } else {
        console.error('Error deleting state:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting state:', error);
    }
  };

  const handleCities = (state) => {
    navigate(`/destinations/${params?.country}/${state.replace(" ","-").toLowerCase()}`);
  }

  const handleBack = () => {
    navigate(-1); // This will go back to the previous page in the history stack
  };

  return (
    <div className="container">
      <h1 className='destinationheading'>{params?.country} States</h1>
      <div className='addstate'>
      <button className="btn btn-primary text-white" onClick={handleBack}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
</svg>
      </button>
      <button className="btn btn-primary text-white" onClick={handleAddState}>
          Add State
        </button>
      </div>
      <div className='stateslist'>
        <div className='statesadded'>
          <h2>States Added</h2>
        </div>
        <table className='table table-bordered table-striped mt-5'>
          <thead>
            <tr>
              <th>State Name</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.map(state => (
              <tr key={state._id}>
                <td>{state.stateName}</td>
                <td className="text-end">
                  <button className='btn btn-info me-2 text-white' onClick={() => handleEdit(state)}> <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-pencil-square"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                      <path
                        fillRule="evenodd"
                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                      />
                    </svg></button>
                  <button className='btn btn-danger me-2 text-white' onClick={() => handleDelete(state._id)}> <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-trash3-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                    </svg></button>
                  <button className='btn btn-primary text-white' onClick={() => handleCities(state.stateName)}>Cities</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CountryStates;
