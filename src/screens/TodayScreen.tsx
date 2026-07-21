import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Zap, Plus, Sparkles } from 'lucide-react'
import { useSessionStore } from '../store/sessionStore'
import {
  leerHistorial,
  leerPerfil,
  calcularVolumen,
  leerPlanificacionActiva,
  leerDiasCompletados,
  estadisticasAdherencia,
} from '../db/db'
import { generarRecomendaciones } from '../recommendations'
import { RecommendationCard } from '../components/RecommendationCard'
import { PlansSection } from '../components/plans/PlansSection'
import { TodayWorkoutCard } from '../components/today/TodayWorkoutCard'
import { WeekStrip } from '../components/today/WeekStrip'
import { Button, Card, StatNumber, SectionHeader } from '../components/ui'
import { TrainingCalendar } from '../components/calendar/TrainingCalendar'

const HOY = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function TodayScreen() {
  const navigate = useNavigate()
  const { active, iniciar } = useSessionStore()
  const [showCalendar, setShowCalendar] = useState(false)
  const [starting, setStarting] = useState(false)

  // Datos reactivos
  const historial = useLiveQuery(() => leerHistorial(20), [], [])
  const perfil = useLiveQuery(async () => (await leerPerfil()) ?? null, [], null)
  const schedule = useLiveQuery(
    async () => (await leerPlanificacionActiva()) ?? null,
    [],
    null,
  )
  const [completedDays, setCompletedDays] = useState<Record<string, any>>({})
  const [adherencia, setAdherencia] = useState<any>(null)

  // Carga días completados
  useEffect(() => {
    const cargar = async () => {
      if (!schedule) return
      const haceUnMes = new Date()
      haceUnMes.setDate(haceUnMes.getDate() - 30)
      const desde = haceUnMes.toISOString().split('T')[0]
      const hasta = new Date().toISOString().split('T')[0]

      const dias = await leerDiasCompletados(desde, hasta)
      const mapa: Record<string, any> = {}
      dias.forEach((d) => {
        mapa[d.date] = { completed: !d.skipped, skipped: d.skipped }
      })
      setCompletedDays(mapa)

      const adh = await estadisticasAdherencia()
      setAdherencia(adh)
    }
    void cargar()
  }, [schedule])

  // Hoy
  const hoy = new Date()
  const todayOfWeek = hoy.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
  const todayTraining = schedule?.weekPlan[todayOfWeek] || {
    dayOfWeek: todayOfWeek,
    trainingType: 'rest' as const,
  }

  // Recomendaciones
  const recomendaciones = generarRecomendaciones(
    historial,
    perfil ?? undefined,
  )

  // Resumen semana
  const haceUnaSemana = Date.now() - 7 * 24 * 3600 * 1000
  const semana = historial.filter((s) => s.startedAt >= haceUnaSemana)
  const volSemana = semana.reduce((n, s) => n + calcularVolumen(s), 0)

  const empezar = async () => {
    setStarting(true)
    try {
      await iniciar()
      navigate('/entrenar')
    } catch (err) {
      console.error(err)
      setStarting(false)
    }
  }

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Zap className="w-12 h-12 text-lime" />
        <p className="text-text/50">Cargando planificación...</p>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Encabezado compacto */}
      <div className="sticky top-0 z-10 bg-bg/80 backdrop-blur border-b border-border px-6 py-4 mb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-text/50 text-sm">Hoy</p>
            <h1 className="text-2xl font-extrabold text-text capitalize">
              {HOY.split(',')[0]}
            </h1>
          </div>
          {adherencia && (
            <div className="text-right">
              <p className="text-xs text-text/50">Esta semana</p>
              <p className="text-xl font-extrabold text-lime">
                {adherencia.completados7}/{adherencia.total7}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Tarjeta protagonista: hoy toca... */}
        {active ? (
          <Card interactive onClick={() => navigate('/entrenar')}>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-lime" />
              <p className="text-sm font-semibold text-lime">En curso</p>
            </div>
            <p className="text-text font-medium">Vuelve a tu entrenamiento</p>
            <p className="text-text/50 text-sm">Continúa donde lo dejaste</p>
          </Card>
        ) : (
          <TodayWorkoutCard
            training={todayTraining}
            isRest={todayTraining.trainingType === 'rest'}
            onStart={empezar}
            loading={starting}
          />
        )}

        {/* Tira semanal */}
        <WeekStrip
          weekPlan={schedule.weekPlan}
          completedDays={completedDays}
          onViewCalendar={() => setShowCalendar(true)}
        />

        {/* Resumen esta semana */}
        <Card className="bg-gradient-to-br from-surface to-bg">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text/60">
            <Sparkles className="h-4 w-4 text-lime" />
            Esta semana
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatNumber value={semana.length} unit="días" label="Entrenados" tone="lime" />
            <StatNumber
              value={(volSemana / 1000).toFixed(1)}
              unit="t"
              label="Volumen"
            />
            <StatNumber value={adherencia?.porcentaje || 0} unit="%" label="Adherencia" />
          </div>
        </Card>

        {/* Recomendaciones */}
        {recomendaciones.length > 0 && (
          <div>
            <SectionHeader
              title="Recomendaciones"
              subtitle="Basadas en tu historial"
            />
            <div className="space-y-3">
              {recomendaciones.slice(0, 2).map((rec, i) => (
                <RecommendationCard key={i} rec={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Planes */}
        <PlansSection />

        {/* Accesos rápidos */}
        <div className="space-y-3">
          <SectionHeader title="Accesos rápidos" />
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 py-4"
              onClick={() => navigate('/entrenar')}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Libre</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 py-4"
              onClick={() => navigate('/ejercicios')}
            >
              <Zap className="w-5 h-5" />
              <span className="text-xs">Ejercicios</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 py-4"
              onClick={() => navigate('/progreso')}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs">Progreso</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal calendario */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur flex items-end">
          <div className="w-full bg-bg rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-text">Calendario</h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-text/50 hover:text-text transition-colors"
              >
                ✕
              </button>
            </div>
            <TrainingCalendar
              weekPlan={schedule.weekPlan}
              completedDays={completedDays}
            />
          </div>
        </div>
      )}
    </div>
  )
}
