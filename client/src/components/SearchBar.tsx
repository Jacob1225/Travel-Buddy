import  Geocode  from 'react-geocode';
import {Box, Button, Flex, VStack, Input, Text, Heading, HStack } from '@chakra-ui/react'
import { Autocomplete } from '@react-google-maps/api';
import { LuClock10 } from "react-icons/lu";
import { TbRotateClockwise } from "react-icons/tb"
import { setRoute, clearLocation } from '../reducers/map';
import { useState, useRef } from 'react';

Geocode.setApiKey(`${process.env.REACT_APP_GOOGLE_MAPS_API}`);

export default function SearchBar(
    {isLoaded, dispatch, notify, mapState}:
    {isLoaded: any, dispatch: any, notify: any, mapState: any}) {
    
    const [calculating, setCalculating] = useState(false);
    const [originError, setOriginError] = useState(false);
    const [destError, setDestError] = useState(false);

    const originAddress = useRef<HTMLInputElement>(null);;
    const destAddress =  useRef<HTMLInputElement>(null);

    const getCoordsFromAddress = async (address: any) => {
        try {
            const response = await Geocode.fromAddress(address);
            return response.results[0].geometry.location; 

        } catch(error) {
            //Maybe display more specific error
            return null
        }
    }
    const milesToKm = (miles: any) => ((parseFloat(miles) * 1.609344).toFixed(2)).toString();

    const getDirections = async (origin: any, destination: any) => {
        try{
            //TODO: maybe add desired arrival time or departure time, + desired route preference
            const directionService = new google.maps.DirectionsService();
            const directionsResults = await directionService.route({
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.TRANSIT,
                unitSystem: google.maps.UnitSystem.IMPERIAL,
                transitOptions: {
                    modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY],
                    routingPreference: google.maps.TransitRoutePreference.LESS_WALKING
                }
            })
            console.log(directionsResults);
            return directionsResults;

        } catch (error) {
            notify('🛑 Error calculating directions! 🛑');
            return null;
        }
    }
    
    const addressValidator = (address: string) => {
        //check if address starts with a number add
        const splitAdd = address.split(" ");
        if (!Number(splitAdd[0])) return 0;
        return 1
    }

    const calculateRoute = async () => {
        if (originAddress.current?.value === '' || destAddress.current?.value === '') {
            setOriginError(true);
            setDestError(true);
            notify('🛑 Origin & destination address cannot be empty! 🛑');
            return;
        }

        //get origin coordinates
        const originCoords = await getCoordsFromAddress(originAddress.current?.value);
        const destCoords = await getCoordsFromAddress(destAddress.current?.value);

        if (!originCoords || !addressValidator(originAddress.current?.value!)) {
            notify('🛑 Origin address is not a valid! 🛑');
            setOriginError(true);
            return;
        }
        if (!destCoords || !addressValidator(destAddress.current?.value!)) {
            notify('🛑 Destination address is not a valid! 🛑');
            setDestError(true);
            return;
        }
        
        setCalculating(true);
        const directionResults = await getDirections(originAddress.current?.value, destAddress.current?.value);
        if (!directionResults) {
            setCalculating(false);
            return;
        }
        /*
            TODO: Add different route preferences: 
            walking less or less bus transfers
            
        */
        dispatch(setRoute({
            originAddress: originAddress.current?.value,
            originLatitude: originCoords.lat,
            originLongitude: originCoords.lng,
            destinationAddress: destAddress.current?.value,
            destinationLatitude: destCoords.lat,
            destinationLongitude: destCoords.lng,
            directions: JSON.stringify(directionResults),
            distance: milesToKm(directionResults?.routes[0]?.legs[0]?.distance?.text),
            eta: directionResults?.routes[0]?.legs[0]?.duration?.text
        }))
        
        setCalculating(false);
    }

    const clearRoute = () => {
        dispatch(clearLocation());
        if (originAddress.current) originAddress.current.value = "";
        if (destAddress.current) destAddress.current.value = "";
    }
    return (
        <Box 
            p={4}
            borderRadius='lg'
            m={4}
            bgColor='white'
            shadow="lg"
            minW='container.md'
            zIndex='1'
            overflow='hidden'>
            {isLoaded &&
            <Flex justifyContent="space-between" alignItems="center">
                <Flex justifyContent="space-evenly" w="75%">
                    <VStack p={2} w="100%">
                        <Box w='100%'>
                            <Autocomplete >
                                <Input 
                                    isInvalid={originError} 
                                    onFocus={() => setOriginError(false)}
                                    errorBorderColor='red.300'
                                    placeholder='Origin'
                                    ref={originAddress}
                                    defaultValue={mapState.originAddress}
                                >
                                </Input>
                            </Autocomplete>
                        </Box>
                        <HStack w='100%' marginRight="auto" marginLeft="0">
                            <Heading size='sm'>Route Distance:</Heading>
                            {mapState.distance && <Text>{`${mapState.distance} km`}</Text>}
                        </HStack>
                    </VStack>
                    <VStack p={2} w="100%">
                        <Box w='100%'>
                            <Autocomplete>
                                <Input 
                                    isInvalid={destError} 
                                    onFocus={() => setDestError(false)}
                                    errorBorderColor='red.300'
                                    placeholder='Destination'
                                    ref={destAddress}
                                    defaultValue={mapState.destinationAddress}
                                >
                                </Input>
                            </Autocomplete>
                        </Box>
                        <HStack marginRight="auto" marginLeft="0">
                            <Heading size='sm'>ETA:</Heading> 
                            <Text>{mapState.eta}</Text>
                        </HStack>
                    </VStack>
                </Flex>
                <Flex p={2} flexDirection="column">
                    <Button 
                        isLoading={calculating}
                        loadingText='calculating'
                        leftIcon={<LuClock10/>}
                        type="submit"
                        mb={5}
                        colorScheme="pink"
                        variant="outline" 
                        onClick={() => calculateRoute()}
                    >
                        <Text>Calculate</Text>
                    </Button>
                    <Button 
                        loadingText='clearing'
                        leftIcon={<TbRotateClockwise/>}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => clearRoute()}>
                        <Text>Clear Route</Text>
                    </Button>
                </Flex>
            </Flex>}
        </Box>
    )
}
