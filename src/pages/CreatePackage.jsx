import React from "react";
import { useSelector } from "react-redux";
import SideBar from "../components/SideBar";
import PackageCreation from "../components/PackageCreation";

const CreatePackage = () => {

  return (
    <div className="container flexitdest">
     
      <PackageCreation />
    </div>
  );
};

export default CreatePackage;
