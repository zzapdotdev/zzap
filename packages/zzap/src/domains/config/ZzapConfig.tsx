import path from "path";
import { getLogger } from "../logging/getLogger";
import type { ZzapPageProps } from "../page/ZzapPageBuilder";
import type { ZzapRouteType, defineRoute } from "../route/defineRoute";
import { WebPath } from "../web-path/WebPath";
import type { ZzapConfigType } from "./zzapConfigSchema";

const logger = getLogger();

export const ZzapConfig = {
  async get(props: { rootDir: string; isDev: boolean }) {
    const rootDir = props.rootDir || "./docs";

    const module = await loadConfigModule({
      rootDir: rootDir,
    });

    const config = { ...module.default } as ZzapConfigType;
    config.rootDir = rootDir;
    config.isDev = props.isDev;

    config.srcDir = "./" + path.join(rootDir, config.srcDir);
    config.outputDir = "./" + path.join(rootDir, config.outputDir);
    config.publicDir = "./" + path.join(rootDir, config.publicDir);
    config.routesDir = "./" + path.join(config.srcDir, "routes");
    config.layoutsDir = "./" + path.join(config.srcDir, "layouts");

    config.routes = await loadRoutes({
      routesDir: config.routesDir,
    });
    config.layouts = await loadLayouts({
      layoutsDir: config.layoutsDir,
    });

    return config;
  },
};

async function loadConfigModule(props: { rootDir: string }) {
  try {
    const location = `${props.rootDir}/zzap.config.tsx`;
    const module = await import(location);
    return module;
  } catch (error) {}
  try {
    const location = `${props.rootDir}/zzap.config.jsx`;
    const module = await import(location);
    return module;
  } catch (error) {}

  logger.terminate(
    `Could not find zzap.config.tsx or zzap.config.jsx in root directory (${props.rootDir}).`,
  );
}

async function loadRoutes(props: { routesDir: string }) {
  const routes: Array<ZzapRouteType> = [];

  const routeFilePatterns = ["*.ts", "*.tsx", "*.js", "*.jsx"];

  for (const pattern of routeFilePatterns) {
    const glob = new Bun.Glob(props.routesDir + "/" + pattern);
    const filesIterator = glob.scan({
      cwd: ".",
      onlyFiles: true,
    });

    for await (const filePath of filesIterator) {
      const module = await import(filePath);
      const fileName = filePath.split("/").pop() || "";
      const path = fileName.split(".").slice(0, -1).join("/");

      const route = module.default as ReturnType<typeof defineRoute>;

      if (route) {
        routes.push({
          ...route,
          path: WebPath.join(path!),
        });
      }
    }
  }

  return routes;
}

async function loadLayouts(props: { layoutsDir: string }) {
  const layouts: Record<
    string,
    {
      location: string;
      module: {
        default(props: ZzapPageProps): JSX.Element;
      };
    }
  > = {};

  const patterns = ["*.tsx", "*.jsx"];

  for (const pattern of patterns) {
    const glob = new Bun.Glob(props.layoutsDir + "/" + pattern);
    const filesIterator = glob.scan({
      cwd: ".",
      onlyFiles: true,
    });

    for await (const filePath of filesIterator) {
      const layoutModule = await import(filePath);
      const fileName = filePath.split("/").pop() || "";
      const layoutName = fileName.split(".").shift() || "";

      layouts[layoutName] = {
        location: filePath,
        module: layoutModule,
      };
    }
  }

  return layouts;
}
