const express = require("express");
const AWS = require("aws-sdk");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const multer = require("multer");
const path = require("path");
const app = express();
const upload = multer({ dest: "uploads/" });
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { uploadFile } = require("./s3");
const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

let hostURL =
  PORT === 8080
    ? "localhost:8080"
    : "aws-celebrity-recognition-6k8zj.ondigitalocean.app";

const options = {
  swaggerDefinition: {
    info: {
      title: "database API",
      version: "1.0.0",
      description: "swagger description for api",
    },
    host: hostURL,
    basePath: "/",
  },
  apis: ["./index.js"],
};
const specs = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

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
app.post("/images", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const result = await uploadFile(file);
    await unlinkFile(file.path);
    try {
      AWS.config.setPromisesDependency();
      //AWS access details
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_BUCKET_REGION,
      });

      const s3 = new AWS.S3();
      const response = await s3
        .listObjectsV2({
          Bucket: process.env.AWS_BUCKET_NAME,
        })
        .promise();
      // console.log(response);
      // console.log("------------");
      // console.log(response.Contents[0].Key);
      // console.log("------------");
      //input parameters
      var params = {
        Image: {
          S3Object: {
            Bucket: response.Name,
            Name: response.Contents[0].Key,
          },
        },
      };

      //Call AWS Rekognition Class
      const rekognition = await new AWS.Rekognition();

      rekognition.recognizeCelebrities(params, function (err, data) {
        if (err) console.log(err, err.stack);
        // an error occurred
        else {
          // console.log("we got our celeb info back");
          console.log(data);
          res.send(data);
        } // successful response
      });
    } catch (e) {
      console.log("our error: " + e);
    }
  } catch (e) {
    console.log(e);
  }
});

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
app.get("/latestImage", async (req, res) => {
  try {
    AWS.config.setPromisesDependency();
    //AWS access details
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_BUCKET_REGION,
    });

    const s3 = new AWS.S3();
    const response = await s3
      .listObjectsV2({
        Bucket: process.env.AWS_BUCKET_NAME,
      })
      .promise();
    // console.log(response);
    // console.log("------------");
    // console.log(response.Contents[0].Key);
    // console.log("------------");
    //input parameters
    var params = {
      Image: {
        S3Object: {
          Bucket: response.Name,
          Name: response.Contents[0].Key,
        },
      },
    };

    //Call AWS Rekognition Class
    const rekognition = await new AWS.Rekognition();

    rekognition.recognizeCelebrities(params, function (err, data) {
      if (err) console.log(err, err.stack);
      // an error occurred
      else {
        // console.log("we got our celeb info back");
        console.log(data);
        res.send(data);
      } // successful response
    });
  } catch (e) {
    console.log("our error: " + e);
  }
});

app.listen(PORT, () => console.log("listening on port 8080"));
