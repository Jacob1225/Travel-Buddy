import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState { 
    name: string,
    email: string,
    given_name: string,
    isLogged: boolean;
}

const initialState = {
    name: "",
    email: "",
    given_name: "",
    isLogged: false,
} as UserState 

/*reducers are the functions that allow the state to be updated*/

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginUser(state: any, action: PayloadAction<UserState>) {
            return {...state, email: action.payload.email, name: action.payload.name, given_name: action.payload.given_name, isLogged: action.payload.isLogged}
        },
        logoutUser(state: any) {
            state = initialState;

        },
    }
})

export const { loginUser } = userSlice.actions;
export default userSlice.reducer;
