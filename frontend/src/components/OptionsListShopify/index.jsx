import React from 'react'
import { Card, Popover, OptionList } from '@shopify/polaris';

const OptionsListShopify = ({ active, activator, toggle, height, title, setSelected, options, selected }) => {
    return (
        <div style={{ maxHeight: `${height}px` }}>
            <Popover
                fullWidth
                active={active}
                activator={activator}
                onClose={toggle}
            >
                <OptionList
                    allowMultiple
                    title={title}
                    onChange={setSelected}
                    options={options}
                    selected={selected}
                />
            </Popover>
        </div>
    )
}

export default OptionsListShopify