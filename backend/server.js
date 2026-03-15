require('dotenv').config();
const app = require('./src/app');
const { loadSecrets } = require('./src/config/secrets');

const PORT = process.env.PORT || 3000;

loadSecrets().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error('Failed to load secrets:', err);
    process.exit(1);
});