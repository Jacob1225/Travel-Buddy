import { useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { setCurrentLocation } from '../reducers/map';

let mapsKey: string = String(process.env.REACT_APP_GOOGLE_MAPS_API);

export default function Map({cookies, dispatch }: any) {
    const user = useSelector((state: any) => state.user);
    const navigate = useNavigate();

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

    return(
        <h1>Map for {user.given_name}</h1>
    )
}