import express from 'express';
import dotenv from 'dotenv';
import measureRoutes from './routes/measureRoutes';

dotenv.config({ path: 'apiKey.env' });

const app = express();
app.use(express.json());

app.use('/api/measures', measureRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`O server vai rodar na porta: ${PORT}`);
});
