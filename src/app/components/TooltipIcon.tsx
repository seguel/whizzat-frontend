import { useState } from "react";
import { FiHelpCircle } from "react-icons/fi";

type TooltipIconProps = {
  message: string;
  perfil: "candidato" | "avaliador" | "recrutador";
};

export default function TooltipIcon({ message, perfil }: TooltipIconProps) {
  const [show, setShow] = useState(false);

  // Map para classes de cor de acordo com o perfil
  const perfilColors: Record<
    "candidato" | "avaliador" | "recrutador",
    { bg: string; hover: string; text: string }
  > = {
    candidato: {
      bg: "bg-green-500",
      hover: "hover:bg-green-200",
      text: "text-green-500",
    },
    recrutador: {
      bg: "bg-purple-500",
      hover: "hover:bg-purple-200",
      text: "text-purple-500",
    },
    avaliador: {
      bg: "bg-blue-500",
      hover: "hover:bg-blue-200",
      text: "text-blue-500",
    },
  };

  const msgClass = `absolute left-5 top-1 z-10 w-64 p-2 text-xs text-white rounded shadow-lg whitespace-pre-line 
    ${perfilColors[perfil].bg} 
    ${perfilColors[perfil].text}
    `;
  const hlpCircle = `cursor-pointer
   ${perfilColors[perfil].text}
    `;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <FiHelpCircle className={hlpCircle} size={16} />
      {show && <div className={msgClass}>{message}</div>}
    </div>
  );
}
