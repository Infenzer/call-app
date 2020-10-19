import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import Lobby from './pages/lobby/Lobby';
import Room from './pages/room/Room';

export interface RoomParam {
  id: string
}

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Lobby}/>
        <Route exact path='/room/:id' component={Room}/>
        <Redirect to='/'/>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
