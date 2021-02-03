const db = require('../utils/db');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Get collections
const userCollectionName = process.env.USER_COLLECTION;
const messageCollectionName = process.env.MESSAGE_COLLECTION;

module.exports = {
    getAllMessages: (callback) => {
        const conn = db.conn();
        const messageCollection = conn.collection(messageCollectionName);

        return messageCollection.find({}, (err, result) => {
            if (err) return callback(err);
            result.toArray((err, result2) => {
                if (err) return callback(err);
                return callback(null, result2);
            });
        });
    },

    getMessageById: (messageId, callback) => {
        const conn = db.conn();
        const messageCollection = conn.collection(messageCollectionName);

        try {
            const query = { _id: ObjectId(messageId) };
            messageCollection.findOne(query, (err, result) => {
                if (err) return callback(err);
                return callback(null, result);
            });
        } catch (err) {
            return callback(err);
        }
        
    },

    getAllMessagesByCustomer: (customerId, callback) => {
        const conn = db.conn();
        const messageCollection = conn.collection(messageCollectionName);

        const query = { customerId: parseInt(customerId) };
        return messageCollection.find(query, (err, result) => {
            if (err) return callback(err);
            result.toArray((err, result2) => {
                if (err) return callback(err);
                return callback(null, result2);
            });
        });
    },

    addNewMessage: (message, callback) => {
        const conn = db.conn();
        const messageCollection = conn.collection(messageCollectionName);

        messageCollection.insertOne(message, (err, result) => {
            if (err) return callback(err);
            return callback(null, result);
        });
    },

    deleteMessageById: (messageId, callback) => {
        const conn = db.conn();
        const messageCollection = conn.collection(messageCollectionName);
        
        try {
            const query = { _id:  ObjectId(messageId) };
            messageCollection.deleteOne(query, (err, result) => {
                if (err) return callback(err);
                return callback(null, result);
            });
        } catch (err) {
            return callback(err);
        }
        
    },

    getCustomerData: (customerId, callback) => {
        const conn = db.conn();
        const userCollection = conn.collection(userCollectionName);

        const query = { _id: customerId };
        userCollection.findOne(query, (err, result) => {
            if (err) return callback(err);
            return callback(null, result);
        });
    },

    addNewCustomer: (customer, callback) => {
        const conn = db.conn();
        const userCollection = conn.collection(userCollectionName);

        userCollection.insertOne(customer, (err, result) => {
            if (err) return callback(err);
            return callback(null, result);
        });
    },

    updateCustomer: (customer, callback) => {
        const conn = db.conn();
        const userCollection = conn.collection(userCollectionName);
        
        const query = { _id:  customer._id };
        const { _id, ...updatedCustomer } = customer;
        const updatedObj = { $set: updatedCustomer };
        const upsert = { upsert: true };
        
        userCollection.updateOne(query, updatedObj, upsert, (err, result) => {
            if (err) return callback(err);
            return callback(null, result);
        });
    },

    getOrCreateNewCustomerData: (customerId, callback) => {
        module.exports.getCustomerData(customerId, (err, result) => {
            if (err) return callback(err);
            if (result) {
                callback(null, result);
            } else {
                const customer = {
                    _id:customerId,
                    state: 0
                }
                module.exports.addNewCustomer(customer, (err2, result2) => {
                    if (err2) return callback(err2);
                    if (result2) {
                        callback(null, customer);
                    }
                });
            }
        });
    },

    logMessageAndUpdateCustomer: (message, reply, customer, callback) => {
        module.exports.updateCustomer(customer, (err, result) => {
            if (err) return callback(err);

            const messageObj = {
                message: message,
                type: 'from',
                customerId: customer._id
            }
            module.exports.addNewMessage(messageObj, (err2, result2) => {
                if (err2) return callback(err2);

                const replyObj = {
                    message: reply,
                    type: 'to',
                    customerId: customer._id
                }
                module.exports.addNewMessage(replyObj, (err3, result3) => {
                    if (err3) return callback (err3);
                    callback (null, (message, reply, customer));
                })
            });
        });
    },
}