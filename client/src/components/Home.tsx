import Spline from '@splinetool/react-spline';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, validateUser} from '../reducers/user'; 
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
            notify(`🦄 Welcome back!`)
            navigate('map')
        }
        else if ('g_state' in cookies) {removeCookie('g_state', {path: '/'}) };
    })
    
    const callback = async (response: Credentials) => {
        if (response && 'credential' in response){
            const token: any = jwt_decode(response.credential);
            setCookie('credentials', response.credential, { path: '/'});
            dispatch(loginUser({name: token.name, email: token.email,
                given_name: token.given_name, isLogged: true}));
            
            //Validate google credentials in backend
            const serverToken = await dispatch(validateUser(response.credential));
            
            if("token" in serverToken.data){
                setCookie('jwt-token', serverToken.data.token, {path: '/'});
                notify(`🦄 Welcome ${token.name}!`)
                navigate('/map');
            } else {
                notify.error('Error Validating google credentials');
            }

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