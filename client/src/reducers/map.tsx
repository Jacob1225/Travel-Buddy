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
    initNotify: boolean,
    stopsLoading: boolean,
    stopsError: boolean,
    stopsLoaded: boolean,
    vehiclesError: boolean,
    vehiclesLoading: boolean,
    vehiclesLoaded: boolean,
    linesError: boolean,
    linesLoading: boolean
    linesLoaded: boolean
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
    initNotify: false,
    stopsLoaded: false,
    stopsError: false,
    stopsLoading: false,
    vehiclesLoading: false,
    vehiclesError: false,
    vehiclesLoaded: false,
    linesError: false,
    linesLoading:false,
    linesLoaded: false,
    static_stops: [],
    vehicles: [],
    transitLines: []
} as MapState

/* Fetch data async */
export const getStops =  createAsyncThunk(
    'map/getStops',
    async(data: string, thunkApi) => {
        try{
            const payload = {
                "target_name": "get stops",
                "target_url": `${process.env.REACT_APP_DEV_URL_STOPS}`
            }

            const res = await axios.post(`${process.env.REACT_APP_DEV_API_URL}`, payload,
            {
                headers: {
                    "Authorization": data!,
                    "Content-Type": "application/json"
                }
            })
            return res.data
        } catch(error: any) {
            console.log(error)
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
)
export const getVehicles = createAsyncThunk(
    'map/getVehicles',
    async(data: string, thunkApi) => {
        try{
            const payload = {
                "target_name": "get vehicles",
                "target_url": `${process.env.REACT_APP_DEV_URL_VEHICLES}`
            }

            const res = await axios.post(`${process.env.REACT_APP_DEV_API_URL}`, payload,
            {
                headers: {
                    "Authorization": data!,
                    "Content-Type": "application/json"
                }
            })
            return res.data
        } catch(error: any) {
            console.log(error)
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
)

export const getTransitLines =  createAsyncThunk(
    'map/getTransitLines',
    async(data: string, thunkApi) => {
        try{
            const payload = {
                "target_name": "get transit lines",
                "target_url": `${process.env.REACT_APP_DEV_URL_LINES}`
            }

            const res = await axios.post(`${process.env.REACT_APP_DEV_API_URL}`, payload,
            {
                headers: {
                    "Authorization": data!,
                    "Content-Type": "application/json"
                }
            })
            return res.data
        } catch(error: any) {
            console.log(error)
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
)
/*reducers are the functions that allow the state to be updated*/

const mapSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
        setInitNotify(state: any, action: PayloadAction<any>) {
            return {
                ...state,
                initNotify: action.payload
            }
        },
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
        builder.addCase(getStops.pending, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                stopsError: false,
                stopsLoading: true,
            }
        })
        builder.addCase(getStops.fulfilled, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                stopsLoading: false,
                stopsLoaded: true,
                static_stops: action.payload.data
            }
        })
        builder.addCase(getStops.rejected, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                stopsError: true,
                stopsLoading: false,
                static_stops: action.payload.data
            }
        })
        builder.addCase(getVehicles.pending, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                vehiclesError: false,
                vehiclesLoading: true,
            }
        })
        builder.addCase(getVehicles.fulfilled, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                vehiclesLoading: false,
                vehiclesLoaded: true,
                vehicles: action.payload.data
            }
        })
        builder.addCase(getVehicles.rejected, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                vehiclesError: true,
                vehiclesLoading: false,
            }
        })
        builder.addCase(getTransitLines.pending, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                linesError: false,
                linesLoading: true,
            }
        })
        builder.addCase(getTransitLines.fulfilled, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                linesLoading: false,
                linesLoaded: true,
                transitLines: action.payload.data
            }
        })
        builder.addCase(getTransitLines.rejected, (state: MapState, action: PayloadAction<any>) => {
            return {
                ...state,
                linesError: true,
                linesLoading: false,
            }
        })
    },
})

export const { setCurrentLocation, setRoute, clearLocation, setInitNotify} = mapSlice.actions;
export default mapSlice.reducer;

export const getMemoizedMap = createSelector(
    (state: any) => state.map,
    (map: any) => map
)



