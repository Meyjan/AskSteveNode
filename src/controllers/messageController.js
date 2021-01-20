const ResponseGenerator = require('../utils/responseGenerator');
const dbHelper = require('../helpers/dbHelper');

module.exports = {
    getMessages: (req, res) => {
        dbHelper.getAllMessages((err, result) => {
            if (err) return ResponseGenerator(res, 500, 'Internal server error');
            ResponseGenerator(res, 200, 'OK', result);
        });
    },

    getMessagesByCustomerId: (req, res) => {
        const { id } = req.params;

        dbHelper.getAllMessagesByCustomer(id, (err, result) => {
            if (err) return ResponseGenerator(res, 500, 'Internal server error');
            ResponseGenerator(res, 200, 'OK', result);
        });
    },

    getMessageById: (req, res) => {
        const { id } = req.params;

        dbHelper.getMessageById(id, (err, result) => {
            if (err) return ResponseGenerator(res, 500, 'Internal server error');
            ResponseGenerator(res, 200, 'OK', result);
        });
    },

    deleteMessageById: (req, res) => {
        const { id } = req.params;

        dbHelper.deleteMessageById(id, (err, result) => {
            if (err) return ResponseGenerator(res, 500, 'Internal server error');
            ResponseGenerator(res, 200, 'OK');
        });
    }
}