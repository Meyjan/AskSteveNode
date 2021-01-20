const request = require('request');

/**
 * Webhook Helper
 * 
 * Contains function to help webhook controller at handling requests
 */
module.exports = {
    // Handles messages events
    handleMessage: (sender_psid, received_message) => {

        let response;

        // Check if the message contains text
        if (received_message.text) {    
            // Create the payload for a basic text message
            response = {
                "text": `You sent the message: "${received_message.text}". Now send me an image!`
            }
        } else if (received_message.attachments) {
            // Get the URL of the message attachment
            let attachment_url = received_message.attachments[0].payload.url;
            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Is this the right picture?",
                            "subtitle": "Tap a button to answer.",
                            "image_url": attachment_url,
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Yes!",
                                    "payload": "yes",
                                },
                                {
                                    "type": "postback",
                                    "title": "No!",
                                    "payload": "no",
                                }
                            ],
                        }]
                    }
                }
            }
        } 
        
        // Sends the response message
        module.exports.callSendAPI(sender_psid, response);
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