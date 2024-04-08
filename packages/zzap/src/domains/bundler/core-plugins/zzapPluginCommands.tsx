import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginCommands = definePlugin({
  plugin() {
    return {
      name: "core-commands",
      async onBuild(ctx) {
        const commandPromises = ctx.config.commands.map(
          async (commandProps) => {
            ctx.logger.log(`  ${commandProps.command}`);

            try {
              if (commandProps.quiet) {
                await ctx.$`${{ raw: commandProps.command }}`.quiet();
              } else {
                await ctx.$`${{ raw: commandProps.command }}`;
              }
            } catch (error) {
              ctx.logger.error("running command", { error: error });
            }
          },
        );
        await Promise.all(commandPromises);
      },
    };
  },
});
