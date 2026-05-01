import React, { lazy } from 'react'
import { Route, Routes } from "react-router-dom";
import Dashboard from './pages/Dashboard';

const Zones = lazy(() => import('./pages/Zones'));
const AddZone = lazy(() => import('./pages/Zones/AddZone'));
const ZoneView = lazy(() => import('./pages/Zones/ZoneView'));
const RateView = lazy(() => import('./pages/Zones/Rates/RateView'));
const AddRate = lazy(() => import('./pages/Zones/Rates/AddRate'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivateRoute = lazy(() => import('./PrivateRoute'));
const AdminArea = lazy(() => import('./pages/AdminArea'));
const RateList = lazy(() => import('./pages/Rates/List'));
const CreateRate = lazy(() => import('./pages/Rates/Create'));
const DefaultRule = lazy(() => import('./pages/DefaultRule'));
const FreeShipping = lazy(() => import('./pages/FreeShipping'));

const AppRouter = () => {
  return <Routes>
    <Route path='*' element={<NotFoundPage />} />
    <Route exact path={"/home"} element={<Dashboard />} />
    <Route exact path={"/admin"} element={<PrivateRoute><AdminArea /></PrivateRoute>} />
    <Route exact path={"/help-center"} element={<HelpPage />} />
    <Route exact path={"/rules"}>
      <Route index element={<RateList />}></Route>
      <Route exact path={"new"} element={<CreateRate />} />
      <Route exact path={":id"} element={<CreateRate />} />
    </Route>
    <Route exact path={"/default_rule"} element={<DefaultRule />} />
    <Route exact path={"/free_shipping_rule"} element={<FreeShipping />} />
    {/* <Route exact path={"/zones"}>
      <Route index element={<Zones />}></Route>
      <Route exact path={":id"} element={<ZoneView />} />
      <Route exact path={"new"} element={<AddZone />} />
      <Route exact path={":id/edit"} element={<AddZone />} />
      <Route exact path={":zoneId/rates/:id"} element={<RateView />} />
      <Route exact path={":zoneId/rates/new"} element={<AddRate />} />
      <Route exact path={":zoneId/rates/:id/edit"} element={<AddRate />} />
    </Route> */}
  </Routes>
}

export default AppRouter
