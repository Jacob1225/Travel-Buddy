import Spline from '@splinetool/react-spline';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, validateUser} from '../reducers/user'; 
import jwt_decode from "jwt-decode";


let clientID: string = String(process.env.REACT_APP_CLIENT_ID);

export default function Home({notify, cookies, setCookie, removeCookie, dispatch, ref}: any) {
    const navigate = useNavigate();
    
    const validateGoogleToken = async(gToken: string) => {
        const serverToken = await dispatch(validateUser(gToken));
        console.log(serverToken);

        if(serverToken.payload && typeof(serverToken.payload) === 'object' && 'token' in serverToken.payload){
            const name: string = setUserInfo(gToken);
            setCookie('jwt_token', serverToken.payload.token, {path: '/'});
            notify(`🦄 Welcome ${name}!`)
            navigate('/map');
        } else {
            //google credentials have expired and user must sign in again
            notify('Google credentials have expired');
            removeCookie('credentials', {path: '/'});
            removeCookie('g_state', {path: '/'}) 
        }
    }

    const setUserInfo = (credentials: string) => {
        //decodes the google credential once validated and updates user state
        const token: any = jwt_decode(credentials);
        setCookie('credentials', credentials, { path: '/'});
        dispatch(loginUser({name: token.name, email: token.email,
            given_name: token.given_name, isLogged: true}));

        return token.name
    }

    const loginWithFallback = () => {
        //See if google prompt is displayed
        google.accounts.id.prompt((notification: any) => {
            if(!notification.h || notification.j === "suppressed_by_user") {
                // @ts-ignore - render google button
                const buttonDiv = window.document.createElement("div")
                buttonDiv.setAttribute("id", "googleLoginBtn")
                buttonDiv.style.position = "absolute";
                buttonDiv.style.bottom = "50px";
                buttonDiv.style.right = "80px";
                document.getElementsByTagName('body')[0].appendChild(buttonDiv);
                // @ts-ignore
                google.accounts.id.renderButton(
                    document.getElementById("googleLoginBtn")!,
                    { type: "standard", theme: "outline", size: "large" }  // customization attributes
                );
            }
        })
    }
   
    const callback = async (response: any) => {
        if (response && 'credential' in response){
            //Validate google credentials in backend
            validateGoogleToken(response.credential);

        } else {
            notify.error('Google Login Error!');
        }
    }
    useEffect(() => {
        if ('credentials' in cookies) {
            validateGoogleToken(cookies.credentials);
        }
        else {
            //initialize google client - Make it global
            /* global google */
            google.accounts.id.initialize({
                client_id: clientID,
                callback: callback
            })
            //Prompt user to login
            loginWithFallback();
        }
    }, [])
    return (
        <Spline scene="https://prod.spline.design/FxfNdLxC2I8o3LF1/scene.splinecode"/>
    );
}