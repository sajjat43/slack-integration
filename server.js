const express = require('express');
const cors = require('cors');
const { WebClient } = require('@slack/web-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Slack Web Client
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Routes
app.get('/api/channels', async (req, res) => {
  try {
    const result = await slackClient.conversations.list({
      types: 'public_channel,private_channel',
      limit: 1000
    });
    res.json(result.channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

app.get('/api/channels/:channelId/messages', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { oldest, latest } = req.query;
    
    const result = await slackClient.conversations.history({
      channel: channelId,
      oldest: oldest,
      latest: latest,
      limit: 100
    });
    
    res.json(result.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/send-message', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await slackClient.chat.postMessage({
      channel: process.env.SLACK_USER_ID,
      text: text
    });
    res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 