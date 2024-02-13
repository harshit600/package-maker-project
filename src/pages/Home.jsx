import React from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../components/SideBar';

export default function Home() {
   const { currentUser } = useSelector((state) => state.user);
  return (
    <div className='flexright'>
     <SideBar />
<div className='right-side'>
   <div className='box1'>
   <a href="/activities-listing">  Activities <div>(80)</div></a>
   </div>
   <a href="/destinations"><div className='box1'>
     Destinations (12) 
   </div></a>
   <div className='box1'>
      Packages <div>(89)</div>
   </div>
   <div className='box1'>
      Employees <div>(191)</div>
   </div>
   <div className='box1'>
      Users <div>(1.5K)</div>
   </div>
</div>
    </div>
  )
}
