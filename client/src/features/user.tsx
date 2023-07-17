import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
    value: { name: string, email: string, given_name: string, isLogged: boolean };
}

const initialState = { value: {
    name: "",
    email: "",
    given_name: "",
    isLogged: false,
}} as UserState 

/*reducers are the functions that allow the state to be updated*/

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginUser(state, action: PayloadAction<UserState["value"]>) {
            state.value = action.payload;
        },
        logoutUser(state: any) {
            state.value = initialState;
        },
    }
})

export const { loginUser } = userSlice.actions;
export default userSlice.reducer;
