export default function AvaliacaoHistorico({ historico }: any) {
  return (
    <div className="bg-white p-6 border rounded-xl shadow">
      <h2 className="font-semibold mb-4">Histórico</h2>

      <div className="space-y-3">
        {historico.map((item: any, index: number) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{item.evento}</span>

            <span className="text-gray-500">{item.data}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
