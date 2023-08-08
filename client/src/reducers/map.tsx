import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSelector } from 'reselect';

export interface requestData {
    lat: string,
    lon: string,
    radius: string
}

export interface MapState { 
    currentLongitude: string,
    currentLatitude: string,
    originLatitude: string,
    originLongitude: string,
    destinationLongitude: string,
    destinationLatitude: string,
    routeLoading: boolean,
    static_stops: any[]
}

const initialState = {
    currentLongitude: "",
    currentLatitude: "",
    originLatitude: "",
    originLongitude: "",
    destinationLongitude: "",
    destinationLatitude: "",
    routeLoading: false,
    static_stops: []
} as MapState

/* Fetch data async */
export const getStops =  createAsyncThunk(
    'map/getRoute',
    async(data, thunkApi) => {
        try{
            const res = await axios.post(`${process.env.REACT_APP_DEV_URL}`, {})
            console.log(res)
            return res.data
        } catch(error: any) {
            console.log(error.message)
            return thunkApi.rejectWithValue(error.message);
        }
    }
)
/*reducers are the functions that allow the state to be updated*/

const mapSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
        setCurrentLocation(state: any, action: PayloadAction<any>) {
            return {...state,
                currentLatitude: action.payload.currentLatitude,
                currentLongitude: action.payload.currentLongitude,
            }
        },
        setRoute(state: any, action: PayloadAction<MapState>){
            return {
                ...state,
                originLatitude: action.payload.originLatitude,
                originLongitude: action.payload.originLongitude,
                destinationLatitude: action.payload.destinationLatitude,
                destinationLongitude: action.payload.destinationLongitude,
                routeLoading: true
            }
        },
        setRouteLoading(state: any, action: PayloadAction<any>) {
            return {
                ...state,
                routeLoading: action.payload.routeLoading
            }
        },
        clearLocation(state: any) {
            return {
                ...state,
                originLatitude: initialState.originLatitude,
                originLongitude: initialState.originLongitude,
                destinationLatitude: initialState.destinationLatitude,
                destinationLongitude: initialState.destinationLongitude,
            };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getStops.pending, (state: MapState) => {
            state.routeLoading = true;
        })
        builder.addCase(getStops.fulfilled, (state: MapState, action: PayloadAction<any>) => {
            state.routeLoading = false;
            state.static_stops = action.payload.data
        })
        builder.addCase(getStops.rejected, (state: MapState, action: PayloadAction<any>) => {
            state.routeLoading = false;

            //TODO: add error message in state to notify front end 
        })
    },
})

export const { setCurrentLocation } = mapSlice.actions;
export default mapSlice.reducer;

export const getMemoizedMap = createSelector(
    (state: any) => state.map,
    (map: any) => map
)



