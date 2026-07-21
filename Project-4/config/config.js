import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const API_KEY = process.env.WEATHER_API_KEY;