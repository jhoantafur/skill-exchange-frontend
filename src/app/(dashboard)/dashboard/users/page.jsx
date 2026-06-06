"use client"

import { useEffect, useState, useCallback } from "react"
import api from "@/lib/api"
import { Pagination } from "@/components/ui/pagination"
import { LoadingState } from "@/components/ui/LoadingState"
import { ErrorMessage } from "@/components/ui/ErrorMessage"
import { EmptyState } from "@/components/ui/EmptyState"
import { Search } from "lucide-react"

function getInitials(firstName, lastName) {
  return [firstName, lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join("")
    || "?"
}

export default function UsersPage() {
  const [data, setData] = useState({ count: 0, results: [] })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = { page }
      if (search) params.search = search
      const { data: resp } = await api.get("/users/", { params })
      const results = resp.results ?? (Array.isArray(resp) ? resp : [])

      if (page === 1 && results.length > 0) {
        setPageSize(results.length)
      }

      setData({
        count: resp.count ?? 0,
        results,
      })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <main className="flex-1 p-6 space-y-4">
      <h1 className="text-xl font-semibold">Usuarios</h1>

      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
          placeholder="Buscar por nombre o email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {loading && <LoadingState message="Cargando usuarios..." />}

      {!loading && error && (
        <ErrorMessage
          message="No se pudieron cargar los usuarios. Revisa tu conexión."
          onRetry={fetchUsers}
        />
      )}

      {!loading && !error && data.results.length === 0 && (
        <EmptyState
          icon="👤"
          title="Sin usuarios"
          message={
            search
              ? "Ningún usuario coincide con tu búsqueda."
              : "No hay usuarios disponibles."
          }
        />
      )}

      {!loading && !error && data.results.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Fecha de ingreso
                </th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                      <span className="font-medium">
                        {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {user.date_joined
                      ? new Date(user.date_joined).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <Pagination
          count={data.count}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </main>
  )
}
