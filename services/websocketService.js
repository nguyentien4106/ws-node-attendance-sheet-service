module.exports.handleMessage = (ws, message) => {
    console.log('Received message:', message);
  
    // You can implement logic based on the message content
    const data = JSON.parse(message);
  
    if (data.type === 'greeting') {
      ws.send(JSON.stringify({ response: 'Hello, client!' }));
    }
  };