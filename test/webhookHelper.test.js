'use strict';
require("dotenv").config();

const webhookHelper = require('../src/helpers/webhookHelper');
const mongoose = require('mongoose');

describe('Simple Test', () => {
    afterAll(() => {
        mongoose.connection.close();
    });

    test('Should count next birthday correctly', () => {
        const date1 = new Date('2020-01-22');
        const date2 = new Date('2020-01-20');
    
        expect(webhookHelper.countBirthday(date1, date2)).toBe(2);
    });

    test('Should count next birthday in next year correctly', () => {
        const date1 = new Date('2020-01-20');
        const date2 = new Date('2020-01-22');
    
        expect(webhookHelper.countBirthday(date1, date2)).toBe(364);
    });

    test('Should set the state to 1', () => {
        let customer = { state: 0 };
        const request_message = { text: 'Hello' };

        const handleStateResult = webhookHelper.handleState(customer, request_message);

        customer = handleStateResult[0];
        const response = handleStateResult[1];
    
        expect(customer.state).toBe(1);
        expect(response.text).toBe('Hello! Please enter your first name!');
    });

    test('Should set the state to 2', () => {
        let customer = { state: 1 };
        const request_message = { text: 'DummyName' };

        const handleStateResult = webhookHelper.handleState(customer, request_message);

        customer = handleStateResult[0];
        const response = handleStateResult[1];
    
        expect(customer.state).toBe(2);
        expect(customer.name).toBe('DummyName');
        expect(response.text).toBe('Hello DummyName! Please enter your birth date!');
    });

    test('Should set the state to 3', () => {
        let customer = { state: 2, name: 'DummyName' };
        const request_message = { text: '2020-01-19' };

        const handleStateResult = webhookHelper.handleState(customer, request_message);

        customer = handleStateResult[0];
        const response = handleStateResult[1];
    
        expect(customer.state).toBe(3);
        expect(customer.name).toBe('DummyName');
        expect(customer.birthDate).toStrictEqual(new Date(request_message.text));
        expect(response.text).toBe('Thank you. Do you want me to tell you how many days until your next birthday?');
    });

    test('Should set the state to 0, send date difference', () => {
        let customer = { state: 3, name: 'DummyName', birthDate: new Date('2020-01-19') };
        const request_message = { text: 'yes' };

        const handleStateResult = webhookHelper.handleState(customer, request_message);

        customer = handleStateResult[0];
        const response = handleStateResult[1];
    
        expect(customer.state).toBe(0);
        expect(customer.name).toBe('DummyName');

        const diffDays = webhookHelper.countBirthday(customer.birthDate, new Date());
        expect(response.text).toBe(`Your next birthday will occur in ${diffDays} days.`);
    });

    test('Should set the state to 0, send thank you', () => {
        let customer = { state: 3, name: 'DummyName', birthDate: new Date('2020-01-19') };
        const request_message = { text: 'no' };

        const handleStateResult = webhookHelper.handleState(customer, request_message);

        customer = handleStateResult[0];
        const response = handleStateResult[1];
    
        expect(customer.state).toBe(0);
        expect(customer.name).toBe('DummyName');
        expect(response.text).toBe(`Thanks.`);
    });

    test('Should keep the state at 3, send clarification', () => {
        let customer = { state: 3, name: 'DummyName', birthDate: new Date('2020-01-19') };
        const request_message = { text: 'asdf' };

        const handleStateResult = webhookHelper.handleState(customer, request_message);

        customer = handleStateResult[0];
        const response = handleStateResult[1];
    
        expect(customer.state).toBe(3);
        expect(customer.name).toBe('DummyName');
        expect(response.text).toBe(`Unidentified word. Do you want me to tell you how many days until your next birthday?`);
    });
});
