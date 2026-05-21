require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); 
const express = require('express');
const app = express();
const cors = require("cors"); 
const port = 5000; 


app.use(cors()); 
app.use(express.json());  // this will convert the client data to json


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_SECRET}@cluster0.gklgo91.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
await client.connect();
    const db = client.db("doctor-appointment-data");
    const doctorsCollection=db.collection("doctors")





    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


run().catch(console.dir);