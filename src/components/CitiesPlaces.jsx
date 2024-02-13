import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import config from "../../config";

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
    paid: false, // New field
    price: 0, // New field
  });

  // Function to handle changes in the 'paid' field
  const handlePaidChange = (e) => {
    const value = e.target.checked;
    setNewPlace({ ...newPlace, paid: value });
  };

  // Function to handle changes in the 'price' field
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setNewPlace({ ...newPlace, price: value });
  };

  const [files, setFiles] = useState([]); // Added files state
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
    // Fetch places when the component mounts
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
        });
        alert("Place added successfully!");
        setShowAddPlaceModal(false); // Close the modal after adding a place
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
  }, [params?.city, params?.state, params?.country]);

  const handleEditPlace = async (placeId) => {
    // Fetch the place details for editing
    const placeToEdit = places.find((place) => place._id === placeId);

    // Open the modal for editing
    setShowEditPlaceModal(true);

    // Set the values in the edit form
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
        // router.put('/edit/:country/:state/:city/:placeId', editPlace);
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

  return (
    <div className="container">
      <h1 className="destinationheading">
        {params?.city.replace("-", " ").toUpperCase()} Places
      </h1>
      <div className="addstate">
        <button
          className="btn btn-primary text-white"
          onClick={() => navigate(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-arrow-left"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
            />
          </svg>
        </button>
        <button
          className="btn btn-primary text-white"
          onClick={() => setShowAddPlaceModal(true)}
        >
          Add Place
        </button>
      </div>
      <Modal
        show={showAddPlaceModal}
        onHide={() => setShowAddPlaceModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Place</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            {/* Place Name */}
            <div className="col-md-6 mb-3">
              <label htmlFor="placeName" className="form-label">
                Place Name
              </label>
              <input
                type="text"
                className="form-control"
                id="placeName"
                value={newPlace.placeName}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, placeName: e.target.value })
                }
              />
            </div>
            {/* Description */}
            <div className="col-md-6 mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                value={newPlace.description}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="row">
            {/* Cost for Sedan */}
            <div className="col-md-4 mb-3">
              <label htmlFor="costSedan" className="form-label">
                Cost (Sedan)
              </label>
              <input
                type="text"
                className="form-control"
                id="costSedan"
                value={newPlace.cost.Sedan}
                onChange={(e) =>
                  setNewPlace({
                    ...newPlace,
                    cost: { ...newPlace.cost, Sedan: e.target.value },
                  })
                }
              />
            </div>
            {/* Cost for SUV */}
            <div className="col-md-4 mb-3">
              <label htmlFor="costSUV" className="form-label">
                Cost (SUV)
              </label>
              <input
                type="text"
                className="form-control"
                id="costSUV"
                value={newPlace.cost.SUV}
                onChange={(e) =>
                  setNewPlace({
                    ...newPlace,
                    cost: { ...newPlace.cost, SUV: e.target.value },
                  })
                }
              />
            </div>
            {/* Cost for Traveller */}
            <div className="col-md-4 mb-3">
              <label htmlFor="costTraveller" className="form-label">
                Cost (Traveller)
              </label>
              <input
                type="text"
                className="form-control"
                id="costTraveller"
                value={newPlace.cost.Traveller}
                onChange={(e) =>
                  setNewPlace({
                    ...newPlace,
                    cost: { ...newPlace.cost, Traveller: e.target.value },
                  })
                }
              />
            </div>
          </div>
          {/* Paid */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="paid"
              checked={newPlace.paid}
              onChange={handlePaidChange}
            />
            <label className="form-check-label" htmlFor="paid">
              Paid
            </label>
          </div>

          {/* Price */}
          {newPlace.paid && (
            <div className="mb-3">
              <label htmlFor="price" className="form-label">
                Price
              </label>
              <input
                type="number"
                className="form-control"
                id="price"
                value={newPlace.price}
                onChange={handlePriceChange}
              />
            </div>
          )}
          <div className="row">
            {/* Image URLs */}
            <div className="mb-3">
              <label htmlFor="image" className="form-label">
                Upload Images
              </label>
              <input
                type="file"
                className="form-control"
                id="image"
                onChange={handleImageChange}
                multiple
              />
            </div>
            <button className="btn btn-primary text-white w-50 mx-auto mt-2 mb-4" onClick={handleImageUpload}>
              Upload Images
            </button>
          </div>
          <div className="row">
            {/* Distance */}
            <div className="col-md-6 mb-3">
              <label htmlFor="distance" className="form-label">
                Distance
              </label>
              <input
                type="number"
                className="form-control"
                id="distance"
                value={newPlace.distance}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, distance: e.target.value })
                }
              />
            </div>
            {/* Enabled */}
            <div className="col-md-6 mb-3">
              <label htmlFor="enabled" className="form-label">
                Enabled
              </label>
              <select
                className="form-select"
                id="enabled"
                value={newPlace.enabled}
                onChange={(e) =>
                  setNewPlace({
                    ...newPlace,
                    enabled: e.target.value === "true",
                  })
                }
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddPlaceModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleAddPlace}>
            Add Place
          </Button>
        </Modal.Footer>
      </Modal>
     {/* Edit Place Modal */}
<Modal
  show={showEditPlaceModal}
  onHide={() => setShowEditPlaceModal(false)}
