import express from "express";
import {subjects} from "./src/db/schema";
import subjectsRouter from "./src/routes/subjects";


const app = express();
const PORT = 8000;

app.use(express.json());

app.use('/api/subjects', subjectsRouter)

app.get("/", (_req, res) => {
    res.send("Hello from Express + TypeScript!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
