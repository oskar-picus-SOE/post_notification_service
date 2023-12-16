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

consumer.on('message', function (message) {
    const post = JSON.parse(message.value)
    console.log(post)
    // todo send notification with web socket
});