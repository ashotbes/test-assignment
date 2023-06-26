import React from 'react';
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import './index.css';
import Photos from "./components/Photos.jsx";
import Posts from "./components/Posts.jsx";
import Tasks from "./components/Tasks.jsx";
import HomePage from "./components/HomePage.jsx";

const App = () => {
    return (
        <>
            <div>
                <ul className="flex gap-20 justify-center pt-10 text-2xl truncate pb-5">
                    <li><NavLink to='/homepage'>Homepage</NavLink></li>
                    <li><NavLink to='/photos'>Photos</NavLink></li>
                    <li><NavLink to='/posts' activeClassName='active'>Posts</NavLink></li>
                    <li><NavLink to='/tasks'>Tasks</NavLink></li>
                </ul>
            </div>
            <Routes>
                <Route path="/" element={<Posts />} />
                <Route path="/photos" element={<Photos />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/homepage" element={<HomePage />} />
            </Routes>
        </>
    );
};

export default App;
