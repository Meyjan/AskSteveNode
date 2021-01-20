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
    // Counting birthday
    countBirthday: (birthDate, currentDate) => {
        let date1 = birthDate;
        const date2 = currentDate;
        date1.setYear(date2.getFullYear());
        if (date1 < date2) {
            date1.setYear(date1.getFullYear() + 1);
        }

        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    },

    // State handler
    handleState: (customer, received_message) => {
        const customer_state = customer.state;
        let response;

        if (customer_state === 0) {
            response = {
                "text": `Hello! Please enter your first name!`
            }
            customer.state = 1;
        
        } else if (customer_state === 1) {
            response = {
                "text": `Hello ${received_message.text}! Please enter your birth date!`
            }
            customer.state = 2;
            customer.name = received_message.text;

        } else if (customer_state === 2) {
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
            customer.state = 3;
            customer.birthDate = new Date(received_message.text);

        } else if (customer_state === 3) {
            received_message.text = received_message.text.toLowerCase();
            if (yesResponse.includes(received_message.text)) {         
                const diffDays = module.exports.countBirthday(customer.birthDate, new Date());
                
                response = {
                    "text": `Your next birthday will occur in ${diffDays} days.`
                }
                customer.state = 0;

            } else if (noResponse.includes(received_message.text)) {
                response = {
                    "text": "Thanks."
                }
                customer.state = 0;

            } else {
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
            }
        } else {
            throw new Error('Unhandled customer state');
        }

        return [customer, response];
    },

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

                    let customer = result;
                    const handleStateResult = module.exports.handleState(customer, received_message);

                    customer = handleStateResult[0];
                    const response = handleStateResult[1];

                    dbHelper.logMessageAndUpdateCustomer(received_message.text, response.text, customer, (err, result) => {
                        console.log(result);
                        console.log(err);
                        if (err) throw err;

                        // Sends the response message
                        console.log(response);
                        module.exports.callSendAPI(sender_psid, response);
                    });

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