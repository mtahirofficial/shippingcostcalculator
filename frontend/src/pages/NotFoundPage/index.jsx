import React from 'react'
import EmptyStateShopify from '../../components/EmptyStateShopify'
import { useNavigate } from 'react-router-dom'
import empty from "../../images/empty.png";
import "./style.css"
import { Card, Page } from '@shopify/polaris';

const NotFoundPage = () => {
    const navigate = useNavigate()
    return (
        <Page narrowWidth>
            <Card>
                <div className='four-zero-four'>
                    <EmptyStateShopify
                        heading={404}
                        message={"Oops! The page you are looking for does not exist."}
                        primaryContent={"Go to Home"}
                        primaryAction={() => navigate("/home")}
                        image={empty}
                    />
                </div>
            </Card>
        </Page>
    )
}

export default NotFoundPage