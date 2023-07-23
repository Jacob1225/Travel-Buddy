import { useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';

export default function Map({cookies}: any) {
    const user = useSelector((state: any) => state.user);
    const navigate = useNavigate();
    useEffect(() => {
        if (!cookies.credentials) {
            navigate("/");
        }
    })

    return(
        <h1>Map for {user.given_name}</h1>
    )
}