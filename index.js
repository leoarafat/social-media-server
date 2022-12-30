const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
// const JWT = require("jsonwebtoken");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
// console.log(uri)

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  const addPostCollection = client.db("socialMedia").collection("addPost");
  const userCollection = client.db("socialMedia").collection("users");
  const commentCollection = client.db("socialMedia").collection("comment");

  app.post("/addPost", async (req, res) => {
    const service = req.body;
    const result = await addPostCollection.insertOne(service);
    //   console.log(result);
    res.send(result);
  });
  app.get("/post", async (req, res) => {
   

    const query = {};
    const cursor = addPostCollection.find(query).sort({ time: -1 });
    const result = await cursor.toArray();
    res.send(result);
  });

  app.get("/topPost", async (req, res) => {
    const query = {};
    const cursor = addPostCollection.find(query).sort({ like: -1 });
    const result = await cursor.limit(3).toArray();
    res.send(result);
  });

  app.get("/allPost/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await addPostCollection.findOne(query);
    res.send(result);
  });
  app.post("/users", async (req, res) => {
    const body = req.body;
    const result = await userCollection.insertOne(body);
    res.send(result);
  });
  app.get("/users", async (req, res) => {
    let query = {};
    if (req.query.email) {
      query = {
        email: req.query.email,
      };
    }
    const cursor = userCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  });
  app.get("/users/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await userCollection.findOne(query);
    res.send(result);
  });

  app.put("/users/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const user = req.body;
    const option = { upsert: true };
    const updatedUser = {
      $set: {
        name: user.name,
        email: user.email,
        varsity: user.varsity,
      },
    };
    const result = await userCollection.updateOne(filter, updatedUser, option);
    res.send(result);
  });

  app.post("/comments", async (req, res) => {
    const user = req.body;
    const result = await commentCollection.insertOne(user);
    console.log(result);
    res.send(result);
  });

  app.put("/like/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $inc: {
        like: 1,
      },
    };
    const result = await addPostCollection.updateOne(
      filter,
      updateDoc,
      options
    );
    res.send(result);
  });

  app.get("/comment", async (req, res) => {
    let query = {};
    if (req.query.postId) {
      query = {
        postId: req.query.postId,
      };
    }
    const cursor = commentCollection.find(query);
    const result = await cursor.sort({ _id: -1 }).toArray();

    res.send(result);
  });
}
run().catch((error) => {
  console.log(error);
});

app.get("/", async (req, res) => {
  res.send("Social media server is running");
});

app.listen(port, () => console.log(`Social media running on ${port}`));
