import { resolve } from "@std/path";

async function compile() {
  const entry = resolve(import.meta.dirname!, "..", "src", "mod.ts");
  const command = new Deno.Command(Deno.execPath(), {
    args: ["compile", "-A", "--output=build/mcp-server-drupal", entry],
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await command.output();

  if (code !== 0) {
    console.log("dev[ERROR]: ", code);
  } else {
    console.log("dev[INFO]: Compiled successfully");
  }
}

if (import.meta.main) {
  const watcher = Deno.watchFs(resolve(import.meta.dirname!, "..", "src/"));
  console.log("\ndev[INFO]: Watching for changes...");

  for await (const event of watcher) {
    if (["modify", "create", "remove"].includes(event.kind)) {
      console.log("dev[INFO]: Compiling");
      await compile();
    }
  }
}
