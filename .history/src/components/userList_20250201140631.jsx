import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${config.API_HOST}/api/maker/get-maker`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        console.log(data);
        setUsers(data);
        setLoading(false);
      }
     
       catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`${config.API_HOST}/api/maker/delete-maker/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove the deleted user from the state
      setUsers(users.filter(user => user._id !== userId));
      // Show success toast
      toast.success('User deleted successfully!');
    } catch (err) {
      setError(err.message);
      // Show error toast
      toast.error(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Users List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {user.firstName} {user.lastName}
            </h3>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center">
                <span className="font-medium mr-2">Email:</span> {user.email}
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Contact:</span> {user.contactNo}
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Address:</span> {user.address}
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">User Type:</span> 
                <span className={`${user.userType === 'admin' ? 'text-blue-600' : 'text-green-600'}`}>
                  {user.userType}
                </span>
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Gender:</span> {user.gender}
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Date of Birth:</span> 
                {new Date(user.dateOfBirth).toLocaleDateString()}
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Status:</span>
                <span className={`${user.publish === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.publish}
                </span>
              </p>
              
              <button
                onClick={() => handleDelete(user._id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
              >
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
