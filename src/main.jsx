// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App.jsx'
import store from './redux/store/store.js'
import {Provider} from "react-redux";

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>

)
