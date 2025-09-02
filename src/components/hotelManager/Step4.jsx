import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Textarea,
  Select,
  Option,
  Typography,
  Button,
  CardBody, CardHeader,
  Radio,IconButton
} from "@material-tailwind/react";
import { Pencil, Trash2 } from "lucide-react"
import { storage } from './firebase'; // Adjust the import based on your Firebase setup
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary Firebase functions

export default function Step4({ stepName, onDataChange, formData, setFormData }) {
  console.log(formData)

  const amenitiesData = {
    Mandatory: [
      "Hairdryer", "Hot & Cold Water", "Toiletries", "TV",
      "Air Conditioning", "Iron/Ironing Board", "Mineral Water",
      "Kettle", "Closet", "Mini Bar", "Telephone", "Work Desk",
      "Safe", "Bathroom", "Chair"
    ],
    "Popular with Guest": [
      "Interconnected Room", "Heater", "Housekeeping", "In Room dining",
      "Laundry Service", "Room service", "Smoking Room", " Study Room","Wifi",
      "Air Purifier"
    ],
    "Bathroom": [
      "Bathroom Phone", "Bathtub", "Bubble Bath", "Dental Kit",
      "Geyser/ Water heater", "Slippers", "Shower Cap", "Hammam","Bathrobes",
      "Western Toilet Seat","Shower cubicle","Weighing Scale","Shaving Mirror","Sewing kit",
      "Bidet","Toilet with grab rails","Ensuite Bathroom/Common Bay","Jetspray"
    ], "Room Feature": [
      "Blackout curtains", "Center Table", "Charging points", "Couch",
      "Dining Table", "Fireplace", "Mini Fridge", "Sofa","Pillow menu",
      "Hypoallergenic Bedding","Living Area","Dining Area","Seating Area","Fireplace Guards","Coffee Machine",
      "Jaccuzi","Hot Water Bag",
    ], "Media and Entertainment": [
      "Smart Controls", "Sound Speakers", "Smartphone"
    ], "Food and Drink": [
      "Cake", "Fruit Basket", "BBQ Grill", "Cook & Butler Service",
      
    ], "Kitchen and Appliance": [
      "Dishwasher", "Induction", "Kitchenette", "Refrigerator",
      "Washing machine", "Cook/Chef", "Cooking Basics", "Stove/Induction","Dishes and Silverware",
      "Toaster","Microwave","Rice Cooker"
    ], "Bed and Blanket": [
      "Blanket"
    ], "Safety and Security": [
        "Cupboards with locks"
    ], "Childcare": [
         "Child safety socket covers"
    ], "other Facilities": [
      "Mosquito Net", "Newspaper", "Balcony", "Jacuzzi",
      "Private Pool", "Terrace", "Fan"
    ]
  }; 
  const categories = Object.keys(amenitiesData);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedAmenities, setSelectedAmenities] = useState(
    Object.fromEntries(categories.map(category => [
      category,
      Object.fromEntries(amenitiesData[category].map(amenity => [amenity, "null"]))
    ]))
  );

  const handleSelectionChange = (category, amenity, value) => {
    setSelectedAmenities(prevState => ({
      ...prevState,
      [category]: {
        ...prevState[category],
        [amenity]: value,
      }
    }));
  };

  console.log(formData)

  const [roomSize, setRoomSize] = useState('square feet');
  const [extraBed, setExtraBed] = useState(false);
  const [baseAdults, setBaseAdults] = useState(1);
  const [maxAdults, setMaxAdults] = useState(1);
  const [maxChildren, setMaxChildren] = useState(1);
  const [maxOccupancy, setMaxOccupancy] = useState(2);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [mealOption, setMealOption] = useState('');
  const [roomType, setRoomType] = useState('');
  const [bedType, setBedType] = useState('');
  const [roomView, setRoomView] = useState('');
  const [smokingAllowed, setSmokingAllowed] = useState('');
  const [baseRate, setBaseRate] = useState('');
  const [extraAdultCharge, setExtraAdultCharge] = useState('');
  const [childCharge, setChildCharge] = useState('');
  const [roomsizeinnumber, setSize] = useState('');
  const [currentSection, setCurrentSection] = useState(formData?.rooms?.data?.length ? 'nextSection' :  'roomDetails' );
  const increment = (value, setter) => setter(value + 1);
  const decrement = (value, setter) => value > 0 && setter(value - 1);
  const [editIndex, setEditIndex] = useState(null); // Track which room is being edited
  const [roomImage, setRoomImage] = useState(null); // State for the room image
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [loading, setLoading] = useState(false); // State for loading
  const fileInputRef = useRef(null); // Reference for the file input

  const handleImageUpload = async (file) => {
    if (!file) return;
    setLoading(true); // Set loading to true when starting upload
    const storageRef = ref(storage, `roomImages/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setLoading(false); // Set loading to false when upload is complete
    return url; // Return the image URL
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setRoomImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set the image preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setRoomImage(null); // Clear the room image state
    setImagePreview(null); // Clear the image preview state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Upload the image if a new one is selected
    const imageUrl = roomImage ? await handleImageUpload(roomImage) : imagePreview; // Use existing image URL if no new image is uploaded

    const roomDetails = {
      roomName,
      roomDescription,
      roomCount,
      mealOption,
      roomType,
      bedType,
      roomSize,
      roomView,
      smokingAllowed,
      extraBed,
      baseAdults,
      maxAdults,
      maxChildren,
      maxOccupancy,
      startDate,
      endDate,
      baseRate,
      extraAdultCharge,
      childCharge,
      roomsizeinnumber,
      selectedAmenities,
      imageUrl, // Add image URL to room details
    };
  
    // Update rooms in formData
    setFormData((prevState) => {
      const updatedRoomsData = editIndex !== null
        ? (prevState.rooms.data || []).map((room, i) => (i === editIndex ? roomDetails : room))
        : [...(prevState.rooms.data || []), roomDetails];

      return {
        ...prevState,
        rooms: {
          ...prevState.rooms,
          data: updatedRoomsData,
        },
      };
    });

    // After submitting, reset the form fields and go to the next section
    setCurrentSection('nextSection'); // Navigate to the next section
  
    // Reset edit index if it's not an update
    if (editIndex !== null) {
      setEditIndex(null); // Reset edit index after update
    }
  };
  
  const handleAddNew = () => {
    // Reset form fields to initial state
    setCurrentSection('roomDetails')
    setRoomName('');
    setRoomDescription('');
    setRoomCount('');
    setMealOption('');
    setRoomType('');
    setBedType('');
    setRoomSize('');
    setRoomView('');
    setSmokingAllowed(false);
    setExtraBed(false);
    setBaseAdults(1);
    setMaxAdults(1);
    setMaxChildren(1);
    setMaxOccupancy(1);
    setStartDate(null);
    setEndDate(null);
    setBaseRate('');
    setExtraAdultCharge('');
    setChildCharge('');
    setSize(1);
  
    // Reset selected amenities
    setSelectedAmenities(
      Object.fromEntries(
        categories.map(category => [
          category,
          Object.fromEntries(amenitiesData[category].map(amenity => [amenity, "null"]))
        ])
      )
    );
  
    // Clear edit index
    setEditIndex(null);
  };
  

  // Watch for changes to currentSection
useEffect(() => {
  console.log('Current section has been updated:', currentSection);
}, [currentSection]);

  const handleDelete = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      rooms: prevState.rooms.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (index) => {
    const selectedRoom = formData?.rooms?.data[index];
    console.log('Editing room:', selectedRoom); // Debugging log to check the selected room
    setRoomName(selectedRoom.roomName);
    setRoomDescription(selectedRoom.roomDescription);
    setRoomCount(selectedRoom.roomCount);
    setMealOption(selectedRoom.mealOption);
    setRoomType(selectedRoom.roomType);
    setBedType(selectedRoom.bedType);
    setRoomSize(selectedRoom.roomSize);
    setRoomView(selectedRoom.roomView);
    setSmokingAllowed(selectedRoom.smokingAllowed);
    setExtraBed(selectedRoom.extraBed);
    setBaseAdults(selectedRoom.baseAdults);
    setMaxAdults(selectedRoom.maxAdults);
    setMaxChildren(selectedRoom.maxChildren);
    setMaxOccupancy(selectedRoom.maxOccupancy);
    setStartDate(selectedRoom.startDate);
    setEndDate(selectedRoom.endDate);
    setBaseRate(selectedRoom.baseRate);
    setExtraAdultCharge(selectedRoom.extraAdultCharge);
    setChildCharge(selectedRoom.childCharge);
    setSelectedAmenities(selectedRoom.selectedAmenities);
    setSize(selectedRoom.roomsizeinnumber);
    setEditIndex(index); // Set the index to indicate editing
    setImagePreview(selectedRoom.imageUrl); // Set the image preview from the selected room
    setCurrentSection('roomDetails'); // Navigate to the form section
  };

 

  console.log(currentSection)

  return (
    <>
    {currentSection === 'nextSection' && (
  <Card className="w-full mx-auto border border-gray-200 p-4">
    <Typography variant="h4" color="blue-gray">
      Rooms
    </Typography>
    <CardBody>
      <Typography variant="paragraph" color="blue-gray" className="mb-4">
        Define Rooms available at your property and the amenities for each type of room
      </Typography>
      <div className="space-y-4">
        {formData?.rooms?.data.map((room, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-blue-gray-50 rounded-lg">
            <div>
              <Typography variant="h6" color="blue-gray">
                {room.roomName}
              </Typography>
              <Typography variant="small" color="gray">
                {room.bedType} | Available Rooms: {room.roomCount} | Base occupancy: {room.baseAdults}
              </Typography>
            </div>
            <div className="flex space-x-2">
              <IconButton variant="text" color="blue-gray" size="sm" onClick={() => handleEdit(index)}>
                <Pencil className="h-4 w-4" />
              </IconButton>
              <IconButton variant="text" color="blue-gray" size="sm" onClick={() => handleDelete(index)}>
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        ))}
        <Button onClick={handleAddNew}>Add New</Button>
      </div>
    </CardBody>
  </Card>
)}

     {currentSection === 'roomDetails' && (
    <Card className="w-full mx-auto border border-gray-200 px-4">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none border-b border-gray-200 pb-4"
      >
        <Typography variant="h4" color="blue-gray">
          Rooms
        </Typography>
        <Typography variant="small" color="gray">
          Add room level details
        </Typography>
      </CardHeader>
   
      <form className="mt-8 mb-2 w-full ">
        <div className="mb-4 flex flex-col gap-6">
        <Input size="lg" label="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          <Textarea label="Room Description" value={roomDescription} onChange={(e) => setRoomDescription(e.target.value)} />
          <Typography variant="small" color="blue-gray" className="-mb-3">
            Number of Available Room(s)
          </Typography>
          <Input size="lg" label="Enter Room Count" value={roomCount} onChange={(e) => setRoomCount(e.target.value)} />
          
          {/* <Select label="Meal Options" value={mealOption} onChange={(value) => setMealOption(value)}>
         
            <Option value="Accomodation Only">Accomodation Only </Option>
            <Option value='Free Breakfast'>Free Breakfast </Option>
            <Option value='Free Breakfast and Lunch/Dinner'>Free Breakfast and Lunch/Dinner </Option>
            <Option value='Free Breakfast ,Lunch/Dinner'>Free Breakfast ,Lunch/Dinner </Option>
            <Option value='Free  Cooked Breakfast'>Free  Cooked Breakfast </Option>
            <Option value='Free Breakfast ,Lunch, Dinner and Custom Inclusion '>Free Breakfast ,Lunch, Dinner and Custom Inclusion  </Option>
            <Option value='Free Breakfast and Lunch '>Free Breakfast and Lunch </Option>
            <Option value='Free Breakfast and Dinner'>Free Breakfast and Dinner </Option>

          </Select> */}
          
          <div className="flex gap-4">
          <Select label="Room Type" className="flex-1" value={roomType} onChange={(value) => setRoomType(value)}>
              <Option value="Standard"  >Standard</Option>
              <Option value="Deluxe" >Deluxe</Option>
              <Option value="Luxury" >Luxury</Option>
              <Option value="Master" >Master</Option>
              <Option value="Common" >Common</Option>
              <Option value="Family Room" >Family Room </Option>
              <Option value="Water Villa" >Water Villa </Option>
              <Option value="Beach Villa" > Beach Villa</Option>
              <Option value="For HoneyMoon" > For HoneyMoon</Option>
              <Option value="Garden Villa" > Garden Villa</Option>
              <Option value="Other" > Other</Option>
              <Option value="Suite" > Suite</Option>




            </Select>
            <Select label="Bed Type" className="flex-1" value={bedType} onChange={(value) => setBedType(value)}>
          
              <Option value="Single Bed" >Single Bed</Option>
              <Option value="Double Bed" >Double Bed</Option>
              <Option value="King Bed" >King Bed </Option>
              <Option value="Twin Bed" >Twin Bed </Option>
              <Option value="Queen Bed" >Queen Bed </Option>
              <Option value="Sofa Bed" >Sofa Bed </Option>
              <Option value="Standard Bed" >Standard Bed </Option>
              <Option value="1 King Bed or 2 Twin Bed" >1 King Bed or 2 Twin Bed </Option>
              <Option value="1 Queen Bed or 2 Twin Bed" >1 Queen Bed or 2 Twin Bed </Option>
              <Option value="1 Double Bed or 2 Twin Bed" >1 Double Bed or 2 Twin Bed </Option>
              <Option value="Bunk Bed" >Bunk Bed </Option>
              <Option value="Futon" >Futon </Option>
              <Option value="Murphy" >Murphy </Option>
              <Option value="Tatani Mats" >Tatani Mats </Option>
              <Option value="2 Double Bed" >2 Double Bed </Option>
              <Option value="2 King Bed" >2 King Bed </Option>
              <Option value="2 Queen  Bed" >2 Queen  Bed </Option>
              <Option value="2 King Bed and 1 Single Bed" >2 King Bed and 1 Single Bed  </Option>
              <Option value="2 Queen Bed and 1 Single Bed" > 2 Queen Bed and 1 Single Bed  </Option>


              
 </Select>
          </div>
          
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2">
              Room Size (Area)
            </Typography>
            <Typography variant="small" color="gray" className="mb-2">
              Define room area, don't include any other property area
            </Typography>
            <div className="flex gap-4">
            <Input
              size="lg"
              label="Size"
              className="flex-1 mt-2"
              value={roomsizeinnumber}
              onChange={(e) => setSize(e.target.value)}
            />
              <Select value={roomSize} onChange={(value) => setRoomSize(value)} className="">
                <Option value="square feet">square feet</Option>
                <Option value="square meter">square meter</Option>
              </Select>
            </div>
          </div>
          
          <Select label="Room View (Optional)" value={roomView} onChange={(value) => setRoomView(value)}>
          <Option value="square feet">Sea View</Option>
                <Option value="Valley View">  Valley View</Option>
                <Option value="Hill View">Hill View</Option>
                <Option value="Pool View">Pool View</Option>
                <Option value="Garden View">Garden View</Option>
                <Option value="River View">River View</Option>
                <Option value="Lake View">Lake View</Option>
                <Option value="Palce View">Palce View</Option>
                <Option value="Bay View">Bay View</Option>
                <Option value="Jungle View">Jungle View</Option>
                <Option value="City View">City View</Option>
                <Option value="Landmark View">Landmark View</Option>
                <Option value="Terrace View">Terrace View</Option>
                <Option value="CourtYard View">CourtYard View</Option>
                <Option value="Golf Course View">Golf Course View</Option>
                <Option value="Mountain View">Mountain View</Option>
                <Option value="Ocean View">Ocean View</Option>
                <Option value="Beach Water View">Beach Water View</Option>
                <Option value="Resort View">Resort View</Option>
                <Option value="Monument View">Monument View</Option>
                <Option value="Park View">Park View</Option>
                <Option value="Lagoon View">Lagoon View</Option>
                <Option value="Forest View">Forest View</Option>
                <Option value="Beach View">Beach View</Option>
                <Option value="Airport View">Airport View</Option>
                <Option value="Country Side View">Country Side View</Option>
                <Option value="Inter Course View">Inter Course View</Option>
                <Option value="Marina View">Marina View</Option>
                <Option value="Temple View">Temple View</Option>
          </Select>
          
          <Select label="Smoking Allowed" value={smokingAllowed} onChange={(value) => setSmokingAllowed(value)}>
            <Option value="yes">Yes</Option>
            <Option  value="no">No</Option>
          </Select>

          {/* Extra Bed Section */}
          <div className="border-t pt-4">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Extra Bed
            </Typography>
            <div className="flex items-center gap-4">
              <Typography>Do you provide extra bed?</Typography>
              <div className="flex gap-4">
                <Radio
                  id="extra-bed-yes"
                  name="extraBed"
                  label="Yes"
                  checked={extraBed === true}
                  onChange={() => setExtraBed(true)}
                />
                <Radio
                  id="extra-bed-no"
                  name="extraBed"
                  label="No"
                  checked={extraBed === false}
                  onChange={() => setExtraBed(false)}
                />
              </div>
            </div>
          </div>

          {/* Room Occupancy Section */}
          <div className="border-t pt-4 border border-gray-300 p-2">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Room Occupancy
            </Typography>
            
            <div className="space-y-4">
              {/* Base Adults */}
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6">Base Adults</Typography>
                  <Typography variant="small" color="gray" className='mr-2'>
                    Ideal number of adults that can be accommodated in this 
                    room. Occupancy calculations are based on the accommodation of two adults per room.
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => decrement(baseAdults, setBaseAdults)}>-</Button>
                  <Input value={String(baseAdults).padStart(2, '0')} readOnly className="w-12 text-center" />
                  <Button onClick={() => increment(baseAdults, setBaseAdults)}>+</Button>
                </div>
              </div>
              
              {/* Maximum Adults */}
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6">Maximum Adults</Typography>
                  <Typography variant="small" color="gray" className='mr-2'>
                    Maximum number of adults that can be accommodated in this room. Occupancy calculations are determined 
                    by the accommodation of two adults in a room, without the addition of extra beds.
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => decrement(maxAdults, setMaxAdults)}>-</Button>
                  <Input value={String(maxAdults).padStart(2, '0')} readOnly className="w-12 text-center" />
                  <Button onClick={() => increment(maxAdults, setMaxAdults)}>+</Button>
                </div>
              </div>

              {/* Maximum Children */}
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6">Maximum Children</Typography>
                  <Typography variant="small" color="gray" className='mr-2'>
                    Mention the number of maximum children who are allowed to stay in the room
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => decrement(maxChildren, setMaxChildren)}>-</Button>
                  <Input value={String(maxChildren).padStart(2, '0')} readOnly className="w-12 text-center" />
                  <Button onClick={() => increment(maxChildren, setMaxChildren)}>+</Button>
                </div>
              </div>

              {/* Maximum Occupancy */}
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6">Maximum Occupancy</Typography>
                  <Typography variant="caption" color="gray" className='mr-2'>
                    Specify the maximum number of adults & children that can be accommodated in this room
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => decrement(maxOccupancy, setMaxOccupancy)}>-</Button>
                  <Input value={String(maxOccupancy).padStart(2, '0')} readOnly className="w-12 text-center" />
                  <Button onClick={() => increment(maxOccupancy, setMaxOccupancy)}>+</Button>
                </div>
              </div>
            </div>

            <Typography variant="caption" color="gray" className="mt-4">
              ⚠️ You can edit the age groups for children after listing your property.
            </Typography>
          </div>

          {/* Base Room Price Section */}
          <div className="border-t pt-4 border border-gray-300 p-2">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Base Room Price
            </Typography>
            <div className="space-y-4">
              <div>
                <Typography variant="small" color="blue-gray">Base Rate</Typography>
                <Input size="lg" label="Add Rate" icon="₹" className='mt-2'value={baseRate} onChange={(e) => setBaseRate(e.target.value)} />
              </div>
              <div>
                <Typography variant="small" color="blue-gray">Extra Adult Charge (  {">="} 18 yrs) (Optional)</Typography>
                <Input size="lg" value={extraAdultCharge} onChange={(e) => setExtraAdultCharge(e.target.value)} label="Add Rate" icon="₹"className='mt-2' />
              </div>
              <div>
                <Typography variant="small" color="blue-gray">Charges for child (7-17 yrs) (Optional)</Typography>
                <Input size="lg" value={childCharge} onChange={(e) => setChildCharge(e.target.value)} label="Add Rate" icon="₹"className='mt-2' />
              </div>
            </div>
            <Typography variant="caption" color="gray" className="mt-2">
              ⚠️ Child age range for a free stay is set at 0-6 yrs. You can edit the child age range after your listing is complete.
            </Typography>
          </div>

          {/* Availability Section */}
          {/* <div className="border border-gray-200 p-2 pt-4">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Availability
            </Typography>
            <Typography variant="small" color="gray" className="mb-2">
              Please select the start & end dates on which your property can be booked by guests.
            </Typography>
            <div className="flex gap-4">
              <div className="flex-1">
                <Typography variant="small" color="blue-gray">Start Date</Typography>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Typography variant="small" color="blue-gray">End Date</Typography>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div> */}

          {/* New Image Upload Field */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Upload Room Image</label>
            <div className="flex items-center">
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={() => fileInputRef.current.click()} // Trigger file input click
              >
                Choose Image
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange} // Handle file change
                className="hidden" // Hide the default file input
              />
            </div>
            {imagePreview && (
              <div className="mt-4 flex items-center">
                <img
                  src={imagePreview}
                  alt="Room Preview"
                  className="w-32 h-32 object-cover rounded-md border border-gray-300"
                />
                <button
                  type="button"
                  className="ml-4 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  onClick={handleDeleteImage} // Handle image delete
                >
                  Delete Image
                </button>
              </div>
            )}
            {loading && (
              <div className="mt-4">
                <Typography variant="small" color="blue-gray">
                  Uploading image, please wait...
                </Typography>
                {/* You can also add a spinner here if you have one */}
              </div>
            )}
          </div>
        </div>
        <Card className="w-full mx-auto border border-gray-200">
     
     <CardBody className="px-0 pt-0">
       <Card className="rounded-none shadow-none">
         <CardBody>
           <Typography variant="h6" color="blue-gray" className="mb-2">
           Room Amenities
           </Typography>
           <Typography color="gray" className="mb-4 font-normal">
             Answering the amenities available at your property can significantly influence guests to book! Please answer the Mandatory Amenities available below
           </Typography>
           <div className="flex border-gray-500">
      <div className="w-1/4 bg-gray-50 border border-gray-300">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`py-4 px-4 cursor-pointer ${selectedCategory === category ? 'bg-gray-200' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            <Typography className="text-sm text-gray-700">
              {category}
            </Typography>
          </div>
        ))}
      </div>
      <div className="w-3/4 pl-4">
        {(amenitiesData[selectedCategory] || []).map((amenity, index) => (
          <div key={index} className="mb-4 flex items-center justify-between border-b pb-2">
            <Typography className="font-medium">{amenity}</Typography>
            <div className="flex gap-4">
              <Radio
                name={`radio-${selectedCategory}-${index}`}
                label="No"
                checked={selectedAmenities[selectedCategory][amenity] === "No"}
                onChange={() => handleSelectionChange(selectedCategory, amenity, "No")}
              />
              <Radio
                name={`radio-${selectedCategory}-${index}`}
                label="Yes"
                checked={selectedAmenities[selectedCategory][amenity] === "Yes"}
                onChange={() => handleSelectionChange(selectedCategory, amenity, "Yes")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
         </CardBody>
       </Card>
     </CardBody>
   </Card>

   <Button color="blue-gray" className="mt-6 " onClick={handleSubmit}>
         
         Save and Continue
        </Button>
      </form>
    </Card>
  )}
    </>
  );
}