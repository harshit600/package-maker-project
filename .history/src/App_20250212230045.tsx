import { Navigate, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      // ... other routes ...
    </Routes>
  )
}

export default App 