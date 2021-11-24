import Fastify from "fastify";

import { logger } from "@website-tools/common";
import { CheckWebsiteResult, queue } from "./website-check";

export * from "./website-check";

import { prisma } from "./db";

const serverOrigin = process.env.SERVER_ORIGIN || "http://localhost:3000";

const fastify = Fastify({
  logger,
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
fastify.register(require("fastify-cors"), { exposedHeaders: ["Location"] });

fastify.get<{ Params: { id: string } }>(
  "/reports/:id",
  async (request, reply) => {
    const { id } = request.params;

    try {
      const report = await prisma.report.findUnique({
        where: { id: Number(id) },
      });

      if (!report) {
        reply.statusCode = 404;

        reply.send();

        return;
      }

      reply.header("Content-Type", "application/json");

      reply.send(report.data);
    } catch (err) {
      logger.error(err);

      reply.statusCode = 500;

      reply.send();

      return;
    }
  }
);

fastify.get<{ Params: { id: string } }>(
  "/reports/job/:id",
  async (request, reply) => {
    const { id } = request.params;

    try {
      const job = await queue.getJob(id);

      if (!job) {
        reply.statusCode = 404;

        reply.send();

        return;
      }

      if (job.status === "created") {
        reply.header("Content-Type", "application/json");

        reply.send({ status: "processing" });

        return;
      } else if (job.status === "failed") {
        reply.statusCode = 500;
        reply.header("Content-Type", "application/json");

        reply.send({ status: "failed" });

        return;
      }

      const report = await prisma.report.findUnique({
        where: { url: job.data.url },
        include: { screenshots: true },
      });

      if (!report) {
        reply.statusCode = 404;

        reply.send();

        return;
      }
      const newLocation = new URL(`/reports/${report.id}`, serverOrigin);

      reply.header("Location", newLocation.href);
      reply.statusCode = 303;

      reply.send(() => {
        logger.info({ location: newLocation.href }, "Redirecting");
      });
    } catch (err) {
      logger.error(err);

      reply.statusCode = 500;
      reply.send();
    }
  }
);

fastify.post<{ Body: { url: string } }>("/reports", async (request, reply) => {
  const { url } = request.body;

  logger.info({ url }, "Performing website check");

  try {
    const report = await prisma.report.findUnique({
      where: { url },
      include: { screenshots: true },
    });

    if (report) {
      logger.info({ id: report.id, url }, "Found report in db");

      const newLocation = new URL(`/reports/${report.id}`, serverOrigin);

      reply.header("Location", newLocation.href);
      reply.statusCode = 303;

      reply.send(() => {
        logger.info({ location: newLocation.href }, "Redirecting");
      });
    } else {
      const job = await queue.createJob({ url }).save();

      job.on("succeeded", async (result: CheckWebsiteResult) => {
        logger.info({ id: job.id, url }, "Job succeeded");

        const { screenshots, ...data } = result;

        try {
          const report = await prisma.report.create({
            data: {
              url: String(url),
              data: JSON.stringify(data),
              screenshots: {
                create: Object.entries(screenshots).map(([key, value]) => ({
                  device: key,
                  filename: value,
                })),
              },
            },
          });

          logger.info({ id: report.id, url }, "Stored report in db");
        } catch (err) {
          logger.error({ url, err }, "Error storing report in db");

          reply.statusCode = 500;

          reply.send();

          return;
        }
      });

      const newLocation = new URL(`/reports/job/${job.id}`, serverOrigin);

      reply.header("Location", newLocation.href);
      reply.statusCode = 202;

      reply.send(() => {
        logger.info({ location: newLocation.href }, "Redirecting");
      });
    }
  } catch (err) {
    logger.error(err);

    reply.statusCode = 500;
    reply.header("Content-Type", "application/json");

    reply.send({ error: err.message });
  }
});

const start = async () => {
  const port = process.env.PORT || 3000;

  try {
    fastify.listen(port, "0.0.0.0");
  } catch (err) {
    logger.error(err);

    process.exit(1);
  }
};

start();
