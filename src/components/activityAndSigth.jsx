import React from 'react';

const ActivityAndSightseeing = ({ 
  dayActivities, 
  day, 
  selectedPackage, 
  setSelectedPackage, 
  citySightseeing, 
  handleRemoveSightseeing 
}) => {
  return (
    <div>
      {/* Activities and Sightseeing Section */}
      <div className="space-y-6">
        {/* Activities Section */}
        {dayActivities && dayActivities.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Activities Header */}
            <div className="bg-[rgb(45,45,68)] text-white px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Activities for
                      Day {day.day}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {dayActivities.length} activities
                      planned
                    </p>
                  </div>
                </div>
                {/* Total Activities Price Display */}
                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    Total Activities
                    Cost
                  </div>
                  <div className="text-xl font-bold">
                    ₹
                    {dayActivities
                      .reduce(
                        (
                          acc,
                          activity
                        ) =>
                          acc +
                          (activity.price ||
                            activity.discount_price) *
                            (activity.quantity ||
                              1),
                        0
                      )
                      .toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Activities List */}
            <div className="p-3">
              <div className="space-y-3">
                {dayActivities.map(
                  (
                    activity,
                    actIndex
                  ) => (
                    <div
                      key={actIndex}
                      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex p-3">
                        {/* Activity Image with Overlay */}
                        <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={
                              activity.imageUrl ||
                              "https://placehold.co/300x200?text=Activity"
                            }
                            alt={
                              activity.title
                            }
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            onError={(
                              e
                            ) => {
                              e.target.onerror =
                                null;
                              e.target.src =
                                "https://placehold.co/300x200?text=Activity";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 ml-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                {
                                  activity.title
                                }
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                  {
                                    activity.category_id
                                  }
                                </span>
                                {activity.tags && (
                                  <span className="text-xs text-gray-500">
                                    {activity.tags
                                      .split(
                                        ","
                                      )
                                      .slice(
                                        0,
                                        2
                                      )
                                      .join(
                                        " • "
                                      )}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ₹
                                {activity.price ||
                                  activity.discount_price}
                              </div>
                              <div className="text-xs text-gray-500">
                                per
                                person
                              </div>

                              {/* Quantity Selector */}
                              <div className="mt-2 flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    const updatedActivities =
                                      selectedPackage.activities.map(
                                        (
                                          a
                                        ) => {
                                          if (
                                            a ===
                                            activity
                                          ) {
                                            return {
                                              ...a,
                                              quantity:
                                                Math.max(
                                                  (a.quantity ||
                                                    1) -
                                                  1,
                                                  1
                                                ),
                                            };
                                          }
                                          return a;
                                        }
                                      );
                                    setSelectedPackage(
                                      (
                                        prev
                                      ) => ({
                                        ...prev,
                                        activities:
                                          updatedActivities,
                                      })
                                    );
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {activity.quantity ||
                                    1}
                                </span>
                                <button
                                  onClick={() => {
                                    const updatedActivities =
                                      selectedPackage.activities.map(
                                        (
                                          a
                                        ) => {
                                          if (
                                            a ===
                                            activity
                                          ) {
                                            return {
                                              ...a,
                                              quantity:
                                                (a.quantity ||
                                                  1) +
                                                1,
                                            };
                                          }
                                          return a;
                                        }
                                      );
                                    setSelectedPackage(
                                      (
                                        prev
                                      ) => ({
                                        ...prev,
                                        activities:
                                          updatedActivities,
                                      })
                                    );
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
                                >
                                  +
                                </button>
                              </div>

                              {/* Total Price */}
                              <div className="mt-1 text-sm text-gray-600">
                                Total:
                                ₹
                                {(
                                  (activity.price ||
                                    activity.discount_price) *
                                  (activity.quantity ||
                                    1)
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="mt-1.5 text-gray-600 text-xs line-clamp-2">
                            {activity.short_description?.replace(
                              /<\/?[^>]+(>|$)/g,
                              ""
                            )}
                          </p>

                          {/* Activity Meta Information */}
                          <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-xs">
                                1 Hour
                                Duration
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                              </svg>
                              <span className="text-xs">
                                {
                                  activity.location_site
                                }
                                ,{" "}
                                {
                                  activity.city
                                }
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                View
                                Details
                              </button>
                              <button
                                onClick={() => {
                                  const updatedActivities =
                                    selectedPackage.activities.filter(
                                      (
                                        a
                                      ) =>
                                        a !==
                                        activity
                                    );
                                  setSelectedPackage(
                                    (
                                      prev
                                    ) => ({
                                      ...prev,
                                      activities:
                                        updatedActivities,
                                    })
                                  );
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors duration-300"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Remove
                              </button>
                            </div>
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                Available
                                Today
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ActivityAndSightseeing;

    
