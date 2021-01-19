module.exports = {
    hello: (req, res) => {
        return res.send('Hello World');
    },

    home: (req, res) => {
        return res.render("home", {
            title: "Meyjan Ask Steve"
        });
    }
}