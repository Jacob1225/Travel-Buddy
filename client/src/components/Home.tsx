import Spline from '@splinetool/react-spline';
import { useGoogleOneTapLogin } from 'react-google-one-tap-login';
import { useSelector } from 'react-redux';
import { UserState } from '../features/user';

let clientID: string;

clientID = String(process.env.REACT_APP_CLIENT_ID);

//Define Google button configuration type
type GsiButtonConfiguration = {
    client_id: string,
    auto_select: string,
    cancel_on_tap_outside: string
}
export default function Home() {
    const user = useSelector((state: any) => state.user.value)
    useGoogleOneTapLogin({
        onError: error => console.log(error),
        onSuccess: response => console.log(response),
        googleAccountConfigs: {
          client_id: clientID
        },
      });

    return (
        <Spline scene="https://prod.spline.design/FxfNdLxC2I8o3LF1/scene.splinecode"
            //onMouseDown={onMouseDown}
        />
  );
}

