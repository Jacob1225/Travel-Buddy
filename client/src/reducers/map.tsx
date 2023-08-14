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
    originAddress: string,
    originLatitude: string,
    originLongitude: string,
    destinationAddress: string,
    destinationLongitude: string,
    destinationLatitude: string,
    directions: any,
    distance: string,
    eta: string,
    stopsLoading: boolean,
    static_stops: any[]
}

const initialState = {
    currentLongitude: "",
    currentLatitude: "",
    originAddress: "",
    originLatitude: "",
    originLongitude: "",
    destinationAddress: "",
    destinationLongitude: "",
    destinationLatitude: "",
    directions: null,
    distance: "",
    eta: "",
    stopsLoading: false,
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
        setRoute(state: any, action: PayloadAction<any>){
            return {
                ...state,
                originAddress: action.payload.originAddress,
                originLatitude: action.payload.originLatitude,
                originLongitude: action.payload.originLongitude,
                destinationAddress: action.payload.destinationAddress,
                destinationLatitude: action.payload.destinationLatitude,
                destinationLongitude: action.payload.destinationLongitude,
                directions: action.payload.directions,
                distance: action.payload.distance,
                eta: action.payload.eta
            }
        },
        clearLocation(state: any) {
            return {
                ...state,
                originAddress: initialState.originAddress,
                originLatitude: initialState.originLatitude,
                originLongitude: initialState.originLongitude,
                destinationAddress: initialState.destinationAddress,
                destinationLatitude: initialState.destinationLatitude,
                destinationLongitude: initialState.destinationLongitude,
                distance: initialState.distance,
                directions: initialState.directions,
                eta: initialState.eta
            };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getStops.pending, (state: MapState) => {
            return {
                ...state,
                stopsLoading: true,
            }
        })
        builder.addCase(getStops.fulfilled, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                stopsLoading: false,
                static_stops: action.payload.data
            }
        })
        builder.addCase(getStops.rejected, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                stopsLoading: false
            }
            //TODO: add error message in state to notify front end 
        })
    },
})

export const { setCurrentLocation, setRoute, clearLocation} = mapSlice.actions;
export default mapSlice.reducer;

export const getMemoizedMap = createSelector(
    (state: any) => state.map,
    (map: any) => map
)



