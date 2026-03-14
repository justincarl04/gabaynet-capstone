const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

const ssm = new SSMClient({
  region: process.env.AWS_REGION,
});

async function getSecret(name) {
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });

  const response = await ssm.send(command);
  return response.Parameter?.Value;
}

module.exports = {
  getSecret,
};