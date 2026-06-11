import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("<h1>Hello World</h1>")
})

app.listen(PORT, () => {
    console.log(
        `App successfully running on PORT ${PORT} at http://localhost:${PORT}`,
    );
});
