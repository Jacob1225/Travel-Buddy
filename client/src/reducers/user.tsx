import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import axios from 'axios';

export interface UserState { 
    name: string,
    email: string,
    given_name: string,
    isLogged: boolean,
}

const initialState = {
    name: "",
    email: "",
    given_name: "",
    isLogged: false,
} as UserState 

/* Fetch data async */
export const validateUser =  createAsyncThunk(
    'home/validateUser',
    async(data: string, thunkApi) => {
        try{
            const payload = {
                "target_name": "authenticate_user",
                "target_url": `${process.env.REACT_APP_DEV_AUTH}`
            }
            
            const res = await axios.post(`${process.env.REACT_APP_DEV_API_URL}`, payload,
                {
                    headers: {
                        "Authorization": data,
                        "Content-Type": "application/json"
                    }
                }
            )
            return res.data
        } catch(error: any) {
            console.log("ERROR: ", error)
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
)
/*reducers are the functions that allow the state to be updated*/

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginUser(state: any, action: PayloadAction<UserState>) {
            return {...state, email: action.payload.email, name: action.payload.name, given_name: action.payload.given_name, isLogged: action.payload.isLogged}
        },
        logoutUser() {
            return initialState;
        },
    },
})

export const { loginUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;

export const getMemoizedUser = createSelector(
    (state: any) => state.user,
    (user) => {
        return user
    }
)