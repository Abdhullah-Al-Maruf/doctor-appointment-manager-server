require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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

// for token verify process we can get help from better-auth doc
//  now we will verify  the token so we need jwt keyset  it will get from the client link  url/api/auth/jwks  and we will verify the token by using jwt library jose(not work in common js)/jose-cjs and if the token is valid then we will call the next() function to move to the next middleware or route handler
const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

//  this function will be used as a middleware for jwt verification .
const verifyJWT =async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  //  we have 2 thing bearer and the token so we will split the authHeader by space and get the token
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  //  now verify using jose-cjs library
  try {
    const { payload } = await jwtVerify(token, JWKS);
    // console.log(payload);
     req.user = payload;
    next();
  } catch (error) {
    return res.status(403).send({ message: "Forbidden access" });
  }
};

async function run() {
  try {
    // await client.connect();
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

    // ()=> this is the middleware for jwt vefication next we will create a separate  function for jwt vefication and add it here as a middleware
    app.get("/doctors/:id", verifyJWT, async (req, res) => {
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
    app.post("/appointments", verifyJWT, async (req, res) => {
      const appointment = req.body;

      const result = await appointmentsCollection.insertOne(appointment);
      res.send(result);
    });

    // get api for all appointments data for my-booking page
    app.get("/appointments", verifyJWT, async (req, res) => {
      const appointments = appointmentsCollection.find({});
      const result = await appointments.toArray();
      res.send(result);
    });

    // patch api for update the appointment  card data

    app.patch("/appointments/:id", verifyJWT, async (req, res) => {
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

    // create delete api for delete the appointment card data
    app.delete("/appointments/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appointmentsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
