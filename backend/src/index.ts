import express,{Express} from "express"
import { PORT } from "./config/server.config";
import apiRouter from "./routes";

const app:Express = express();

app.use("/api",apiRouter)
app.listen(PORT,()=>{
    console.log(`server is running on Port : ${PORT}` )
});