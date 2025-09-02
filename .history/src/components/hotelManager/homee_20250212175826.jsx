import React from 'react'
import { Card, CardHeader, CardBody, Typography, Input, Button, Progress } from '@material-tailwind/react'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import ListedProperites from './ListedPoperties'


export function Homee() {
  return (
     
   
    <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1 mt-5">
    <Card className="w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-8 mb-8">
          <div>
            <Typography variant="h3" color="blue-gray">
              My Properties
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Link to="/property">
            <Button className="flex items-center gap-3" size="sm" color="blue">
              
              <PlusIcon strokeWidth={2} className="h-4 w-4" /> Create New
             
            </Button>
            </Link>
          </div>
        </div>
        <div className="w-full md:w-72">
          <Input
            label="Search by name"
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
          />
        </div>
      </CardHeader>
      <ListedProperites />
    </Card>
    </div>
  )
}
export default Homee;