>
  <Modal.Header closeButton>
    <Modal.Title>Edit Place</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="row">
      {/* Place Name */}
      <div className="col-md-6 mb-3">
        <label htmlFor="editPlaceName" className="form-label">
          Place Name
        </label>
        <input
          type="text"
          className="form-control"
          id="editPlaceName"
          value={selectedPlace?.placeName}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              placeName: e.target.value,
            })
          }
        />
      </div>
      {/* Description */}
      <div className="col-md-6 mb-3">
        <label htmlFor="editDescription" className="form-label">
          Description
        </label>
        <textarea
          className="form-control"
          id="editDescription"
          value={selectedPlace?.description}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              description: e.target.value,
            })
          }
        />
      </div>
    </div>
    <div className="row">
      {/* Cost */}
      <div className="col-md-4 mb-3">
        <label htmlFor="editCostSedan" className="form-label">
          Cost (Sedan)
        </label>
        <input
          type="text"
          className="form-control"
          id="editCostSedan"
          value={selectedPlace?.cost.Sedan}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              cost: { ...selectedPlace.cost, Sedan: e.target.value },
            })
          }
        />
      </div>
      {/* Cost for SUV */}
      <div className="col-md-4 mb-3">
        <label htmlFor="editCostSUV" className="form-label">
          Cost (SUV)
        </label>
        <input
          type="text"
          className="form-control"
          id="editCostSUV"
          value={selectedPlace?.cost.SUV}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              cost: { ...selectedPlace.cost, SUV: e.target.value },
            })
          }
        />
      </div>
      {/* Cost for Traveller */}
      <div className="col-md-4 mb-3">
        <label htmlFor="editCostTraveller" className="form-label">
          Cost (Traveller)
        </label>
        <input
          type="text"
          className="form-control"
          id="editCostTraveller"
          value={selectedPlace?.cost.Traveller}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              cost: { ...selectedPlace.cost, Traveller: e.target.value },
            })
          }
        />
      </div>
      {/* Time */}
      <div className="col-md-6 mb-3">
        <label htmlFor="editTime" className="form-label">
          Time
        </label>
        <input
          type="number"
          className="form-control"
          id="editTime"
          value={selectedPlace?.time}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              time: e.target.value,
            })
          }
        />
      </div>
    </div>
    <div className="row">
      {/* Image URLs */}
      <div className="mb-3">
        <label htmlFor="editImage" className="form-label">
          Upload Images
        </label>
        <input
          type="file"
          className="form-control"
          id="editImage"
          onChange={handleImageChange}
          multiple
        />
      </div>
      <Button variant="primary" onClick={handleImageUpload}>
        Upload Images
      </Button>
    </div>
    <div className="row">
      {/* Distance */}
      <div className="col-md-6 mb-3">
        <label htmlFor="editDistance" className="form-label">
          Distance
        </label>
        <input
          type="number"
          className="form-control"
          id="editDistance"
          value={selectedPlace?.distance}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              distance: e.target.value,
            })
          }
        />
      </div>
      {/* Enabled */}
      <div className="col-md-6 mb-3">
        <label htmlFor="editEnabled" className="form-label">
          Enabled
        </label>
        <select
          className="form-select"
          id="editEnabled"
          value={selectedPlace?.enabled}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              enabled: e.target.value === "true",
            })
          }
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </div>
    </div>
    {/* Paid */}
    <div className="mb-3 form-check">
      <input
        type="checkbox"
        className="form-check-input"
        id="editPaid"
        checked={selectedPlace?.paid}
        onChange={(e) =>
          setSelectedPlace({
            ...selectedPlace,
            paid: e.target.checked,
          })
        }
      />
      <label className="form-check-label" htmlFor="editPaid">
        Paid
      </label>
    </div>
    {/* Price */}
    {selectedPlace?.paid && (
      <div className="mb-3">
        <label htmlFor="editPrice" className="form-label">
          Price
        </label>
        <input
          type="number"
          className="form-control"
          id="editPrice"
          value={selectedPlace?.price}
          onChange={(e) =>
            setSelectedPlace({
              ...selectedPlace,
              price: e.target.value,
            })
          }
        />
      </div>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button
      variant="secondary"
      onClick={() => setShowEditPlaceModal(false)}
    >
      Close
    </Button>
    <Button variant="primary" onClick={handleUpdatePlace}>
      Update Place
    </Button>
  </Modal.Footer>
</Modal>

      <Modal
        show={showDeleteConfirmationModal}
        onHide={() => setShowDeleteConfirmationModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Place</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {placeToDelete && (
            <p>
              Are you sure you want to delete the place "
              {placeToDelete.placeName}"?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirmationModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="placeslist">
        <div className="placesadded">
          <h2>Places</h2>
        </div>
        <table className="table table-bordered table-striped mt-5">
          <thead>
            <tr>
              <th>Place Name</th>
              {/* <th>Description</th> */}
              <th>Cost (Sedan)</th>
              <th>Cost (SUV)</th>
              <th>Cost (Traveller)</th>
              <th>Time (in mins)</th>
              <th>Distance (kms)</th>
              <th>Enabled</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {places.map((place) => (
              <tr key={place._id}>
                <td>{place.placeName}</td>
                {/* <td>{place.description}</td> */}
                <td>{place.cost.Sedan}</td>
                <td>{place.cost.SUV}</td>
                <td>{place.cost.Traveller}</td>
                <td>{place.time}</td>
                <td>{place.distance}</td>
                <td>
                  {/* Toggle switch for enabling/disabling */}
                  <select
                    className="form-select"
                    value={place.enabled}
                    onChange={(e) =>
                      handleToggleEnable(place._id, e.target.value)
                    }
                  >
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </td>
                <td className="text-end">
                  {/* ... (previous buttons) */}
                  <button
                    className="btn btn-info me-2 text-white"
                    onClick={() => handleEditPlace(place._id)}
                  >
                    <svg
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
                    </svg>
                  </button>
                  <button
                    className="btn btn-danger me-2 text-white"
                    onClick={() => handleDeletePlace(place._id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-trash3-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Places;
