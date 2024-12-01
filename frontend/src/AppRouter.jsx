import React from 'react'
import { Route, Routes } from "react-router-dom";
import Zones from './pages/Zones';
import AddZone from './pages/Zones/AddZone';
import ZoneView from './pages/Zones/ZoneView';
import RateView from './pages/Zones/Rates/RateView';
import AddRate from './pages/Zones/Rates/AddRate';
import Dashboard from './pages/Dashboard';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './PrivateRoute';
import AdminArea from './pages/AdminArea';

const AppRouter = () => {
  return <Routes>
    <Route path='*' element={<NotFoundPage />} />
    <Route exact path={"/home"} element={<Dashboard />} />
    <Route exact path={"/admin"} element={<PrivateRoute><AdminArea /></PrivateRoute>} />
    <Route exact path={"/help-center"} element={<HelpPage />} />
    <Route exact path={"/zones"}>
      <Route index element={<Zones />}></Route>
      <Route exact path={":id"} element={<ZoneView />} />
      <Route exact path={"new"} element={<AddZone />} />
      <Route exact path={":id/edit"} element={<AddZone />} />
      <Route exact path={":zoneId/rates/:id"} element={<RateView />} />
      <Route exact path={":zoneId/rates/new"} element={<AddRate />} />
      <Route exact path={":zoneId/rates/:id/edit"} element={<AddRate />} />
    </Route>
  </Routes>
}

export default AppRouter
