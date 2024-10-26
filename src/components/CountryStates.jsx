import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../../config';
import Table from '../components/ui-kit/molecules/Table';
import Button from '../components/ui-kit/atoms/Button';
import { Icons } from '../icons/index';

const { EditIcon, DeleteIcon, ArrowLeftIcon } = Icons;

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
  };

  const handleDelete = (stateId) => {
    if (window.confirm('Are you sure you want to delete this state?')) {
      deleteState(stateId);
    }
  };

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
    navigate(`/destinations/${params?.country}/${state.replace(" ", "-").toLowerCase()}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container destcontainer">
      <h1 className='destinationheading'>{params?.country} States</h1>
      <div className='addstate flex gap-2 mb-4'>
        <Button variant="secondary" onClick={handleBack} icon={<ArrowLeftIcon />} />
        <Button variant="shade" onClick={handleAddState} text="Add State" />
      </div>

      <Table
        headers={["State Name"]}
        data={states}
        renderRow={(state) => (
          <td className="px-2 py-4 font-medium text-gray-800">{state.stateName}</td>
        )}
        renderActions={(state) => (
             <div className="flex gap-4 justify-end items-center">
                <span className="cursor-pointer" onClick={() => handleEdit(state)}><EditIcon /></span>
                <span className="cursor-pointer" onClick={() => handleDelete(state._id)}><DeleteIcon /></span>
                <span className="cursor-pointer" onClick={() => handleCities(state.stateName)}>States</span>
              </div>
       
        )}
      />
    </div>
  );
};

export default CountryStates;
