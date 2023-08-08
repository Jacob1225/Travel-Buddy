import {Box, Button, Flex, VStack, Input, Text } from '@chakra-ui/react'
import { LuClock10 } from "react-icons/lu";
import { TbRotateClockwise } from "react-icons/tb"
import { useSelector } from 'react-redux';
import { getMemoizedMap } from '../reducers/map';


  export default function SearchBar({routeLoading}: {routeLoading: boolean}) {

    const map = useSelector(getMemoizedMap);
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
            <Flex justifyContent="space-between" alignItems="center">
                <Flex justifyContent="space-evenly" w="75%">
                    <VStack p={2} w="100%">
                        <Input placeholder='Origin' mt={2} mb={2}></Input>
                        <Text marginRight="auto" marginLeft="0">Route Distance:</Text>
                    </VStack>
                    <VStack p={2} w="100%">
                        <Input placeholder='Destination' mt={2} mb={2}></Input>
                        <Text marginRight="auto" marginLeft="0">ETA: </Text>
                    </VStack>
                </Flex>
                <Flex p={2} flexDirection="column">
                    <Button isLoading={routeLoading} loadingText='calculating'leftIcon={<LuClock10/>} type="submit" mb={5} colorScheme="pink" variant="outline" >
                        <Text>Calculate</Text>
                    </Button>
                    <Button loadingText='clearing'leftIcon={<TbRotateClockwise/>} colorScheme="blue" variant="outline">
                        <Text>Clear Route</Text>
                    </Button>
                </Flex>
            </Flex>
        </Box>
    )
}
