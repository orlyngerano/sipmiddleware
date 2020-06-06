const DrachtioSrf = require("drachtio-srf");
const AWS = require("aws-sdk");
const config = require("./config.json");

//configure dynamodb access
AWS.config.update(config.aws.dynamoDB.config);

const dynamoDB = new AWS.DynamoDB(config.aws.dynamoDB.instance);
const drachtioSrf = new DrachtioSrf();

//connect to drachtio server
drachtioSrf.connect(config.dractio.srf.connect);

drachtioSrf.on("connect", (err, hostport) => {
  console.log(`connected to a drachtio server listening on: ${hostport}`);
});

drachtioSrf.options(async (req, res) => {
  const customResponeHeaders = ["X-Freelancer-Project"];

  const { Item } = await dynamoDB
    .getItem({
      TableName: "useragents",
      Key: {
        ipaddress: { S: req.source_address },
      },
    })
    .promise();

  res.send(200, "Ok", {
    headers: customResponeHeaders.reduce(
      (headers, header) => ({
        ...headers,
        [header]: Item ? AWS.DynamoDB.Converter.unmarshall(Item).option : "", //in future can expand values to be inserted for each type custom header
      }),
      {}
    ),
  });
});
