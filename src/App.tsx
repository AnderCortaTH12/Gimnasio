import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import {
  TodayScreen,
  HistoryScreen,
  ProgressScreen,
  ExercisesScreen,
  ExerciseDetailScreen,
  ProfileScreen,
} from './screens'

/**
 * Raíz de FORJA. Enrutado con react-router: un layout común (tab bar inferior)
 * envuelve las 5 pestañas, más la vista de detalle de ejercicio.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<TodayScreen />} />
          <Route path="historial" element={<HistoryScreen />} />
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
