import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import {BrowserRouter, Outlet, Route, Routes} from 'react-router-dom';
import Photos from "./components/Photos.jsx";
import Posts from "./components/Posts.jsx";
import Tasks from "./components/Tasks.jsx";

ReactDOM.render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>,
    document.getElementById('root')
);

