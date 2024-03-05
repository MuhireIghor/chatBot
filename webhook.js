/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";
// req.body.entry[0].changes[0]
// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = 'EAANOKbJLwIYBO8lplJZCtdcsr2TY4bs9I33WOoFcHhkjEt7P6f4NsN9OOJU9ZAPeDPCpzeRLIG1IsO3vXNaoZBfVkRHLL9WA1AXXBv2PCcEssAkMv3vbVB0r22tRfPW6B7jf6l4HQPjZAua7Y2KClYZAU1n84yasbGX9aWH7aJFWAAhpaPT7uZBqEG12gw6DkmDO4FBulnyMUosn8ts6oAj4XOmqlRrORZAXcFR3lJZArWIZD';

// Imports dependencies and set up http server
const request = require("request"),
    express = require("express"),
    body_parser = require("body-parser"),
    axios = require("axios").default,
    app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2));

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object) {
        if (
            req.body.entry &&
            req.body.entry[0].changes &&
            req.body.entry[0].changes[0] &&
            req.body.entry[0].changes[0].value.messages &&
            req.body.entry[0].changes[0].value.messages[0]
        ) {
            let phone_number_id =
                req.body.entry[0].changes[0].value.metadata.phone_number_id;
            let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
            let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
            const data = JSON.stringify({
                messaging_product: "whatsapp",
                to: from,
                type: "interactive",
                interactive: {
                    type: "list",
                    body: {
                        text: "Please select a category From the below Options",
                    },
                    action: {
                        button: "Select Category",
                        sections: [
                            {
                                title: "Choose a Category",
                                rows: [
                                    {
                                        id: `cat_chains`,
                                        title: "Chain",
                                    },
                                    {
                                        id: `cat_necklace`,
                                        title: "necklace",
                                    },
                                    {
                                        id: `cat_bangles`,
                                        title: "Bangles",
                                    },
                                    {
                                        id: `cat_silver`,
                                        title: "Silver Items",
                                    },
                                ],
                            },
                        ],
                    },
                },
            }); // extract the message text from the webhook payload
            if (msg_body.toString().toLowerCase() == 'hello' || 'hi') {

             
                axios({
                    method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                    url:
                        "https://graph.facebook.com/v12.0/" +
                        phone_number_id +
                        "/messages?access_token=" +
                        token,
                    data: data,
                    headers: { "Content-Type": "application/json" },
                });
            }
            else {

                axios({
                    method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                    url:
                        "https://graph.facebook.com/v12.0/" +
                        phone_number_id +
                        "/messages?access_token=" +
                        token,
                    data:data,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }
        res.sendStatus(200);
    } else {
        // Return a '404 Not Found' if event is not from a WhatsApp API
        res.sendStatus(404);
    }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
    **/
    const verify_token = 'EAANOKbJLwIYBO8lplJZCtdcsr2TY4bs9I33WOoFcHhkjEt7P6f4NsN9OOJU9ZAPeDPCpzeRLIG1IsO3vXNaoZBfVkRHLL9WA1AXXBv2PCcEssAkMv3vbVB0r22tRfPW6B7jf6l4HQPjZAua7Y2KClYZAU1n84yasbGX9aWH7aJFWAAhpaPT7uZBqEG12gw6DkmDO4FBulnyMUosn8ts6oAj4XOmqlRrORZAXcFR3lJZArWIZD';

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === verify_token) {
            // Respond with 200 OK and challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});


const sendReply = async (
    phone_number_id,
    whatsapp_token,
    to,
    reply_message
) => {
    try {
        console.log(phone_number_id, to, reply_message);
        let data = JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: {
                body: `Thank you for checking the bot Your City & Cat are ${reply_message}`
            },
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${whatsapp_token}`,
                "Content-Type": "application/json",
            },
            data: data,
        };
        const response = await axios.request(config);
        console.log(response);
    } catch (err) {
        console.log(err);
    }
};


const sendCityInteractiveMessage = async (
    phone_number_id,
    whatsapp_token,
    to
) => {
    try {
        let data = JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "interactive",
            interactive: {
                type: "list",
                body: {
                    text: "Welcome to Ecommerce Bot, Please select  from the options",
                },
                action: {
                    button: "Choose a City",
                    sections: [
                        {
                            title: "Choose a City",
                            rows: [
                                {
                                    id: "city_hyderabad",
                                    title: "Hyderabad",
                                    //   description: "row-description-content-here",
                                },
                                {
                                    id: "city_delhi",
                                    title: "Delhi",
                                    //   description: "row-description-content-here",
                                },
                                {
                                    id: "city_mumbai",
                                    title: "Mumbai",
                                    //   description: "row-description-content-here",
                                },
                                {
                                    id: "city_banglore",
                                    title: "Banglore",
                                    //   description: "row-description-content-here",
                                },
                                {
                                    id: "city_vizag",
                                    title: "Vizag",
                                    //   description: "row-description-content-here",
                                },
                            ],
                        },
                        // {
                        //   title: "your-section-title-content-here",
                        //   rows: [
                        //     {
                        //       id: "unique-row-identifier-here",
                        //       title: "row-title-content-here",
                        //       description: "row-description-content-here",
                        //     },
                        //   ],
                        // },
                    ],
                },
            },
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${whatsapp_token}`,
                "Content-Type": "application/json",
            },
            data: data,
        };
        const response = await axios.request(config);
        console.log(response);
    } catch (err) {
        console.log(err);
    }
};

const sendCategoryInteractiveMessage = async (
    phone_number_id,
    whatsapp_token,
    to,
    city
) => {
    try {
        let data = JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "interactive",
            interactive: {
                type: "list",
                body: {
                    text: "Please select a category From the below Options",
                },
                action: {
                    button: "Select Category",
                    sections: [
                        {
                            title: "Choose a Category",
                            rows: [
                                {
                                    id: `cat_${city}_chains`,
                                    title: "Chain",
                                },
                                {
                                    id: `cat_${city}_necklace`,
                                    title: "necklace",
                                },
                                {
                                    id: `cat_${city}_bangles`,
                                    title: "Bangles",
                                },
                                {
                                    id: `cat_${city}_silver`,
                                    title: "Silver Items",
                                },
                            ],
                        },
                    ],
                },
            },
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${whatsapp_token}`,
                "Content-Type": "application/json",
            },
            data: data,
        };
        const response = await axios.request(config);
        console.log(response);
    } catch (err) {
        console.log(err);
    }
};
const sendMultipleProductMessage = async (
    phone_number_id,
    whatsapp_token,
    to,
    category
) => {
    try {
        let data = JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "interactive",
            interactive: {
                type: "product_list",
                header: {
                    type: "text",
                    text: `Jewellery Store ${category}`,
                },
                body: {
                    text: "We are dedicated to providing our customers with the safest and cleanest products, Please select products from below",
                },
                action: {
                    catalog_id: "176713595394228",
                    sections: [
                        {
                            title: "Jewellery Products",
                            product_items: [
                                {
                                    product_retailer_id: "tc5k2e4gfa",
                                },
                                {
                                    product_retailer_id: "wkey35bg0x",
                                },
                            ],
                        },
                    ],
                },
            },
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${whatsapp_token}`,
                "Content-Type": "application/json",
            },
            data: data,
        };
        const response = await axios.request(config);
        console.log(response);
    } catch (err) {
        console.log(JSON.stringify(err));
    }
};

