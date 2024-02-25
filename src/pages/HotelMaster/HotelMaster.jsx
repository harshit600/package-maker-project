import React from 'react'
import HotelSideBar from '../../components/HotelSideBar'
import HotelManagement from '../../components/HotelManagement'

function HotelMaster() {
  return (
    <div className="container flexitdest">
    <div className="sidebarpluto">
      <HotelSideBar />
    </div>
    <HotelManagement />
  </div>
  )
}

export default HotelMaster