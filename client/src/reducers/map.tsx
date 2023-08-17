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
    vehiclesLoading: boolean,
    linesLoading: boolean
    static_stops: any[],
    vehicles: any[],
    transitLines: any[],
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
    vehiclesLoading: false,
    linesLoading: false,
    static_stops: [],
    vehicles: [],
    transitLines: []
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
export const getVehicles =  createAsyncThunk(
    'map/getVehicles',
    async(data, thunkApi) => {
        try{
            const res = await axios.post(`${process.env.REACT_APP_DEV_URL_VEHICLES}`, {})
            console.log(res)
            return res.data
        } catch(error: any) {
            console.log(error.message)
            return thunkApi.rejectWithValue(error.message);
        }
    }
)

export const getTransitLines =  createAsyncThunk(
    'map/getTransitLines',
    async(data, thunkApi) => {
        try{
            const res = await axios.post(`${process.env.REACT_APP_DEV_URL_LINES}`, {})
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
        builder.addCase(getStops.rejected, (state: MapState) => {
            return {
                ...state,
                stopsLoading: false
            }
            //TODO: add error message in state to notify front end 
        })
        builder.addCase(getVehicles.pending, (state: MapState) => {
            return {
                ...state,
                vehiclesLoading: true,
            }
        })
        builder.addCase(getVehicles.fulfilled, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                vehiclesLoading: false,
                vehicles: action.payload.data
            }
        })
        builder.addCase(getVehicles.rejected, (state: MapState) => {
            return {
                ...state,
                vehiclesLoading: false
            }
        })
        builder.addCase(getTransitLines.pending, (state: MapState) => {
            return {
                ...state,
                linesLoading: true,
            }
        })
        builder.addCase(getTransitLines.fulfilled, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                linesLoading: false,
                transitLines: action.payload.data
            }
        })
        builder.addCase(getTransitLines.rejected, (state: MapState) => {
            return {
                ...state,
                linesLoading: false
            }
        })
    },
})

export const { setCurrentLocation, setRoute, clearLocation} = mapSlice.actions;
export default mapSlice.reducer;

export const getMemoizedMap = createSelector(
    (state: any) => state.map,
    (map: any) => map
)



