import React, { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import DayPricesModal from "../components/DayPricesModal";

const ProductForm = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(null);
  const [dayPricesModalOpen, setDayPricesModalOpen] = useState(false);

  // ... (your existing functions)

  const openDayPricesModal = (index) => {
    setSelectedPackageIndex(index);
    setDayPricesModalOpen(true);
  };

  const closeDayPricesModal = () => {
    setSelectedPackageIndex(null);
    setDayPricesModalOpen(false);
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    packageOptions: [
      {
        packageType: "",
        dailyPrices: {},
      },
    ],

    quantity: "",
    offer: "",
    highlights: [""],
    imageUrls: [],
    userRef: "",  // Add these fields to your state
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [packageOptions, setPackageOptions] = useState([
    {
      packageType: "",
      quantity: 0,
      offer: "",
      dailyPrices: {},
    },
  ]);

  console.log(packageOptions);

  const handlePackageInputChange = (index, e) => {
    const { name, value } = e.target;
    setPackageOptions((prevPackageOptions) => {
      return prevPackageOptions.map((option, i) => {
        if (i === index) {
          return {
            ...option,
            [name]: value,
          };
        }
        return option;
      });
    });
  };

  const handlePackageDayPriceChange = (index, day, value) => {
    const updatedPackageOptions = [...packageOptions];
    updatedPackageOptions[index] = {
      ...updatedPackageOptions[index],
      dailyPrices: {
        ...updatedPackageOptions[index].dailyPrices,
        [day]: value,
      },
    };
    setPackageOptions(updatedPackageOptions);
  };

  const addPackageOption = () => {
    setPackageOptions((prevOptions) => [
      ...prevOptions,
      {
        packageType: "",
        dailyPrices: {},
      },
    ]);
  };

  const handleImageSubmit = (e) => {
    console.log(files);
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
          setImageUploadError("Image upload failed (2 mb max per image)");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name.startsWith("packageType")) {
      // Handle package type input
      const index = parseInt(name.split("-")[1], 10);
      setPackageOptions((prevPackageOptions) => {
        return prevPackageOptions.map((option, i) => {
          if (i === index) {
            return {
              ...option,
              packageType: value,
            };
          }
          return option;
        });
      });
    } else {
      // Handle other inputs
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  
  
  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData({
      ...formData,
      highlights: newHighlights,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");
      for (const option of packageOptions) {
        if (Object.keys(option.dailyPrices).length === 0) {
          return setError("Please set day prices for each package option");
        }
      }
      setLoading(true);
      setError(false);
      const res = await fetch("/api/activity/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
          packageOptions,
        }),
      });
      const data = await res.json();
      console.log(data);
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      } else {
        setFormData({
          name: "",
          description: "",
          address: "",
          dailyPrices: {},
          packageType: "",
          quantity: 0,
          offer: "",
          highlights: ["", "", "", ""],
          imageUrls: [],
          userRef: "",
        });
      }
      // navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDayPriceChange = (day, value) => {
    console.log("Before update:", formData.dailyPrices);

    setFormData((prevFormData) => ({
      ...prevFormData,
      dailyPrices: {
        ...prevFormData.dailyPrices,
        [day]: value,
      },
    }));

    console.log("After update:", formData.dailyPrices);
  };

  // console.log(fomData);

  const addHighlight = () => {
    setFormData({
      ...formData,
      highlights: [...formData.highlights, ""],
    });
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="leftside">
        <SideBar />
      </div>
      <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Add a new activity
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Activity Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Type activity name"
                required=""
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
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
            <div className="w-full sm:col-span-2">
              <label
                htmlFor="brand"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
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
            <div className="w-full sm:col-span-2">
              <section className="bg-white dark:bg-gray-900">
                {packageOptions.map((packageOption, index) => (
                  <div className="mt-4" key={index}>
                    <h3 className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Package Option {index + 1}
                    </h3>
                    {/* Input field for Package Type */}
                    <div className="w-full mb-4">
                      <input
                        type="text"
                        name={`packageType-${index}`}
                        id={`packageType-${index}`}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder={`Type for Package Option ${index + 1}`}
                        required=""
                        value={
                          packageOptions[index]
                            ? packageOptions[index].packageType
                            : ""
                        }
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>
                    {/* ... (your existing package input fields) */}
                    <button
                      type="button"
                      onClick={() => openDayPricesModal(index)}
                      className="inline-flex bg-primary submitbtn items-center max-w-full w-screen text-center px-5 py-5 mt-4 sm:mt-6 text-sm font-medium justify-center text-white bg-secondary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
                    >
                      Set Day Prices
                    </button>
                    <DayPricesModal
                      isOpen={
                        selectedPackageIndex === index && dayPricesModalOpen
                      }
                      onClose={closeDayPricesModal}
                      handleDayPriceChange={(day, value) =>
                        handlePackageDayPriceChange(index, day, value)
                      }
                      formData={packageOption}
                    />
                  </div>
                ))}
                <button
                  className="inline-flex bg-primary submitbtn items-center max-w-full w-screen text-center px-5 py-5 mt-4 sm:mt-6 text-sm font-medium justify-center text-white bg-secondary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
                  type="button"
                  onClick={addPackageOption}
                >
                  Add Package Option
                </button>
              </section>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="category"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Package Type
              </label>
              <select
                id="packagetype"
                name="packageType"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                value={formData.packageType}
                onChange={handleInputChange}
              >
                <option selected="">Select category</option>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="item-weight"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="12"
                required=""
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Offer
              </label>
              <select
                id="offer"
                name="offer"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                value={formData.offer}
                onChange={handleInputChange}
              >
                <option selected="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {formData.highlights.map((highlight, index) => (
              <div className="sm:col-span-2" key={index}>
                <label
                  htmlFor={`highlight-${index + 1}`}
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Highlight {index + 1}
                </label>
                <div className="flexit">
                  <input
                    type="text"
                    name={`highlights-${index + 1}`}
                    id={`highlight-${index + 1}`}
                    value={highlight}
                    onChange={(e) =>
                      handleHighlightChange(index, e.target.value)
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder={`Highlight ${index + 1}`}
                    required=""
                  />
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="text-primary-700 ml-2 bg-primary text-white pl-4 pr-4 rounded-lg cursor-pointer focus:outline-none"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label
            className="block mb-4 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            htmlFor="multiple_files"
          >
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
            type="button"
            disabled={uploading}
            onClick={handleImageSubmit}
            className="p-3 mt-5 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          <button
            type="submit"
            className="inline-flex bg-primary submitbtn items-center max-w-full w-screen text-center px-5 py-5 mt-4 sm:mt-6 text-sm font-medium justify-center text-white bg-secondary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
          >
            Add Activity
          </button>
        </form>
      </div>
    </section>
  );
};

export default ProductForm;

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
