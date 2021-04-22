const {
  getLatestImage,
  uploadFileFromUser,
} = require("../controllers/awsController");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const multer = require("multer");
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
    .route("/latestImage")
    /**
     * @swagger
     * /latestImage:
     *    get:
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
    .route("/images")
    /**
     * @swagger
     * /images:
     *    post:
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