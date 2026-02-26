import 'dotenv/config';

import app from './app.js';

console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Database URL Present: ${!!process.env.DATABASE_URL}`);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
