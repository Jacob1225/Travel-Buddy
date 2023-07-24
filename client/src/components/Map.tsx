import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMemoizedMap } from '../reducers/map';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import { setCurrentLocation } from '../reducers/map';

let mapsKey: string = String(process.env.REACT_APP_GOOGLE_MAPS_API);


//const [user, map] = useSelector((state: any) => [state.user, state.map]);

export default function Map({cookies, dispatch }: any) {
    const navigate = useNavigate();
    let mapState = useSelector(getMemoizedMap);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: mapsKey
    })

    const locationSuccess = (position: any) => {
        dispatch(setCurrentLocation({
            currentLatitude: position.coords.latitude,
            currentLongitude: position.coords.longitude,
            destinationLatitude: "",
            destinationLongitude: ""
        }))
    }

    const locationError = (error: any) => {
        console.log('Cannot get user location ', error);
    } 

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    }

    useEffect(() => {
        if (!cookies.credentials) {
            navigate("/");
        }
    })

    if(!isLoaded) {
        //add spinner
        return <h1>Hi</h1>
    }

    return(
        
        <GoogleMap
            center={{lat: mapState.currentLatitude, lng: mapState.currentLongitude}}
            zoom={15}
            mapContainerStyle={{width: '100%', height: '100%'}}
        >
        </GoogleMap>
    )
}