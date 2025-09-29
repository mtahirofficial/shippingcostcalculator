import React, { useCallback, useEffect, useState } from 'react'
import './App.css';
import { NavMenu, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import AppRouter from './AppRouter';
import { Box, FooterHelp, Text } from '@shopify/polaris';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from './providers/AppProvider';
import axios from 'axios';
import { request } from './core/api';
import { endpoints } from './constants';
import { formatTitle } from './utilis';
import ShopifyModal from './components/ShopifyModal';

function App() {
  const shopify = useAppBridge()
  const { setStore, setCountries, setStates, setActivePlan, setFeatures, setActiveFeatures, modalActive, setModalActive, billingUrl, setBillingUrl } = useApp()
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
        setBillingUrl(`https://admin.shopify.com/store/${response.store?.name}/charges/${import.meta.env.VITE_APP_PATH}/pricing_plans`)
        setStore(prev => ({ ...response.store }))
        _setStore(prev => ({ ...response.store }))
      }
      let featuresList = response.features || []
      if (response.features) {
        featuresList = response.features.map(feature => feature.handle)
        setFeatures(featuresList)
      }

      if (response.activePlan) {
        setActivePlan(response.activePlan)
        const features = {}
        for (const feature of response.activePlan.features) {
          features[feature.handle] = feature.handle
        }
        let activeFeatures = {}
        for (const key in features) {
          if (Object.prototype.hasOwnProperty.call(features, key)) {
            const element = features[key];
            activeFeatures[element] = featuresList.indexOf(element) > -1
          }
        }
        setActiveFeatures(activeFeatures)
      }

      if (response.countries) {
        setCountries([...response.countries])
        setStates([...response.states])
      }
    },
    [],
  )

  useEffect(() => {
    if (modalActive["plans-modal"]) {
      shopify.modal.show("plans-modal")
    }

    return () => {
      if (modalActive) {
        shopify.modal.hide("plans-modal")
      }
    }
  }, [modalActive])


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
        <Link to="/default_rule">Default Rule</Link>
        <Link to="/free_shipping_rule">Free Shipping Rule</Link>
        {/* <Link to="/zones">Zones</Link> */}
        <Link to="/help-center">Help Center</Link>
        {_store?.email === "hmtahirs1@gmail.com" ? <>
          <Link to="/admin">Admin Area</Link>
        </> : null}
      </NavMenu>
      <TitleBar title=''>
        <button variant="primary" onClick={() => window.open("https://wa.me/923457699395", "_blank")}>Get Instant Support</button>
      </TitleBar>
      <AppRouter />
      <Box paddingBlock={400}>
        <FooterHelp>{import.meta.env.VITE_APP_NAME} © {new Date().getFullYear()} | <a className='logicsarcade' href='https://logicsarcade.com/' target='_blank' rel="noreferrer">LogicsArcade</a></FooterHelp>
      </Box>
      <ShopifyModal
        title={formatTitle("Upgrade Plans")}
        primaryAction={() => {
          setModalActive(prev => ({ ...prev, "plans-modal": false }))
          window.open(billingUrl, '_top')
        }}
        secondaryAction={() => {
          setModalActive(prev => ({ ...prev, "plans-modal": false }))
        }}
        id="plans-modal"
        handleHide={() => {
          setModalActive(prev => ({ ...prev, "plans-modal": false }))
        }}
        primaryBtnTxt="Plans & Pricing"
        secondaryBtnTxt="Cancel"
        disabled={false}
        primaryTone="base"
        children={
          <>
            <Text variant="headingLg" as="h2">
              Upgrade required
            </Text>
            <Box paddingBlockStart="200">
              <Text as="p" variant="bodyMd">
                This feature is not available on your current plan. To use it, please upgrade to a higher-tier plan.
              </Text>
            </Box>
          </>}
      />
    </React.Fragment>
  );
}

export default App;
