import React, { useState } from 'react';
import { storage, ref, uploadBytes, getDownloadURL } from './firebase'; // Import necessary Firebase functions

function Step5({ formData, setFormData }) {
  console.log(formData)
  const [images, setImages] = useState(formData?.photosAndVideos?.images);
  const [uploading, setUploading] = useState(false);

  // Function to handle file upload
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);

    try {
      // Upload each file to Firebase Storage and get download URLs
      const uploadedImages = await Promise.all(
        files.map((file) => {
          const fileRef = ref(storage, `property-images/${file.name}`); // Reference to where the image will be stored
          return uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef)); // Upload and get download URL
        })
      );

      // Add the download URLs of uploaded images to the state
      setImages((prevImages) => [...prevImages, ...uploadedImages]);

      // Save the image URLs to formData (in the 'photosAndVideos' field)
      setFormData((prevState) => ({
        ...prevState,
        photosAndVideos: {
          ...prevState.photosAndVideos,
          images: [...prevState.photosAndVideos.images, ...uploadedImages]
        }
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  // Function to remove an image from the list
  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);

    // Also remove the image from formData (in the 'photosAndVideos' field)
    setFormData((prevState) => ({
      ...prevState,
      photosAndVideos: {
        ...prevState.photosAndVideos,
        images: updatedImages
      }
    }));
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upload Property Images</h2>

      {/* Image upload area */}
      <label className="w-full h-60 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <span className="text-gray-400">
          {uploading ? 'Uploading...' : 'Drag & drop or click to upload images'}
        </span>
      </label>

      {/* Display uploaded images */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Property Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg shadow-md"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step5;
