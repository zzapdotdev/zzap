import Bun from "bun";
import { parseArgs } from "util";
import { ZzapCommander } from "./domains/commander/ZzapCommander";
import { ZzapConfig } from "./domains/config/ZzapConfig";
import { enableDebugLogs, getLogger } from "./domains/logging/getLogger";

export const logger = getLogger();

await main();

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      port: {
        type: "string",
      },
      debug: {
        type: "boolean",
      },
      paths: {
        type: "string",
      },
      child: {
        type: "boolean",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.debug) {
    enableDebugLogs();
  }

  const command = positionals[2] as "watch" | "start" | "build" | "rebuild";
  const rootDir = positionals[3];

  const config = await ZzapConfig.get({
    rootDir: rootDir,
    isDev: command === "watch" || !!values.child,
  });

  logger.debug(
    `Running "zzap ${command}" for root directory "${config.rootDir}" (${process.env.NODE_ENV})`,
  );

  if (command === "build") {
    await ZzapCommander.build({
      config,
      debug: values.debug,
      paths: undefined,
    });
  }
  if (command === "rebuild") {
    await ZzapCommander.rebuild({
      config,
      debug: values.debug,
      paths: values.paths,
    });
  }

  if (command === "watch") {
    await ZzapCommander.watch({
      config,
      debug: values.debug,
      port: Number(values.port),
    });
  }

  if (command === "start") {
    await ZzapCommander.start({
      config,
      debug: values.debug,
      port: Number(values.port),
    });
  }
}
