import React, { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import SideBar from "../components/SideBar";
import PackageCreation from "../components/PackageCreation";

const CreatePackage = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="container flexitdest">
      <div className="sidebarpluto">
        <SideBar />
      </div>
      <PackageCreation />
    </div>
  );
};

export default CreatePackage;
