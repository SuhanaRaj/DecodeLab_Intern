import http from "http";
import querystring from "querystring";
import connectDB from "./config/db.js";
import User from "./model/user.js";

connectDB();

const server = http.createServer(async (req, res) => {

    // Home Page
    if (req.url === "/" && req.method === "GET") {

        res.setHeader("Content-Type", "text/html");

        res.write(`
            <html>
                <head>
                    <title>User Form</title>
                </head>

                <body>
                    <h1>User Registration Form</h1>

                    <form action="/" method="POST">

                        <input
                            type="text"
                            name="username"
                            placeholder="Enter Username"
                            required
                        ><br><br>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            required
                        ><br><br>

                        <input
                            type="number"
                            name="age"
                            placeholder="Enter Age"
                            required
                        ><br><br>

                        <button type="submit">Submit</button>

                    </form>

                    <br>

                    <a href="/users">View Users</a>

                    <br>

                    <a href="/delete">Delete User</a>

                </body>

            </html>
        `);

        return res.end();
    }

    // Create User
    if (req.url === "/" && req.method === "POST") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const parsedBody = querystring.parse(body);

                const existing = await User.findOne({
                    email: parsedBody.email
                });

                if (existing) {

                    res.setHeader("Content-Type", "text/html");

                    res.write(`
                        <h2>Email already exists!</h2>
                        <a href="/">Go Back</a>
                    `);

                    return res.end();
                }

                await User.create(parsedBody);

                res.statusCode = 302;
                res.setHeader("Location", "/users");

                return res.end();

            } catch (error) {

                console.log(error);

                res.write("Something went wrong");

                res.end();

            }

        });

        return;
    }

    // Read Users
    if (req.url === "/users" && req.method === "GET") {

        try {

            const users = await User.find();

            res.setHeader("Content-Type", "text/html");

            res.write(`
                <html>

                <head>
                    <title>All Users</title>
                </head>

                <body>

                <h1>All Users</h1>

            `);

            users.forEach(user => {

                res.write(`
                    <p>
                        <strong>Name:</strong> ${user.username}
                        <br>

                        <strong>Email:</strong> ${user.email}
                        <br>

                        <strong>Age:</strong> ${user.age}
                        <br>

                        <a href="/edit?id=${user._id}">Edit</a>

                        |

                        <a href="/delete?id=${user._id}">Delete</a>

                    </p>

                    <hr>
                `);

            });

            res.write(`
                <br>

                <a href="/">Add New User</a>

                </body>

                </html>
            `);

            return res.end();

        } catch (error) {

            console.log(error);

            res.write("Error fetching users");

            res.end();

        }

    }

    // Delete User
if (req.url.startsWith("/delete") && req.method === "GET") {

    try {

        const id = req.url.split("=")[1];

        await User.findByIdAndDelete(id);

        // Redirect back to users page
        res.statusCode = 302;
        res.setHeader("Location", "/users");

        return res.end();

    } catch (error) {

        console.log(error);

        res.setHeader("Content-Type", "text/html");

        res.write(`
            <h2>Error deleting user</h2>
            <a href="/users">Back to Users</a>
        `);

        return res.end();
    }
}

    // Route Not Found
    res.statusCode = 404;

    res.setHeader("Content-Type", "text/html");

    res.write("<h1>404 - Page Not Found</h1>");

    res.end();

});

const PORT = 5000;

server.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});