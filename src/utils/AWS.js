import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const config = new AWS.Config({
  accessKeyId: "AKIAUAYTNPY642FXYMMF",
  secretAccessKey: "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",
  region: "ap-southeast-1",
});

const CLOUND_FRONT_URL = "https://d915cnlfqwxuy.cloudfront.net/";

AWS.config = config;

const s3 = new AWS.S3({
  accessKeyId: "AKIAUAYTNPY642FXYMMF",
  secretAccessKey: "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",
});

export const uploadToS3 = async (files) => {
  console.log("File nhận vào :",files);
  let response = {};
  let filesResults = [];
  if (files) {
    for (var i = 0; i < files.length; i++) {
      if (files[i].size > 10000000000) {
        response = {
          status: false,
          message: "File size too large",
          files: filesResults,
        };
        return response;
      }
    }
    for (var i = 0; i < files.length; i++) {
      console.log(files[i]);

      const filename = files[i].name;
      var parts = filename.split(".");
      const fileType = parts[parts.length - 1];

      let filePath = `${uuidv4() + Date.now().toString()}.${fileType}`;
      const params = {
        Bucket: "app-chat-s3",
        Key: filePath,
        Body: files[i],
      };
      filesResults = [
        ...filesResults,
        {
          url: `${CLOUND_FRONT_URL}${filePath}`,
          fileName: filename,
          size: files[i].size,
        },
      ];
      await s3
        .upload(params, (error) => {
          if (error) {
            console.log("error = ", error);
            // return res.send("Internal Server Error");
            response = { status: false, message: "Fail to upload file" };
            return response;
          }
        })
        .promise();
    }
    console.log("file Result : ",filesResults);
    response = {
      status: true,
      message: "Upload successfully",
      files: filesResults,
    };
    return response;
  }
};

export const deleteFromS3 = async (files) => {
  let response = {};
  if (files) {
    for (var i = 0; i < files.length; i++) {
      // console.log(files[i]);
      var parts = files[i].split("/");
      const key = parts[parts.length - 1];
      console.log(key);
      const params = {
        Bucket: "app-chat-s3",
        Key: key,
      };
      await s3
        .deleteObject(params, (error) => {
          if (error) {
            console.log("error = ", error);
            // return res.send("Internal Server Error");
            response = { status: false, message: "Fail to remove file" };
            return response;
          }
        })
        .promise();
    }
    response = {
      status: true,
      message: "Remove successfully",
    };
    return response;
  }
};
