require("dotenv").config();
import AWS from "aws-sdk";
import { uploadFile } from "../helpers/s3helpers";
import multer from "multer";
import util from "util";
import fs from "fs";

const unlinkFile = util.promisify(fs.unlink);

export const getLatestImage = async (req, res) => {
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
    const newArr = response.Contents.sort(
      (a, b) => b.LastModified - a.LastModified
    );
    //input parameters
    var params = {
      Image: {
        S3Object: {
          Bucket: response.Name,
          Name: newArr[0].Key,
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
        res.json(data);
      } // successful response
    });
  } catch (e) {
    console.log("our error: " + e);
  }
};

export const uploadFileFromUser = async (req, res) => {
  try {
    const file = req.file;
    if (req.file.mimetype == "image/jpeg" && req.file.size >= 400) {
      // file type has to be jpeg and file size has to be greater than 400 bytes (100 pixels)
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

        // sorting returned objects by time uploaded as they are not always in the correct order
        const newArr = response.Contents.sort(
          (a, b) => b.LastModified - a.LastModified
        );
        // console.log("----SORTED ARRAY START-----");
        // console.log(newArr);
        // console.log("-----SORTED ARRAY END----");
        // console.log("------------");
        // console.log(newArr[0].Key);
        // console.log(response.Contents[0].Key);
        // console.log("------------");
        //input parameters
        var params = {
          Image: {
            S3Object: {
              Bucket: response.Name,
              Name: newArr[0].Key,
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
            res.json(data);
          } // successful response
        });
      } catch (e) {
        console.log("our error: " + e);
      }
    } else {
      res.json({
        status: 400,
        error: "not an image/jpeg or file size is not larger than 100 pixels",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
