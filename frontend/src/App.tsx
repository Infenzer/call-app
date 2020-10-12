import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Lobby from './pages/lobby/Lobby';
import Room from './pages/room/Room';

export interface RoomParam {
  id: string
  name: string
}

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Lobby}/>
        <Route exact path='/room/:id/:name' component={Room}/>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
