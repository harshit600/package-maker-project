// components/ui-kit/molecules/Table.js
import React from "react";
import PropTypes from "prop-types";

const Table = ({ headers, data, renderRow, renderActions }) => {
  return (
    <table className="w-full text-sm text-left text-gray-800 bg-gray-200 border-collapse shadow-sm rounded-lg overflow-hidden">
      <thead className="border-b border-gray-300 text-xs font-semibold uppercase tracking-wider text-gray-600">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-2 py-3 text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={index}
            className={`${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            } pl-2 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200`}
          >
            {renderRow(row)}
            {renderActions && (
              <td className="px-6 py-3 text-right">
                {renderActions(row)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

Table.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.array.isRequired,
  renderRow: PropTypes.func.isRequired,
  renderActions: PropTypes.func,
};

export default Table;
