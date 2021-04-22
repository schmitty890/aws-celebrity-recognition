import {
  getLatestImage,
  uploadFileFromUser,
} from "../controllers/awsController";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
// determine port server is running on
const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
// determine port for swagger docs
let hostURL =
  PORT === 8080
    ? "localhost:8080"
    : "aws-celebrity-recognition-6k8zj.ondigitalocean.app";

// define swagger options
const options = {
  swaggerDefinition: {
    info: {
      title: "ITIS 6177 celebrity rekognition",
      version: "1.0.0",
      description: "endpoints for aws celebrity rekognition images",
    },
    host: hostURL,
    basePath: "/",
  },
  apis: ["./routes/awsRoutes.js"],
};
const specs = swaggerJsdoc(options);

// define routes
const routes = (app) => {
  // swagger docs route
  app.get("/docs", swaggerUi.setup(specs));

  // api route get last uploaded image
  app
    .route("/api/v1/latestImageUploaded")
    /**
     * @swagger
     * /api/v1/latestImageUploaded:
     *    get:
     *      tags:
     *          - aws endpoints
     *      description: Return latest image
     *      consumes:
     *          - application/json
     *      responses:
     *          200:
     *              description: Returns the latest object in image array
     */
    .get(getLatestImage);

  // api route upload image
  app
    .route("/api/v1/upload")
    /**
     * @swagger
     * /api/v1/upload:
     *    post:
     *      tags:
     *          - aws endpoints
     *      description: Add one image
     *      consumes:
     *          - multipart/form-data
     *      produces:
     *          - application/json
     *      parameters:
     *          - in: formData
     *            name: image
     *            description: An image
     *            type: file
     *            required: true
     *      responses:
     *          200:
     *              description: Add an image
     *          400:
     *              description: Error from parameters
     *          500:
     *              description: Server Error
     */
    .post(upload.single("image"), uploadFileFromUser);
};

export default routes;
