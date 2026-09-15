export default function DashboardPage() {
  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Resumen de tu actividad comercial.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Contactos
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            0
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Oportunidades
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            0
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Interacciones
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            0
          </p>
        </div>
      </div>
    </div>
  );
}