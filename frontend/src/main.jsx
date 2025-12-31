import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import store from '../store.js'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DarkModeContextProvider } from './context/DarkModeContext.jsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
<StrictMode>
  <QueryClientProvider client={queryClient}>
      <DarkModeContextProvider>
    <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </Provider>
      </DarkModeContextProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
</StrictMode>,
)
