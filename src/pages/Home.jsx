import React from "react";
import { useSelector } from "react-redux";
import { Icons } from "../icons";

const { HotAirBaloon, Destinations, Packages, Users, Employees  } = Icons;

export default function Home() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <div className="flexright">
      <div className="right-side">
        <a href="/activities-listing">
          <div className="box1 shadow-md flex flex-col items-center gap-4">
            <HotAirBaloon />
            Activities
          </div>
        </a>

        <a href="/destinations">
          <div className="box1 shadow-md flex flex-col items-center gap-4">
            <Destinations />
            Destinations
          </div>
        </a>
        <a href="/create-package">
          <div className="box1 shadow-md flex flex-col items-center gap-4">
            <Packages />
            Packages
          </div>
        </a>
        <a href="/destinations">
          <div className="box1 shadow-md flex flex-col items-center gap-4">
            <Employees />
            Employees
          </div>
        </a>
        <a href="/destinations">
          <div className="box1 shadow-md flex flex-col items-center gap-4">
            <Users />
            Users
          </div>
        </a>
      </div>
    </div>
  );
}
