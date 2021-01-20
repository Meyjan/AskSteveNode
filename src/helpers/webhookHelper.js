const request = require('request');
const dbHelper = require('./dbHelper');

const yesResponse = ['yes', 'ok', 'yeah', 'yup'];
const noResponse = ['no', 'nah', 'nope', 'sorry'];

/**
 * Webhook Helper
 * 
 * Contains function to help webhook controller at handling requests
 */

module.exports = {
    // Handles messages events
    handleMessage: (sender_psid, received_message) => {
        try {
            let response;

            // Check if the message contains text
            if (received_message.text) {
                // Create the payload for a basic text message
                dbHelper.getOrCreateNewCustomerData(parseInt(sender_psid), (err, result) => {
                    if (err) throw err;
                    if (!result) return console.error('Cannot find existing data');

                    const customer = result;
                    const customer_state = result.state;

                    if (customer_state === 0) {
                        response = {
                            "text": `Hello! Please enter your first name!`
                        }
                        customer.state = 1;

                        console.log(customer);

                        dbHelper.logMessageAndUpdateCustomer(received_message.text, response.text, customer, (err, result) => {
                            console.log(result);
                            console.log(err);
                            if (err) throw err;

                            // Sends the response message
                            console.log(response);
                            module.exports.callSendAPI(sender_psid, response);
                        });
                    
                    } else if (customer_state === 1) {
                        response = {
                            "text": `Hello ${received_message.text}! Please enter your birth date!`
                        }
                        customer.state = 2;
                        customer.name = received_message.text;

                        dbHelper.logMessageAndUpdateCustomer(received_message.text, response.text, customer, (err, result) => {
                            if (err) throw err;

                            // Sends the response message
                            console.log(response);
                            module.exports.callSendAPI(sender_psid, response);
                        });

                    } else if (customer_state === 2) {
                        response = {
                            "text": "Thank you. Do you want me to tell you how many days until your next birthday?"
                        }
                        customer.state = 3;
                        customer.birthDate = new Date(received_message.text);

                        dbHelper.logMessageAndUpdateCustomer(received_message.text, response.text, customer, (err, result) => {
                            if (err) throw err;

                            response = {
                                "text": "Thank you. Do you want me to tell you how many days until your next birthday?",
                                "quick_replies":[
                                    {
                                        "content_type":"text",
                                        "title":"Yes",
                                        "payload":"yes"
                                    },{
                                        "content_type":"text",
                                        "title":"No",
                                        "payload":"no"
                                    }
                                ]
                            }

                            // Sends the response message
                            console.log(response);
                            module.exports.callSendAPI(sender_psid, response);
                        });

                    } else if (customer_state === 3) {
                        received_message.text = received_message.text.toLowerCase();
                        if (yesResponse.includes(received_message.text)) {
                            let date1 = customer.birthDate;
                            const date2 = new Date();
                            date1.setYear(date2.getFullYear());
                            if (date1 < date2) {
                                date1.setYear(date1.getFullYear() + 1);
                            }

                            const diffTime = Math.abs(date2 - date1);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            response = {
                                "text": `Your next birthday will occur in ${diffDays} days.`
                            }
                            customer.state = 0;
                            dbHelper.logMessageAndUpdateCustomer(received_message.text, response.text, customer, (err, result) => {
                                if (err) throw err;
                                // Sends the response message
                                console.log(response);
                                module.exports.callSendAPI(sender_psid, response);
                            });

                        } else if (noResponse.includes(received_message.text)) {
                            response = {
                                "text": "Okay then. No problem."
                            }

                            customer.state = 0;
                            dbHelper.logMessageAndUpdateCustomer(received_message.text, response.text, customer, (err, result) => {
                                if (err) throw err;
                                // Sends the response message
                                console.log(response);
                                module.exports.callSendAPI(sender_psid, response);
                            });

                        } else {
                            response = {
                                "text": "Unidentified word. Do you want me to tell you how many days until your next birthday?"
                            }
                            dbHelper.logMessageAndUpdateCustomer(received_message.text, response.text, customer, (err, result) => {
                                if (err) throw err;
                                response = {
                                    "text": "Unidentified word. Do you want me to tell you how many days until your next birthday?",
                                    "quick_replies":[
                                        {
                                            "content_type":"text",
                                            "title":"Yes",
                                            "payload":"yes"
                                        },{
                                            "content_type":"text",
                                            "title":"No",
                                            "payload":"no"
                                        }
                                    ]
                                }
                                // Sends the response message
                                console.log(response);
                                module.exports.callSendAPI(sender_psid, response);
                            });
                        }
                    } else {
                        throw new Error('Unhandled customer state');
                    }
                });
                
            } else {
                // Handles non-text message
                response = {
                    "text": `This chatbot only handles text messages!`
                }
                // Sends the response message
                console.log(response);
                module.exports.callSendAPI(sender_psid, response);
            } 
        } catch (err) {
            console.error(err);
        }
    },

    // Handles messaging_postbacks events
    handlePostback: (sender_psid, received_postback) => {
        let response;
  
        // Get the payload for the postback
        let payload = received_postback.payload;
      
        // Set the response based on the postback payload
        if (payload === 'yes') {
            response = { "text": "Thanks!" }
        } else if (payload === 'no') {
            response = { "text": "Oops, try sending another image." }
        }

        // Send the message to acknowledge the postback
        module.exports.callSendAPI(sender_psid, response);
    },

    handleReferral: (sender_psid, received_referral) => {
        // Check before giving welcome message
        if (received_referral.type === 'OPEN_THREAD') {
            let response = { "text": "Hi! How can I help you?" };

            module.exports.callSendAPI(sender_psid, response);
        }
    },

    // Sends response messages via the Send API
    callSendAPI: (sender_psid, response) => {
        // Construct the message body
        let request_body = {
            "recipient": {
                "id": sender_psid
            },
            "message": response
        }

        // Send the HTTP request to the Messenger Platform
        request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": process.env.FACEBOOK_PAGE_VERIFY_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent!')
            } else {
                console.error("Unable to send message:" + err);
            }
        });
    }
}