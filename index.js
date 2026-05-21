require("dotenv").config(); 
const express = require('express');
const app = express();
const cors = require("cors"); 
const port = 5000; 


app.use(cors()); 
app.use(express.json());  // this will convert the client data to json

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});