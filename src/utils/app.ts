import express from "express";
import testEmailRoute from "../routes/testEmailRoute";

const app = express();

app.use(express.json());
app.use("/api", testEmailRoute); // এখন route হবে: /api/test-email

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});