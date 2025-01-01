import { parseArgs } from "@std/cli";
import { HELP_MESSAGE, VERSION_FRAME } from "./templates.ts";

const flags = parseArgs(Deno.args, {
  boolean: ["help", "version"],
  string: ["drupal-url", "build-sdk-version", "build-app-version"],
  default: {
    ["build-sdk-version"]: "dev",
    ["build-app-version"]: "dev",
  },
});

if (flags.help) {
  console.info(HELP_MESSAGE);
  Deno.exit(0);
}

if (flags.version) {
  console.log(
    VERSION_FRAME(flags["build-app-version"]!, flags["build-sdk-version"]!)
  );
  Deno.exit(0);
}
