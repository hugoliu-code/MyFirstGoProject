import React from "react";

type PopUpProps = {
  showPopUp: boolean;
  text: string;
  closePopUp: () => void;
};

const PopUp: React.FC<PopUpProps> = ({ showPopUp, text, closePopUp }) => {
  if (!showPopUp) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-slate-100/80 flex flex-col justify-center v-screen items-center z-50 text-neutral-800">
      {text != "" && (
        <h1 className="max-w-xl border rounded-lg bg-slate-100/100 p-4">
          {text}
        </h1>
      )}
      {text == "" && (
        <h1 className="text-xl border rounded-lg bg-slate-100/100 p-4">
          Generating...
        </h1>
      )}
      <div className="py-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 transition-colors duration-200"
          onClick={closePopUp}
        >
          close
        </button>
      </div>
    </div>
  );
};

export default PopUp;
