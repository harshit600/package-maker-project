import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Progress,
  Avatar,
  IconButton,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import ListedProperites from "./ListedPoperties";

export function Homee() {
  return (
    <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1 mt-5">
      <Card className="w-full">
       
        <ListedProperites />
      </Card>
    </div>
  );
}
export default Homee;
