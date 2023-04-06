const express = require("express");
const router = require("./routes");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/posts", router);
app.use((error, req, res, next) => {
    res.status(400).json({
        code: 400,
        message: error.stack,
    });
});
app.listen(8600, () => {
    console.log("App listening on port 8600!");
});
module.exports = app;
