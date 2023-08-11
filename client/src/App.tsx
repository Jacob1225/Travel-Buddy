import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { CookiesProvider, useCookies} from 'react-cookie';
import { useDispatch } from 'react-redux';
import Home from './components/Home';
import Map from './components/Map';
import { ChakraProvider } from '@chakra-ui/react'
import 'react-toastify/dist/ReactToastify.css';
import SearchBar from './components/SearchBar';
import OptionsMenu from './components/OptionsMenu';

export default function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['credentials', 'g_state']);
  const dispatch = useDispatch(); 

  const notify = (notification: string) => toast(notification, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });

  return (
  <ChakraProvider>
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
          /> }/>
          <Route path="/test" element={ <SearchBar 
            routeLoading={false}
          /> }/>
          {/* <Route path="/options" element={ <OptionsMenu
          /> }/> */}
        </Routes>
      </Router>
      <ToastContainer/>
      </CookiesProvider>
    </ChakraProvider>
  );
}
