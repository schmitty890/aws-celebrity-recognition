const express = require("express");
const AWS = require("aws-sdk");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const multer = require("multer");
const path = require("path");
const app = express();
const upload = multer({ dest: "uploads/" });

const { uploadFile } = require("./s3");
const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

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
