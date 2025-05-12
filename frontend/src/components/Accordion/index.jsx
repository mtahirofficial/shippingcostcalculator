import React, { useRef, useState } from "react";
import { Icon } from '@shopify/polaris';
import {
    ChevronDownIcon,
} from '@shopify/polaris-icons';
import './style.css'
const faqs = [
    {
        "question": `What is ${process.env.REACT_APP_APP_NAME}?`,
        "answer": `${process.env.REACT_APP_APP_NAME} is a Shopify app that allows you to define and calculate custom shipping charges for your store's checkout process based on specific rules you set.`,
        "url": "https://youtu.be/sVkT-YTUXS4"
    },
    {
        "question": `How do I install ${process.env.REACT_APP_APP_NAME}?`,
        "answer": `You can install ${process.env.REACT_APP_APP_NAME} from the Shopify App Store. Simply search for our app, click 'Add app,' and follow the installation instructions.`
    },
    // {
    //     "question": "What are shipping zones?",
    //     "answer": "Shipping zones are specific geographical areas where you offer shipping services. By creating shipping zones, you can set tailored shipping rates and rules for different regions."
    // },
    // {
    //     "question": "How do I add a new shipping zone?",
    //     "answer": "Go to the 'Zones' section in the app and click on 'Add Zone.' Follow the prompts to define the zone's name and the regions it covers."
    // },
    {
        "question": "What are shipping rules?",
        "answer": "Shipping rules determine the cost of shipping for orders within a specific shipping area. You can set different rules based on factors like weight, order total price, cart quantity, or product quantity."
    },
    // {
    //     "question": "How do I add a new shipping rule?",
    //     "answer": "Click 'Add Rate' button Define the criteria and costs for the rate, and save your changes."
    // },
    // {
    //     "question": "What are shipping ranges?",
    //     "answer": "Shipping ranges specify the conditions (such as weight range or order value) that apply to a particular shipping rule. They help in defining more precise shipping costs."
    // },
    // {
    //     "question": "How do I add a new shipping range?",
    //     "answer": "Within a specific shipping rule, click on 'Add Range.' Set the criteria for the range (e.g., weight limits, order value) and the corresponding shipping cost, then save your changes."
    // },
    {
        "question": "Why aren't my shipping rules showing up at checkout?",
        "answer": "Ensure that you have defined and rules correctly. Also, check that the rules are active and meet the criteria for the order being placed."
    },
    // {
    //     "question": "How do I update or delete a shipping rule?",
    //     "answer": "Go to the 'Zones' or 'Rates' section in specific zone, select the zone or rate you want to update, make your changes, and save. To delete, use the delete option next to the zone or rate."
    // },
    {
        "question": "How can I contact support?",
        "answer": "If you need help, you can reach our support team using Chat option"
    },
    // {
    //     "question": "Where can I find more detailed guides and tutorials?",
    //     "answer": `Visit our support center at [Support URL] for comprehensive guides, FAQs, and video tutorials to help you make the most of ${process.env.REACT_APP_APP_NAME}.`
    // }
]
//  accordionitem component
const AccordionItem = ({ question, answer, url, isOpen, onClick }) => {
    const contentHeight = useRef();
    return (
        <div className="wrapper">
            <button
                className={`question-container ${isOpen ? "active" : ""}`}
                onClick={onClick}
            >
                <p className="question-content">{question}</p>
                <span className={`arrow-icon${isOpen ? " rotate" : ""}`}>
                    <Icon
                        source={ChevronDownIcon}
                        // source={isOpen ? ChevronUpIcon : ChevronDownIcon}
                        tone="base"
                    />
                </span>
            </button>

            <div
                ref={contentHeight}
                className="answer-container"
                style={
                    isOpen
                        ? { height: contentHeight.current.scrollHeight }
                        : { height: "0px" }
                }
            >
                <p className="answer-content">
                    {answer}{" "}
                    {url ? <a className="learn-more" href={url} target="_blank" rel="noreferrer">Learn more</a> : null}
                </p>
            </div>
        </div>
    );
};

const Accordion = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const handleItemClick = (index) => {
        setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (
        <div className="container">
            {faqs.map((item, index) => (
                <AccordionItem
                    key={index}
                    {...item}
                    isOpen={activeIndex === index}
                    onClick={() => handleItemClick(index)}
                />
            ))}
        </div>
    );
};

export default Accordion;
