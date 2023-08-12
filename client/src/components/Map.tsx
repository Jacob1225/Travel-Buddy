import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Stack, Flex, Input } from '@chakra-ui/react'
import { getMemoizedMap, setCurrentLocation, getStops } from '../reducers/map';
import { useJsApiLoader, GoogleMap, MarkerF, InfoWindow, Autocomplete } from '@react-google-maps/api';
import Spinner from './Spinner';
import SearchBar from './SearchBar';
import OptionsMenu from './OptionsMenu';

let mapsKey: string = String(process.env.REACT_APP_GOOGLE_MAPS_API);
const libraries: any = ["places"];

export default function Map({cookies, dispatch }: {cookies: any, dispatch: any}) { //TODO: maybe type the props? 
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: mapsKey,
        libraries
    })
    
    //map & marker & visibility state
    const [map, setMap] = useState(null)
    const [activeMarker, setActiveMarker] = useState(null);
    const [visible, setVisible] = useState(true);

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
    
    const panTo = (map: any) => {
        map.panTo({lat: mapState.currentLatitude, lng: mapState.currentLongitude})
    }
    const clickCenterMap = () => {
        panTo(map)
    }

    const hideStops = () => {
        setVisible(false)
    }

    const showStops = () => {
        setVisible(true)
    }

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
    }, [dispatch, cookies.credentials])

    return(
        <Flex 
            position='relative'
            flexDirection='column'
            h='100vh'
            w='100vw'
            alignItems='center'
        >
            <Box
                position='absolute'
                left={0}
                top={0}
                h='100%'
                w='100%'
            >
                {isLoaded ? 
                    <GoogleMap
                        center={{lat: mapState.currentLatitude, lng: mapState.currentLongitude}}
                        zoom={15}
                        mapContainerStyle={{width: '100%', height: '100%'}}
                        onLoad={(map: any) => setMap(map)}
                    >
                        <MarkerF position={{lat: mapState.currentLatitude, lng: mapState.currentLongitude}}
                        />

                        {mapState.static_stops.map((stop: any, index: number) => {
                            return (
                            <MarkerF 
                                key={index} position={{lat: stop.stop_lat, lng: stop.stop_lon}}
                                visible={visible} 
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
                    <Spinner color={"white"} loading={true}/>}
            </Box>
                <SearchBar routeLoading={false} isLoaded={isLoaded} />
            <OptionsMenu 
                clickCenterMap={clickCenterMap}
                hideStops={hideStops}
                showStops={showStops}
                visibility={visible}
            />
        </Flex>
    )
}