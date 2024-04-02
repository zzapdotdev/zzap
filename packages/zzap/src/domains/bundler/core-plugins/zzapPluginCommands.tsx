import { definePlugin } from "../../plugin/definePlugin";

export const zzapPluginCommands = definePlugin({
  plugin() {
    return {
      name: "core-commands",
      async onBuild(ctx) {
        const commandPromises = ctx.config.commands.map(
          async (commandProps) => {
            ctx.logger.log(`  ${commandProps.command}`);
            await ctx.$`${{ raw: commandProps.command }}`;
          },
        );
        await Promise.all(commandPromises);
      },
    };
  },
});
