import express from "express";
import awsRoutes from "./routes/awsRoutes";
import swaggerUi from "swagger-ui-express";

const app = express();
const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.use("/docs", swaggerUi.serve);

awsRoutes(app);

app.listen(PORT, () => console.log("listening on port 8080"));
