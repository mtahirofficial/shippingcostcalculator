import React, { useState } from 'react';
import {
    Icon,
    Card,
    TextField,
    Listbox,
    AutoSelection,
    Scrollable,
    EmptySearchResult,
    InlineGrid,
    Text,
    Badge,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';


const actionValue = '__ACTION__';



const interval = 25;

export const ShopifyListBox = ({ stores }) => {
    const segments = [...stores];
    const [showFooterAction, setShowFooterAction] = useState(true);
    const [query, setQuery] = useState('');
    const [lazyLoading, setLazyLoading] = useState(false);
    const [willLoadMoreResults, setWillLoadMoreResults] = useState(true);
    const [visibleOptionIndex, setVisibleOptionIndex] = useState(6);
    const [activeOptionId, setActiveOptionId] = useState(segments[0]?.id);
    const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
    const [filteredSegments, setFilteredSegments] = useState([]);


    // const lazyLoadSegments = Array.from(Array(100)).map((_, index) => ({
    //     label: `Other customers ${index + 13}`,
    //     id: `gid://shopify/CustomerSegment/${index + 13}`,
    //     value: `${index + 12}`,
    // }));

    // segments.push(...lazyLoadSegments);

    const handleClickShowAll = () => {
        setShowFooterAction(false);
        setVisibleOptionIndex(segments.length);
    };

    const handleFilterSegments = (query) => {
        const nextFilteredSegments = segments.filter((segment) => {
            return segment.name
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase().trim());
        });

        setFilteredSegments(nextFilteredSegments);
    };

    const handleQueryChange = (query) => {
        setQuery(query);

        if (query.length >= 2) handleFilterSegments(query);
    };

    const handleQueryClear = () => {
        handleQueryChange('');
    };

    const handleSegmentSelect = (segmentIndex) => {
        if (segmentIndex === actionValue) {
            return handleClickShowAll();
        }

        setSelectedSegmentIndex(Number(segmentIndex));
    };

    const handleActiveOptionChange = (_, domId) => {
        setActiveOptionId(domId);
    };

    // This is just to illustrate lazy loading state vs loading state. This is an
    // example, so we aren't fetching from GraphQL. You'd use `pageInfo.hasNextPage`
    // from your GraphQL query data instead of this fake "willLoadMoreResults" state
    // along with setting `first` your GraphQL query's variables to your app's
    // default max edges limit (e.g., 250).

    const handleLazyLoadSegments = () => {
        if (willLoadMoreResults && !showFooterAction) {
            setLazyLoading(true);

            const options = query ? filteredSegments : segments;

            setTimeout(() => {
                const remainingOptionCount = options.length - visibleOptionIndex;
                const nextVisibleOptionIndex =
                    remainingOptionCount >= interval
                        ? visibleOptionIndex + interval
                        : visibleOptionIndex + remainingOptionCount;

                setLazyLoading(false);
                setVisibleOptionIndex(nextVisibleOptionIndex);

                if (remainingOptionCount <= interval) {
                    setWillLoadMoreResults(false);
                }
            }, 1000);
        }
    };

    const listboxId = 'SearchableListbox';

    const textFieldMarkup = (
        <div style={{ padding: '12px' }}>
            <TextField
                focused={showFooterAction}
                clearButton
                labelHidden
                label="Customer segments"
                placeholder="Search segments"
                autoComplete="off"
                value={query}
                prefix={<Icon source={SearchIcon} />}
                ariaActiveDescendant={activeOptionId}
                ariaControls={listboxId}
                onChange={handleQueryChange}
                onClearButtonClick={handleQueryClear}
            />
        </div>
    );

    const segmentOptions = query ? filteredSegments : segments;
    let s = {
        "id": 1,
        "key": 1,
        "userId": null,
        "storeId": 66141847715,
        "myshopifyDomain": "appbetatesting.myshopify.com",
        "domain": "appbetatesting.myshopify.com",
        "name": "appbetatesting",
        "owner": "Muhammad Tahir",
        "phone": null,
        "email": "hmtahirs1@gmail.com",
        "customerEmail": "hmtahirs1@gmail.com",
        "address1": null,
        "address2": null,
        "zip": null,
        "city": null,
        "province": null,
        "provinceCode": null,
        "country": "Pakistan",
        "countryCode": "PK",
        "currency": "PKR",
        "moneyFormat": "Rs.{{amount}}",
        "planDisplayName": "Developer Preview",
        "planName": "partner_test",
        "locationId": 72646852771,
        "enabledCurrencies": "MXN,PKR",
        "timeZone": null,
        "primaryLocale": "en",
        "active": true,
        "shopifyHost": "YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvYXBwYmV0YXRlc3Rpbmc",
        "lattitude": null,
        "longitude": null,
        "serviceId": 68783964323,
        "closed": null,
        "trialDays": null,
        "timeZoneOffset": null,
        "firstLoad": null,
        "createdAt": "2024-10-03T19:54:32.000Z",
        "updatedAt": "2024-12-01T08:46:10.000Z"
    }

    const segmentList =
        segmentOptions.length > 0
            ? segmentOptions
                .slice(0, visibleOptionIndex)
                .map(({ myshopifyDomain, id, domain, name, active, storeId, country }) => {
                    const selected = segments[selectedSegmentIndex].value === storeId;
                    return (
                        <Listbox.Option key={id} value={storeId} selected={selected}>
                            <Listbox.TextOption selected={selected}>
                                <InlineGrid columns={6}>
                                    <Text variant="headingSm" as="h6">
                                        {storeId}
                                    </Text>
                                    <Text variant="headingSm" as="h6">
                                        {name}
                                    </Text>
                                    <Text variant="headingSm" as="h6">
                                        {myshopifyDomain}
                                    </Text>
                                    <Text variant="headingSm" as="h6">
                                        {domain}
                                    </Text>
                                    <Badge tone={active ? "success" : "info"}>{active ? "Active" : "Deactive"}</Badge>
                                    <Text variant="headingSm" as="h6">
                                        {country}
                                    </Text>
                                </InlineGrid>
                            </Listbox.TextOption>
                        </Listbox.Option>
                    );
                })
            : null;

    const showAllMarkup = showFooterAction ? (
        <Listbox.Action value={actionValue}>
            <span style={{ color: 'var(--p-color-text-emphasis)' }}>
                Show all 111 segments
            </span>
        </Listbox.Action>
    ) : null;

    const lazyLoadingMarkup = lazyLoading ? (
        <Listbox.Loading
            accessibilityLabel={`${query ? 'Filtering' : 'Loading'
                } customer segments`}
        />
    ) : null;

    const noResultsMarkup =
        segmentOptions.length === 0 ? (
            <EmptySearchResult
                title=""
                description={`No segments found matching "${query}"`}
            />
        ) : null;

    const listboxMarkup = (
        <Listbox
            enableKeyboardControl
            autoSelection={AutoSelection.FirstSelected}
            accessibilityLabel="Search for and select a customer segment"
            customListId={listboxId}
            onSelect={handleSegmentSelect}
            onActiveOptionChange={handleActiveOptionChange}
        >
            {segmentList}
            {showAllMarkup}
            {noResultsMarkup}
            {lazyLoadingMarkup}
        </Listbox>
    );

    return (
        <Card>
            <div
                style={{
                    alignItems: 'stretch',
                    borderTop: '1px solid #DFE3E8',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'stretch',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                {textFieldMarkup}

                <Scrollable
                    shadow
                    style={{
                        position: 'relative',
                        height: '292px',
                        padding: 'var(--p-space-200) 0',
                        borderBottomLeftRadius: 'var(--p-border-radius-200)',
                        borderBottomRightRadius: 'var(--p-border-radius-200)',
                    }}
                    onScrolledToBottom={handleLazyLoadSegments}
                >
                    {listboxMarkup}
                </Scrollable>
            </div>
        </Card>
    );
}