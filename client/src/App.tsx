import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { CookiesProvider, useCookies} from 'react-cookie';
import { useDispatch } from 'react-redux';
import Home from './components/Home';
import Map from './components/Map';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['credentials', 'g_state']);
  const dispatch = useDispatch(); 

  const notify = (notification: string) => toast(notification, {
    position: "top-right",
    toastId: "success",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "light",
  });
  
  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route path="/" element={ <Home
            notify={notify}
            dispatch={dispatch}
            cookies={cookies}
            setCookie={setCookie}
            removeCookie={removeCookie}
          /> }/>
          <Route path="/map" element={ <Map 
            cookies={cookies}
            dispatch={dispatch}
            notify={notify}
            removeCookie={removeCookie}
          /> }/>
        </Routes>
      </Router>
      <ToastContainer/>
      </CookiesProvider>
  );
}
