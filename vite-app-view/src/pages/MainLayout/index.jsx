import { Page } from '@shopify/polaris'
import React from 'react'
import { Outlet } from 'react-router-dom'
import { useApp } from '../../providers/AppProvider'
import { TitleBar } from '@shopify/app-bridge-react'

const MainLayout = () => {
    const { title } = useApp()
    return (
        <React.Fragment>
            <TitleBar title={title}>
                <button variant={"primary"}>Add Zone</button>
                <button tone='critical'>test</button>
                <section label={"More actions"}>
                    <button variant={"primary"}>Add Rate</button>
                    <button >test</button>
                </section>
            </TitleBar>
            <Outlet />
        </React.Fragment>
    )
}

export default MainLayout