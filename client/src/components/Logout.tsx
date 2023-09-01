import { AiOutlineLogout } from 'react-icons/ai';
import { IconButton, Box, Tooltip } from '@chakra-ui/react'
import { logoutUser } from '../reducers/user';


export default function Logout({removeCookie, dispatch, notify}: {removeCookie: any, dispatch: any, notify: any}) {

    const logout = () => {
        dispatch(logoutUser());
        removeCookie('credentials', {path: '/'});
        removeCookie('jwt_token', {path: '/'});
        notify('Logout Successful!');
    }

    return (
        <Box
            position='absolute'
            right={50}
            bottom={180}
            w='0%'
            bgColor='white'
            shadow="lg"
            borderRadius='lg'
            zIndex='1'
        >
            <Tooltip label='Logout'>
                <IconButton 
                    bgColor='white'
                    aria-label='Logout'
                    icon={<AiOutlineLogout />}
                    size='md'
                    width='10%'
                    m='auto'
                    mb='10px'
                    mt='10px'
                    onClick={() => logout()}
                />
            </Tooltip>
        </Box>
    )
}