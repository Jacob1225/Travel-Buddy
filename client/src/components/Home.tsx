import Spline from '@splinetool/react-spline';
import { useSelector, useDispatch } from 'react-redux';
import { UserState, loginUser } from '../features/user'; 
import { useGoogleOneTapLogin } from 'react-google-one-tap-login';

let clientID: string = String(process.env.REACT_APP_CLIENT_ID);

export default function Home() {
    //const dispatch = useDispatch();

    useGoogleOneTapLogin({
        onSuccess: response => {
            loginUser({name: response.name, email: response.email, given_name: response.given_name, isLogged: true})
        },
        onError: error => console.log(error), //TODO: add notification that it did not work
        googleAccountConfigs: {
            client_id: clientID
        },
    }); 

    //const user = useSelector()

    return (
        <Spline scene="https://prod.spline.design/FxfNdLxC2I8o3LF1/scene.splinecode"
            //onMouseDown={onMouseDown}
        />
  );
}

