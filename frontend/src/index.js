import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./Components/App";
import 'bootstrap/dist/css/bootstrap.css';


ReactDOM.render(
    <Router>
        <App />
    </Router>,
    document.getElementById("root")
);