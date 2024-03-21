export const getLogger = makeGetLogger("⚡Zap", {
  console,
});

function makeGetLogger(appName: string, deps: { console: Console }) {
  return function getLogger(
    serviceName: string = "",
    props?: { pretty?: boolean }
  ) {
    const pretty =
      props?.pretty !== undefined
        ? props?.pretty
        : process.env.NODE_ENV === "development";
    const prefix = serviceName
      ? `${appName} ▶ ${serviceName} ▶`
      : `${appName} ▶`;

    const infoLabel = style("INFO").bold().blue().toString();
    const debugLabel = style("DEBUG").bold().magenta().toString();
    const warnLabel = style("WARN").bold().yellow().toString();
    const errorLabel = style("ERROR").bold().red().toString();
    const prefixLabel = style(prefix).cyan().toString();

    let debugTimestamp: number;
    const childLogger = {
      info(message: string, data?: Record<string, any>) {
        const prettyData = getPrettyData(data, pretty);

        deps.console.info(
          pretty
            ? `${infoLabel} ${prefixLabel} ${message}${prettyData}`
            : getJSONLog({ level: "info", appName, serviceName, message, data })
        );
      },
      debug(message: string, data?: Record<string, any>) {
        const prettyData = getPrettyData(data, pretty);

        const currentTimestamp = new Date().getTime();
        const timeDiff = debugTimestamp
          ? ` [+${currentTimestamp - debugTimestamp}ms]`
          : " ";
        debugTimestamp = currentTimestamp;

        const DEBUG = process.env["DEBUG"];
        const isDebug =
          DEBUG === "*" ||
          DEBUG?.split(",").includes(serviceName) ||
          DEBUG?.split(",").includes(appName);

        if (isDebug) {
          deps.console.debug(
            pretty
              ? `${debugLabel} ${prefixLabel}${timeDiff} ${message}${prettyData}`
              : getJSONLog({
                  level: "debug",
                  appName,
                  serviceName,
                  message,
                  data,
                })
          );
        }
      },
      warn(message: string, data?: Record<string, any>) {
        const prettyData = getPrettyData(data, pretty);

        deps.console.warn(
          pretty
            ? `${warnLabel} ${prefixLabel} ${message}${prettyData}`
            : getJSONLog({ level: "warn", appName, serviceName, message, data })
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
        const prettyData = getPrettyData(dataWithError, pretty);

        deps.console.error(
          pretty
            ? `${errorLabel} ${prefixLabel} ${message}${prettyData}`
            : getJSONLog({
                level: "error",
                appName,
                serviceName,
                message,
                data: dataWithError,
              })
        );
      },
    };

    return childLogger;
  };
}

function getJSONLog(props: {
  level: string;
  appName: string;
  serviceName: string;
  message: string;
  data?: Record<string, any>;
}) {
  return JSON.stringify({
    timestamp: getTimestamp(),
    level: props.level,
    appName: props.appName,
    serviceName: props.serviceName,
    message: props.message,
    data: props.data,
  });
}

function getPrettyData(data?: Record<string, any>, pretty?: boolean) {
  if (!data) {
    return "";
  }
  return pretty ? ` \n${style(JSON.stringify(data, null, 2)).dim()}` : "";
}

function getTimestamp() {
  return new Date().toISOString();
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
