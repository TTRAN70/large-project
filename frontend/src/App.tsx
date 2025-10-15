import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";
import BouncingCat from "./components/BouncingCat";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BouncingCat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
