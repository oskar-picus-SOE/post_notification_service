const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const uuidv4 = require('uuid').v4;

// Spinning the http server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8004;
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});

// active connections
const clients = {};

function broadcastMessage(json) {
    console.log(`Broadcasting message ${json} to all ${Object.keys(clients).length} clients`)
    // We are sending the current data to all connected clients
    const data = JSON.stringify(json);
    for(let userId in clients) {
        let client = clients[userId];
        if(client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
}

function handleDisconnect(userId) {
    console.log(`${userId} disconnected.`);
    delete clients[userId];
}

// A new client connection request received
wsServer.on('connection', function(connection) {
    // Generate a unique code for every user
    const userId = uuidv4();
    console.log('Received a new connection');

    // Store the new connection and handle messages
    clients[userId] = connection;
    console.log(`${userId} connected.`);
    // User disconnected
    connection.on('close', () => handleDisconnect(userId));
    // send previous posts
    postsJson.forEach(postJson => broadcastMessage(postJson));
});

const kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.KafkaClient(),
    consumer = new Consumer(
        client,
        [
            {topic: 'postNotifications', partition: 0},
        ],
        {
            autoCommit: false
        }
    );

const postsJson = []

consumer.on('message', function (message) {
    console.log(`Consumed message from Kafka ${message.value}`)
    postsJson.push(message.value)
    broadcastMessage(message.value)
});