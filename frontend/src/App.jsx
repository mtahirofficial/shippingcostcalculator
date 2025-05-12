import React, { useCallback, useEffect, useState } from 'react'
import './App.css';
import { NavMenu } from '@shopify/app-bridge-react';
import AppRouter from './AppRouter';
import { Box, FooterHelp } from '@shopify/polaris';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from './providers/AppProvider';
import axios from 'axios';
import { request } from './core/api';
import { endpoints } from './constants';

function App() {
  const { setStore, setCountries, setStates } = useApp()
  const location = useLocation()

  const [_store, _setStore] = useState({})

  const getStore = useCallback(
    async cancelToken => {
      const domain = new URLSearchParams(location.search).get("shop")
      const options = {
        "method": "GET",
        "cancelToken": cancelToken
      }
      const response = await request(endpoints.store + "?domain=" + domain, options)
      if (response.store) {
        setStore(prev => ({ ...response.store }))
        _setStore(prev => ({ ...response.store }))
      }
      if (response.countries) {
        setCountries([...response.countries])
        setStates([...response.states])
      }
    },
    [],
  )


  useEffect(() => {
    const cancelToken = axios.CancelToken.source()
    getStore(cancelToken.token)
    return () => {
      cancelToken.cancel()
    }
  }, [])

  return (
    <React.Fragment>
      <NavMenu>
        <Link to="/home" rel="home">Home</Link>
        <Link to="/home">Dashboard</Link>
        <Link to="/rules">Rules</Link>
        {/* <Link to="/zones">Zones</Link> */}
        <Link to="/help-center">Help Center</Link>
        {_store?.email === "hmtahirs1@gmail.com" ? <>
          <Link to="/admin">Admin Area</Link>
        </> : null}
      </NavMenu>
      <AppRouter />
      <Box paddingBlock={400}>
        <FooterHelp>{process.env.REACT_APP_APP_NAME} © {new Date().getFullYear()} | <a className='logicsarcade' href='https://logicsarcade.com/' target='_blank' rel="noreferrer">LogicsArcade</a></FooterHelp>
      </Box>
    </React.Fragment>
  );
}

export default App;
