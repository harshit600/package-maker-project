import React from 'react'
import CountriesForm from './CountriesForm'

function Modal({ formData, setFormData, setCloseModal, isEditMode, setSelectedCountry }) {
  return (
    <div className='plutomodal'>
         <CountriesForm formData={formData} setFormData={setFormData} setCloseModal={setCloseModal} isEditMode={isEditMode} setSelectedCountry={setSelectedCountry}/>
    </div>
  )
}

export default Modal