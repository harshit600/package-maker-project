"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  Input,
  Select,
  Option,
  Radio,
  Button,
  Checkbox,
} from "@material-tailwind/react";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step6 from "./Step6";
import Step7 from "./Step7";
import { useMaterialTailwindController, setStepData } from "./context/index";
import Step5 from "./Step5";
import config from "../../../config";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "./utils/api";
import { useAuth } from "./context/AuthContext";
import {
  HomeIcon,
  MapPinIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  ShieldCheckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    name: "Basic Info",
    icon: <HomeIcon className="w-5 h-5" />,
    color: "blue",
  },
  {
    name: "Location",
    icon: <MapPinIcon className="w-5 h-5" />,
    color: "indigo",
  },
  {
    name: "Amenities",
    icon: <SparklesIcon className="w-5 h-5" />,
    color: "purple",
  },
  {
    name: "Rooms",
    icon: <BuildingOfficeIcon className="w-5 h-5" />,
    color: "pink",
  },
  {
    name: "Photos and videos",
    icon: <PhotoIcon className="w-5 h-5" />,
    color: "rose",
  },
  {
    name: "Policies",
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    color: "orange",
  },
  {
    name: "Finance & legal",
    icon: <BanknotesIcon className="w-5 h-5" />,
    color: "green",
  },
];

const tabStyles = {
  wrapper: `
    relative flex overflow-x-auto mt-4 mb-6 
    scrollbar-hide bg-white rounded-lg shadow-md
    border border-gray-100
  `,
  progressBar: `
    absolute bottom-0 left-0 h-0.5 
    bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
    transition-all duration-500 ease-in-out
  `,
  tab: `
    relative flex items-center gap-2 px-4 py-3
    min-w-[130px] transition-all duration-300
    hover:bg-gray-50/80 cursor-pointer
    border-r border-gray-100 last:border-r-0
  `,
  tabContent: `
    flex flex-col items-center justify-center
    text-center transition-all duration-300
    relative
  `,
  iconWrapper: `
    w-8 h-8 rounded-full flex items-center justify-center
    transition-all duration-300 mb-1.5
  `,
  iconActive: `
    bg-gradient-to-br from-blue-500 to-blue-600
    shadow-lg shadow-blue-500/30 transform scale-110
    ring-4 ring-blue-100
  `,
  iconInactive: `
    bg-gray-100
  `,
  iconCheck: `
    text-white bg-green-500 
    shadow-lg shadow-green-500/30
    transform scale-105
    ring-4 ring-green-100
  `,
  label: `
    font-medium text-xs whitespace-nowrap
    transition-all duration-300
  `,
  labelActive: `
    font-semibold text-blue-600
    after:content-[''] after:absolute after:bottom-[-12px]
    after:left-1/2 after:transform after:-translate-x-1/2
    after:w-full after:h-0.5 after:bg-blue-500
  `,
  labelCompleted: `text-green-500`,
  labelInactive: `text-gray-500`,
  activeIndicator: `
    absolute -bottom-[1px] left-0 right-0 h-0.5
    bg-blue-500 transition-all duration-300
  `
};

