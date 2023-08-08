import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Stack, } from '@chakra-ui/react'
import { getMemoizedMap, setCurrentLocation, getStops } from '../reducers/map';
import { useJsApiLoader, GoogleMap, MarkerF, InfoWindow } from '@react-google-maps/api';
import Spinner from './Spinner';

let mapsKey: string = String(process.env.REACT_APP_GOOGLE_MAPS_API);

export default function Map({cookies, dispatch }: {cookies: any, dispatch: any}) { //TODO: maybe type the props? 
    //marker state
    const [activeMarker, setActiveMarker] = useState(null);

    const navigate = useNavigate();
    let mapState = useSelector(getMemoizedMap);
        
    const locationSuccess = (position: any) => {
        dispatch(setCurrentLocation({
            currentLatitude: position.coords.latitude,
            currentLongitude: position.coords.longitude,
        }))
    }

    const locationError = (error: any) => {
        console.log('Cannot get user location ', error);
    } 

    const handleActiveMarker = (stopID: any) => {
        if (stopID === activeMarker) {
          return;
        }
        setActiveMarker(stopID);
    };

    useEffect(() => {
        //if no credentials redirect to login - else fetch stops
        if (!cookies.credentials) {
            navigate("/");
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
        }

        /* Fetch stops only if no stops in state
            Will fetch on refresh as size of data is too large to be persisted 
        */
        if (mapState && mapState.static_stops.length === 0) {
            dispatch(getStops()) 
        }
    }, [dispatch])

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: mapsKey
    })

    //console.log(mapState.static_stops)
    return(
        isLoaded ? 
            <GoogleMap
                center={{lat: mapState.currentLatitude, lng: mapState.currentLongitude}}
                zoom={15}
                mapContainerStyle={{width: '100%', height: '100%'}}
            >
                
            <MarkerF position={{lat: mapState.currentLatitude, lng: mapState.currentLongitude}}/>

            {mapState.static_stops.map((stop: any, index: number) => {
                return (
                <MarkerF 
                    key={index} position={{lat: stop.stop_lat, lng: stop.stop_lon}} 
                    onClick={() => handleActiveMarker(stop.stop_id)}
                >
                    {activeMarker === stop.stop_id ? (
                        <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                            <Stack>
                                <Box><Heading size='xs'>Stop Name:</Heading> {stop.stop_name}</Box>
                                <Box><Heading size='xs'>Transit Line:</Heading> {stop.route_short_name}</Box>
                                <Box><Heading size='xs'>Transit Direction:</Heading> {stop.trip_headsign}</Box>
                                <Box><Heading size='xs'>Route Name:</Heading> {stop.route_long_name}</Box>
                                <Box><Heading size='xs'>Stop Type:</Heading> {stop.route_type === 1 ? 'Metro': 'Bus'}</Box>
                            </Stack>
                        </InfoWindow>
                    ) : null}
                </MarkerF>)
            })}
            
            </GoogleMap>
        :
            <Spinner color={"white"} loading={true}/>
    )
}