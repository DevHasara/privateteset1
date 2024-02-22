const express = require('express');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = 5000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle the generateConfig request from the front-end
app.post('/generateConfig', async (req, res) => {
    try {
        // Authentication data
        const username = 'hasara';
        const password = 'hasara';
        
        // Dynamically import node-fetch
        const fetch = (await import('node-fetch')).default;

        // Authenticate user on the x-ui panel
        const authResponse = await fetch('http://165.22.245.179:2053/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (!authResponse.ok) {
            throw new Error('Failed to authenticate');
        }

        const authData = await authResponse.json();
        const token = authData.token;

        // Generate UUID and Email dynamically
        const uuid = generateUUID();
        const email = `Client-${uuid}`;

        // Calculate expiry time as 2 days from creation date
        const expiryDate = moment().add(2, 'days').valueOf();

        // Configure headers and body for adding a client
        const myHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cookie': 'session=MTcwODU3MTkwMnxEWDhFQVFMX2dBQUJFQUVRQUFCMV80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRUVBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFRdE1iMmRwYmxObFkzSmxkQUVNQUFBQUZ2LUNFd0VDQVFab1lYTmhjbUVCQm1oaGMyRnlZUUE9fJm7YISrltSewY0W_e2mYK7OqzySWiLjmCNJidzGf_z6'
        };

        const raw = JSON.stringify({
            "id": 2,
            "settings": `{"clients":[{"id":"${uuid}","alterId":0,"email":"${email}","limitIp":2,"totalGB":42949672960,"expiryTime":${expiryDate},"enable":true,"tgId":"","subId":""}]}` // Dynamically insert UUID, Email, and Expiry Time
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        // Generate V2Ray config by adding a client on the x-ui panel
        const generateResponse = await fetch("http://165.22.245.179:2053/panel/api/inbounds/addClient", requestOptions);
        const generateData = await generateResponse.json();

        console.log('Response from x-ui panel:', generateData); // Log the response data

        // Construct final V2Ray config URL with dynamic UUID and Email
        const v2rayConfigURL = `vless://${uuid}@165.22.245.179:443?type=ws&path=%2F&security=none#${email}`;
        res.json({ config: v2rayConfigURL });
    } catch (error) {
        console.error('Error:', error.message); // Log the error message
        res.status(500).json({ message: 'Failed to generate V2Ray config. Please try again later.' });
    }
});

// Function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Start the server listen on port 5000
app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${port}`);
});
