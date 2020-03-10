import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

const App = () => {
    return (
        <Router>
            <Route path="/"></Route>
            <Route path="chat" />
        </Router>
    )
}

export default App;
