import userReducer from './reducers/user';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';

const persistConfig: any = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2
  };

const rootReducer = combineReducers({
    user: userReducer
})
const persistedReducer = persistReducer(persistConfig, rootReducer);
  
export default persistedReducer;
