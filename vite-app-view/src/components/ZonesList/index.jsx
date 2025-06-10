import { Card, Box, InlineGrid, } from '@shopify/polaris';
import { useState } from 'react';
import { useZoneContext } from '../../providers/ZoneProvider';
import { useNavigate } from "react-router-dom";
import { useApp } from '../../providers/AppProvider';
import { request } from '../../core/api';
import { endpoints } from '../../constants';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import EmptyStateShopify from '../EmptyStateShopify';
import ZoneCard from '../ZoneCard';
import { numbers } from '../../utilis';
import CardSkeleton from '../skeletons/CardSkeleton';

const ZonesList = props => {
    const shopify = useAppBridge();
    const { zones, setZones } = useZoneContext()
    const navigate = useNavigate();
    const { store } = useApp()
    const [delZone, setDelZone] = useState(null)
    const [loading, setLoading] = useState({})

    const deleteZone = async id => {
        try {
            const options = {
                "method": "DELETE",
                "data": { id }
            }
            setLoading(prev => ({ ...prev, id: true }))
            const response = await request(endpoints.zone, options, store.storeId)
            if (response.delete) {
                let filtered = zones.filter(z => z.id !== id)
                setZones([...filtered])
                shopify.toast.show("Deleted successfully", { isError: false })
                shopify.modal.hide("delete-zone")
            }
        } catch (e) {
            shopify.toast.show(e.message, { isError: true })
        } finally {
            setLoading(prev => ({ ...prev, id: false }))
        }
    }

    return (
        <>
            <InlineGrid columns={(zones.length || props.loading) ? 3 : 1} gap={300}>
                {props.loading ? numbers(5).map(num => <CardSkeleton />) : (
                    zones.length ? zones?.map((zone, i) => {
                        const { id, name, price, status } = zone;
                        const chars = name.split(" ")
                        let initials = ''
                        for (const char of chars) {
                            initials += char[0].toUpperCase()
                        }
                        return <ZoneCard zone={zone} initials={initials} loading={loading} setDelZone={setDelZone} />
                    }) : <Card><EmptyStateShopify
                        fullWidth={true}
                        heading={"Oops! No Shipping Zones Created Yet"}
                        message="Start by creating a shipping zone to set your rates and regions!"
                        image={"https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
                        primaryContent={"Create zone"}
                        primaryAction={() => navigate("new")}
                    /></Card>
                )}
            </InlineGrid>
            {/* <Box
                padding="400"
                background="bg-surface-active"
                borderWidth="025"
                borderRadius="200"
                borderColor="border"
                overflowX="scroll"
            >
                <pre>
                    <code>{JSON.stringify(zones[3] ?? {}, null, 2)}</code>
                </pre>
            </Box> */}
            <Modal id="delete-zone">
                <Box padding={400}>
                    <p>If you delete this zone, it can't be undone.</p>
                    <p>All shipping rates will also be deleted.</p>
                </Box>
                <TitleBar title={`Delete the zone ${delZone?.name}`}>
                    <button variant="primary" tone="critical" onClick={() => deleteZone(delZone.id)}>
                        Delete
                    </button>
                    <button onClick={() => shopify.modal.hide("delete-zone")}>Cancel</button>
                </TitleBar>
            </Modal>
        </>
    );

}

export default ZonesList