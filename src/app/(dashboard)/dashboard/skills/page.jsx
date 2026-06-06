"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Pagination } from "@/components/ui/pagination"
import { LoadingState } from "@/components/ui/LoadingState"
import { ErrorMessage } from "@/components/ui/ErrorMessage"
import { EmptyState } from "@/components/ui/EmptyState"
import { SkillCard } from "@/components/skills/SkillCard"
import { CategoryFilter } from "@/components/skills/CategoryFilter"
import { OrderSelector } from "@/components/skills/OrderSelector"
import { Search } from "lucide-react"

export default function SkillsPage() {
  const router = useRouter()

  const [data, setData] = useState({ count: 0, results: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pageSize, setPageSize] = useState(10)

  const [category, setCategory] = useState(null)
  const [ordering, setOrdering] = useState("name")
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [category, ordering])

  const fetchSkills = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = { ordering, page }
      if (category) params.category = category
      if (search) params.search = search

      const { data: resp } = await api.get("/skills/", { params })
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
  }, [category, search, ordering, page])

  useEffect(() => { fetchSkills() }, [fetchSkills])

  return (
    <main className="flex-1 p-6 space-y-4">
      <h1 className="text-xl font-semibold">Skills</h1>

      <CategoryFilter selected={category} onChange={setCategory} />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
            placeholder="Buscar skills..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <OrderSelector value={ordering} onChange={setOrdering} />
      </div>

      {loading && <LoadingState message="Cargando skills..." />}

      {!loading && error && (
        <ErrorMessage
          message="No se pudieron cargar las skills. Revisa tu conexión."
          onRetry={fetchSkills}
        />
      )}

      {!loading && !error && data.results.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Sin skills"
          message={
            category || search
              ? "Ninguna skill coincide con los filtros actuales."
              : "Aún no hay skills disponibles."
          }
        />
      )}

      {!loading && !error && data.results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.results.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onClick={() => router.push(`/dashboard/skills/${skill.id}`)}
            />
          ))}
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
