import http from 'http';

const server = http.createServer((req, res) => {

    res.setHeader('Content-Type', 'application/json' )

    if(req.url === '/' && req.method === 'GET'){

        res.setHeader('Content-Type', 'text/html' )
        res.write("<html>Welcome to the server<br></html>");

        const suhana = [
            {
                id: 1,
                semester: 1,
                cgpa: 9
            },
            {
                id: 2,
                semester: 2,
                cgpa: 8.5
            },
            {
                id: 3,
                semester: 3,
                cgpa: 8.2
            },
            {
                id: 4,
                semester: 4,
                cgpa: 8
            }
        ]


    return res.end(JSON.stringify({
        data: suhana,
        message: "Data fetched successfully"
    }));
}

    else if(req.url === '/' && req.method === 'POST'){

        const body = [];
        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });

        req.on('end', () => {
            const fullBody = Buffer.concat(body).toString();
            console.log(fullBody);

        })
    return res.end(JSON.stringify({
        message: "Req sent successfully",
        data: body
    }));
}

});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});