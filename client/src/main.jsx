import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
    BrowserRouter,
} from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { LoadingProvider } from "./context/LoadingContext.jsx";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <LoadingProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </LoadingProvider>
    </StrictMode>
);
