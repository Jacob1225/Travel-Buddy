import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

export interface MapState { 
    currentLongitude: string,
    currentLatitude: string,
    destinationLongitude: string,
    destinationLatitude: string
}

const initialState = {
    currentLongitude: "",
    currentLatitude: "",
    destinationLongitude: "",
    destinationLatitude: ""
} as MapState

/*reducers are the functions that allow the state to be updated*/

const mapSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
        setCurrentLocation(state: any, action: PayloadAction<MapState>) {
            return {...state,
                currentLatitude: action.payload.currentLatitude,
                currentLongitude: action.payload.currentLongitude,
            }
        },
        clearCurrentLocation(state: any) {
            return {
                ...state,
                currentLatitude: initialState.currentLatitude,
                currentLongitude: initialState.currentLongitude 
            };
        },
    }
})

export const { setCurrentLocation } = mapSlice.actions;
export default mapSlice.reducer;

export const getMemoizedMap = createSelector(
    (state: any) => state.map,
    (map: any) => {
        return map;
    }  
)



