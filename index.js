const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  let cloudfrontId = ""; // fill in here your default
  let path = "";
    var queryParams;
    if (!event.Records) {
        queryParams = new URLSearchParams(event.rawQueryString);
    }
    else if (event.Records && event.Records[0]) {
        queryParams = new URLSearchParams(event.Records[0].cf.request.querystring);
    }
    if (queryParams.get("id")) {
        cloudfrontId = queryParams.get("id");
    }
    if (queryParams.get("path")) {
        path = queryParams.get("path");
    }
    if (path == "") {
        return callback(null, "error, no path given");
    }
    if (cloudfrontId == "") {
        return callback(null, "error, no id given");
    }
      if (path.includes("http://") || path.includes("https://")) {
          path = path.replace("http://", "");
          path = path.replace("https://", "");
          path = path.substring(path.indexOf("/"));
      }
        let cloudFrontKey = path + "*";
        if (cloudFrontKey.substring(0,1)!="/") {
          cloudFrontKey = "/" + cloudFrontKey;
        }
        
        let cloudfront = new AWS.CloudFront();
        var params = {
          DistributionId : cloudfrontId,
          InvalidationBatch : {
            CallerReference : '' + new Date().getTime(),
            Paths : {
              Quantity : 1,
              Items : [ cloudFrontKey ]
            }
          }
        };
        
        // Invalidate
        cloudfront.createInvalidation(params, function (err, data) {
          if (err) {
            console.log('Error: ', err);
          }
          console.log('Success: ', data.InvalidationBatch);
        });
        
        return callback(null, "finished");

      
};

