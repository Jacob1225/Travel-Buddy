import { Flex, IconButton, Tooltip} from '@chakra-ui/react'
import { FaLocationArrow } from 'react-icons/fa'
import { BiSolidHide, BiSolidShow } from 'react-icons/bi'


export default function OptionsMenu({clickCenterMap, hideStops, showStops, visibility}: {clickCenterMap: any, hideStops: any, showStops: any, visibility: boolean }) {
    
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
            {visibility ?
                <Tooltip label='Hide Stops'> 
                    <IconButton 
                        bgColor='white'
                        aria-label='Hide stops'
                        icon={<BiSolidHide/> }
                        size='md'
                        width='10%'
                        m='auto'
                        mb='10px'
                        onClick={() => hideStops()}
                    />
                </Tooltip>
                :
                <Tooltip label='Show Stops'>
                    <IconButton 
                        bgColor='white'
                        aria-label='Show stops'
                        icon={<BiSolidShow/> }
                        size='md'
                        width='10%'
                        m='auto'
                        mb='10px'
                        onClick={() => showStops()}
                    />
                </Tooltip>
            }
        </Flex>
    )
}