export default function PropertyForm() {
  const [controller, dispatch] = useMaterialTailwindController();
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [propertyId, setPropertyId] = useState("");
  const [propertyIdFromUrl, setPropertyIdFromUrl] = useState("");
  console.log(propertyIdFromUrl);
  const [formDataFromApi, setFormDataFromApi] = useState();
  console.log(formDataFromApi?.basicInfo?.propertyName);
  const [formData, setFormData] = useState({
    basicInfo: {
      propertyName: "",
      propertyDescription: "",
      hotelStarRating: "",
      propertyBuiltYear: "",
      bookingSinceYear: "",
      channelManager: "No",
      email: "",
      mobile: "",
      useWhatsApp: false,
      landline: "",
      step: 0,
    },
    location: {
      search: "",
      address: "",
      locality: "",
      pincode: "",
      country: "",
      state: "",
      city: "",
      agreeToTerms: false,
      step: 1,
    },
    amenities: {
      step: 2,
    },
    rooms: {
      step: 3,
      data: [],
    },
    photosAndVideos: {
      step: 4,
      images: [], // Array of image URLs
    },
    policies: {
      step: 5,
    },
    financeAndLegal: {
      ownershipType: "",
      propertyDocument: null,
      relationshipDoc: "",
      relationshipDocument: null,
      accountNumber: "",
      reEnterAccountNumber: "",
      ifscCode: "",
      bankName: "",
      address: "",
      hasGSTIN: "no",
      gstin: "",
      pan: "",
      acceptGstNoc: false,
      hasTAN: "no",
      tan: "",
      step: 6,
    },
  });

  console.log(formData);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Extract the ID from the URL
    const pathParts = location.pathname.split("/");
    const id = pathParts[pathParts.length - 1]; // Get the last part
    setPropertyIdFromUrl(id);
  }, [location.pathname]);

  useEffect(() => {
    if (propertyIdFromUrl && formDataFromApi) {
      setFormData((prevData) => ({
        ...prevData,
        basicInfo: {
          ...prevData.basicInfo,
          ...formDataFromApi.basicInfo, // Prefill basic info from API
        },
        location: {
          ...prevData.location,
          ...formDataFromApi.location, // Prefill location info from API
        },
        amenities: {
          ...prevData.amenities,
          ...formDataFromApi.amenities, // Prefill amenities from API
        },
        rooms: {
          ...prevData.rooms,
          ...formDataFromApi.rooms, // Prefill rooms from API
        },
        photosAndVideos: {
          ...prevData.photosAndVideos,
          ...formDataFromApi.photosAndVideos, // Prefill photos and videos
        },
        policies: {
          ...prevData.policies,
          ...formDataFromApi.policies, // Prefill policies from API
        },
        financeAndLegal: {
          ...prevData.financeAndLegal,
          ...formDataFromApi.financeAndLegal, // Prefill finance and legal info
        },
      }));
    }
  }, [propertyIdFromUrl, formDataFromApi]);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!propertyIdFromUrl) return;

      try {
        const response = await fetch(
          `${config.API_HOST}/api/packagemaker/get-packagemaker-by-id/${propertyIdFromUrl}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const result = await response.json();

        console.log("API Response:", result.data);
        setFormDataFromApi(result?.data);

        if (result.success) {
          /* empty */
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      }
    };

    fetchRoomData();
  }, [propertyIdFromUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev["basicInfo"],
        [name]: type === "checkbox" ? checked : value,
      },
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateFields = () => {
    let newErrors = {};
    // const currentStepData = formData["basicInfo"];
    // if (!currentStepData.propertyName) newErrors.propertyName = "Property name is required.";
    // if (!currentStepData.hotelStarRating) newErrors.hotelStarRating = "Hotel star rating is required.";
    // if (!currentStepData.propertyBuiltYear) newErrors.propertyBuiltYear = "Built year is required.";
    // if (!currentStepData.bookingSinceYear) newErrors.bookingSinceYear = "Booking since year is required.";
    // if (!currentStepData.email) newErrors.email = "Email address is required.";
    // if (!currentStepData.mobile) newErrors.mobile = "Mobile number is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev["basicInfo"],
        [name]: value,
      },
    }));
  };

  // Function to call the POST API for Step 1
  const postFormData = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/packagemaker/create-packagemaker`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            step: 0,
            ...formData.basicInfo,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create property");
      }

      const data = await response.json();
      console.log("POST Success:", data);

      // Save the property ID for future updates
      setPropertyId(data.data._id);

      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // Function to call the PATCH API for the current step
  const patchFormData = async () => {
    // Extract step-specific data based on currentStep
    console.log("act", activeStep);
    let stepData = {};
    switch (activeStep) {
      case 0:
        stepData = { step: 0, ...formData.basicInfo };
        break;
      case 1:
        stepData = { step: 1, ...formData.location };
        break;
      case 2:
        stepData = { step: 2, ...formData.amenities };
        break;
      case 3:
        stepData = { step: 3, ...formData.rooms };
        break;
      case 4:
        stepData = { step: 4, ...formData.photosAndVideos };
        break;
      case 5:
        stepData = { step: 5, ...formData.policies };
        break;
      case 6:
        stepData = { step: 6, ...formData.financeAndLegal };
        break;
      default:
        console.error("Invalid step");
        return;
    }

    try {
      const propertyTypes = ["hotel", "resort", "guestHouse", "lodge"];
      const response = await fetch(
        `${config.API_HOST}/api/packagemaker/update-packagemaker/${
          !propertyTypes.includes(propertyIdFromUrl)
            ? propertyIdFromUrl
            : propertyId
        }`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(stepData),
        }
      );
      if (!response.ok) throw new Error("Failed to update package.");
      const data = await response.json();
      console.log("PATCH Success:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePrev = () => setActiveStep((cur) => (cur > 0 ? cur - 1 : cur));

  // Handle Next Step
  const handleNext = async () => {
    if (validateFields()) {
      try {
        // Call POST API for Step 1 and PATCH API for others
        if (
          activeStep === 0 &&
          (propertyIdFromUrl === "hotel" ||
            propertyIdFromUrl === "resort" ||
            propertyIdFromUrl === "guestHouse" ||
            propertyIdFromUrl === "lodge")
        ) {
          console.log("Creating new property...");
          await postFormData();
        } else {
          await patchFormData();
        }

        setStepData(
          dispatch,
          steps[activeStep].name,
          formData[steps[activeStep].name]
        );

        // If this is the last step and API call was successful, redirect
        if (activeStep === 6) {
          navigate("/hotel-manager");
          return;
        }

        // Otherwise, move to next step
        setActiveStep((cur) => (cur < steps.length - 1 ? cur + 1 : cur));
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error saving data. Please try again.");
      }
    }
  };

  const handleStepChange = (index) => {
    if (index > activeStep && !validateFields()) {
      return;
    }
    setActiveStep(index);
  };

  const handleChildDataChange = (step, data) => {
    setFormData((prevData) => ({
      ...prevData,
      [step]: data,
    }));
  };

  console.log("Updated formData:", formData);
  console.log(activeStep);

  const renderBasicInfoStep = () => (
    <>
      <div className="px-2">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          Property Details
        </Typography>
        <Typography variant="small" color="gray" className="font-normal mb-4">
          Update your property details here
        </Typography>
      </div>
      <div className="grid grid-cols-3 border-b gap-4 items-center">
        <div className="col-span-1">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Name of the Property
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            Enter the name as on the property documents
          </Typography>
        </div>
        <div className="col-span-2">
          <Input
            label="Enter Your Name"
            name="propertyName"
            value={formData["basicInfo"].propertyName}
            onChange={handleChange}
            labelProps={{ className: "!text-gray-400" }}
            containerProps={{ className: "min-w-[100px]" }}
          />
          {errors.propertyName && (
            <span className="text-red-500">{errors.propertyName}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 border-b gap-4 items-center">
        <div className="col-span-1">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Description of the Property
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            Enter the description of property
          </Typography>
        </div>
        <div className="col-span-2">
          <Input
            label="Enter Description"
            name="propertyDescription"
            value={formData["basicInfo"].propertyDescription}
            onChange={handleChange}
            labelProps={{ className: "!text-gray-400" }}
            containerProps={{ className: "min-w-[100px]" }}
          />
          {errors.propertyDescription && (
            <span className="text-red-500">{errors.propertyDescription}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 border-b gap-4 items-center">
        <div className="col-span-1">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Hotel Star Rating
          </Typography>
        </div>
        <div className="col-span-2">
          <Select
            label="Select rating"
            placeholder="Select rating"
            value={formData["basicInfo"].hotelStarRating}
            onChange={(value) => handleSelectChange("hotelStarRating", value)}
            labelProps={{ className: "!text-gray-400" }}
            containerProps={{ className: "min-w-[100px]" }}
          >
            <Option value="1 Star">1 Star</Option>
            <Option value="2 Star">2 Stars</Option>
            <Option value="3 Star">3 Stars</Option>
            <Option value="4 Star">4 Stars</Option>
            <Option value="5 Star">5 Stars</Option>
          </Select>
          {errors.hotelStarRating && (
            <span className="text-red-500">{errors.hotelStarRating}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 border-b gap-4 items-center">
        <div className="col-span-1">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            When was the property built?
          </Typography>
        </div>
        <div className="col-span-2">
          <Select
            label="Select a year"
            placeholder="Select a year"
            value={formData["basicInfo"].propertyBuiltYear}
            onChange={(value) => handleSelectChange("propertyBuiltYear", value)}
            labelProps={{ className: "!text-gray-400" }}
            containerProps={{ className: "min-w-[100px]" }}
          >
            {Array.from(
              { length: 100 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <Option key={year} value={year.toString()}>
                {year}
              </Option>
            ))}
          </Select>
          {errors.propertyBuiltYear && (
            <span className="text-red-500">{errors.propertyBuiltYear}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 border-b gap-4 items-center">
        <div className="col-span-1">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Accepting booking since?
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            Since when is this property available for guests to book
          </Typography>
        </div>
        <div className="col-span-2">
          <Select
            label="Select a year"
            placeholder="Select a year"
            value={formData["basicInfo"].bookingSinceYear}
            onChange={(value) => handleSelectChange("bookingSinceYear", value)}
            labelProps={{ className: "!text-gray-400" }}
            containerProps={{ className: "min-w-[100px]" }}
          >
            {Array.from(
              { length: 100 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <Option key={year} value={year.toString()}>
                {year}
              </Option>
            ))}
          </Select>
          {errors.bookingSinceYear && (
            <span className="text-red-500">{errors.bookingSinceYear}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 items-start border-b-[15px]">
        <div className="col-span-1 mb-5">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Do you work with channel manager?
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            This allows to update inventory across different travel platforms
          </Typography>
        </div>
        <div className="col-span-2 flex gap-8 ">
          <Radio
            name="channelManager"
            label="No"
            value="No"
            checked={formData["basicInfo"].channelManager === "No"}
            onChange={handleChange}
            className="border-blue-500"
            labelProps={{
              className: "text-blue-gray-700",
            }}
          />
          <Radio
            name="channelManager"
            label="Yes"
            value="Yes"
            checked={formData["basicInfo"].channelManager === "Yes"}
            onChange={handleChange}
            className="border-blue-gray-200"
            labelProps={{
              className: "text-blue-gray-700",
            }}
          />
        </div>
      </div>
      <div className="px-2 mt-3">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          Contact Details
        </Typography>
        <Typography variant="small" color="gray" className="font-normal mb-4">
          Update your contact details here
        </Typography>
      </div>
      <div className="grid grid-cols-3 border-b gap-4 items-center">
        <div className="col-span-1">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Email Address
          </Typography>
        </div>
        <div className="col-span-2">
          <Input
            label="Enter email address"
            name="email"
            value={formData["basicInfo"].email}
            onChange={handleChange}
            labelProps={{ className: "!text-gray-400" }}
            containerProps={{ className: "min-w-[100px]" }}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
        </div>
      </div>
      <div className="grid grid-cols-3 border-b gap-4 items-center">
        <div className="col-span-1">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Mobile Number
          </Typography>
        </div>
        <div className="col-span-2">
          <Input
            label="Enter mobile number"
            name="mobile"
            value={formData["basicInfo"].mobile}
            onChange={handleChange}
            labelProps={{ className: "!text-gray-400" }}
            containerProps={{ className: "min-w-[100px]" }}
          />
          {errors.mobile && (
            <span className="text-red-500">{errors.mobile}</span>
          )}
          <Checkbox
            id="useWhatsApp"
            name="useWhatsApp"
            label="Use WhatsApp"
            checked={formData["basicInfo"].useWhatsApp}
            onChange={handleChange}
            labelProps={{ className: "text-sm font-medium mt-2" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 border-b gap-4 items-center">
        <div className="col-span-1">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Landline Number
          </Typography>
        </div>
        <div className="col-span-2">
          <Input
            label="Enter landline number"
            name="landline"
            value={formData["basicInfo"].landline}
            onChange={handleChange}
            labelProps={{ className: "!text-gray-400" }}
            containerProps={{ className: "min-w-[100px]" }}
          />
        </div>
      </div>
    </>
  );

  const renderTabs = () => (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className={tabStyles.wrapper}>
        <div
          className={tabStyles.progressBar}
          style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
        />
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const isCompleted = activeStep > index;

          return (
            <div
              key={step.name}
              onClick={() => handleStepChange(index)}
              className={tabStyles.tab}
            >
              <div className={tabStyles.tabContent}>
                <div
                  className={`
                  ${tabStyles.iconWrapper}
                  ${
                    isActive
                      ? `${tabStyles.iconActive} from-${step.color}-500 to-${step.color}-600 text-white`
                      : ""
                  }
                  ${isCompleted ? tabStyles.iconCheck : ""}
                  ${!isActive && !isCompleted ? tabStyles.iconInactive : ""}
                `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`
                  ${tabStyles.label}
                  ${isActive ? tabStyles.labelActive : ""}
                  ${isCompleted ? tabStyles.labelCompleted : ""}
                  ${!isActive && !isCompleted ? tabStyles.labelInactive : ""}
                `}
                >
                  {step.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return (
          <Step2
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <Step3
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <Step4
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <Step5
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 5:
        return (
          <Step6
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
            onDataChange={(data) =>
              handleChildDataChange(steps[activeStep].name, data)
            }
          />
        );
      case 6:
        return (
          <Step7
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
            onDataChange={(data) =>
              handleChildDataChange(steps[activeStep].name, data)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto pb-8">
        {renderTabs()}

        <Card className="mt-5 rounded-lg border border-r-4 border-brown-100 shadow-lg">
          <CardBody className="flex flex-col gap-6 p-6">
            {renderStepContent()}
          </CardBody>
        </Card>

        <div className="flex justify-between p-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {activeStep === 6 ? "Save" : "Save and Next"}
          </Button>
        </div>
      </div>
    </>
  );
}
