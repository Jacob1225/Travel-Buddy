import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Stack, Flex } from '@chakra-ui/react'
import { convertTimestamp, getNearestArrivalTime, checkRefreshTimer } from '../utils/util';
import { getMemoizedMap, setCurrentLocation, getStops, getVehicles, getTransitLines, setInitNotify } from '../reducers/map';
import { useJsApiLoader, GoogleMap, MarkerF, InfoWindow, DirectionsRenderer, Polyline} from '@react-google-maps/api';
import Spinner from './Spinner';
import SearchBar from './SearchBar';
import OptionsMenu from './OptionsMenu';
import Logout from './Logout';
import { OCCUPANCYMAPPING, STATUSMAPPING } from '../mappings/vehiclesMappings';

let mapsKey: string = String(process.env.REACT_APP_GOOGLE_MAPS_API);
const libraries: any = ["places"];

export default function Map({cookies, dispatch, notify, removeCookie }: {cookies: any, dispatch: any, notify: any, removeCookie: any}) { //TODO: maybe type the props? 
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: mapsKey,
        libraries
    })

    //map & marker & visibility state
    const [map, setMap] = useState(null)
    const [activeMarker, setActiveMarker] = useState({id: "", routeID: ""});
    const [stopVisible, setStopVisible] = useState(true);
    const [busVisible, setBusVisible] = useState(true);
    const [center, setCenter] = useState({lat: 0, lng: 0})
    const [busNotified, setBusNotified] = useState(false);
    const [stopsNotified, setStopsNotified] = useState(false);

    const navigate = useNavigate();
    let mapState = useSelector(getMemoizedMap);

    const locationSuccess = (position: any) => {
        dispatch(setCurrentLocation({
            currentLatitude: position.coords.latitude,
            currentLongitude: position.coords.longitude,
        }))
    }

    const locationError = (error: any) => {
        console.log(error)
        notify('Cannot get user location!');
    } 
    
    const validateRefresh = (lastUpdate: string) => {
        const refresh  = checkRefreshTimer(lastUpdate);
        if (refresh) notify("Bus Positions should be refreshed!");
        
    }
    const handleActiveMarker = (vehicleMarker: boolean, markerID: string, routeID: string, lat: number, lng: number, lastUpdate: string) => {
        window.event!.preventDefault();
        if (vehicleMarker) {
            validateRefresh(lastUpdate);
        }
        if (markerID === activeMarker.id) {
          return;
        }
        setActiveMarker({id: markerID, routeID: routeID});
        setCenter({lat, lng});
    };
    
    const panTo = (map: any, lat: number, lng: number) => {
        setCenter({lat: 0, lng: 0})
        map.panTo({lat, lng});
    }
    const clickCenterMap = () => {
        panTo(map, mapState.currentLatitude, mapState.currentLongitude);
    }

    const hideMarkers = (markerType: string) => {
        if (markerType === 'stops') setStopVisible(false); else setBusVisible(false);
        setActiveMarker({id: "", routeID: ""});
    }

    const showMarkers = (markerType: string) => {
        if (markerType === 'stops') setStopVisible(true); else setBusVisible(true);
        setActiveMarker({id: "", routeID: ""});
    }

    const removeSignInButton = () =>{
        const googleBtn = document.getElementById("googleLoginBtn");
        googleBtn?.remove();
    }

    const refreshBuses = () => {
        if (mapState && mapState.vehiclesLoading) {
            notify("Buses are already loading!");
            return;
        } else if (mapState && !mapState.vehiclesLoading) {
            notify("Reloading Buses!");
            dispatch(getVehicles(cookies.jwt_token));
        }
    }

    useEffect(() => {
        removeSignInButton();
        if (!cookies.jwt_token) {
            navigate("/");
            return;
        }
        if (mapState && mapState.static_stops.length === 0 && mapState.vehicles.length === 0 && !mapState.initNotify) {
            dispatch(setInitNotify(true));
            notify('🦄 Stops & Buses are loading!');
        }
        if (mapState && mapState.stopsLoaded && !stopsNotified) {
            setStopsNotified(true);
            notify('🦄 Bus Stops have loaded!');

        } else if (mapState && !mapState.stopsLoaded && !mapState.stopsLoading) {
            notify("Error Fetching stops - Try Refreshing!")
        }
        
        if (mapState && mapState.vehiclesLoaded && !busNotified) {
            setBusNotified(true);
            notify('🦄 Bus Positions have loaded!');
        }
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
        }

        /* Fetch stops & vehicles only if no stops/vehicles in state
            Will fetch on refresh as size of data is too large to be persisted 
        */
        if (mapState && !mapState.stopsLoading && !mapState.stopsLoaded) {
            dispatch(getStops(cookies.jwt_token));
        } else if (mapState && mapState.stopsError){
            notify("⚠️Error Loading Bus Stops - Try Refreshing!⚠️");
        }
        if (mapState && !mapState.vehiclesLoaded && !mapState.vehiclesLoading){
            dispatch(getVehicles(cookies.jwt_token));
        } else if (mapState && mapState.vehiclesError) {
            notify("⚠️Error Loading Buses! - Try Refreshing!⚠️");
        }
        if (mapState && !mapState.linesLoaded && !mapState.linesLoading){
            dispatch(getTransitLines(cookies.jwt_token));
        } else if (mapState && mapState.linesError) {
            notify("⚠️Error Loading Bus Tranist Lines - Try Refreshing!⚠️");
        }

    }, [cookies, mapState.stopsLoaded, mapState.vehiclesLoading, navigator])

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
                        center={center.lat !== 0 ? center : {lat: mapState.currentLatitude, lng: mapState.currentLongitude}}
                        zoom={15}
                        mapContainerStyle={{width: '100%', height: '100%'}}
                        onLoad={(map: any) => setMap(map)}
                    >
                        {mapState && mapState.transitLines.map((line: any, index: number) => {
                            return (
                                <Polyline 
                                    key={index} 
                                    path={line.sequence} 
                                    visible={(activeMarker.routeID).toString() === (line.route_id).toString() ? true : false}
                                    options={{strokeColor:`#${line.route_color}`, strokeOpacity:2.0, strokeWeight:5}}/>)
                        })}
                        <MarkerF 
                            position={{lat: mapState.currentLatitude, lng: mapState.currentLongitude}}
                            icon={{url: require('../assets/user.svg').default}
                        }
                        />
                        {mapState && mapState.directions && <DirectionsRenderer directions={JSON.parse(mapState.directions)}/>}
                        {mapState && mapState.static_stops.length > 0 && mapState.static_stops.map((stop: any, index: number) => {
                            return (
                            <MarkerF 
                                key={index} position={{lat: stop.stop_lat, lng: stop.stop_lon}}
                                visible={(stopVisible && activeMarker.id === "") || (activeMarker.id !== "" && (activeMarker.routeID).toString() === (stop.route_id).toString())} 
                                onClick={() => 
                                    handleActiveMarker(
                                        false,
                                        stop.stop_id,
                                        stop.route_id,
                                        stop.stop_lat,
                                        stop.stop_lon,
                                        ""
                                    )
                                }
                            >
                                {activeMarker.id === stop.stop_id ? (
                                    <InfoWindow onCloseClick={() => {
                                        setActiveMarker({id: "", routeID: ""})
                                    }}>
                                        <Stack>
                                            <Box><Heading size='xs'>Stop Name:</Heading> {stop.stop_name}</Box>
                                            <Box><Heading size='xs'>Transit Line:</Heading> {stop.route_short_name}</Box>
                                            <Box><Heading size='xs'>Transit Direction:</Heading> {stop.trip_headsign}</Box>
                                            <Box><Heading size='xs'>Route Name:</Heading> {stop.route_long_name}</Box>
                                            <Flex flexDirection='column'>
                                                <Heading size='xs'>Next Arrival Times:</Heading> 
                                                {getNearestArrivalTime(stop.arrival_time).length > 0 ? 
                                                    getNearestArrivalTime(stop.arrival_time).map((time: string, index: number) => {
                                                        return (<Box key={index}>{time}</Box>)
                                                    })
                                                : <Box>No arrivals for next 10 mins</Box>}
                                            </Flex>
                                            <Box><Heading size='xs'>Stop Type:</Heading> {stop.route_type === 1 ? 'Metro': 'Bus'}</Box>
                                        </Stack>
                                    </InfoWindow>
                                ) : null}
                            </MarkerF>)
                        })}
                        {mapState && mapState.vehicles.length > 0 && mapState.vehicles.map((vehicle: any, index: number) => {
                            return (
                                <MarkerF 
                                    key={index} 
                                    position={{lat: vehicle.latitude, lng: vehicle.longitude}}
                                    icon={{url: require('../assets/bus-svgrepo-com.svg').default}}
                                    visible={(busVisible && activeMarker.id === "") || (activeMarker.id !== "" && (activeMarker.routeID).toString() === (vehicle.route_id).toString())}
                                    onClick={() =>
                                        handleActiveMarker(
                                            true, 
                                            vehicle.vehicle_id, 
                                            vehicle.route_id, 
                                            vehicle.latitude, 
                                            vehicle.longitude, 
                                            convertTimestamp(vehicle.timestamp)
                                        )
                                    }
                                >
                                {activeMarker.id === vehicle.vehicle_id ? (
                                    <InfoWindow onCloseClick={() => {
                                        setActiveMarker({id: "", routeID: ""})}}>
                                        <Stack>
                                            <Box><Heading size='xs'>Bus #:</Heading> {vehicle.route_id}</Box>
                                            <Box><Heading size='xs'>Bus Start Time:</Heading> {vehicle.start_time}</Box>
                                            <Box>
                                                <Heading size='xs'>Next Stop:</Heading>
                                                {vehicle.trip.length !== 0 && vehicle.trip[0].stop_sequence.length !== 0 ? vehicle.trip[0].stop_sequence[0].stop_name : 'Next Stop Unknown'}
                                            </Box>
                                            <Box>
                                                <Heading size='xs'>Next Stop Arrival:</Heading>
                                                {vehicle.trip.length !== 0 && vehicle.trip[0].stop_sequence.length !== 0 ? convertTimestamp(vehicle.trip[0].stop_sequence[0].arrival_time): 'Next Arrival Time Unknown'}
                                            </Box>
                                            <Box><Heading size='xs'>Bus Status:</Heading> {STATUSMAPPING[vehicle.current_status]}</Box>
                                            <Box><Heading size='xs'>Occupancy level:</Heading> {OCCUPANCYMAPPING[vehicle.occupancy_status]}</Box>
                                            <Box><Heading size='xs'>Current Speed:</Heading> {parseFloat(vehicle.speed).toFixed(2).toString()} km/h</Box>
                                            <Box><Heading size='xs'>Last Updated At:</Heading> {convertTimestamp(vehicle.timestamp)}</Box>
                                        </Stack>
                                    </InfoWindow>
                                ) : null}
                                </MarkerF>
                            )
                        })}
                    </GoogleMap>
                :
                    <Spinner color={"white"} loading={true}/>}
            </Box>
                <SearchBar isLoaded={isLoaded} dispatch={dispatch} notify={notify} mapState={mapState} />
            <OptionsMenu 
                mapState={mapState}
                clickCenterMap={clickCenterMap}
                hideMarkers={hideMarkers}
                showMarkers={showMarkers}
                stopVisible={stopVisible}
                busVisible={busVisible}
                refreshBuses={refreshBuses}
            />
            <Logout removeCookie={removeCookie} dispatch={dispatch} notify={notify}/>
        </Flex>
    )
}