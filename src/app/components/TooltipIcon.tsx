import { useState } from "react";
import { FiHelpCircle } from "react-icons/fi";

type TooltipIconProps = {
  message: string;
};

export default function TooltipIcon({ message }: TooltipIconProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <FiHelpCircle className="text-purple-500 cursor-pointer" size={16} />
      {show && (
        <div className="absolute left-5 top-1 z-10 w-64 p-2 text-xs text-white bg-purple-500 rounded shadow-lg whitespace-pre-line">
          {message}
        </div>
      )}
    </div>
  );
}
