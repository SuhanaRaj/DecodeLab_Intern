import http from "http";
import querystring from "querystring";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./model/user.js";

dotenv.config();

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

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            required
                        ><br><br>

                        <button type="submit">Submit</button>

                    </form>

                    <br>

                    <h2>Login</h2>

                    <form action="/login" method="POST">

                    <input type="email" name="email" placeholder="Enter Email" required><br><br>

                    <input type="password" name="password" placeholder="Enter Password" required><br><br>

                    <button type="submit">Login</button>

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

                const hashedPassword = await bcrypt.hash(parsedBody.password, 10);
                await User.create({
                    username: parsedBody.username,
                    email: parsedBody.email,
                    age: parsedBody.age,
                    password: hashedPassword
                });

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

    //login User
    if (req.url === "/login" && req.method === "POST") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async() => {

            try {

                const parsedBody = querystring.parse(body);

                const user = await User.findOne({
                    email : parsedBody.email
                });

                if(!user){
                    res.setHeader("Content-Type", "text/html");

                    res.write(`
                        <h2>User Not Found</h2>
                        <a href="/">Go Back</a>
                    `);

                    return res.end();
                }

                const isMatch = await bcrypt.compare(
                    parsedBody.password,
                    user.password
                );

                if(!isMatch){
                     res.setHeader("Content-Type", "text/html");

                    res.write(`
                        <h2>Invalid Password</h2>
                        <a href="/">Go Back</a>
                    `);

                    return res.end();
                }

                const token = jwt.sign(
                    {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    },

                    process.env.JWT_SECRET,
                    {
                        expiresIn: "1h"
                    }
                );

                // const decoded = jwt.verify(token, process.env.JWT_SECRET);

                res.setHeader("Content-Type", "text/html");

                res.write(`
                    <html>
                        <head>
                            <title>Welcome</title>
                        </head>

                        <body>

                            <h1>Welcome ${user.username}</h1>

                            <p> Login Successful </p>

                            <p><strong>Token:</strong></p>

                            <textarea rows="8" cols="80">${token}</textarea>

                            <a href="/users">View Users</a>

                        </body>
                    </html>
                `)

                return res.end();
            }catch(error){

                console.log(error);

                res.statusCode = 500;
                res.write("Login Error");

                return res.end();
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

            return res.end();

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

        // // Route Not Found
        // res.statusCode = 404;

        // res.setHeader("Content-Type", "text/html");

        // res.write("<h1>404 - Page Not Found</h1>");

    // Route Not Found
        res.statusCode = 404;

        res.setHeader("Content-Type", "text/html");

        res.write("<h1>404 - Page Not Found</h1>");

        return res.end();

});


const PORT = 5000;

server.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});