import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  let results;

  try {
    results = await connectionPool.query("select * from assignments");
    return res.status(200).json({ data: results.rows });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      "select * from assignments where assignment_id = $1",
      [assignmentId]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  const newAssignment = { ...req.body, updated_at: new Date() };
  let result;
  try {
    result = await connectionPool.query(
      "update assignments set title = $2, content = $3, category= $4 where assignment_id = $1",
      [
        assignmentId,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }

    return res.status(200).json({ message: "Updated assignment sucessfully" });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", (req, res) => {
  const assignmentId = req.params.assignmentId;
  let result;
  try {
    result = connectionPool.query(
      "delete * from assignments where assignment_id = $1",
      [assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }

    return res.status(200).json({ message: "Deleted assignment sucessfully" });
  } catch (e) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
