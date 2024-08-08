require('dotenv').config(); // Ensure this is at the top to load environment variables
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(express.json());
app.use(cors());

const port = 3010;

// Elasticsearch configuration
const elasticConfig = {
  baseUrl: 'https://localhost:9200',
  username: 'elastic',
  password: '3zy-1uFcrdMILzTOGWbz',
  index: 'posts',
  type: '_doc'
};

// Axios instance to bypass SSL certificate validation, only use in development
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Function to fetch OpenAI response, similar to fetchOpenAIResponse in api.js
async function fetchOpenAIResponse(query) {
    const prompt = `Generate a small appreciate sentence based on the query: ${query}`;
    const openaiApiKey = process.env.OPENAI_API_KEY || '';

    try {
      const response = await axios.post(
          'https://api.openai.com/v1/completions', // Corrected endpoint for Completions
          {
              model: "gpt-3.5-turbo-instruct", // Adjust the model as needed
              prompt: prompt,
              max_tokens: 100,
              temperature: 0.7, // Optional: adjust as needed for creativity
              top_p: 1.0,
              frequency_penalty: 0.0,
              presence_penalty: 0.0,
          },
          {
              headers: {
                  'Authorization': `Bearer ${openaiApiKey}`,
                  'Content-Type': 'application/json'
              }
          }
      );
      // Ensure we correctly handle and return the generated text
      return response.data.choices && response.data.choices.length > 0 
               ? response.data.choices[0].text.trim() 
               : "No suggestions could be found.";
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        throw new Error('Failed to fetch response from OpenAI');
    }
}

// Endpoint to create a new post
app.post('/api/posts', async (req, res) => {
  const post = req.body;
  try {
    const esResponse = await axiosInstance.post(`${elasticConfig.baseUrl}/${elasticConfig.index}/${elasticConfig.type}/`, post, {
      auth: { username: elasticConfig.username, password: elasticConfig.password },
    });

    // Query subscriptions index for users subscribed to the category
    const subscriptionsQuery = await axiosInstance.post(`${elasticConfig.baseUrl}/subscriptions/_search`, {
      query: {
        match: { topic: post.category }
      }
    }, {
      auth: { username: elasticConfig.username, password: elasticConfig.password },
      headers: { 'Content-Type': 'application/json' }
    });

    const subscribers = subscriptionsQuery.data.hits.hits.map(hit => hit._source.username);

    // Create a notification for each subscriber
    subscribers.forEach(async (username) => {
      const notification = {
        username,
        message: `New post in category '${post.category}': ${post.title}`,
        postId: esResponse.data._id, // Assuming this returns the ID of the newly created post
        read: false,
        createdAt: new Date().toISOString()
      };
      await axiosInstance.post(`${elasticConfig.baseUrl}/notifications/_doc`, notification, {
        auth: { username: elasticConfig.username, password: elasticConfig.password },
        headers: { 'Content-Type': 'application/json' }
      });
    });

    res.json({ message: 'Post created successfully', data: esResponse.data });
  } catch (error) {
    console.error('Failed to create post or notify users:', error);
    res.status(500).json({ message: 'Failed to create post or notify users', error: error.toString() });
  }
});



// Endpoint to add a comment to a post
app.post('/api/posts/:postId/comment', async (req, res) => {
  const postId = req.params.postId;
  const { comment } = req.body;
  try {
    const esResponse = await axiosInstance({
      method: 'POST',
      url: `${elasticConfig.baseUrl}/${elasticConfig.index}/_update/${postId}`,
      auth: {
        username: elasticConfig.username,
        password: elasticConfig.password
      },
      data: {
        script: {
          source: 'ctx._source.comments = ctx._source.comments != null ? ctx._source.comments : []; ctx._source.comments.add(params.comment);',
          params: { comment }
        }
      }
    });
    res.status(201).json({ message: 'Comment added successfully', data: esResponse.data });
  } catch (error) {
    console.error('Failed to add comment:', error.message);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

// Endpoint to fetch all posts
app.get('/api/posts', async (req, res) => {
  try {
    const esResponse = await axiosInstance({
      method: 'GET',
      url: `${elasticConfig.baseUrl}/${elasticConfig.index}/_search`,
      auth: {
        username: elasticConfig.username,
        password: elasticConfig.password
      },
      params: { size: 50 }
    });
    const posts = esResponse.data.hits.hits.map(hit => ({
      ...hit._source,
      id: hit._id
    }));
    res.json(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error.message);
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
});

// Endpoint to generate suggestions using OpenAI
app.post('/api/generate-suggestion', async (req, res) => {
  const { category } = req.body;
  
  try {
    const suggestion = await fetchOpenAIResponse(category);
    res.json({ suggestion });
  } catch (error) {
    console.error('Failed to generate suggestion:', error);
    res.status(500).json({ message: 'Failed to generate suggestion', error: error.message });
  }
});

app.post('/api/subscribe', async (req, res) => {
  const { username, topic } = req.body;
  try {
    await axiosInstance.post(`${elasticConfig.baseUrl}/subscriptions/_doc`, { username, topic }, {
      auth: { username: elasticConfig.username, password: elasticConfig.password },
      headers: { 'Content-Type': 'application/json' }
    });
    res.json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ message: 'Error subscribing', error: error.toString() });
  }
});

app.post('/api/unsubscribe', async (req, res) => {
  const { username, topic } = req.body;

  try {
    const response = await axiosInstance.post(
      `${elasticConfig.baseUrl}/subscriptions/_delete_by_query`, // Use the _delete_by_query endpoint
      {
        query: {
          bool: {
            must: [
              { match: { username: username } },
              { match: { topic: topic } }
            ]
          }
        }
      },
      {
        auth: {
          username: elasticConfig.username,
          password: elasticConfig.password
        },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data && response.data.deleted > 0) {
      res.json({ message: 'Unsubscription successful' });
    } else {
      res.status(404).json({ message: 'Subscription not found or already removed' });
    }
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ message: 'Error processing unsubscription', error: error.toString() });
  }
});

app.post('/api/notifications', async (req, res) => {
  const { username } = req.body;
  try {
    const response = await axiosInstance.post(`${elasticConfig.baseUrl}/notifications/_search`, {
      query: {
        bool: {
          must: [
            { match: { username } },
            { match: { read: false } } // Optional: Fetch only unread notifications
          ]
        }
      }
    }, {
      auth: { username: elasticConfig.username, password: elasticConfig.password },
      headers: { 'Content-Type': 'application/json' }
    });

    const notifications = response.data.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    res.json({ notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.toString() });
  }
});


app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
