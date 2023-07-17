import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import Map from './components/Map';

export default function App() {

  return (
      <Router>
          <Routes>
            <Route path="/" element={ <Home/> }/>
            <Route path="/map" element={ <Map/> }/>

          </Routes>
      </Router>
  );
}
