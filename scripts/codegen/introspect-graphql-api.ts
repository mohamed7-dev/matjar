import fs from "node:fs";
import http from "node:http";
import { bootstrap, Logger, LogLevel, StdoutLoggerStrategy } from "@matjar/api";
import {
  ADMIN_API_PATH,
  STORE_API_PATH,
} from "@matjar/common/lib/shared-constants";
import type { INestApplication } from "@nestjs/common";
import { getIntrospectionQuery } from "graphql";
import { CODEGEN_LOG_CONTEXT } from "./generate-types";

let cachedAppPromise: undefined | Promise<INestApplication>;

function startServer() {
  if (cachedAppPromise) return cachedAppPromise;
  cachedAppPromise = bootstrap({
    userConfig: {
      api: {
        port: 3030,
        enableIntrospection: true,
        admin: {
          path: ADMIN_API_PATH,
        },
        store: {
          path: STORE_API_PATH,
        },
      },
      system: {
        loggerStrategy: new StdoutLoggerStrategy({
          logLevel: LogLevel.Verbose,
        }),
      },
      database: {
        type: "sqljs",
        synchronize: true,
        logging: false,
      },
    },
    adminDashboardRootPath: ".",
  });

  return cachedAppPromise;
}

function getRequestBody() {
  return JSON.stringify({
    query: getIntrospectionQuery(),
  });
}

export async function introspectGraphqlApi(
  apiPath: string,
  outputPath: string,
) {
  const requestBody = getRequestBody();
  const app = await startServer();

  return new Promise((resolve, reject) => {
    const clientRequest = http.request(
      {
        path: `/${apiPath}`,
        method: "post",
        host: "localhost",
        port: 3030,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      },
      (res) => handleResponse(res, resolve, reject, outputPath),
    );
    clientRequest.write(requestBody);
    clientRequest.end();
    clientRequest.on("error", (err: unknown) => {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "ECONNREFUSED"
      ) {
        Logger.error(`Connection to the server failed.`, CODEGEN_LOG_CONTEXT);
        resolve(false);
      }
      reject(err as Error);
    });
  }).finally(() => {
    Logger.info("Types generated successfully", CODEGEN_LOG_CONTEXT);
    app.close();
  });
}

function handleResponse(
  res: http.IncomingMessage,
  resolve: (value: unknown) => void,
  reject: () => void,
  outputPath: string,
) {
  const writeStream = fs.createWriteStream(outputPath);
  res.pipe(writeStream);
  res.on("end", () => resolve(true));
  res.on("error", reject);
}
