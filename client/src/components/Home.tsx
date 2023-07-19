import Spline from '@splinetool/react-spline';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie'
import { loginUser } from '../features/user'; 
import { useGoogleOneTapLogin } from 'react-google-one-tap-login';
import jwt_decode from "jwt-decode";


let clientID: string = String(process.env.REACT_APP_CLIENT_ID);

interface Credentials {
    clientId: string,
    client_id: string,
    credential: string,
    user: string
}
/* TODO: 
    - Add logout + remove cookie
    - If cookie credential set - move to the map
    - If one tap login does not show up - call it on click of button
    - Add notifications for errors on login or cookie being set.
*/
export default function Home({notify}: any) {
    const dispatch = useDispatch(); 
    let navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['credentials']);


    const callback = (response: Credentials) => {
        if (response && 'credential' in response){
            const token: any = jwt_decode(response.credential);
            setCookie('credentials', response.credential, { path: '/'});
            dispatch(loginUser({name: token.name, email: token.email,
                given_name: token.given_name, isLogged: true}));
                notify(`🦄 Welcome ${token.name}!`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    })
            navigate('/map');
        } else {
            notify.error('Login Error!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    }
    
    useGoogleOneTapLogin({
        onError: error => console.log(error),
        googleAccountConfigs: {
            client_id: clientID,
            callback: callback
        },
    }); 

    return (
        <Spline scene="https://prod.spline.design/FxfNdLxC2I8o3LF1/scene.splinecode"
            //onMouseDown={onMouseDown}
        />

  );
}