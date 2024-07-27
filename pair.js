const axios = require('axios');
const { MongoClient } = require('mongodb');
const { MONGODB_URL, SESSION_NAME } = require('./config');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
};

router.use(cors());
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function getPaire() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let session = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: Browsers.macOS("Safari"),
             });

            if (!session.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await session.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            session.ev.on('creds.update', saveCreds);

            session.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(5000);
                    await delay(5000);

                    storeData(id, SESSION_NAME, MONGODB_URL, session);
                    
                    await session.sendMessage(session.user.id, { text: ` *Successfully Connected*\n\n *Total Scan :* ${userCount}` });
                    await session.sendMessage(session.user.id, { text: data.data });

                    await delay(100);
                    await session.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    getPaire();
                }
            });
        } catch (err) {
            console.log("service restated");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }

    return await getPaire();
});

module.exports = router;

const dbName = 'session';  // Replace with your database name
const collectionName = 'create';  // Replace with your collection name

async function storeData(id, sessionName, mongoUrl, session) {
    try {
        // Read the JSON data from the file
        const jsonData = await fs.readFile(`${__dirname}/temp/${id}/creds.json`, 'utf-8');
        const creds = JSON.parse(jsonData);

        // Create a new MongoClient
        const client = new MongoClient(mongoUrl);

        // Connect to the MongoDB server
        await client.connect();

        // Specify the database and collection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Prepare the document to be inserted
        const document = {
            SessionID: sessionName+id,
            creds: creds,
            createdAt: new Date()
        };

        // Insert the document into the collection
        const result = await collection.insertOne(document);
        console.log(`Document inserted with _id: ${result.insertedId}`);

        // Get the count of documents in the collection
        const count = await collection.countDocuments();
        await session.sendMessage(session.user.id, { text: ` *Successfully Connected*\n\n *Total Scan :* ${count}` });
        await session.sendMessage(session.user.id, { text: document.SessionID });
                               
        // Close the connection
        await client.close();
    } catch (error) {
        console.error('Error storing data in MongoDB:', error);
    }
}            
