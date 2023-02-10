import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import VidialApp from "./components/VidialApp";

export default function ReactApp() {
    return (
        <BrowserRouter>
            <VidialApp />
        </BrowserRouter>
    );
}

if (document.getElementById("root")) {
    createRoot(document.getElementById("root")).render(<ReactApp />);
}
