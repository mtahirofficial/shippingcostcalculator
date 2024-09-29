import React from 'react'
import {
    InlineStack,
    Tag,
    Listbox,
    EmptySearchResult,
    Combobox,
    Text,
    AutoSelection,
    InlineError,
    Box,
} from '@shopify/polaris';
import { useState, useCallback, useMemo } from 'react';
const ShopifyCombobox = ({ label, oprions = [], selected = [], category, placeholder, helpText, onChange, error }) => {
    const [selectedTags, setSelectedTags] = useState(selected);
    const [value, setValue] = useState('');
    const [suggestion, setSuggestion] = useState('');

    const handleActiveOptionChange = useCallback(
        (activeOption) => {
            const activeOptionIsAction = activeOption === value;

            if (!activeOptionIsAction && !selectedTags.includes(activeOption)) {
                setSuggestion(activeOption);
            } else {
                setSuggestion('');
            }
        },
        [value, selectedTags],
    );
    const updateSelection = useCallback(
        (selected) => {
            const nextSelectedTags = new Set([...selectedTags]);

            if (nextSelectedTags.has(selected)) {
                nextSelectedTags.delete(selected);
            } else {
                nextSelectedTags.add(selected);
            }
            setSelectedTags([...nextSelectedTags]);
            onChange([...nextSelectedTags])
            setValue('');
            setSuggestion('');
        },
        [selectedTags],
    );

    const removeTag = useCallback(
        (tag) => () => {
            updateSelection(tag);
        },
        [updateSelection],
    );

    const getAllTags = useCallback(() => {
        const savedTags = oprions;
        return [...new Set([...savedTags, ...selectedTags].sort())];
    }, [selectedTags]);

    const formatOptionText = useCallback(
        (option) => {
            const trimValue = value.trim().toLocaleLowerCase();
            const matchIndex = option.toLocaleLowerCase().indexOf(trimValue);

            if (!value || matchIndex === -1) return option;

            const start = option.slice(0, matchIndex);
            const highlight = option.slice(matchIndex, matchIndex + trimValue.length);
            const end = option.slice(matchIndex + trimValue.length, option.length);

            return (
                <p>
                    {start}
                    <Text fontWeight="bold" as="span">
                        {highlight}
                    </Text>
                    {end}
                </p>
            );
        },
        [value],
    );

    const escapeSpecialRegExCharacters = useCallback(
        (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        [],
    );

    const options = useMemo(() => {
        let list;
        const allTags = getAllTags();
        const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), 'i');

        if (value) {
            list = allTags.filter((tag) => tag.match(filterRegex));
        } else {
            list = allTags;
        }

        return [...list];
    }, [value, getAllTags, escapeSpecialRegExCharacters]);

    const verticalContentMarkup =
        selectedTags.length > 0 ? (
            <InlineStack gap={200}>
                {selectedTags.map((tag) => (
                    <Tag key={`option-${tag}`} onRemove={removeTag(tag)}>
                        {tag}
                    </Tag>
                ))}
            </InlineStack>
        ) : null;

    const optionMarkup =
        options.length > 0
            ? options.map((option) => {
                return (
                    <Listbox.Option
                        key={option}
                        value={option}
                        selected={selectedTags.includes(option)}
                        accessibilityLabel={option}
                    >
                        <Listbox.TextOption selected={selectedTags.includes(option)}>
                            {formatOptionText(option)}
                        </Listbox.TextOption>
                    </Listbox.Option>
                );
            })
            : null;

    const noResults = value && !getAllTags().includes(value);

    const actionMarkup = noResults ? (
        <Listbox.Action value={value}>{`Add "${value}"`}</Listbox.Action>
    ) : null;

    const emptyStateMarkup = optionMarkup ? null : (
        <EmptySearchResult
            title=""
            description={`No ${category} found matching "${value}"`}
        />
    );

    const listboxMarkup =
        optionMarkup || actionMarkup || emptyStateMarkup ? (
            <Listbox
                autoSelection={AutoSelection.None}
                onSelect={updateSelection}
                onActiveOptionChange={handleActiveOptionChange}
            >
                {actionMarkup}
                {optionMarkup}
            </Listbox>
        ) : null;

    return (
        <div className='combobox' style={{ maxHeight: '225px' }}>
            <Combobox
                allowMultiple
                activator={
                    <Combobox.TextField
                        autoComplete="off"
                        label={label}
                        labelHidden
                        value={value}
                        suggestion={suggestion}
                        placeholder={placeholder}
                        verticalContent={verticalContentMarkup}
                        onChange={setValue}
                        // helpText={helpText}
                        error={error}
                    />
                }
            >
                {listboxMarkup}
            </Combobox>
            {
                (error && error !== "") ? <Box paddingBlock={100}><InlineError message="Required" /></Box> : null
            }
            <Text as="p" tone="subdued">{helpText}</Text>
        </div>
    );
}

export default ShopifyCombobox