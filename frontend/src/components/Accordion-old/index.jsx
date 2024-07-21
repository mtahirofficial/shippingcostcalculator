import React from 'react'
import './style.css'
const Accordion = () => {
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
            "answer": "Go to the 'Shipping Zones' section in the app and click on 'Add Shipping Zone.' Follow the prompts to define the zone's name and the regions it covers."
        },
        {
            "question": "What are shipping rates?",
            "answer": "Shipping rates determine the cost of shipping for orders within a specific shipping zone. You can set different rates based on factors like weight, order total, or shipping method."
        },
        {
            "question": "How do I add a new shipping rate?",
            "answer": "Select the shipping zone you want to add a rate to, then click 'Add Shipping Rate.' Define the criteria and costs for the rate, and save your changes."
        },
        {
            "question": "What are shipping ranges?",
            "answer": "Shipping ranges specify the conditions (such as weight range or order value) that apply to a particular shipping rate. They help in defining more precise shipping costs."
        },
        {
            "question": "How do I add a new shipping range?",
            "answer": "Within a specific shipping rate, click on 'Add Shipping Range.' Set the criteria for the range (e.g., weight limits, order value) and the corresponding shipping cost, then save your changes."
        },
        {
            "question": "Why aren't my shipping rates showing up at checkout?",
            "answer": "Ensure that you have defined both shipping zones and rates correctly. Also, check that the rates are active and meet the criteria for the order being placed."
        },
        {
            "question": "How do I update or delete a shipping zone or rate?",
            "answer": "Go to the 'Shipping Zones' or 'Shipping Rates' section, select the zone or rate you want to update, make your changes, and save. To delete, use the delete option next to the zone or rate."
        },
        {
            "question": "How can I contact support?",
            "answer": "If you need help, you can reach our support team by clicking on 'Contact Support' in the app or visiting our support center at [Support URL]."
        },
        {
            "question": "Where can I find more detailed guides and tutorials?",
            "answer": `Visit our support center at [Support URL] for comprehensive guides, FAQs, and video tutorials to help you make the most of ${process.env.REACT_APP_APP_NAME}.`
        }
    ]

    return (
        <ul class="tota11y-accordion" aria-label="FAQs accordion">
            {
                faqs.map((faq, i) => {
                    return <li>
                        <a href={`#acc${i}`} id={`#accLink${i}`}><b>{faq.question}</b></a>
                        <section class="content" id={`acc${i}`} aria-labelledby={`accLink${i}`}>
                            {faq.answer}
                        </section>
                    </li>
                })
            }
        </ul>
    )
}

export default Accordion