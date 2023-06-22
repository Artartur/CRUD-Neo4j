const axios = require("axios");
const express = require("express");
const neo4j = require("neo4j-driver");
const app = express();
app.use(express.json());

const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "any_password")
);

app.get("/api/nodes", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (n) RETURN n");
    const nodes = result.records.map((record) => record.get("n").properties);
    res.json(nodes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting nodes from Neo4j");
  } finally {
    session.close();
  }
});

const user1 = {
  city: "Olinda",
  name: "Artur",
  label: "Student",
};

axios
  .post("http://localhost:3000/api/nodes", user1)
  .then((res) => console.log("Successfully registered user", res.data))
  .catch((err) =>
    console.error("An error occurred while inserting a user: ", err)
  );

app.post("/api/nodes", async (req, res) => {
  const { label, properties } = req.body;
  const session = driver.session();
  try {
    const result = await session.run(
      "CREATE (n:" + label + ") SET n = $properties RETURN n",
      { properties: req.body }
    );
    const createdNode = result.records[0].get("n").properties;
    res.json(createdNode);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating node in Neo4j");
  } finally {
    session.close();
  }
});

const putId = 0;

const editedUser = {
  city: "Recife",
  name: "Artur",
  label: "Student",
};

axios.put(`http://localhost:3000/api/nodes/${putId}`, editedUser)
  .then(() => {
    console.log('Data updated successfully');
  })
  .catch(error => {
    console.error('An error occurred while editing a user: ', error);
  });

app.put("/api/nodes/:id", async (req, res) => {
  const nodeId = req.params.id;
  const properties  = req.body;
  const session = driver.session();
  try {
    const result = await session.run(
      "MATCH (n) WHERE ID(n) = toInteger($nodeId) SET n = $properties RETURN n",
      { nodeId, properties }
    );
    const updatedNode = result.records[0].get("n").properties;
    res.json(updatedNode);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating node in Neo4j");
  } finally {
    session.close();
  }
});

const userId = 0;

axios.delete(`http://localhost:3000/api/nodes/${userId}`)
  .then(() => {
    console.log('User has been deleted successfully');
  })
  .catch(error => {
    console.error('An error occurred while deliting a user:', error);
  });

app.delete("/api/nodes/:id", async (req, res) => {
  const nodeId = req.params.id;
  const session = driver.session();
  try {
    await session.run("MATCH (n) WHERE ID(n) = toInteger($nodeId) DELETE n", {
      nodeId,
    });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting node from Neo4j");
  } finally {
    session.close();
  }
});


app.listen(3000, () => {
  console.log("Server on port: 3000");
});
