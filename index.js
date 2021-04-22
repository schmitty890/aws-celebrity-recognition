import express from "express";
import awsRoutes from "./routes/awsRoutes";

const app = express();
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.use("/docs", swaggerUi.serve);

awsRoutes(app);

app.listen(PORT, () => console.log("listening on port 8080"));
