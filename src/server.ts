import "dotenv/config";

import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port || 5000;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`GearUp  is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

main();
