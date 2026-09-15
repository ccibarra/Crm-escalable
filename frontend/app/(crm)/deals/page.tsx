"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Deal {
  id: string;
  contact_id: string;
  owner_id: string;
  title: string;
  description: string | null;
  stage: string;
}

interface Contact {
  id: string;
  nombre: string;
  email: string | null;
  empresa: string | null;
}

interface DealForm {
  title: string;
  description: string;
  contact_id: string;
  stage: string;
}

const initialForm: DealForm = {
  title: "",
  description: "",
  contact_id: "",
  stage: "PROSPECTO",
};

const stageLabels: Record<string, string> = {
  PROSPECTO: "Prospecto",
  CONTACTADO: "Contactado",
  PROPUESTA: "Propuesta",
  CERRADO_GANADO: "Cerrado / Ganado",
  PERDIDO: "Perdido",
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<DealForm>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);

  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadDeals() {
    const token = getToken();

    if (!token) {
      setError("Sesión no válida");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<Deal[]>("/api/v1/deals", {
        token,
      });

      setDeals(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("No fue posible cargar las oportunidades");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadContacts() {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const data = await apiFetch<Contact[]>("/api/v1/contacts", {
        token,
      });

      setContacts(data);
    } catch {
      setError("No fue posible cargar los contactos");
    }
  }

  useEffect(() => {
    loadDeals();
    loadContacts();
  }, []);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreateModal() {
    setForm(initialForm);
    setEditingDealId(null);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(deal: Deal) {
    setForm({
      title: deal.title,
      description: deal.description || "",
      contact_id: deal.contact_id,
      stage: deal.stage,
    });

    setEditingDealId(deal.id);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openDeleteModal(deal: Deal) {
  setDealToDelete(deal);
  setError("");
  setSuccess("");
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setForm(initialForm);
    setEditingDealId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      setError("Sesión no válida");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const body = {
      title: form.title,
      description: form.description || null,
      contact_id: form.contact_id,
      stage: form.stage,
    };

    try {
      if (editingDealId) {
        await apiFetch<Deal>(
          `/api/v1/deals/${editingDealId}`,
          {
            method: "PUT",
            token,
            body: JSON.stringify(body),
          },
        );

        setSuccess("Oportunidad actualizada correctamente.");
      } else {
        await apiFetch<Deal>("/api/v1/deals", {
          method: "POST",
          token,
          body: JSON.stringify(body),
        });

        setSuccess("Oportunidad creada correctamente.");
      }

      setForm(initialForm);
      setEditingDealId(null);
      setShowModal(false);

      await loadDeals();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          editingDealId
            ? "No fue posible actualizar la oportunidad"
            : "No fue posible crear la oportunidad",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!dealToDelete) {
        return;
    }

    const token = getToken();

    if (!token) {
        setError("Sesión no válida");
        return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
        await apiFetch<void>(
        `/api/v1/deals/${dealToDelete.id}`,
        {
            method: "DELETE",
            token,
        },
        );

        setDealToDelete(null);

        setSuccess("Oportunidad eliminada correctamente.");

        await loadDeals();
    } catch (error) {
        if (error instanceof Error) {
        setError(error.message);
        } else {
        setError("No fue posible eliminar la oportunidad");
        }
    } finally {
        setDeleting(false);
    }
  }

  function getStageStyle(stage: string) {
    switch (stage) {
      case "PROSPECTO":
        return "bg-gray-100 text-gray-700";

      case "CONTACTADO":
        return "bg-blue-100 text-blue-700";

      case "PROPUESTA":
        return "bg-yellow-100 text-yellow-700";

      case "CERRADO_GANADO":
        return "bg-green-100 text-green-700";

      case "PERDIDO":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getContactName(contactId: string) {
    const contact = contacts.find(
      (item) => item.id === contactId,
    );

    return contact?.nombre || contactId;
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Oportunidades
        </h1>

        <p className="mt-4 text-gray-600">
          Cargando oportunidades...
        </p>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Oportunidades
            </h1>

            <p className="mt-2 text-gray-600">
              Gestiona las oportunidades comerciales.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            + Nueva oportunidad
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
          {deals.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <p>No hay oportunidades registradas.</p>

              <button
                onClick={openCreateModal}
                className="mt-4 font-medium text-blue-600 hover:text-blue-700"
              >
                Crear la primera oportunidad
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Título
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Contacto
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Descripción
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Etapa
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deals.map((deal) => (
                    <tr
                      key={deal.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {deal.title}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {getContactName(deal.contact_id)}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {deal.description || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStageStyle(
                            deal.stage,
                          )}`}
                        >
                          {stageLabels[deal.stage] || deal.stage}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(deal)}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => openDeleteModal(deal)}
                          className="ml-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingDealId
                    ? "Editar oportunidad"
                    : "Nueva oportunidad"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingDealId
                    ? "Actualiza la información de la oportunidad."
                    : "Registra una nueva oportunidad comercial."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="text-2xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Título *
                </label>

                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  autoFocus
                  placeholder="Ej. Implementación CRM"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="contact_id"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Contacto *
                </label>

                <select
                  id="contact_id"
                  name="contact_id"
                  value={form.contact_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">
                    Selecciona un contacto
                  </option>

                  {contacts.map((contact) => (
                    <option
                      key={contact.id}
                      value={contact.id}
                    >
                      {contact.nombre}
                      {contact.empresa
                        ? ` - ${contact.empresa}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Descripción
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe brevemente la oportunidad..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="stage"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Etapa
                </label>

                <select
                  id="stage"
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="PROSPECTO">
                    Prospecto
                  </option>

                  <option value="CONTACTADO">
                    Contactado
                  </option>

                  <option value="PROPUESTA">
                    Propuesta
                  </option>

                  <option value="CERRADO_GANADO">
                    Cerrado / Ganado
                  </option>

                  <option value="PERDIDO">
                    Perdido
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Guardando..."
                    : editingDealId
                      ? "Guardar cambios"
                      : "Crear oportunidad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL ELIMINAR */}
      {dealToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                Eliminar oportunidad
                </h2>

                <p className="mt-3 text-gray-600">
                ¿Estás seguro de que deseas eliminar la oportunidad?
                </p>

                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="font-medium text-gray-900">
                    {dealToDelete.title}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                    {stageLabels[dealToDelete.stage] || dealToDelete.stage}
                </p>
                </div>

                <p className="mt-4 text-sm text-red-600">
                Esta acción no se puede deshacer.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setDealToDelete(null)}
                    disabled={deleting}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {deleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}