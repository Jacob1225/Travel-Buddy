import { useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';


export default function Map() {
    const user = useSelector((state: any) => state.user.value);
    console.log(user);
    const navigate = useNavigate();

    useEffect(() => {

        if (!user.isLogged) {
            navigate("/");
        }
    }, [])

    return(
        <h1>{user.email}</h1>
    )
}