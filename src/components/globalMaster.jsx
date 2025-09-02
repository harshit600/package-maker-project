import React, { useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import config from "../../config";

// Rich text editor modules and style (moved outside component to prevent re-render issues)
const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const editorStyle = {
  height: "200px",
  paddingBottom: "50px",
  borderRadius: "10px",
};

// Rich text input component (moved outside)
const RichTextInput = ({ value, onChange }) => {
  return (
    <ReactQuill
      theme="snow"
      modules={modules}
      placeholder="Write something..."
      style={editorStyle}
      value={value}
      onChange={onChange}
    />
  );
};

const GlobalMaster = () => {
  const [globalData, setGlobalData] = useState([]);

  const handleAddGlobalEntry = () => {
    const newEntry = { name: "", description: "" };
    setGlobalData([...globalData, newEntry]);
  };

  const handleRemoveGlobalEntry = (index) => {
    const newData = globalData.filter((_, i) => i !== index);
    setGlobalData(newData);
  };

  const handleNameChange = (index, value) => {
    const newData = globalData.map((entry, i) =>
      i === index ? { ...entry, name: value } : entry
    );
    setGlobalData(newData);
  };

  const handleDescriptionChange = (index, value) => {
    const newData = globalData.map((entry, i) =>
      i === index ? { ...entry, description: value } : entry
    );
    setGlobalData(newData);
  };

  const handleSaveGlobalData = async () => {
    try {
      if (globalData.length === 1) {
        // Single entry: use /create
        const response = await fetch(`${config.API_HOST}/api/globalmaster/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(globalData[0]),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save global master data");
        }
        const result = await response.json();
        alert("Global Master entry saved successfully!");
        console.log("Global Master Data (saved):", result);
      } else if (globalData.length > 1) {
        // Multiple entries: use /bulk-create
        const response = await fetch(`${config.API_HOST}/api/globalmaster/bulk-create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: globalData }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save global master data");
        }
        const result = await response.json();
        alert("Global Master data saved successfully!");
        console.log("Global Master Data (saved):", result);
      } else {
        alert("No data to save.");
      }
    } catch (error) {
      alert(`Error saving global master data: ${error.message}`);
      console.error("Error saving global master data:", error);
    }
  };

  return (
    <div className="mx-auto p-2 sm:p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="bg-[rgb(45,45,68)] from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8 text-white">
        <h1 className="text-xl sm:text-2xl font-bold">Global Master</h1>
        <p className="text-blue-100 mt-2 text-sm sm:text-base">
          Manage global data entries that can be used across packages
        </p>
      </div>

      {/* Global Data Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
          if you want to add inclusions and exclusions for a package, you can add them here.
          <br />
          please write <span className="text-2xl font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Inclusions</span> and <span className="text-2xl font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Exclusions</span> in the description field.
       <span className="text-2xl font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded"> Spelling must be same as above. </span>
       </h3>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 pb-2 border-b gap-3 sm:gap-0">
        
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Global Data Entries
          </h2>
          <button
            type="button"
            onClick={handleAddGlobalEntry}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Add Entry</span>
          </button>
        </div>

        {/* Global Data List */}
        {globalData.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm sm:text-base">No global entries yet. Click "Add Entry" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {globalData.map((entry, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800">Entry #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveGlobalEntry(index)}
                    className="text-red-500 hover:text-red-700 transition-colors self-end sm:self-auto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 sm:h-4 sm:w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Entry Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter entry name"
                      value={entry.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 sm:h-4 sm:w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      Description
                    </label>
                    <div className="text-sm sm:text-base">
                      <RichTextInput
                        value={entry.description}
                        onChange={(value) => handleDescriptionChange(index, value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        {globalData.length > 0 && (
          <div className="flex justify-center sm:justify-end mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            <button
              onClick={handleSaveGlobalData}
              type="button"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Global Data</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalMaster;
