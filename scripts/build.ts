import { resolve } from "@std/path";
import { z } from "zod";

const SDK_KEY = "@modelcontextprotocol/sdk";

const ConfigSchema = z.object({
  version: z.string(),
  imports: z
    .object({
      [SDK_KEY]: z.string(),
    })
    .transform((value) => {
      const full = value[SDK_KEY];
      const sdkVersionMatch = full.match(/\d+\.\d+\.\d+/);
      const sdkVersion = sdkVersionMatch ? sdkVersionMatch[0] : "unknown";

      return sdkVersion;
    }),
});

if (import.meta.main) {
  try {
    const path = resolve(import.meta.dirname!, "..", "deno.jsonc");
    const entry = resolve(import.meta.dirname!, "..", "src", "mod.ts");
    const config = JSON.parse(Deno.readTextFileSync(path));
    const parsed = ConfigSchema.safeParse(config);

    if (!parsed.success) {
      console.error(`ERROR: ${parsed.error.errors}`);
      Deno.exit(5);
    }

    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "compile",
        "--allow-read",
        "--allow-net",
        "--allow-env",
        ...Deno.args,
        entry,
        `--build-sdk-version=${parsed.data.imports}`,
        `--build-app-version=${parsed.data.version}`,
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    await command.output();
    Deno.exit(0);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      Deno.exit(5);
    }

    console.error("ERROR: ", error);
  }
}
