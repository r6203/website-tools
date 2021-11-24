import pino from "pino";

export const logger = pino();

/*
import winston, { format } from "winston";
import debugFormat from "winston-format-debug";

import { isProduction } from "./utils";

export const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.File({
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.json()
      ),
      filename: "server.log",
    }),
  ],
});

if (!isProduction) {
  logger.add(
    new winston.transports.Console({
      format: format.combine(
        format.colorize({ message: true }),
        debugFormat({ colorizeMessage: false })
      ),
    })
  );
}
*/
