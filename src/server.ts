import app from "./app";
import config from "./config";
import { initDb } from "./db";

const main = () => {
  initDb();

  app.listen(config.port, () => {
    console.log(`Server is running on port: ${config.port}`);
  });
};

main();
