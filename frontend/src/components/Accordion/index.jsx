import React, { useRef, useState } from "react";
import {Icon} from '@shopify/polaris';
import {
    ChevronDownIcon,
    ChevronUpIcon
} from '@shopify/polaris-icons';
import './style.css'
const faqs = [
    {
        "question": `What is ${process.env.REACT_APP_APP_NAME}?`,
        "answer": `${process.env.REACT_APP_APP_NAME} is a Shopify app that allows you to define and calculate custom delivery charges for your store's checkout process based on specific rules you set.`
    },
    {
        "question": `How do I install ${process.env.REACT_APP_APP_NAME}?`,
        "answer": `You can install ${process.env.REACT_APP_APP_NAME} from the Shopify App Store. Simply search for our app, click 'Add app,' and follow the installation instructions.`
    },
    {
        "question": "What are shipping zones?",
        "answer": "Shipping zones are specific geographical areas where you offer shipping services. By creating shipping zones, you can set tailored shipping rates and rules for different regions."
    },
    {
        "question": "How do I add a new shipping zone?",
        "answer": "Go to the 'Zones' section in the app and click on 'Add Zone.' Follow the prompts to define the zone's name and the regions it covers."
    },
    {
        "question": "What are shipping rates?",
        "answer": "Shipping rates determine the cost of shipping for orders within a specific shipping zone. You can set different rates based on factors like weight, order total, or cart quantity."
    },
    {
        "question": "How do I add a new shipping rate?",
        "answer": "Select the shipping zone you want to add a rate to, then click 'Add Rate.' Define the criteria and costs for the rate, and save your changes."
    },
    {
        "question": "What are shipping ranges?",
        "answer": "Shipping ranges specify the conditions (such as weight range or order value) that apply to a particular shipping rate. They help in defining more precise shipping costs."
    },
    {
        "question": "How do I add a new shipping range?",
        "answer": "Within a specific shipping rate, click on 'Add Range.' Set the criteria for the range (e.g., weight limits, order value) and the corresponding shipping cost, then save your changes."
    },
    {
        "question": "Why aren't my shipping rates showing up at checkout?",
        "answer": "Ensure that you have defined both shipping zones and rates correctly. Also, check that the rates are active and meet the criteria for the order being placed."
    },
    {
        "question": "How do I update or delete a shipping zone or rate?",
        "answer": "Go to the 'Zones' or 'Rates' section in specific zone, select the zone or rate you want to update, make your changes, and save. To delete, use the delete option next to the zone or rate."
    },
    {
        "question": "How can I contact support?",
        "answer": "If you need help, you can reach our support team by clicking on 'Contact Support' in the app"
    },
    // {
    //     "question": "Where can I find more detailed guides and tutorials?",
    //     "answer": `Visit our support center at [Support URL] for comprehensive guides, FAQs, and video tutorials to help you make the most of ${process.env.REACT_APP_APP_NAME}.`
    // }
]
//  accordionitem component
const AccordionItem = ({ question, answer, isOpen, onClick }) => {
    const contentHeight = useRef();
    return (
        <div className="wrapper">
            <button
                className={`question-container ${isOpen ? "active" : ""}`}
                onClick={onClick}
            >
                <p className="question-content">{question}</p>
                <Icon
                    source={isOpen ? ChevronUpIcon : ChevronDownIcon}
                    tone="base"
                />
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
                <p className="answer-content">{answer}</p>
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
                    question={item.question}
                    answer={item.answer}
                    isOpen={activeIndex === index}
                    onClick={() => handleItemClick(index)}
                />
            ))}
        </div>
    );
};

export default Accordion;
