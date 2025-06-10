import React from 'react'
import CreatableSelect from 'react-select/creatable';
import chroma from 'chroma-js';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const DropdownIndicator = () => null
const IndicatorSeparator = () => null

let prefix = true
let range = true
const Creatable = props => {

    const styles = {
        control: styles => ({ ...styles, backgroundColor: chroma(props.err || props.error.isErr ? "pink" : "white").alpha(0.3).css(), borderColor: chroma(props.err ? "red" : "B3B3B3").alpha(0.5).css() }),
        menuList: styles => ({ ...styles, backgroundColor: chroma(props.err || props.error.isErr ? "pink" : "white").alpha(0.3).css(), color: chroma(props.err || props.error.isErr ? "red" : 'black').alpha(0.9).css() }),
        // singleValue: (styles, state) => ({ ...styles, backgroundColor: chroma(props.styles.back).alpha(0.3).css(), color: 'red' }),
    };
    return (
        <CreatableSelect
            isDisabled={props.isDisabled}
            required
            isMulti
            label={props.label}
            styles={styles}
            inputValue={props.inputValue}
            onBlurResetsInput={false}
            blurInputOnSelect={false}
            openMenuOnFocus={false}
            openMenuOnClick={false}
            placeholder={props.placeholder}
            onChange={entries => {
                if (!props.error.isErr) {
                    const codes = { [props.id]: entries }
                    if (props.id === "zip_codes") {
                        codes.modifiedCodes = entries
                        codes.esteric_zip = entries
                    }
                    props.handleChange(codes)
                };
                props.setError({ isErr: false, msg: null })
            }}
            onInputChange={entries => {
                props.setInputValue(entries)
                let isErr = true
                let msg = null
                let codess = entries.replace(/\s+/g, "")
                if ((!props.esteric || !props.range) && codess.match(/[^a-zA-Z0-9\-,]+/g)) {
                    msg = `Special characters are not allowed.`
                } else {
                    if ((entries.includes('*') && !prefix) || (entries.includes('>') && !range)) {
                        msg = `This feature is not allowed in current plan.`
                    } else {
                        entries = entries.replace(/\s+/g, "")
                        if (entries.length === 0) {
                            isErr = false
                        } else if ((entries.match(/[^a-zA-Z0-9\*\>\-\,]+/g) && props.id === 'zip_codes')) {
                            msg = `Special characters are not allowed.`
                        } else if (!entries.includes('*') && !entries.includes('>') && entries.length < 3 && props.id === 'zip_codes') {
                            msg = `Minimum 3 characters required.`
                        } else if (entries.includes('*') && entries.includes('>') && props.id === 'zip_codes') {
                            msg = `Either you can add range or a prefixed zip code.`
                        } else if ((entries.indexOf('*') === 0 || entries.indexOf('>') === 0) && props.id === 'zip_codes') {
                            msg = `Must start with alphanumeric.`
                        } else {
                            if (entries.includes('>') && props.id === 'zip_codes') {
                                const [start, end] = entries.split('>')
                                if (isNaN(start) || isNaN(end)) {
                                    msg = `Range must be numerics only.`
                                } else if (start.length < 3) {
                                    msg = `Minimum 3 characters required.`
                                } else if (entries.match(/>/g).length > 1) {
                                    msg = `Format not matched .i.e XXXXX>XXXXX`
                                } else if (Number(end) === 0) {
                                    msg = `Must enter end limit.`
                                } else if (Number(end) > 0 && (Number(start) >= Number(end))) {
                                    msg = `End limit must be greater than start limit.`
                                } else {
                                    isErr = false
                                }
                            } else if (entries.includes('*') && props.id === 'zip_codes') {
                                if (entries.indexOf('*') < 3) {
                                    msg = `Minimum 3 characters required.`
                                } else if (entries.match(/\*/g).length > 1 || entries.charAt(entries.length - 1) !== '*') {
                                    msg = `Format not matched .i.e XXXXX*.`
                                } else {
                                    isErr = false
                                }
                            } else if (entries.includes(',')) {
                                const valuesToSelect = [];
                                const existingValues = props.value ? props.value.map(v => v.value) : []
                                const splitValues = entries.split(',').map(v => { if (v !== '') { return { label: v.trim(), value: v.trim().toLowerCase() } }; return null }).filter(z => { if (z) { return z }; return null });
                                splitValues.forEach(v => {
                                    if (existingValues.includes(v.value)) {
                                        return;
                                    }
                                    valuesToSelect.push(v);
                                });

                                let c = props.value ? [...props.value, ...valuesToSelect] : valuesToSelect
                                props.handleChange({ [props.id]: c })
                                props.setInputValue('')
                                isErr = false
                                msg = null
                            } else {
                                isErr = false
                            }
                        }
                    }
                }
                props.setError({ isErr, msg })
            }}
            value={props.value}
            components={{ animatedComponents, DropdownIndicator, IndicatorSeparator }}
            defaultValue={props.defaults}
            formatCreateLabel={inputValue => props.error.msg ? props.error.msg : `Press Enter to Add "${inputValue}"`}
            noOptionsMessage={({ inputValue }) => {
                if (props.defaults) {
                    for (const option of props.defaults) {
                        if (inputValue.toLowerCase().trim() !== "" && option.label.toLowerCase().includes(inputValue.toLowerCase().trim())) {
                            return "Already Added"
                        }
                    }
                }
                return "Write to add new..."
            }}
        />
    )
}

export default Creatable