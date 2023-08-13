import  Geocode  from 'react-geocode';
import {Box, Button, Flex, VStack, Input, Text } from '@chakra-ui/react'
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

        if (!originCoords) {
            notify('🛑 Origin address is not a valid! 🛑');
            setOriginError(true);
            return;
        }
        if (!destCoords) {
            notify('🛑 Destination address is not a valid! 🛑');
            setDestError(true);
            return;
        }
        setCalculating(true);
        //Add route coords to map state
        dispatch(setRoute({
            originAddress: originAddress.current?.value,
            originLatitude: originCoords.lat,
            originLongitude: originCoords.lng,
            destinationAddress: destAddress.current?.value,
            destinationLatitude: destCoords.lat,
            destinationLongitude: destCoords.lng
        }))

        setCalculating(false);
    }

    const clearRoute = () => {
        //TODO: add clearing state + clear all markers and directions from map
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
                        <Text marginRight="auto" marginLeft="0">Route Distance:</Text>
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
                        <Text marginRight="auto" marginLeft="0">ETA: </Text>
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
