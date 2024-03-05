
"use strict";

const token = 'EAANOKbJLwIYBO8lplJZCtdcsr2TY4bs9I33WOoFcHhkjEt7P6f4NsN9OOJU9ZAPeDPCpzeRLIG1IsO3vXNaoZBfVkRHLL9WA1AXXBv2PCcEssAkMv3vbVB0r22tRfPW6B7jf6l4HQPjZAua7Y2KClYZAU1n84yasbGX9aWH7aJFWAAhpaPT7uZBqEG12gw6DkmDO4FBulnyMUosn8ts6oAj4XOmqlRrORZAXcFR3lJZArWIZD';
let isCitySelected = false;
let selectedCity = ''

const request = require("request");
const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios").default;
const app = express().use(body_parser.json());


app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

app.post("/webhook", async (req, res) => {

    console.log(JSON.stringify(req.body, null, 2));


    if (req.body.object) {
        if (
            req.body.entry &&
            req.body.entry[0].changes &&
            req.body.entry[0].changes[0] &&
            req.body.entry[0].changes[0].value.messages &&
            req.body.entry[0].changes[0].value.messages[0]
        ) {
            let phone_number_id =req.body.entry[0].changes[0].value.metadata.phone_number_id;
            let from = req.body.entry[0].changes[0].value.messages[0].from;
            let msg_body = req.body.entry[0].changes[0].value.messages[0]

            if (msg_body.text.body.toString().toLowerCase() == 'hello' || 'hi') {
                axios({
                    method: "POST", // Required, HTTP method, a string, e.g. POST, GET
                    url:
                        "https://graph.facebook.com/v12.0/" +
                        phone_number_id +
                        "/messages?access_token=" +
                        token,
                    data: 'Hello welcome to our bot',
                    headers: { "Content-Type": "application/json" },
                });
            }
            else if (msg_body.type === 'text' && isCitySelected == false) {
                await sendCityInteractiveMessage(phone_number_id, token, from)
                const responseBody = "Done";
                response = {
                    statusCode: 200,
                    body: JSON.stringify(responseBody),
                    isBase64Encoded: false,
                };
            }
            else if (msg_body.type === "interactive" && isCitySelected) {
                if (msg_body.interactive.type === 'list_reply') {
                    let messageinfo =
                        message.interactive.list_reply.id.split("_");
                    if (messageinfo[0] === "city") {
                        await sendCategoryInteractiveMessage(
                            phone_number_id,
                            token,
                            from,
                            messageinfo[1]
                        );
                    } else if (messageinfo[0] === "cat") {
                        await sendReply(
                            phone_number_id,
                            token,
                            from,
                            `${messageinfo[2]} and ${messageinfo[3]}`
                        );
                    }
                    const responseBody = "Done";
                    response = {
                        statusCode: 200,
                        body: JSON.stringify(responseBody),
                        isBase64Encoded: false,
                    }
                }
            }
            else if (msg_body.type === "button_reply") {
                let messageinfo = message.interactive.button_reply.id;
                if (messageinfo === "address_form") {
                    await sendAddressDeliveryMessage(
                        phone_number_id,
                        token,
                        from
                    );
                } else if (messageinfo === "location") {
                    await sendLocationMessage(
                        phone_number_id,
                        token,
                        from
                    );
                }
                else if (message.type === "order") {
                    await sendReplyButtons(phone_number_id, token, from);

                }
            }

        }
        res.sendStatus(200);
    } else {

        res.sendStatus(404);
    }
});


app.get("/webhook", (req, res) => {

    const verify_token = 'EAANOKbJLwIYBO8lplJZCtdcsr2TY4bs9I33WOoFcHhkjEt7P6f4NsN9OOJU9ZAPeDPCpzeRLIG1IsO3vXNaoZBfVkRHLL9WA1AXXBv2PCcEssAkMv3vbVB0r22tRfPW6B7jf6l4HQPjZAua7Y2KClYZAU1n84yasbGX9aWH7aJFWAAhpaPT7uZBqEG12gw6DkmDO4FBulnyMUosn8ts6oAj4XOmqlRrORZAXcFR3lJZArWIZD';


    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];


    if (mode && token) {

        if (mode === "subscribe" && token === verify_token) {

            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {

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
    isCitySelected = true;
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
                                    id: `city_${city}_hyderabad`,
                                    title: "Hyderabad",
                                    //   description: "row-description-content-here",
                                },
                                {
                                    id: `city_${city}_delhi`,
                                    title: "Delhi",
                                    //   description: "row-description-content-here",
                                },
                                {
                                    id: `city_${city}mumbai`,
                                    title: "Mumbai",
                                    //   description: "row-description-content-here",
                                },
                                {
                                    id: `city_${city}_banglore`,
                                    title: "Banglore",
                                    //   description: "row-description-content-here",
                                },
                                {
                                    id: `city_${city}_vizag`,
                                    title: "Vizag",
                                    //   description: "row-description-content-here",
                                },
                            ],
                        },

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



