"use client"

import { useEffect, useState, useCallback } from "react"
import api from "@/lib/api"
import { Pagination } from "@/components/ui/pagination"
import { LoadingState } from "@/components/ui/LoadingState"
import { ErrorMessage } from "@/components/ui/ErrorMessage"
import { EmptyState } from "@/components/ui/EmptyState"
import { Calendar, CheckCircle2, TrendingUp, Trophy } from "lucide-react"

function formatDecimal(value) {
  const num = parseFloat(value)
  return Number.isNaN(num) ? "0.00" : num.toFixed(2)
}

function getProgress(goal) {
  const current = parseFloat(goal.current_value) || 0
  const target = parseFloat(goal.target_value) || 1
  const pct = Math.min(100, Math.round((current / target) * 100))
  return { current, target, pct }
}

export default function GoalsPage() {
  const [data, setData] = useState({ count: 0, results: [] })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data: resp } = await api.get("/goals/", { params: { page } })
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
  }, [page])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleAchieveGoal = async (goalId) => {
    setActionLoading(goalId)
    try {
      await api.post(`/goals/${goalId}/achieve/`, {})
      await fetchGoals()
    } catch {
      alert("Error al marcar la meta como alcanzada. Inténtalo de nuevo.")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Metas de Aprendizaje</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Establece objetivos de estudio, mide tu progreso y alcanza tus metas.
          </p>
        </div>
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Trophy className="size-5" />
        </div>
      </div>

      {loading && <LoadingState message="Cargando metas de aprendizaje..." />}

      {!loading && error && (
        <ErrorMessage
          message="No se pudieron cargar tus metas de aprendizaje. Revisa tu conexión."
          onRetry={fetchGoals}
        />
      )}

      {!loading && !error && data.results.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Sin metas activas"
          message="No tienes ninguna meta configurada en este momento. ¡Añade metas para motivar tu estudio!"
        />
      )}

      {!loading && !error && data.results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.results.map((goal) => {
            const { current, target, pct } = getProgress(goal)
            const isAchieved = goal.status === "achieved"

            return (
              <div
                key={goal.id}
                className="rounded-lg border border-border p-5 bg-background space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isAchieved ? "bg-emerald-500" : "bg-primary"
                  }`}
                />

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-1">
                      {goal.title}
                    </h3>
                    {isAchieved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="size-3" />
                        Alcanzada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <TrendingUp className="size-3" />
                        En progreso
                      </span>
                    )}
                  </div>

                  {goal.skill && (
                    <p className="text-xs text-muted-foreground font-medium">
                      Skill vinculada: <span className="text-foreground">{goal.skill.name}</span>
                    </p>
                  )}

                  {goal.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-border mt-auto">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Progreso</span>
                      <span>
                        {formatDecimal(current)} / {formatDecimal(target)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAchieved ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      <span>
                        Límite:{" "}
                        {goal.target_date
                          ? new Date(goal.target_date).toLocaleDateString("es-CO", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>

                    {!isAchieved && (
                      <button
                        onClick={() => handleAchieveGoal(goal.id)}
                        disabled={actionLoading === goal.id}
                        className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === goal.id ? "Completando..." : "Alcanzar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
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
