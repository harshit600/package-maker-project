// components/Places.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import config from "../../config";
import { Icons } from '../icons/index';
import Table from './ui-kit/molecules/Table';
import Button from "../components/ui-kit/atoms/Button"

const { EditIcon, DeleteIcon, ArrowLeftIcon } = Icons;


const Places = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showEditPlaceModal, setShowEditPlaceModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [newPlace, setNewPlace] = useState({
    placeName: "",
    enabled: true,
    cost: {
      Sedan: "",
      SUV: "",
      Traveller: "",
    },
    time: 0,
    imageUrls: [],
    distance: 0,
    description: "",
    city: "",
    stateName: "",
    country: "",
    paid: false,
    price: 0,
  });

  const handlePaidChange = (e) => {
    const value = e.target.checked;
    setNewPlace({ ...newPlace, paid: value });
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setNewPlace({ ...newPlace, price: value });
  };

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);

  const handleImageChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleImageUpload = () => {
    if (files.length > 0 && files.length + newPlace.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(null);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setNewPlace({
            ...newPlace,
            imageUrls: newPlace.imageUrls.concat(urls),
          });
          setImageUploadError(null);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 MB max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/places/getplaces/${params?.country}/${params?.state}/${params?.city}`
      );
      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  const handleAddPlace = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/places/addplace/${params?.country}/${params?.state}/${params?.city}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPlace),
        }
      );

      if (response.ok) {
        const addedPlace = await response.json();
        setPlaces((prevPlaces) => [...prevPlaces, addedPlace]);
        setNewPlace({
          placeName: "",
          enabled: true,
          cost: { Sedan: "", SUV: "", Traveller: "" },
          time: 0,
          imageUrls: [],
          distance: 0,
          description: "",
          paid: false,
          price: 0,
        });
        alert("Place added successfully!");
        setShowAddPlaceModal(false);
      } else {
        alert("Failed to add place. Please try again.");
      }
    } catch (error) {
      console.error("Error adding place:", error);
      alert("An error occurred while adding the place.");
    }
  };

  useEffect(() => {
    setNewPlace({
      ...newPlace,
      city: params?.city,
      stateName: params?.state,
      country: params?.country,
    });
  }, [params]);

  const handleEditPlace = (placeId) => {
    const placeToEdit = places.find((place) => place._id === placeId);
    setShowEditPlaceModal(true);
    setSelectedPlace({
      ...placeToEdit,
      cost: {
        Sedan: placeToEdit.cost.Sedan,
        SUV: placeToEdit.cost.SUV,
        Traveller: placeToEdit.cost.Traveller,
      },
    });
  };

  const handleUpdatePlace = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/places/edit/${params?.country}/${params?.state}/${params?.city}/${selectedPlace?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedPlace),
        }
      );

      if (response.ok) {
        const updatedPlace = await response.json();
        setPlaces((prevPlaces) =>
          prevPlaces.map((place) =>
            place._id === updatedPlace._id ? updatedPlace : place
          )
        );
        setShowEditPlaceModal(false);
        alert("Place updated successfully!");
      } else {
        alert("Failed to update place. Please try again.");
      }
    } catch (error) {
      console.error("Error updating place:", error);
      alert("An error occurred while updating the place.");
    }
  };

  const handleDeletePlace = (placeId) => {
    const placeToDelete = places.find((place) => place._id === placeId);
    setPlaceToDelete(placeToDelete);
    setShowDeleteConfirmationModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/places/delete/${placeToDelete?._id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setPlaces((prevPlaces) =>
          prevPlaces.filter((place) => place._id !== placeToDelete?._id)
        );
        setShowDeleteConfirmationModal(false);
        alert("Place deleted successfully!");
      } else {
        alert("Failed to delete place. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting place:", error);
      alert("An error occurred while deleting the place.");
    }
  };

  const renderRow = (place) => (
    <>
      <td className="px-2 py-4">{place.placeName}</td>
      <td className="px-2 py-4">{place.city}</td>
      <td className="px-2 py-4">{place.stateName}</td>
      <td className="px-2 py-4">{place.cost.Sedan}</td>
      <td className="px-2 py-4">{place.cost.SUV}</td>
      <td className="px-2 py-4">{place.cost.Traveller}</td>
    </>
  );

  const renderActions = (place) => (
    <div className="flex gap-4">
      <span className="cursor-pointer"  onClick={() => handleEditPlace(place._id)}><EditIcon /></span>
      <span className="cursor-pointer"  onClick={() => handleDeletePlace(place._id)}><DeleteIcon/></span>
    </div>
  );

  return (
    <div className="container destcontainer">
      <div className="text-3xl text-center">
        Places in {params?.city}
      </div>
      <div className="flex justify-end mb-4">
      <Button variant="shade" text="+ Place" onClick={() => setShowAddPlaceModal(true)} />
      </div>
      <Table
        headers={[
          "Place Name",
          "City",
          "State",
          "Cost (Sedan)",
          "Cost (SUV)",
          "Cost (Traveller)",
          "Actions",
        ]}
        data={places}
        renderRow={renderRow}
        renderActions={renderActions}
      />

      {/* Add Place Modal */}
      <Modal show={showAddPlaceModal} onHide={() => setShowAddPlaceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Place</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>Place Name:</label>
            <input
              type="text"
              value={newPlace.placeName}
              onChange={(e) =>
                setNewPlace({ ...newPlace, placeName: e.target.value })
              }
              required
            />
            <label>Description:</label>
            <textarea
              value={newPlace.description}
              onChange={(e) =>
                setNewPlace({ ...newPlace, description: e.target.value })
              }
              required
            />
            <label>Cost (Sedan):</label>
            <input
              type="text"
              value={newPlace.cost.Sedan}
              onChange={(e) =>
                setNewPlace({
                  ...newPlace,
                  cost: { ...newPlace.cost, Sedan: e.target.value },
                })
              }
              required
            />
            <label>Cost (SUV):</label>
            <input
              type="text"
              value={newPlace.cost.SUV}
              onChange={(e) =>
                setNewPlace({
                  ...newPlace,
                  cost: { ...newPlace.cost, SUV: e.target.value },
                })
              }
              required
            />
            <label>Cost (Traveller):</label>
            <input
              type="text"
              value={newPlace.cost.Traveller}
              onChange={(e) =>
                setNewPlace({
                  ...newPlace,
                  cost: { ...newPlace.cost, Traveller: e.target.value },
                })
              }
              required
            />
            <label>Upload Images:</label>
            <input type="file" multiple onChange={handleImageChange} />
            <Button onClick={handleImageUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Images"}
            </Button>
            {imageUploadError && <p>{imageUploadError}</p>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddPlaceModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddPlace}>
            Add Place
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Place Modal */}
      <Modal show={showEditPlaceModal} onHide={() => setShowEditPlaceModal(false)} className="rounded-lg">
  <Modal.Header closeButton className="bg-gray-200 text-gray-700">
    <Modal.Title className="text-lg font-semibold">Edit Place</Modal.Title>
  </Modal.Header>
  <Modal.Body className="p-6">
    {selectedPlace && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Place Name:</label>
          <input
            type="text"
            value={selectedPlace.placeName}
            onChange={(e) =>
              setSelectedPlace({ ...selectedPlace, placeName: e.target.value })
            }
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description:</label>
          <textarea
            value={selectedPlace.description}
            onChange={(e) =>
              setSelectedPlace({ ...selectedPlace, description: e.target.value })
            }
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-400"
            rows="4"
          />
        </div>
        <div className="flex gap-2">
          <div><label className="block text-sm font-medium text-gray-700">Cost (Sedan):</label>
          <input
            type="text"
            value={selectedPlace.cost.Sedan}
            onChange={(e) =>
              setSelectedPlace({
                ...selectedPlace,
                cost: { ...selectedPlace.cost, Sedan: e.target.value },
              })
            }
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-400"
          /></div>
           <div>
          <label className="block text-sm font-medium text-gray-700">Cost (SUV):</label>
          <input
            type="text"
            value={selectedPlace.cost.SUV}
            onChange={(e) =>
              setSelectedPlace({
                ...selectedPlace,
                cost: { ...selectedPlace.cost, SUV: e.target.value },
              })
            }
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost (Traveller):</label>
          <input
            type="text"
            value={selectedPlace.cost.Traveller}
            onChange={(e) =>
              setSelectedPlace({
                ...selectedPlace,
                cost: { ...selectedPlace.cost, Traveller: e.target.value },
              })
            }
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-400"
          />
        </div>
        </div>
       
      </div>
    )}
  </Modal.Body>
  <Modal.Footer className="flex justify-end gap-2">
    <Button variant="shade" text="close" onClick={() => setShowEditPlaceModal(false)} className="bg-gray-300 hover:bg-gray-400" />
    
    <Button variant="primary" text="save" onClick={handleUpdatePlace} className="bg-blue-600 hover:bg-blue-700 text-white" />
    
  </Modal.Footer>
</Modal>


      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirmationModal} onHide={() => setShowDeleteConfirmationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the place "{placeToDelete?.placeName}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmationModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Places;
