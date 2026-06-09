import { useTranslation } from "react-i18next";

type RespostaItem = {
  pergunta: string;
  resposta: string;
};

type Props = {
  respostas: RespostaItem[];
  titulo: string;
};

export default function CardQuestionarioRespostas({
  respostas,
  titulo,
}: Props) {
  const { t } = useTranslation("common");

  if (!respostas?.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("minha_avaliacao.respostas_questionario")}
        </h2>

        <p className="font-semibold text-blue-900">{titulo}</p>
      </div>

      <div
        className={`
          grid
          grid-cols-1
          ${respostas.length > 2 ? "lg:grid-cols-2" : ""}
          gap-x-8
        `}
      >
        {respostas.map((item, index) => (
          <div
            key={index}
            className={`
              py-5
              ${
                index !== respostas.length - 1 ? "border-b border-gray-200" : ""
              }
            `}
          >
            <p className="font-semibold text-blue-900">
              {index + 1}. {item.pergunta}
            </p>

            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
              <span className="font-semibold text-gray-900">R:</span>{" "}
              {item.resposta}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
