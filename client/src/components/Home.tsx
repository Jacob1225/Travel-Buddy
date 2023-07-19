import Spline from '@splinetool/react-spline';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie'
import { loginUser } from '../features/user'; 
import { useGoogleOneTapLogin } from 'react-google-one-tap-login';

let clientID: string = String(process.env.REACT_APP_CLIENT_ID);
const setCookie: any = useCookies(['credentials']);

const callback = (response: any) => {
    setCookie('credentials', response.credential, { path: '/'});
}

export default function Home() {
    const dispatch = useDispatch(); 
    let navigate = useNavigate();

    useGoogleOneTapLogin({
        onSuccess: response => {
            console.log(response);
            dispatch(loginUser({name: response.name, email: response.email,
                given_name: response.given_name, isLogged: true}));
            navigate("/map");
        },
        onError: error => console.log(error), //TODO: add notification that it did not work
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

