
import connectDB from "./adapter/db/conectDB";
import application from './framework/web/app'


const app=application


connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

