"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Contact {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  empresa: string | null;
  status: string;
  owner_id: string;
}

interface ContactForm {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  status: string;
}

const initialForm: ContactForm = {
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  status: "NUEVO",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<ContactForm>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingContactId, setEditingContactId] = useState<string | null>(
    null,
  );

  const [contactToDelete, setContactToDelete] =
    useState<Contact | null>(null);

  async function loadContacts() {
    const token = getToken();

    if (!token) {
      setError("Sesión no válida");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<Contact[]>("/api/v1/contacts", {
        token,
      });

      setContacts(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("No fue posible cargar los contactos");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openCreateModal() {
    setForm(initialForm);
    setEditingContactId(null);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(contact: Contact) {
    setForm({
      nombre: contact.nombre,
      email: contact.email || "",
      telefono: contact.telefono || "",
      empresa: contact.empresa || "",
      status: contact.status,
    });

    setEditingContactId(contact.id);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setForm(initialForm);
    setEditingContactId(null);
  }

  function openDeleteModal(contact: Contact) {
    setError("");
    setSuccess("");
    setContactToDelete(contact);
  }

  function closeDeleteModal() {
    if (deleting) return;

    setContactToDelete(null);
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
      nombre: form.nombre,
      email: form.email || null,
      telefono: form.telefono || null,
      empresa: form.empresa || null,
      status: form.status,
    };

    try {
      if (editingContactId) {
        await apiFetch<Contact>(
          `/api/v1/contacts/${editingContactId}`,
          {
            method: "PUT",
            token,
            body: JSON.stringify(body),
          },
        );

        setSuccess("Contacto actualizado correctamente.");
      } else {
        await apiFetch<Contact>("/api/v1/contacts", {
          method: "POST",
          token,
          body: JSON.stringify(body),
        });

        setSuccess("Contacto creado correctamente.");
      }

      setForm(initialForm);
      setEditingContactId(null);
      setShowModal(false);

      await loadContacts();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          editingContactId
            ? "No fue posible actualizar el contacto"
            : "No fue posible crear el contacto",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!contactToDelete) return;

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
        `/api/v1/contacts/${contactToDelete.id}`,
        {
          method: "DELETE",
          token,
        },
      );

      setContactToDelete(null);
      setSuccess("Contacto eliminado correctamente.");

      await loadContacts();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("No fue posible eliminar el contacto");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Contactos
        </h1>

        <p className="mt-4 text-gray-600">
          Cargando contactos...
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
              Contactos
            </h1>

            <p className="mt-2 text-gray-600">
              Gestiona tus contactos comerciales.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            + Nuevo contacto
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
          {contacts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <p>No hay contactos registrados.</p>

              <button
                onClick={openCreateModal}
                className="mt-4 font-medium text-blue-600 hover:text-blue-700"
              >
                Crear el primer contacto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Nombre
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Teléfono
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Empresa
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Estado
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {contact.nombre}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {contact.email || "-"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {contact.telefono || "-"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {contact.empresa || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {contact.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(contact)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => openDeleteModal(contact)}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
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
                  {editingContactId
                    ? "Editar contacto"
                    : "Nuevo contacto"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingContactId
                    ? "Actualiza la información del contacto."
                    : "Registra un nuevo contacto comercial."}
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
                  htmlFor="nombre"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Nombre *
                </label>

                <input
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="telefono"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Teléfono
                </label>

                <input
                  id="telefono"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="empresa"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Empresa
                </label>

                <input
                  id="empresa"
                  name="empresa"
                  value={form.empresa}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="NUEVO">Nuevo</option>
                  <option value="CONTACTADO">Contactado</option>
                  <option value="CALIFICADO">Calificado</option>
                  <option value="NO_CALIFICADO">
                    No calificado
                  </option>
                  <option value="CLIENTE">Cliente</option>
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
                    : editingContactId
                      ? "Guardar cambios"
                      : "Crear contacto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Eliminar contacto
              </h2>

              <p className="mt-3 text-gray-600">
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-semibold text-gray-900">
                  {contactToDelete.nombre}
                </span>
                ?
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Esta acción no se puede deshacer.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
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