import { initDb } from "./db/index.js";
import { testRoutes } from "./routes/index.js";
import { env, Logger, Redis } from "./utils/index.js";
import fastify from "fastify";
import { middleware } from "./modules/middleware.js";

const API_VERSION = "v1";

export const main = async () => {
  const server = fastify({
    bodyLimit: 1_000_000,
    trustProxy: true,
  });

  await initDb();
  await Redis.initialize();

  server.register(middleware);
  server.register(import("@fastify/cors"), {
    maxAge: 600,
    origin: true,
    credentials: true,
  });

  // Routes
  server.register(testRoutes, {
    prefix: `/${API_VERSION}/test`,
  });

  server.listen({ host: env.HOST, port: env.PORT }, (error, address) => {
    if (error) {
      Logger.error("INIT", error.message);
      throw new Error(error.message);
    }

    Logger.info("INIT", `Server listening at ${address}`);
  });

  return server;
};

main();
