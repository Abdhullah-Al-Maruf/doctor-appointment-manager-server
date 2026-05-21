require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;

app.use(cors());
app.use(express.json()); // this will convert the client data to json

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_SECRET}@cluster0.gklgo91.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    const db = client.db("doctor-appointment-data");
    const doctorsCollection = db.collection("doctors");
    const appointmentsCollection = db.collection("appointments");

    //  get api for all doctors data
    app.get("/doctors", async (req, res) => {
      const doctors = doctorsCollection.find({});
      const result = await doctors.toArray();
      res.send(result);
    });

    // api for single doctor data
    app.get("/doctors/:id", async (req, res) => {
      // get the id from the client
      const id = req.params.id;
      // query for the id
      const query = {
        _id: new ObjectId(id),
      };

      // find the doctor by id
      const doctor = await doctorsCollection.findOne(query);
      res.send(doctor);
    });



    
    //  post api for add appointment data
    app.post("/appointments", async (req, res) => {
      const appointment = req.body;
      //  the console should be removed after testing, because it will show the data in the console which is not good for security
      console.log("data to be inserted ", appointment);
      const result = await appointmentsCollection.insertOne(appointment);
      res.send(result);
    });

    // get api for all appointments data for my-booking page 
    app.get("/appointments", async (req, res) => {
      const appointments= appointmentsCollection.find({});
      const result= await appointments.toArray();
        res.send(result)});

// patch api for update the appointment  card data

app.patch("/appointments/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      patientName: updatedData.patientName,
      phone: updatedData.phone,
      userEmail: updatedData.userEmail,
      appointmentDate: updatedData.appointmentDate,
      doctorName: updatedData.doctorName,
      gender: updatedData.gender,
      appointmentTime: updatedData.appointmentTime,
    },
  };
  const result = await appointmentsCollection.updateOne(query, updateDoc);
  res.send(result);
});



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

run().catch(console.dir);
