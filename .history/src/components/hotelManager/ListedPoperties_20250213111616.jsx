import React, { useEffect, useState } from 'react'
import config from "../../../config"
import {
    PencilSquareIcon,
    TrashIcon,
    CalendarIcon
} from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';
import { slugify } from "../../common/functions";

function ListedProperites() {
    const [propertiesData, setPropertiesData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Add delete handler function
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                const response = await fetch(`${config.API_HOST}/api/packagemaker/delete-packagemaker/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                
                if (data.success) {
                    // Remove the deleted property from state
                    setPropertiesData(prevData => prevData.filter(property => property._id !== id));
                }
            } catch (error) {
                console.error("Error deleting property:", error);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${config.API_HOST}/api/packagemaker/get-packagemaker`);
              console.log("API Response:", response);
                const data = await response.json();
                console.log("API Response:", data);
                if (data.success) {
                    setPropertiesData(data.data);
                }
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Skeleton loader component
    const PropertySkeleton = () => (
        <div className='property-card flex justify-between mt-4 animate-pulse'>
            <div className='flex gap-8 items-center'>
                <div className='h-[200px] w-[200px] bg-gray-200 rounded-lg'></div>
                <div className='flex flex-col gap-4'>
                    <div className='h-8 w-48 bg-gray-200 rounded'></div>
                    <div className='h-4 w-96 bg-gray-200 rounded'></div>
                </div>
            </div>
            <div className='flex gap-4 items-center mr-10'>
                <div className="w-7 h-7 bg-gray-200 rounded"></div>
                <div className="w-7 h-7 bg-gray-200 rounded"></div>
                <div className="w-7 h-7 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className='p-4'>
                {[1, 2, 3].map((index) => (
                    <PropertySkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <div className='p-4'>
            {propertiesData?.map((property, index) => (
                <div key={property._id} className='property-card flex justify-between mt-4 hover:bg-gray-50 transition-all duration-300 p-4 rounded-lg'>
                    <div className='flex gap-8 items-center'>
                        <img 
                            src={property?.photosAndVideos?.images?.[0]} 
                            height='200px' 
                            width='200px' 
                            className='rounded-lg object-cover'
                            alt={property?.basicInfo?.propertyName}
                           
                        />
                        <div className='flex flex-col'>
                            <div className='font-bold text-2xl text-gray-800'>{property?.basicInfo?.propertyName}</div>
                            <div className='font-normal text-gray-600 mt-2'>{property?.location?.address}</div>
                        </div>
                    </div>
                    <div className='flex gap-4 items-center mr-10'>
                        <Link to={`/update/${slugify(property?.basicInfo?.propertyName)}/${property._id}`}>
                            <div className="w-7 cursor-pointer hover:text-blue-500 hover:scale-110 transition-all">
                                <PencilSquareIcon />
                            </div>
                        </Link>
                        <div 
                            className="w-7 cursor-pointer hover:text-red-500 hover:scale-110 transition-all"
                            onClick={() => handleDelete(property._id)}
                        >
                            <TrashIcon />
                        </div>
                        <Link to={`/property/${slugify(property?.basicInfo?.propertyName)}/${property._id}`}>
                            <div className="w-7 cursor-pointer hover:text-green-500 hover:scale-110 transition-all">
                                <CalendarIcon />
                            </div>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ListedProperites;