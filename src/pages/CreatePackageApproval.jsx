import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PackageCreationApproval from "../components/PackageCreationApproval";
import config from "../../config";

const CreatePackageApproval = () => {
  const [packageData, setPackageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');
  console.log("editId", editId);

  useEffect(() => {
    const fetchPackageData = async () => {
      if (editId) {
        setIsLoading(true);
        try {
          const response = await fetch(`${config.API_HOST}/api/packages/getpackage/${editId}`);
          const data = await response.json();
          setPackageData(data);
        } catch (error) {
          console.error("Error fetching package data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPackageData();
  }, [editId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container flexitdest">
      <PackageCreationApproval initialData={packageData} isEditing={Boolean(editId)} editId={editId}/>
    </div>
  );
};

export default CreatePackageApproval;
