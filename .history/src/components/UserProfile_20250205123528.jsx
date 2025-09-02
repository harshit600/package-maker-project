import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../redux/user/userSlice"; // Adjust the import based on your project structure

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser); // Assuming user data is stored in Redux

  useEffect(() => {
    // Fetch user profile when the component mounts
    dispatch(fetchUserProfile());
  }, [dispatch]);

  return <div>{/* You can display user information here if needed */}</div>;
};

export default UserProfile;
