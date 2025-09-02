import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Select,
  Option,
  Input,
  Radio,
  Checkbox,
} from "@material-tailwind/react";

export default function Component({ stepName, onDataChange, setFormData, formData }) {
  // Add useEffect to log formData when it changes
  useEffect(() => {
    console.log("Step7 formData:", formData?.financeAndLegal);
  }, [formData]);

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevData => ({
        ...prevData,
        financeAndLegal: {
          ...prevData.financeAndLegal,
          [fieldName]: file
        }
      }));
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      financeAndLegal: {
        ...prevData.financeAndLegal,
        [name]: value
      }
    }));
  };

  return (
    <Card className="w-full mx-auto p-3 border border-gray-200 rounded-lg">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none border-b border-gray-200 pb-4"
      >
        <Typography variant="h4" color="blue-gray">
          Finance & Legal
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          Add finance & legal details for the new listing of your property.
        </Typography>
      </CardHeader>
      <CardBody className="p-0 pt-4">
        <div className="flex flex-col gap-6">
          <div>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Ownership details
            </Typography>
            <Typography color="gray" className="mb-4 font-normal text-sm">
              Provide documents that proves your ownership
            </Typography>
            <Select
              label="Type of ownership does the property have?"
              value={formData?.financeAndLegal?.ownershipType || ""}
              onChange={(value) => handleInputChange("ownershipType", value)}
            >
              <Option value="lease">My Own Property</Option>
              <Option value="spouse">My Spouse Owns The Property</Option>
              <Option value="parents">My Parents/Grand Parents Own The Property</Option>
              <Option value="sibling">My Sibling/Cousins Own The Property</Option>
              <Option value="friend">My Friend Owns The Property</Option>
              <Option value="revenue_management">I have taken property for Revenue Management</Option>
              <Option value="leased">Leased Property</Option>
            </Select>
          </div>

          <div>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Upload the lease document
            </Typography>
            <Typography color="gray" className="mb-2 font-normal text-sm">
              The address on the registration document should match with the property address
            </Typography>
            <Input
              type="text"
              label="Your property address"
              name="address"
              value={formData?.financeAndLegal?.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="mb-4"
            />
            {/* File upload section */}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              Banking Details
            </Typography>
            <Typography color="gray" className="mb-4 font-normal text-sm">
              Enter Bank, PAN & GST Details
            </Typography>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                type="text"
                label="Account Number"
                value={formData?.financeAndLegal?.accountNumber || ""}
                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              />
              <Input
                type="text"
                label="Re-enter Account Number"
                value={formData?.financeAndLegal?.reEnterAccountNumber || ""}
                onChange={(e) => handleInputChange("reEnterAccountNumber", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                type="text"
                label="IFSC Code"
                value={formData?.financeAndLegal?.ifscCode || ""}
                onChange={(e) => handleInputChange("ifscCode", e.target.value)}
              />
              <Select
                label="Bank Name"
                value={formData?.financeAndLegal?.bankName || ""}
                onChange={(value) => handleInputChange("bankName", value)}
              >
                <Option value="bank1">Bank 1</Option>
                <Option value="bank2">Bank 2</Option>
                <Option value="bank3">Bank 3</Option>
              </Select>
            </div>

            {/* GST Section */}
            <div className="flex items-center justify-between border-b mb-4">
              <Typography color="blue-gray" className="mb-2">
                Do you have a GSTIN?
              </Typography>
              <div className="flex gap-4">
                <Radio
                  name="gstin"
                  label="No"
                  checked={formData?.financeAndLegal?.hasGSTIN === "no"}
                  onChange={() => handleInputChange("hasGSTIN", "no")}
                />
                <Radio
                  name="gstin"
                  label="Yes"
                  checked={formData?.financeAndLegal?.hasGSTIN === "yes"}
                  onChange={() => handleInputChange("hasGSTIN", "yes")}
                />
              </div>
            </div>

            {/* Conditional GST/PAN fields */}
            {formData?.financeAndLegal?.hasGSTIN === "yes" && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  type="text"
                  label="Enter the 15-digit GSTIN"
                  value={formData?.financeAndLegal?.gstin || ""}
                  onChange={(e) => handleInputChange("gstin", e.target.value)}
                />
                <Input type="text" label="Your PAN will be filled in automatically" disabled />
              </div>
            )}

            {formData?.financeAndLegal?.hasGSTIN === "no" && (
              <div className="flex flex-col gap-4 mb-4">
                <Input
                  type="text"
                  label="Enter PAN"
                  value={formData?.financeAndLegal?.pan || ""}
                  onChange={(e) => handleInputChange("pan", e.target.value)}
                />
                <Checkbox
                  label="to proceed, please read & accept the GST NOC"
                  checked={formData?.financeAndLegal?.acceptGstNoc || false}
                  onChange={(e) => handleInputChange("acceptGstNoc", e.target.checked)}
                />
              </div>
            )}

            {/* TAN Section */}
            <div className="flex items-center justify-between border-b mb-4">
              <Typography color="blue-gray" className="mb-2">
                Do you have a TAN?
              </Typography>
              <div className="flex gap-4">
                <Radio
                  name="tan"
                  label="No"
                  checked={formData?.financeAndLegal?.hasTAN === "no"}
                  onChange={() => handleInputChange("hasTAN", "no")}
                />
                <Radio
                  name="tan"
                  label="Yes"
                  checked={formData?.financeAndLegal?.hasTAN === "yes"}
                  onChange={() => handleInputChange("hasTAN", "yes")}
                />
              </div>
            </div>

            {formData?.financeAndLegal?.hasTAN === "yes" && (
              <Input
                type="text"
                label="Enter 10-digit TAN"
                value={formData?.financeAndLegal?.tan || ""}
                onChange={(e) => handleInputChange("tan", e.target.value)}
              />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
