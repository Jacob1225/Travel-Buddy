import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { CookiesProvider } from 'react-cookie';
import Home from './components/Home';
import Map from './components/Map';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {

  const notify = (notification: string, options: any) => toast(notification);

  return (
      <CookiesProvider>
        <Router>
            <Routes>
              <Route path="/" element={ <Home notify={notify}/> }/>
              <Route path="/map" element={ <Map/> }/>
            </Routes>
        </Router>
        <ToastContainer />
      </CookiesProvider>

  );
}