const sendAddressDeliveryMessage = async (
    phone_number_id,
    whatsapp_token,
    to
) => {
    try {
        let data = JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "interactive",
            interactive: {
                type: "address_message",
                body: {
                    text: "Thanks for your order! Tell us what address you'd like this order delivered to.",
                },
                action: {
                    name: "address_message",
                    parameters: {
                        country: "IN",
                    },
                },
            },
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${whatsapp_token}`,
                "Content-Type": "application/json",
            },
            data: data,
        };
        const response = await axios.request(config);
        console.log(response);
    } catch (err) {
        console.log(JSON.stringify(err));
    }
};

const sendLocationMessage = async (phone_number_id, whatsapp_token, to) => {
    try {
        let data = JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "interactive",
            interactive: {
                type: "location_request_message",
                body: {
                    type: "text",
                    text: "Please Send Your Current Location For Address",
                },
                action: {
                    name: "send_location",
                },
            },
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${whatsapp_token}`,
                "Content-Type": "application/json",
            },
            data: data,
        };
        const response = await axios.request(config);
        console.log(response);
    } catch (err) {
        console.log(JSON.stringify(err));
    }
};
const sendReplyButtons = async (phone_number_id, whatsapp_token, to) => {
    try {
        let data = JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                    text: "Please select an option for sending the delivery",
                },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "address_form",
                                title: "Fill Address",
                            },
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "location",
                                title: "Send Location",
                            },
                        },
                    ],
                },
            },
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${whatsapp_token}`,
                "Content-Type": "application/json",
            },
            data: data,
        };
        const response = await axios.request(config);
        console.log(response);
    } catch (err) {
        console.log(JSON.stringify(err));
    }
};



