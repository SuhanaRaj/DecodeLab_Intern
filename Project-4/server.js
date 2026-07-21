import http from "http";
import url from "url";

import { PORT } from "./config/config.js";
import { fetchWeather } from "./services/weatherService.js";

const server = http.createServer(async (req, res) => {

    const parsedUrl = url.parse(req.url, true);

    // Home Page
    if (req.method === "GET" && parsedUrl.pathname === "/") {

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Weather App</title>
            </head>
            <body>

                <h1>Weather App</h1>

                <form action="/weather" method="GET">
                    <input
                        type="text"
                        name="city"
                        placeholder="Enter City"
                        required
                    >

                    <button type="submit">
                        Get Weather
                    </button>
                </form>

            </body>
            </html>
        `);

        return;
    }

    // Weather Route
    if (req.method === "GET" && parsedUrl.pathname === "/weather") {

        const city = parsedUrl.query.city;

        try {

            const weather = await fetchWeather(city);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify(weather, null, 2));

        } catch (error) {

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                message: error.message
            }));
        }

        return;
    }

    // 404
    res.writeHead(404, {
        "Content-Type": "text/plain"
    });

    res.end("Route Not Found");

});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});