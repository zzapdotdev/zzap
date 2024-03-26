export const { getLogger, enableDebug } = makeGetLogger("⚡zzap", {
  console,
});

function makeGetLogger(appName: string, deps: { console: Console }) {
  let includeDebugStatements = false;
  return {
    enableDebug() {
      includeDebugStatements = true;
    },
    getLogger(serviceName: string = "") {
      const prefix = serviceName
        ? `${appName} ▶ ${serviceName} ▶`
        : `${appName} ▶`;

      const infoLabel = style("INFO:").bold().blue().toString();
      const debugLabel = style("DEBUG").bold().magenta().toString();
      const warnLabel = style("WARN").bold().yellow().toString();
      const errorLabel = style("ERROR").bold().red().toString();
      const prefixLabel = style(prefix).cyan().toString();

      let debugTimestamp: number;
      const childLogger = {
        log(message: string, data?: Record<string, any>) {
          const prettyData = getPrettyData(data);

          deps.console.info(`${prefixLabel} ${message}${prettyData}`);
        },
        info(message: string, data?: Record<string, any>) {
          const prettyData = getPrettyData(data);

          deps.console.info(
            `${prefixLabel} ${infoLabel} ${message}${prettyData}`,
          );
        },
        debug(message: string, data?: Record<string, any>) {
          const prettyData = getPrettyData(data);

          const currentTimestamp = new Date().getTime();
          const timeDiff = debugTimestamp
            ? ` [+${currentTimestamp - debugTimestamp}ms]`
            : "";
          debugTimestamp = currentTimestamp;

          if (includeDebugStatements) {
            deps.console.debug(
              `${prefixLabel} ${debugLabel}${timeDiff} ${message}${prettyData}`,
            );
          }
        },
        warn(message: string, data?: Record<string, any>) {
          const prettyData = getPrettyData(data);

          deps.console.warn(
            `${prefixLabel} ${warnLabel} ${message}${prettyData}`,
          );
        },
        error(message: string, data?: Record<string, any> & { error?: any }) {
          const error = data?.error;
          const errorObject =
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                  cause: error.cause,
                }
              : error;

          const hasDataOrError = error || data;
          const dataWithError = hasDataOrError
            ? { ...data, error: errorObject }
            : undefined;
          const prettyData = getPrettyData(dataWithError);

          deps.console.error(
            `${prefixLabel} ${errorLabel} ${message}${prettyData}`,
          );
        },
      };

      return childLogger;
    },
  };
}

function getPrettyData(data?: Record<string, any>, pretty?: boolean) {
  if (!data) {
    return "";
  }
  return pretty ? ` \n${style(JSON.stringify(data, null, 2)).dim()}` : "";
}

function style(msg: string) {
  let styled = msg;
  return {
    blue(this) {
      styled = `\x1b[34m${styled}\x1b[0m`;
      return this;
    },
    red(this) {
      styled = `\x1b[31m${styled}\x1b[0m`;
      return this;
    },
    green(this) {
      styled = `\x1b[32m${styled}\x1b[0m`;
      return this;
    },
    yellow(this) {
      styled = `\x1b[33m${styled}\x1b[0m`;
      return this;
    },
    cyan(this) {
      styled = `\x1b[36m${styled}\x1b[0m`;
      return this;
    },
    magenta(this) {
      styled = `\x1b[35m${styled}\x1b[0m`;
      return this;
    },
    dim(this) {
      styled = `\x1b[2m${styled}\x1b[0m`;
      return this;
    },
    bold(this) {
      styled = `\x1b[1m${styled}\x1b[0m`;
      return this;
    },
    italic(this) {
      styled = `\x1b[3m${styled}\x1b[0m`;
      return this;
    },
    toString() {
      return styled;
    },
  };
}
