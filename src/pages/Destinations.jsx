import React from 'react'
import DestinationsPage from '../components/DestinationsPage'
import SideBar from '../components/SideBar'

function Destinations() {
  return (
    <div className='flexitdest'>
      <div className='sidebarpluto'>
      <SideBar />
      </div>
      <DestinationsPage />
    </div>
  )
}

export default Destinations