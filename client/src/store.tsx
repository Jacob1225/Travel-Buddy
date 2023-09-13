import userReducer from './reducers/user';
import mapReducer from './reducers/map';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig: any = {
    key: 'root',
    storage,
    blacklist: ['map']
  };

  const mapPersistConfig = {
    key: 'map',
    storage: storage,
    blacklist: [
      'static_stops',
      'vehicles', 
      'transitLines', 
      'stopsLoaded', 
      'vehiclesLoaded', 
      'linesLoaded', 
      'linesLoading',
      'initNotify',
      'stopsLoading',
      'vehiclesLoading',
      'times',
    ]
  };
  
const rootReducer = combineReducers({
    user: userReducer,
    map: persistReducer(mapPersistConfig, mapReducer)
})
const persistedReducer = persistReducer(persistConfig, rootReducer);
  
export default persistedReducer;
