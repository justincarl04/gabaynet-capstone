const { getSecret } = require('./ssm');

let secrets = null;

async function loadSecrets() {
  if (process.env.NODE_ENV !== 'production') {
    secrets = {
      DB_PASS: process.env.DB_PASS,
      JWT_SECRET: process.env.JWT_SECRET,
    };

    process.env.DB_PASS = secrets.DB_PASS;
    process.env.JWT_SECRET = secrets.JWT_SECRET;

    return secrets;
  }

  if (!secrets) {
    secrets = {
      DB_PASS: await getSecret(process.env.DB_PASS_PARAM),
      JWT_SECRET: await getSecret(process.env.JWT_SECRET_PARAM),
    };

    process.env.DB_PASS = secrets.DB_PASS;
    process.env.JWT_SECRET = secrets.JWT_SECRET;
  }

  return secrets;
}

function getSecrets() {
  if (!secrets) {
    throw new Error('Secrets not loaded yet.');
  }
  return secrets;
}

module.exports = {
  loadSecrets,
  getSecrets,
};