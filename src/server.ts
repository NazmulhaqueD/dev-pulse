import app from "./app";
import { initDb } from "./db";

const main = () => {
  initDb();

  app.listen(5000, () => {
    console.log(`Server is running on port: 5000`);
  });
};

main();
