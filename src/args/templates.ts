import { bold, yellow, cyan } from "@std/fmt/colors";

const HELP_MESSAGE = `
${bold("Usage:")} ${yellow("mcp-server-drupal [OPTIONS]")}

${bold("Options:")}
  ${cyan("--drupal-url")}          The URL of the Drupal site
  ${cyan("--version")}             The version of the server

${bold(yellow("Drupal Module:"))}  https://www.drupal.org/project/mcp
${bold(yellow("Docs:"))}           https://mcp-77a54f.pages.drupalcode.org
`;

const VERSION_FRAME = (core: string, sdk: string) => `
MCP Server: ${yellow(core)}
MCP SDK:    ${yellow(sdk)}
`;

export { HELP_MESSAGE, VERSION_FRAME };
