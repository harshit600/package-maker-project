import React, { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SideBar from '../components/SideBar';
import config from '../../config';

const CreateDescription = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    cityname: '',
    description: '',
    address: '',
    thingToDo: [''], // Updated to store an array of "Things to Do"
    tourAttraction: [''],
    imageUrls: [],
    reviewsTitle: [''],
    reviewsDescription: [''],
  });

  console.log(formData);

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleThingToDoChange = (index, value) => {
    const newThingToDo = [...formData.thingToDo];
    newThingToDo[index] = value;
    setFormData({
      ...formData,
      thingToDo: newThingToDo,
    });
  };

  const addNewThingToDo = () => {
    setFormData({
      ...formData,
      thingToDo: [...formData.thingToDo, ''], // Add an empty string for a new "Thing to Do"
    });
  };


  const handleTourAttractionChange = (index, value) => {
    const newTourAttraction = [...formData.tourAttraction];
    newTourAttraction[index] = value;
    setFormData({
      ...formData,
      tourAttraction: newTourAttraction,
    });
  };

  const addNewTourAttraction = () => {
    setFormData({
      ...formData,
      tourAttraction: [...formData.tourAttraction, ''],
    });
  };

  const handleReviewsTitleChange = (index, value) => {
    const newReviewsTitle = [...formData.reviewsTitle];
    newReviewsTitle[index] = value;
    setFormData({
      ...formData,
      reviewsTitle: newReviewsTitle,
    });
  };

  const addNewReviewsTitle = () => {
    setFormData({
      ...formData,
      reviewsTitle: [...formData.reviewsTitle, ''],
    });
  };

  const handleReviewsDescriptionChange = (index, value) => {
    const newReviewsDescription = [...formData.reviewsDescription];
    newReviewsDescription[index] = value;
    setFormData({
      ...formData,
      reviewsDescription: newReviewsDescription,
    });
  };

  const addNewReviewsDescription = () => {
    setFormData({
      ...formData,
      reviewsDescription: [...formData.reviewsDescription, ''],
    });
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageSubmit = (e) => {
    console.log(files)
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
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
        'state_changed',
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`${config.API_HOST}/api/destination/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      setFormData({
        cityname: '',
        description: '',
        address: '',
        thingToDo: [''], // Updated to store an array of "Things to Do"
        tourAttraction: [''],
        imageUrls: [],
        reviewsTitle: [''],
        reviewsDescription: [''],
      })
      // navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className='leftside'>
        <SideBar />
      </div>
      <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Add a new Destination</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Destination Name
              </label>
              <input
                type="text"
                name="cityname"
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Type activity name"
                required=""
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                id="description"
                rows="8"
                name="description"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Your description here"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="w-full">
              <label htmlFor="brand" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Product brand"
                required=""
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            {formData.thingToDo.map((thing, index) => (
              <div key={index} className=" items-center mb-2">
                <label htmlFor="brand" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {`Add things to do (#${index + 1})`}
              </label>
              <div className='flex g-2'>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder={`Add new Thing`}
                  value={thing}
                  onChange={(e) => handleThingToDoChange(index, e.target.value)}
                />
                <button
              type="button"
              onClick={addNewThingToDo}
              className="text-primary-700 ml-2 bg-primary text-white pl-4 pr-4 rounded-lg cursor-pointer focus:outline-none"
            >
              +
            </button>
            </div>
              </div>
            ))}
             {formData.tourAttraction.map((attraction, index) => (
                <div key={index} className="mb-2">
                  <label
                    htmlFor="tourAttraction"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {`Tour Attraction (#${index + 1})`}
                  </label>
                  <div className='flex g-2'>
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder={`Add new Tour Attraction`}
                      value={attraction}
                      onChange={(e) => handleTourAttractionChange(index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addNewTourAttraction}
                      className="text-primary-700 ml-2 bg-primary text-white pl-4 pr-4 rounded-lg cursor-pointer focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              {/* ... (existing code) */}
              {formData.reviewsTitle.map((title, index) => (
                <div key={index} className="mb-2">
                  <label
                    htmlFor="reviewsTitle"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                   {`Review Title (#${index + 1})`}
                  </label>
                  <div className='flex g-2'>
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder={`Add new Review Title`}
                      value={title}
                      onChange={(e) => handleReviewsTitleChange(index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addNewReviewsTitle}
                      className="text-primary-700 ml-2 bg-primary text-white pl-4 pr-4 rounded-lg cursor-pointer focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              {/* ... (existing code) */}
              {formData.reviewsDescription.map((description, index) => (
                <div key={index} className="mb-2">
                  <label
                    htmlFor="reviewsDescription"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {`Review Description (#${index + 1})`}
                  </label>
                  <div className='flex g-2'>
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder={`Add new Review Description`}
                      value={description}
                      onChange={(e) => handleReviewsDescriptionChange(index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addNewReviewsDescription}
                      className="text-primary-700 ml-2 bg-primary text-white pl-4 pr-4 rounded-lg cursor-pointer focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <label className="block mb-4 mt-6 text-sm font-medium text-gray-900 dark:text-white" htmlFor="multiple_files">
            Upload multiple files
          </label>
          <input
            className="block w-full text-sm text-gray-900 p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="imageUrls"
            name="imageUrls"
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />

<button
              type='button'
              disabled={uploading}
              onClick={handleImageSubmit}
              className='p-3 mt-5 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            </div>
            <button
            type="submit"
            className="inline-flex bg-primary submitbtn items-center max-w-full w-screen text-center px-5 py-5 mt-4 sm:mt-6 text-sm font-medium justify-center text-white bg-secondary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
          >
            Add Destination
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateDescription;



// address: "1305, Tower E, ROF ALAAYAS, sector 102, gurugram";
// description: "Testing";
// discountedPrice: "2500";
// highlights: [("hi", "hello", "hiiii", "helooooo")];
// imageUrls: [
//   "https://firebasestorage.googleapis.com/v0/b/mern-e…=media&token=c749fd92-c137-4565-bb73-cfd6fd907332",
// ];
// name: "Digvijay Chauhan";
// offer: "Yes";
// packageType: "Domestic";
// quantity: "8";
// regularPrice: "3000";
// userRef: "";