import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import chroma from 'chroma-js';
import "./style.css"
import { Icon, InlineError } from '@shopify/polaris';
import { SelectIcon } from '@shopify/polaris-icons';

const animatedComponents = makeAnimated();
const DropdownIndicator = () => <Icon source={SelectIcon} />
const IndicatorSeparator = () => null

const SelectList = ({ options, disabled, placeholder, defaults, groupedOptions, handleChange, error, label }) => {
    const styles = {
        control: (styles) => ({ ...styles, backgroundColor: chroma(error ? "pink" : "white").alpha(0.3).css(), borderColor: chroma(error ? "red" : "B3B3B3").alpha(0.5).css() }),
    };
    const formatGroupLabel = data => {
        return groupedOptions ? <div style={groupStyles}>
            <span>{data.label}</span>
            <span style={groupBadgeStyles}>{data.options.length}</span>
        </div> : null
    }
    const groupStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    };
    const groupBadgeStyles = {
        backgroundColor: '#EBECF0',
        borderRadius: '2em',
        color: '#172B4D',
        display: 'inline-block',
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: '1',
        minWidth: 1,
        padding: '0.16666666666667em 0.5em',
        textAlign: 'center',
    };
    return (<>
        <Select
            isMulti
            label={label}
            blurInputOnSelect={false}
            styles={styles}
            isDisabled={disabled}
            placeholder={placeholder}
            closeMenuOnSelect={true}
            closeMenuOnScroll={true}
            value={defaults}
            defaultValue={defaults}
            options={groupedOptions ? groupedOptions : options}
            formatGroupLabel={formatGroupLabel}
            onChange={handleChange}
            className="basic-multi-select"
            classNamePrefix="select"
            components={{ animatedComponents, DropdownIndicator, IndicatorSeparator }}
        />
        <InlineError message={error} />
    </>);
}

export default SelectList