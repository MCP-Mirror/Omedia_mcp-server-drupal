import { Server as MCPServer } from "@modelcontextprotocol/sdk/server/index.js";
import { flags } from "./cli/args.ts";
import { Formatter } from "./cli/format.ts";

const Server = new MCPServer(
  {
    name: "mcp-server-drupal",
    version: flags["build-app-version"]!,
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

Server.onerror = (error) => {
  console.error(Formatter.error(error));
};

Server.oninitialized = () => {
  console.error(Formatter.info("Initialization was successful"));
};

export { Server };
