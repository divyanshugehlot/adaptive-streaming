import express,{Express,Request,Response} from "express"

const app:Express = express();

app.get("/ping",(_req:Request,res:Response)=>{
res.json({
    message:"pong!!"
})
})

app.listen(3000,()=>{
    console.log("server is running on Port : 3000" )
});