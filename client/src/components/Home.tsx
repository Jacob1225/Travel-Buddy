import Spline from '@splinetool/react-spline';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser} from '../reducers/user'; 
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
    - Add logout + remove cookie + remove g_state
*/
export default function Home({notify, cookies, setCookie, removeCookie, dispatch }: any) {
    const navigate = useNavigate();

    useEffect(() => {
        if ('credentials' in cookies) {
            const token: any = jwt_decode(cookies.credentials);
            dispatch(loginUser({name: token.name, email: token.email,
                given_name: token.given_name, isLogged: true}));
            notify(`🦄 Welcome back!`) //TODO: find user name in state
            navigate('map')
        }
        else if ('g_state' in cookies) {removeCookie('g_state', {path: '/'}) };
    })
    
    const callback = (response: Credentials) => {
        if (response && 'credential' in response){
            const token: any = jwt_decode(response.credential);
            setCookie('credentials', response.credential, { path: '/'});
            dispatch(loginUser({name: token.name, email: token.email,
                given_name: token.given_name, isLogged: true}));
                notify(`🦄 Welcome ${token.name}!`)
            navigate('/map');
        } else {
            notify.error('Login Error!');
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
        <Spline scene="https://prod.spline.design/FxfNdLxC2I8o3LF1/scene.splinecode"/>
    );
}