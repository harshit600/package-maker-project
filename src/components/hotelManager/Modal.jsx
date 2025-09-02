import React from "react";

const Modal = ({ show, closeModal, title, children, css }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center z-50">
      <div className={`bg-white rounded-lg shadow-md w-full h-full p-6 relative ${css}`}>
        <button
          onClick={closeModal}
          className="absolute top-2 right-4 text-3xl text-gray-500 hover:text-gray-700 focus:outline-none"
        >
           &times;
        </button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
