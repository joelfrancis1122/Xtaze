
import connectDB from "./infrastructure/db/conectDB";
import application from './presentation/web/app'


const app=application


connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

