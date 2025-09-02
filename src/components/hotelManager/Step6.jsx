import { useState,useEffect } from 'react'  
import { Select, Option, Radio, Card, Typography, Accordion, AccordionHeader, AccordionBody, Input } from "@material-tailwind/react"  
import { useMaterialTailwindController, setStepData } from "./context/index";
  
export default function Step6({ stepName, onDataChange, formData, setFormData }) {  
  const [data, setData] = useState({  
   checkInTime: "12:00 pm (noon)",  
   checkOutTime: "12:00 pm (noon)",  
   cancellationPolicy: "",  
   guestProfileAnswers: {  
    unmarriedCouples: "",  
    guestsBelow18: "",  
    maleOnlyGroups: ""  
   },  
   acceptableIdProof: "",  
   sameCity: "",  
   propertyRestrictions: {  
    smoking: "",  
    privateParties: "",  
    outsideVisitors: "",  
    wheelchairAccessible: ""  
   },  
   petPolicy: {  
    petsAllowed: "",  
    petsLivingOnProperty: ""  
   },  
   checkinCheckoutPolicies: {  
    twentyFourHourCheckin: ""  
   },  
   extraBedPolicies: {  
    extraAdults: "",  
    extraKids: ""  
   },  
   customPolicy: "",  
   mealRackPrices: {  
    breakfast: "",  
    lunch: "",  
    dinner: ""  
   }  
})  

console.log(data)
  
  const times = [  
   "12:00 am (midnight)", "1:00 am", "2:00 am", "3:00 am", "4:00 am", "5:00 am",  
   "6:00 am", "7:00 am", "8:00 am", "9:00 am", "10:00 am", "11:00 am",  
   "12:00 pm (noon)", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm",  
   "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm", "11:00 pm"  
  ]  
  
  const handleGuestProfileChange = (question, answer) => {  
   setData(prev => ({ ...prev, guestProfileAnswers: { ...prev.guestProfileAnswers, [question]: answer } }))  
  }  
  
  const handlePropertyRestrictionsChange = (question, answer) => {  
   setData(prev => ({ ...prev, propertyRestrictions: { ...prev.propertyRestrictions, [question]: answer } }))  
  }  
  
  const handlePetPolicyChange = (question, answer) => {  
   setData(prev => ({ ...prev, petPolicy: { ...prev.petPolicy, [question]: answer } }))  
  }  
  
  const handleCheckinCheckoutPoliciesChange = (question, answer) => {  
   setData(prev => ({ ...prev, checkinCheckoutPolicies: { ...prev.checkinCheckoutPolicies, [question]: answer } }))  
  }  
  
  const handleExtraBedPoliciesChange = (question, answer) => {  
   setData(prev => ({ ...prev, extraBedPolicies: { ...prev.extraBedPolicies, [question]: answer } }))  
  }  
  
  const handleMealRackPricesChange = (question, answer) => {  
   setData(prev => ({ ...prev, mealRackPrices: { ...prev.mealRackPrices, [question]: answer } }))  
  }  
  // Assuming 'data' is the object containing the new data for 'policies' (or any other field in formData)
useEffect(() => {
  if (data) {
    setFormData(prevData => ({
      ...prevData,
      policies: { ...prevData.policies, ...data }, // Merge the new 'policies' data into the existing 'policies'
    }));
  }
}, [data]);

useEffect(() => {
  if(formData?.policies?.cancellationPolicy){
    setData(formData?.policies);
  }
},[])


  return (  
   <Card className="w-full mx-auto  p-3 border border-gray-200 rounded-lg">  
    <div className='mb-4 borderspace-y-4  px-3'>  
      <h1 className="text-2xl font-semibold mb-2">Policies</h1>  
      <p className="text-sm text-gray-600 mb-2 ">Mention all the policies applicable at your property.</p>  
    </div>  
    <div className="mb-8 border border-gray-500 p-3 rounded-lg">  
      <h2 className="text-lg font-medium mb-2">Check-in & Check-out Time</h2>  
      <p className="text-sm text-gray-600 mb-4 ">Specify the check-in & check-out time at your property</p>  
      <div className="grid grid-cols-2 gap-4">  
       <div>  
        <Select label="Check-in Time" value={data.checkInTime} onChange={(value) => setData(prev => ({ ...prev, checkInTime: value }))}>  
          {times.map((time) => (  
           <Option key={time} value={time}>{time}</Option>  
          ))}  
        </Select>  
       </div>  
       <div>  
        <Select label="Check-out Time" value={data.checkOutTime} onChange={(value) => setData(prev => ({ ...prev, checkOutTime: value }))}>  
          {times.map((time) => (  
           <Option key={time} value={time}>{time}</Option>  
          ))}  
        </Select>  
       </div>  
      </div>  
    </div>  
  
    <div className="mb-8 border border-gray-500 p-3 rounded-lg">  
      <h2 className="text-lg font-medium mb-2">Cancellation Policy</h2>  
      <p className="text-sm text-gray-600 mb-2 border-b-2">Select a suitable cancellation policy</p>  
      <div className="flex flex-col ">  
       <Radio  
        name="cancellation"  
        label="Free cancellation upto 24 hrs"  
        checked={data.cancellationPolicy === "24hrs"}
        value="24hrs"  
        onChange={() => setData(prev => ({ ...prev, cancellationPolicy: "24hrs" }))}  
       />  
       <Radio  
        name="cancellation"  
        label="Free cancellation upto 48 hrs" 
        checked={data.cancellationPolicy === "48hrs"} 
        value="48hrs"  
        onChange={() => setData(prev => ({ ...prev, cancellationPolicy: "48hrs" }))}  
       />  
       <Radio  
        name="cancellation"  
        label="Free cancellation upto 72 hrs"  
        checked={data.cancellationPolicy === "72hrs"} 
        value="72hrs"  
        onChange={() => setData(prev => ({ ...prev, cancellationPolicy: "72hrs" }))}  
       />  
       <Radio  
        name="cancellation"  
        label="Non Refundable"  
        checked={data.cancellationPolicy === "non-refundable"} 
        value="non-refundable"  
        onChange={() => setData(prev => ({ ...prev, cancellationPolicy: "non-refundable" }))}  
       />  
      </div>  
    </div>  
  
    <div className='border border-gray-500 p-3 rounded-lg'>  
      <h2 className="text-lg font-medium mb-2">Property Rules <span className="text-sm font-normal text-gray-600">(optional)</span></h2>  
      <p className="text-sm text-gray-600 mb-4 ">Add property rules basis the requirement of your property listing</p>  
    </div>  
  
    {/* Previous sections remain unchanged */}  
  
    <Accordion open={true} className="mt-4 mb-4 borderspace-y-4 border border-gray-500 px-3 rounded-lg">  
      <h2 className="text-lg font-medium mt-2">Guest Profile</h2>  
      <AccordionBody>  
       <div className="space-y-4  px-3 rounded-lg">  
        <div className="flex items-center justify-between border-b ">  
          <Typography className="mb-2">Do you allow unmarried couples?</Typography>  
          <div className="flex gap-4">  
           <Radio name="unmarriedCouples" checked={data?.guestProfileAnswers?.unmarriedCouples === "No"} label="No" onChange={() => handleGuestProfileChange('unmarriedCouples', 'No')} />  
           <Radio name="unmarriedCouples" checked={data?.guestProfileAnswers?.unmarriedCouples === "Yes"} label="Yes" onChange={() => handleGuestProfileChange('unmarriedCouples', 'Yes')} />  
          </div>  
        </div>  
        <div className="mb-4 flex items-center justify-between border-b ">  
          <Typography className="mb-2">Do you allow guests below 18 years of age at your property?</Typography>  
          <div className="flex gap-4">  
           <Radio name="guestsBelow18" checked={data?.guestProfileAnswers?.guestsBelow18 === "No"} label="No" onChange={() => handleGuestProfileChange('guestsBelow18', 'No')} />  
           <Radio name="guestsBelow18" checked={data?.guestProfileAnswers?.guestsBelow18 === "Yes"} label="Yes" onChange={() => handleGuestProfileChange('guestsBelow18', 'Yes')} />  
          </div>  
        </div>  
        <div className="mb-4 flex items-center justify-between ">  
          <Typography className="mb-2">Groups with only male guests are allowed at your property?</Typography>  
          <div className="flex gap-4">  
           <Radio name="maleOnlyGroups" checked={data?.guestProfileAnswers?.maleOnlyGroups === "No"}  label="No" onChange={() => handleGuestProfileChange('maleOnlyGroups', 'No')} />  
           <Radio name="maleOnlyGroups" checked={data?.guestProfileAnswers?.maleOnlyGroups === "Yes"} label="Yes" onChange={() => handleGuestProfileChange('maleOnlyGroups', 'Yes')} />  
          </div>  
        </div>  
       </div>  
      </AccordionBody>  
    </Accordion>  
  
    <Accordion open={true} className="mb-4 borderspace-y-4 border border-gray-500 px-3 rounded-lg">  
      <h2 className="text-lg font-medium mt-2">Acceptable Identity Proofs</h2>  
      <AccordionBody>  
       <div className="space-y-4 px-3 rounded-lg">  
        <div className="mb-4 flex items-center justify-between border-b pb-2">  
          <Typography className="mb-2">Acceptable Identity Proofs</Typography>  
          <Select label="Select" value={data?.acceptableIdProof} onChange={(value) => setData(prev => ({ ...prev, acceptableIdProof: value }))}>  
           <Option value="passport">Passport</Option>  
           <Option value="drivingLicense">Driving License</Option>  
           <Option value="voterID">Voter ID</Option>  
          </Select>  
        </div>  
        <div className="mb-4 flex items-center justify-between  pb-1">  
          <Typography className="mb-2">Are IDs of the same city as the property allowed?</Typography>  
          <div className="flex gap-4">  
           <Radio name="sameCity"   label="No" onChange={() => setData(prev => ({ ...prev, sameCity: 'No' }))} />  
           <Radio name="sameCity" label="Yes" onChange={() => setData(prev => ({ ...prev, sameCity: 'Yes' }))} />  
          </div>  
        </div>  
       </div>  
      </AccordionBody>  
    </Accordion>  
  
    <Accordion open={true} className="space-y-4 border border-gray-500 px-3 rounded-lg">  
      <h2 className="text-lg font-medium mt-2">Property Restrictions</h2>  
      <AccordionBody>  
       <div className="space-y-4 px-3 rounded-lg">  
        <div className="mb-4 flex items-center justify-between border-b ">  
          <Typography className="mb-2">Is smoking allowed anywhere within the premises? (Select 'No' if it's not permitted, even in outdoor spaces like balconies or lawns, or any designated smoking area)</Typography>  
          <div className="flex gap-4">  
           <Radio name="smoking" label="No" onChange={() => handlePropertyRestrictionsChange('smoking', 'No')} />  
           <Radio name="smoking" label="Yes" onChange={() => handlePropertyRestrictionsChange('smoking', 'Yes')} />  
          </div>  
        </div>  
        <div className="mb-4 flex items-center justify-between border-b ">  
          <Typography className="mb-2">Are Private parties or events allowed at the property?</Typography>  
          <div className="flex gap-4">  
           <Radio name="privateParties" label="No" onChange={() => handlePropertyRestrictionsChange('privateParties', 'No')} />  
           <Radio name="privateParties" label="Yes" onChange={() => handlePropertyRestrictionsChange('privateParties', 'Yes')} />  
          </div>  
        </div>  
        <div className="mb-4 flex items-center justify-between border-b ">  
          <Typography className="mb-2">Can guests invite any outside visitors in the room during their stay?</Typography>  
          <div className="flex gap-4">  
           <Radio name="outsideVisitors" label="No" onChange={() => handlePropertyRestrictionsChange('outsideVisitors', 'No')} />  
           <Radio name="outsideVisitors" label="Yes" onChange={() => handlePropertyRestrictionsChange('outsideVisitors', 'Yes')} />  
          </div>  
        </div>  
        <div className="mb-4 flex items-center justify-between  ">  
          <Typography className="mb-2">Is your property accessible for guests who use a wheelchair?</Typography>  
          <div className="flex gap-4">  
           <Radio name="wheelchairAccessible" label="No" onChange={() => handlePropertyRestrictionsChange('wheelchairAccessible', 'No')} />  
           <Radio name="wheelchairAccessible" label="Yes" onChange={() => handlePropertyRestrictionsChange('wheelchairAccessible', 'Yes')} />  
          </div>  
        </div>  
       </div>  
      </AccordionBody>  
    </Accordion>  
  
    <Accordion open={true} className="mb-4 borderspace-y-4 border border-gray-500 px-3 rounded-lg mt-3">  
      <h2 className="text-lg font-medium mt-2">Pet Policy</h2>  
      <AccordionBody>  
       <div className="px-3 rounded-lg">  
        <div className="mb-2 flex items-center justify-between border-b ">  
          <Typography className="mb-2">Are Pets Allowed?</Typography>  
          <div className="flex gap-4">  
           <Radio name="petsAllowed" label="No" onChange={() => handlePetPolicyChange('petsAllowed', 'No')} />  
           <Radio name="petsAllowed" label="Yes" onChange={() => handlePetPolicyChange('petsAllowed', 'Yes')} />  
          </div>  
        </div>  
        <div className="flex items-center justify-between ">  
          <Typography className="mb-2">Any Pet(s) living on the property?</Typography>  
          <div className="flex gap-4">  
           <Radio name="petsLivingOnProperty" label="No" onChange={() => handlePetPolicyChange('petsLivingOnProperty', 'No')} />  
           <Radio name="petsLivingOnProperty" label="Yes" onChange={() => handlePetPolicyChange('petsLivingOnProperty', 'Yes')} />  
          </div>  
        </div>  
       </div>  
      </AccordionBody>  
    </Accordion>  
  
    <Accordion open={true} className="mb-4 borderspace-y-4 border border-gray-500 p-3 rounded-lg mt-3">  
      <h2 className="text-lg font-medium mt-2">Checkin and Checkout Policies</h2>  
      <AccordionBody>  
       <div className="space-y-4 px-3 rounded-lg">  
        <div className="flex items-center justify-between border-b ">  
          <Typography className="mb-2">Do you have a 24-hour check-in?</Typography>  
          <div className="flex gap-4">  
           <Radio name="twentyFourHourCheckin" label="No" onChange={() => handleCheckinCheckoutPoliciesChange('twentyFourHourCheckin', 'No')} />  
           <Radio name="twentyFourHourCheckin" label="Yes" onChange={() => handleCheckinCheckoutPoliciesChange('twentyFourHourCheckin', 'Yes')} />  
          </div>  
        </div>  
       </div>  
      </AccordionBody>  
    </Accordion>  
  
    <Accordion open={true} className="mb-4 borderspace-y-4 border border-gray-500 p-3 rounded-lg mt-3">  
      <h2 className="text-lg font-medium mt-2">Extra Bed Policies</h2>  
      <AccordionBody>  
       <div className="space-y-4 px-3 rounded-lg">  
        <div className="flex items-center justify-between border-b ">  
          <Typography className="mb-2">Do you provide bed to extra adults?</Typography>  
          <div className="flex gap-4">  
           <Radio name="extraAdults" label="No" onChange={() => handleExtraBedPoliciesChange('extraAdults', 'No')} />  
           <Radio name="extraAdults" label="Yes" onChange={() => handleExtraBedPoliciesChange('extraAdults', 'Yes')} />  
          </div>  
        </div>  
        <div className="flex items-center justify-between border-b ">  
          <Typography className="mb-2">Do you provide bed to extra kids?</Typography>  
          <div className="flex gap-4">  
           <Radio name="extraKids" label="No" onChange={() => handleExtraBedPoliciesChange('extraKids', 'No')} />  
           <Radio name="extraKids" label="Yes" onChange={() => handleExtraBedPoliciesChange('extraKids', 'Yes')} />  
          </div>  
        </div>  
       </div>  
      </AccordionBody>  
    </Accordion>  
  
    <Accordion open={true} className="mb-4  border border-gray-500 p-3 rounded-lg mt-3">  
      <h2 className="text-lg font-medium mt-2">Custom Policy</h2>  
      <AccordionBody>  
       <div className="px-3 rounded-lg">  
        <Typography className="mb-2">Custom Policy</Typography>  
        <textarea  
          placeholder="Please add details"  
          className="w-full p-2 border rounded-md border-gray-300"  
          maxLength={3000}  
          value={data.customPolicy}  
          onChange={(e) => setData(prev => ({ ...prev, customPolicy: e.target.value }))}  
        ></textarea>  
        <div className="text-right text-gray-400 text-sm">0 of 3000</div>  
       </div>  
      </AccordionBody>  
    </Accordion>  
  
    <Accordion open={true} className="mb-4 border border-gray-500 p-3 rounded-lg mt-3">  
      <h2 className="text-lg font-medium mt-2">Meal Rack Prices</h2>  
      <AccordionBody>  
       <div className="space-y-4 px-3 rounded-lg">  
        {/* Breakfast Price */}  
        <div className="flex items-center justify-between   rounded-lg ">  
          <Typography className="mb-2">Breakfast</Typography>  
          <input placeholder="₹ Enter" style={{ height: "40px" }} className=" border border-gray-300 rounded-md px-2 ml-auto" value={data.mealRackPrices.breakfast} onChange={(e) => handleMealRackPricesChange('breakfast', e.target.value)} />  
        </div>  
        {/* Lunch Price */}  
        <div className="flex items-center justify-between   rounded-lg mt-2">  
          <Typography className="mb-2">Lunch</Typography>  
          <input placeholder="₹ Enter" style={{ height: "40px" }} className=" border border-gray-300 rounded-md px-2 ml-auto" value={data.mealRackPrices.lunch} onChange={(e) => handleMealRackPricesChange('lunch', e.target.value)} />  
        </div>  
        {/* Dinner Price */}  
        <div className="flex items-center justify-end  rounded-lg mt-2">  
          <Typography className="mb-2">Dinner</Typography>  
          <input placeholder="₹ Enter" style={{ height: "40px" }} className=" border border-gray-300 rounded-md px-2 ml-auto" value={data.mealRackPrices.dinner} onChange={(e) => handleMealRackPricesChange('dinner', e.target.value)} />  
        </div>  
       </div>  
      </AccordionBody>  

    </Accordion>  
   </Card>  
  )  
}
