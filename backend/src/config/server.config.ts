import dotenv from "dotenv";

dotenv.config();// load ,env file

export const PORT = process.env.PORT|| 3000;