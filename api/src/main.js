import express from 'express';

const app = express();
const port = 8080;

app.get('/', (req, res) => res.send(new Date().toDateString()));

app.listen(port, () => console.log(`API started on port ${port}`));