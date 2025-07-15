import React, { useCallback, useEffect, useState } from 'react';
import { IndexTable, Card, Link, useIndexResourceState, useSetIndexFiltersMode, Text, Badge, EmptySearchResult, Thumbnail, Icon, Button, InlineStack, IndexFilters, Spinner, SkeletonBodyText, } from '@shopify/polaris';
import { CheckIcon, XIcon } from '@shopify/polaris-icons';
// import { ReactComponent as fb_circle } from "../../assets/svg/fb-circle.svg";
// import universal_placeholder from "../../assets/svg/universal_placeholder.svg";
// import { useProducts } from '../../context/ProductsContext';
import { capitalize } from '../../utilis';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useApp } from '../../context/AppContext';
// import supabase from "../../config/supabaseClient";
// import { request } from '../../api'
import { useAppBridge } from '@shopify/app-bridge-react';
// import { useApp } from '../../providers/AppProvider';
// import ProductTableSkeleton from '../ProductTableSkeleton';

const StoresList = (props) => {
    const shopify = useAppBridge()
    // const { store, setShowBillingPopup, popupEnabled, setProcessing } = useApp()
    // const { products, setProducts } = useProducts()
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [stores, setStores] = useState([...props.stores])
    const [sortSelected, setSortSelected] = useState(['createdAt desc']);
    const [queryValue, setQueryValue] = useState('');
    const { mode, setMode } = useSetIndexFiltersMode('DEFAULT');
    const [selected, setSelected] = useState(0);
    const [itemStrings, setItemStrings] = useState([
        { label: 'All', value: "all", key: "all" },
        { label: 'Active', value: true, key: "active" },
        { label: 'Deactive', value: false, key: "active" },
        { label: 'Dev', value: true, key: "dev" }
    ]);
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(20)
    const [totalPages, setTotalPages] = useState(Math.ceil(stores.length / perPage))
    const [loading, setLoading] = useState(false)
    const [archiving, setArchiving] = useState(false)

    useEffect(() => {
        setStores([...props.stores])
        return () => {
            setStores([])
        }
    }, [props.stores])

    // Function to update the "page" parameter
    const updateParams = (key, value) => {
        searchParams.set(key, value);
        setSearchParams(searchParams);
    };

    const handleFiltersQueryChange = useCallback((value) => {
        // filterProducts(value, 1)
        updateParams("query", value)
        setQueryValue(value)
    }, [],);
    // useEffect(() => {
    //     filterProducts(itemStrings[selected], 1)
    // }, [])
    useEffect(() => {
        handleSelectionChange("page", false)
    }, [loading])

    useEffect(() => {
        setPage(1)
    }, [selected])

    useEffect(() => {
        updateParams("sort", sortSelected)
        const [column, direction] = sortSelected[0].split(" ")
        const sortedData = [...stores].sort((a, b) => {
            if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
            if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setStores([...sortedData])
    }, [sortSelected])

    const resourceName = {
        singular: 'store',
        plural: 'stores',
    };
    const sortOptions = [
        { label: 'Name', value: 'name asc', directionLabel: 'Ascending' },
        { label: 'Name', value: 'name desc', directionLabel: 'Descending' },
        { label: 'Domain', value: 'domain asc', directionLabel: 'Ascending' },
        { label: 'Domain', value: 'domain desc', directionLabel: 'Descending' },
        { label: 'Shopify Domain', value: 'myShopifyDomain asc', directionLabel: 'Ascending' },
        { label: 'Shopify Domain', value: 'myShopifyDomain desc', directionLabel: 'Descending' },
        { label: 'Created At', value: 'createdAt asc', directionLabel: 'Ascending' },
        { label: 'Created At', value: 'createdAt desc', directionLabel: 'Descending' },
    ];

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(stores);

    const emptyStateMarkup = (
        loading ? <InlineStack align='center'><Spinner size='large' /></InlineStack> : <EmptySearchResult
            title={'No Stores'}
            description={'Try changing the filters or search term'}
            withIllustration
        />
    );
    const onHandleCancel = () => handleFiltersQueryChange("");

    // const filterProducts = async (key, page) => {
    //     let max = (page * perPage)
    //     let min = max - perPage
    //     max -= 1

    //     try {
    //         let query = supabase
    //             .from("products")
    //             .select('*, creatives!left(productId)', { count: 'exact' })
    //             .order('id', { ascending: false })
    //             .range(min, max)

    //         switch (key) {
    //             case "Archived":
    //                 query = query.eq('status', 'archived')
    //                 break;
    //             case "AliExpress":
    //                 query = query.eq('importedFrom', 'Ali Express')
    //                 break;
    //             case "Shopify":
    //                 query = query.eq('importedFrom', 'Shopify')
    //                 break;
    //             case "All":
    //                 query = query.neq('status', 'archived')
    //                 break;
    //             default:
    //                 query = query.ilike('title', `%${key}%`)
    //                 break;
    //         }
    //         query = query.eq('shopId', shop.shopId)
    //         setLoading(true)
    //         const { data: products, count, error } = await query
    //         if (error) {
    //             // shopify.toast.show(error.message, { isError: true })
    //             return
    //         }
    //         setProducts([...products])
    //         setTotalPages(Math.ceil(count / perPage))
    //         const processingProducts = products.filter(p => p.processing)
    //         let ids = processingProducts?.map(p => p.id)
    //         // setProcessing(ids)
    //     } catch (error) {
    //         shopify.toast.show(error.message, { isError: true })
    //     } finally {
    //         setLoading(false)
    //     }
    // }
    const tabs = itemStrings?.map((item, index) => ({
        content: item.label,
        index,
        onAction: () => {
            setSelected(index)
            updateParams(item.key, item.value)
            // filterProducts(item, 1)
        },
        id: `${item}-${index}`,
        isLocked: index === 0
    }));

    // useEffect(() => {
    //     if (page >= 1 && page <= totalPages) {
    //         filterProducts(itemStrings[selected], page)
    //     }
    // }, [page, perPage])

    // const toggleArchiveProducts = async archive => {
    //     try {
    //         setArchiving(true)
    //         const productIds = stores.filter(p => selectedResources.indexOf(p.id) >= 0).map(p => p.productId)
    //         let idsString = `${productIds.filter(id => id)}`
    //         if (idsString !== "") {
    //             // await request("POST", `/products/status?ids=${idsString}&archive=${archive}`, shop?.shopId)

    //             // filterProducts(itemStrings[selected], 1)
    //         } else {
    //             shopify.toast.show("Products not found", { isError: true })
    //         }
    //     } catch (e) {
    //         console.log(e);
    //         shopify.toast.show(e.message, { isError: true })
    //     } finally {
    //         setArchiving(false)
    //     }
    // }

    // const generateTemplate = async id => {
    //     setProcessing(prev => ([...prev, id]))
    //     await supabase.from("products").update({ "processing": true }).eq("id", id)
    //     request("POST", `/products/template/generate`, shop.shopId, { "id": id })
    //     // request("POST", `/products/template/generate?productId=${productId}`, shop.shopId)
    // }

    return (
        <Card padding={0}>
            <IndexFilters
                sortOptions={sortOptions}
                sortSelected={sortSelected}
                queryValue={queryValue}
                queryPlaceholder="Searching in all"
                onQueryChange={handleFiltersQueryChange}
                onQueryClear={onHandleCancel}
                onSort={setSortSelected}
                primaryAction={undefined}
                cancelAction={{
                    onAction: onHandleCancel,
                    disabled: false,
                    loading: false,
                }}
                tabs={tabs}
                selected={selected}
                canCreateNewView={false}
                filters={[]}
                mode={mode}
                setMode={setMode}
                loading={loading}
            />
            <IndexTable
                selectable={false}
                resourceName={resourceName}
                itemCount={stores?.length}
                selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources?.length
                }
                onSelectionChange={handleSelectionChange}
                emptyState={emptyStateMarkup}
                headings={[
                    { title: 'Store ID' },
                    { title: 'Name' },
                    { title: 'Active' },
                    { title: 'Carrier' },
                    { title: 'Plan' },
                    { title: 'Display Plan' },
                    { title: 'Rules' },
                    { title: 'Country' },
                ]}
                pagination={{
                    hasNext: !loading && page < totalPages,
                    hasPrevious: !loading && page > 1,
                    type: 'table',
                    onNext: () => setPage(page => page + 1),
                    onPrevious: () => setPage(page => page - 1)
                }}
            // promotedBulkActions={[{
            //     content: itemStrings[selected] === "Archived" ? 'Unarchive' : 'Archive',
            //     loading: archiving,
            //     disabled: archiving || loading,
            //     onAction: () => {
            //         if (!loading) {
            //             toggleArchiveProducts(!(itemStrings[selected] === "Archived"))
            //         }
            //     },
            // }]}
            >
                {stores?.map((store, i) => {
                    const { id, myshopifyDomain, domain, name, active, storeId, country, zones, rates, serviceId, planName, planDisplayName } = store
                    return <React.Fragment key={i}>
                        <IndexTable.Row
                            id={storeId}
                            key={storeId}
                            selected={selectedResources.includes(id)}
                            position={i}
                        >
                            <IndexTable.Cell>
                                <Text variant="bodyLg" as="span">
                                    <Button variant='plain' url={"https://" + myshopifyDomain} target='_blank'>{storeId}</Button>
                                </Text>
                            </IndexTable.Cell>
                            <IndexTable.Cell>
                                <Text variant="bodyLg" as="span">
                                    <Button variant='plain' url={"https://" + domain} target='_blank'>{name}</Button>
                                </Text>
                            </IndexTable.Cell>
                            {/* <IndexTable.Cell>
                                <Thumbnail
                                    source={image ?? universal_placeholder}
                                    alt={title}
                                    size='small'
                                />
                            </IndexTable.Cell> */}
                            <IndexTable.Cell>{<Icon source={active ? CheckIcon : XIcon} tone={active ? "success" : "critical"} />}</IndexTable.Cell>
                            <IndexTable.Cell>
                                <Icon source={serviceId ? CheckIcon : XIcon} tone={serviceId ? "success" : "critical"} />
                            </IndexTable.Cell>
                            <IndexTable.Cell>{planName}</IndexTable.Cell>
                            <IndexTable.Cell>{planDisplayName}</IndexTable.Cell>
                            <IndexTable.Cell>{rates}</IndexTable.Cell>
                            <IndexTable.Cell>{country}</IndexTable.Cell>
                        </IndexTable.Row>
                    </React.Fragment>
                })}
            </IndexTable>
        </Card >
    );
}

export default StoresList