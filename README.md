## 1st step

Add your `mongoDb` url in `config.js`

## 2th step

Host this code in any server `eg : render`


## 3ed step

Connect your device with `pair or qr`

## 4th connect to bot

### You can use this function for connecting with your bot MakeId Function

The `MakeId` function is used to restore `creds.json` file 

### Function 

```javascript
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function MakeId(sessionId, folderPath, mongoDb) {
    try {
        // Create folder if it doesn't exist
        await fs.mkdir(folderPath, { recursive: true });

        // Send request to restore session
        const response = await axios.post('https://api.lokiser.xyz/mongoose/session/restore', {
            id: sessionId,
            mongoUrl: mongoDb
        });

        // Extract data from response
        const jsonData = response.data.data;

        // Write data to creds.json
        const filePath = path.join(folderPath, "creds.json");
        await fs.writeFile(filePath, jsonData);

        console.log("creds.json created successfully.");
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

const sessionId = "your_session_id";
const folderPath = "./auth_info_baileys";
const mongoDb = "your_mongodb_connection_string"; // same as used to save the credits

MakeId(sessionId, folderPath, mongoDb)
    .then(() => {
        console.log("MakeId function executed successfully.");
    })
    .catch((error) => {
        console.error("Error occurred while executing MakeId function:", error.message);
    });
```

## How to delete session after storing it in your database 

<details close>
<summary>delete session</summary>
    

```javascript
const axios = require('axios');

// Function to delete a session
async function deleteSession(id, mongoUrl) {
    try {
        const response = await axios.post(`https://api.lokiser.xyz/mongoose/session/delete`, { id, mongoUrl });
        return response.data;
    } catch (error) {
        console.error('Error deleting session:', error.response.data);
        throw error.response.data;
    }
}

// Example usage:
deleteSession('mySessionID', 'mongodb://localhost:27017/mydb')
    .then(console.log)
    .catch(console.error);

```

</details>

## How to clear mongoDb

<details close>
<summary>clear MongoDb</summary>
    

```javascript
const axios = require('axios');

// Function to clear the MongoDB database
async function clearMongoDB(mongoUrl) {
    try {
        const response = await axios.post(`https://api.lokiser.xyz/mongoose/clear`, { mongoUrl });
        return response.data;
    } catch (error) {
        console.error('Error clearing MongoDB database:', error.response.data);
        throw error.response.data;
    }
}

// Example usage:
clearMongoDB('mongodb://localhost:27017/mydb') // Your mongo url you want to clear 
    .then(console.log)
    .catch(console.error);
