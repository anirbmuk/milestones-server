require('./database/database');
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`milestones-server started running on port ${PORT}`));
