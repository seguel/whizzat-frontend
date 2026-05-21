"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";

type Agenda = {
  id: number;
  data_hora_agenda: string;
  status: string;
};

type Props = {
  habilitado: boolean;
  avaliacaoId: string;
  agenda?: Agenda | null;
  status: string;

  entrevistaRealizada: boolean;
  setEntrevistaRealizada: (value: boolean) => void;
};

export default function CardAgenda({
  habilitado,
  avaliacaoId,
  agenda,
  status,
  entrevistaRealizada,
  setEntrevistaRealizada,
}: Props) {
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>();

  const [horarioSelecionado, setHorarioSelecionado] = useState<string>("");

  const [loadingEnviar, setLoadingEnviar] = useState(false);
  const horarioSelecionadoRef = useRef<HTMLButtonElement | null>(null);

  const hoje = new Date();

  const limite = new Date();
  limite.setMonth(limite.getMonth() + 3);

  // 👇 status agenda
  const agendaPendente = agenda?.status === "PENDENTE";
  const agendaAceita = agenda?.status === "ACEITO";
  const agendaRecusada = agenda?.status === "RECUSADO";

  // const entrevistaRealizada = status === "ENTREVISTA_REALIZADA";

  // 👇 bloqueia somente quando existe agenda válida
  const bloqueado = agendaPendente || agendaAceita;

  // 👇 permite reagendar quando recusada
  const podeReagendar = agendaRecusada;

  // 👇 carrega agenda existente
  useEffect(() => {
    if (agenda?.data_hora_agenda) {
      const data = new Date(agenda.data_hora_agenda);

      setDataSelecionada(data);

      setHorarioSelecionado(
        data.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }
  }, [agenda]);

  useEffect(() => {
    if (horarioSelecionadoRef.current) {
      horarioSelecionadoRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [horarioSelecionado]);

  // 👇 gera horários 08:00 → 19:45
  const horarios = useMemo(() => {
    const lista: string[] = [];

    for (let h = 8; h <= 18; h++) {
      ["00", "15", "30", "45"].forEach((m) => {
        lista.push(`${String(h).padStart(2, "0")}:${m}`);
      });
    }

    return lista;
  }, []);

  const dataHoraCompleta =
    dataSelecionada && horarioSelecionado
      ? new Date(
          `${dataSelecionada.toISOString().split("T")[0]}T${horarioSelecionado}:00`,
        )
      : null;

  const handleEnviarAgenda = async () => {
    if (!dataHoraCompleta) return;

    try {
      setLoadingEnviar(true);
      console.log(dataHoraCompleta.toISOString());
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/avaliacoes/agendar`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avaliacao_id: Number(avaliacaoId),
            data: dataHoraCompleta.toISOString(),
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao enviar agenda");
      }

      const data = await res.json();

      console.log("Agenda enviada:", data);

      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEnviar(false);
    }
  };

  const statusAgendaLabel = {
    PENDENTE: "Aguardando aceite",
    ACEITO: "Aceita",
    RECUSADO: "Recusada",
  }[agenda?.status ?? ""];

  return (
    <div className="bg-white p-1 border rounded-xl shadow-sm flex flex-col gap-2 h-[525px] overflow-hidden">
      <h2 className="font-semibold">Data Entrevista</h2>

      {/* 👇 agenda enviada */}
      {agenda && (
        <div
          className={`rounded-lg px-3 py-2 text-sm shadow-sm border
          ${
            agendaRecusada
              ? "border-red-200 bg-red-50"
              : agendaAceita
                ? "border-green-200 bg-green-50"
                : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-700">Sugestão enviada:</span>

            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap
              ${
                agendaRecusada
                  ? "bg-red-100 text-red-700"
                  : agendaAceita
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {statusAgendaLabel}
            </span>
          </div>

          <div
            className={`mt-1 font-bold whitespace-nowrap
                ${
                  agendaRecusada
                    ? "text-red-700"
                    : agendaAceita
                      ? "text-green-700"
                      : "text-yellow-700"
                }`}
          >
            {new Date(agenda.data_hora_agenda).toLocaleDateString("pt-BR")} -{" "}
            {new Date(agenda.data_hora_agenda).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-start">
        {/* 👇 calendário */}
        <div
          className="flex-1 min-w-0"
          style={
            {
              "--rdp-cell-size": "15px",
            } as React.CSSProperties
          }
        >
          <DayPicker
            locale={ptBR}
            mode="single"
            selected={dataSelecionada}
            onSelect={setDataSelecionada}
            disabled={
              !habilitado || bloqueado ? true : { before: hoje, after: limite }
            }
            className="text-[13px]"
            styles={{
              month_grid: {
                width: "100%",
              },
              day: {
                margin: 0,
              },
            }}
            classNames={{
              months: "flex justify-center",
              caption: "flex justify-center mb-2",
              table: "border-collapse",
              head_cell: "text-xs text-gray-500 font-medium p-0",
              cell: "p-0",
              day: "text-[12px] rounded-md hover:bg-gray-100",
              day_selected: "bg-blue-600 text-white hover:bg-blue-600",
            }}
          />
        </div>

        {/* 👇 horários */}
        <div className="w-24 border-l overflow-y-auto max-h-[290px] bg-gray-50">
          <div className="sticky top-0 bg-white px-2 py-2 text-xs font-medium text-gray-500">
            Horários
          </div>

          <div className="p-2 flex flex-col gap-1">
            {horarios.map((horario) => (
              <button
                key={horario}
                ref={
                  horarioSelecionado === horario ? horarioSelecionadoRef : null
                }
                disabled={!habilitado || bloqueado}
                onClick={() => setHorarioSelecionado(horario)}
                className={`text-sm rounded-md py-1 transition
                      ${
                        horarioSelecionado === horario
                          ? "bg-blue-600 text-white"
                          : habilitado && !bloqueado
                            ? "hover:bg-blue-100 text-gray-700"
                            : "text-gray-300 cursor-not-allowed"
                      }`}
              >
                {horario}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 👇 preview */}
      {dataHoraCompleta && !bloqueado && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm shadow-sm">
          <span className="text-gray-700">Sugestão selecionada:</span>{" "}
          <span className="font-bold text-indigo-700 whitespace-nowrap">
            {dataHoraCompleta.toLocaleDateString("pt-BR")} -{" "}
            {dataHoraCompleta.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      <button
        onClick={handleEnviarAgenda}
        disabled={
          !habilitado ||
          !dataSelecionada ||
          !horarioSelecionado ||
          loadingEnviar ||
          bloqueado
        }
        className={`rounded-lg py-1 text-sm font-semibold transition border border-transparent
        ${
          !habilitado ||
          !dataSelecionada ||
          !horarioSelecionado ||
          loadingEnviar ||
          bloqueado
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "text-indigo-900 bg-blue-100 hover:bg-blue-200 hover:border-blue-300 cursor-pointer"
        }`}
      >
        {loadingEnviar
          ? "Enviando..."
          : podeReagendar
            ? "Enviar Nova Sugestão"
            : agendaPendente
              ? "Sugestão enviada"
              : "Enviar Sugestão"}
      </button>

      {!habilitado && !agenda && (
        <p className="text-xs text-gray-400">
          Disponível após envio do questionário ou caso o avaliador opte por não
          enviar.
        </p>
      )}

      {agendaAceita && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={entrevistaRealizada || status == "FINALIZADO"}
              onChange={(e) => setEntrevistaRealizada(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />

            <span className="font-medium text-gray-700">
              Confirmar entrevista realizada
            </span>
          </label>

          {/* <p className="text-xs text-gray-500 mt-1">
            Após confirmar, será possível finalizar a avaliação.
          </p> */}
        </div>
      )}
    </div>
  );
}
