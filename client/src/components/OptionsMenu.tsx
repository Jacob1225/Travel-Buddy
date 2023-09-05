import { Flex, IconButton, Tooltip} from '@chakra-ui/react'
import { FaLocationArrow } from 'react-icons/fa'
import { FiRefreshCw } from 'react-icons/fi';
import { BiSolidHide, BiSolidShow } from 'react-icons/bi'
import { FaBusAlt } from 'react-icons/fa';


export default function OptionsMenu(
    {clickCenterMap, hideMarkers, showMarkers, stopVisible, busVisible, mapState, refreshBuses}: 
    {clickCenterMap: any, hideMarkers: any, showMarkers: any, stopVisible: boolean, busVisible: boolean, mapState: any, refreshBuses:any}) 
{
    
    return (
        <Flex
            position='absolute'
            right={50}
            top={55}
            w='0%'
            flexDirection='column'
            bgColor='white'
            shadow="lg"
            borderRadius='lg'
            zIndex='1'
        >
            <Tooltip label='Pan to current location'>
                <IconButton 
                    bgColor='white'
                    aria-label='Pan current location'
                    icon={<FaLocationArrow />}
                    size='md'
                    width='10%'
                    m='auto'
                    mb='10px'
                    mt='10px'
                    onClick={() => clickCenterMap()}
                />
            </Tooltip>
            {stopVisible ?
                <Tooltip label='Hide Stops'> 
                    <IconButton 
                        isDisabled={mapState.static_stops.length > 0 ? false : true }
                        bgColor='white'
                        aria-label='Hide stops'
                        icon={<BiSolidHide/> }
                        size='md'
                        width='10%'
                        m='auto'
                        mb='10px'
                        onClick={() => hideMarkers("stops")}
                    />
                </Tooltip>
                :
                <Tooltip label='Show Stops'>
                    <IconButton
                        isDisabled={mapState.static_stops.length > 0 ? false : true }
                        bgColor='white'
                        aria-label='Show stops'
                        icon={<BiSolidShow/> }
                        size='md'
                        width='10%'
                        m='auto'
                        mb='10px'
                        onClick={() => showMarkers("stops")}
                    />
                </Tooltip> 
            }
            {busVisible ? 
                <Tooltip label='Hide Buses'> 
                    <IconButton 
                        isDisabled={mapState.vehicles.length > 0 ? false : true}
                        bgColor='white'
                        aria-label='Hide stops'
                        icon={<BiSolidHide/> }
                        size='md'
                        width='10%'
                        m='auto'
                        mb='10px'
                        onClick={() => hideMarkers("bus")}
                    />
                </Tooltip>
            :
                <Tooltip label='Show Buses'>
                    <IconButton 
                        isDisabled={mapState.vehicles.length > 0 ? false : true}
                        bgColor='white'
                        aria-label='Show stops'
                        icon={<FaBusAlt/> }
                        size='md'
                        width='10%'
                        m='auto'
                        mb='10px'
                        onClick={() => showMarkers("bus")}
                    />
                </Tooltip> 
                }
            <Tooltip label='Refresh Buses'>
                <IconButton 
                    bgColor='white'
                    aria-label='Refresh Buses'
                    icon={<FiRefreshCw />}
                    size='md'
                    width='10%'
                    m='auto'
                    mb='10px'
                    mt='10px'
                    onClick={() => refreshBuses()}
                />
            </Tooltip>
        </Flex>
    )
}