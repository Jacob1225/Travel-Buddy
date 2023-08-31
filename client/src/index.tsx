import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ChakraProvider } from '@chakra-ui/react';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, 
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import persistedReducer from './store';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';

const store: any = configureStore({
  reducer:persistedReducer,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});
const persistor: any= persistStore(store);

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </PersistGate>
    </Provider>
);
