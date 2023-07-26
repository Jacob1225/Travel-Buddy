import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMemoizedMap, setCurrentLocation } from '../reducers/map';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';
import Spinner from './Spinner';

let mapsKey: string = String(process.env.REACT_APP_GOOGLE_MAPS_API);

export default function Map({cookies, dispatch }: {cookies: any, dispatch: any}) { //TODO: maybe type the props? 
    const navigate = useNavigate();
    let mapState = useSelector(getMemoizedMap);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: mapsKey
    })

    const locationSuccess = (position: any) => {
        dispatch(setCurrentLocation({
            currentLatitude: position.coords.latitude,
            currentLongitude: position.coords.longitude,
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
        <Spinner 
            color={"white"}
            loading={true}
        />
    }

    return(
        isLoaded ? 
            <GoogleMap
                center={{lat: mapState.currentLatitude, lng: mapState.currentLongitude}}
                zoom={15}
                mapContainerStyle={{width: '100%', height: '100%'}}
            >
            <MarkerF position={{lat: mapState.currentLatitude, lng: mapState.currentLongitude}}/>
            </GoogleMap>
        :
            <Spinner color={"white"} loading={true}/>
    )
}