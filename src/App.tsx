import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { useSessionStore } from './store/sessionStore'
import {
  TodayScreen,
  WorkoutScreen,
  HistoryScreen,
  SessionDetailScreen,
  ProgressScreen,
  ExercisesScreen,
  ExerciseDetailScreen,
  ProfileScreen,
} from './screens'

/**
 * Raíz de FORJA. Enrutado con react-router: un layout común (tab bar inferior)
 * envuelve las pantallas. Al arrancar hidrata la sesión activa desde IndexedDB
 * para que un entrenamiento en curso sobreviva a recargar la app.
 */
function App() {
  const hidratar = useSessionStore((s) => s.hidratar)

  useEffect(() => {
    void hidratar()
  }, [hidratar])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<TodayScreen />} />
          <Route path="entrenar" element={<WorkoutScreen />} />
          <Route path="historial" element={<HistoryScreen />} />
          <Route path="historial/:id" element={<SessionDetailScreen />} />
          <Route path="progreso" element={<ProgressScreen />} />
          <Route path="ejercicios" element={<ExercisesScreen />} />
          <Route path="ejercicios/:id" element={<ExerciseDetailScreen />} />
          <Route path="perfil" element={<ProfileScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
