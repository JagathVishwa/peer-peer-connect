import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Room from './pages/Room'; // Make sure the Room component is imported

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/room/:roomId" element={<Room />} />
        {/* other routes */}
      </Routes>
    </Router>
  );
}

export default App;
