import {
  Resource,
  ResourceTemplate,
  Tool,
} from "@modelcontextprotocol/sdk/types.ts";
import { Formatter } from "../cli/format.ts";
import { composeMCPEndpoint } from "./helpers.ts";

enum MCPMethods {
  TOOLS = "tools/list",
  RESOURCES = "resources/list",
  TEMPLATES = "resources/templates/list",
  CALL = "tools/call",
  READ = "resources/read",
}

type JRPCResponse<K extends string, T> = {
  jsonrpc: string;
  id: string;
  result: {
    [key in K]: T;
  };
};

export type DrupalProxy = ReturnType<typeof createDrupalProxy>;

function createDrupalProxy(base: string) {
  const url = composeMCPEndpoint(base);

  return {
    async tools(): Promise<Tool[]> {
      const data = await jrpc<"tools", Tool[]>(url, MCPMethods.TOOLS);
      return data.result.tools;
    },
    async resources(): Promise<Resource[]> {
      const data = await jrpc<"resources", Resource[]>(
        url,
        MCPMethods.RESOURCES,
      );

      return data.result.resources;
    },
    async templates(): Promise<ResourceTemplate[]> {
      const data = await jrpc<"resourceTemplates", ResourceTemplate[]>(
        url,
        MCPMethods.TEMPLATES,
      );
      return data.result.resourceTemplates;
    },
    async call(name: string, args?: Record<string, unknown>) {
      const data = await jrpc<"_", unknown>(url, MCPMethods.CALL, {
        name,
        arguments: args,
      });
      return data.result;
    },
    async read(params: Record<string, unknown>) {
      const data = await jrpc<"_", unknown>(url, MCPMethods.READ, params);
      return data.result;
    },
  };
}

function jrpc<K extends string, T>(
  url: string,
  method: MCPMethods,
  params?: Record<string, unknown>,
): Promise<JRPCResponse<K, T>> {
  const request = new Request(url, {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      method,
      params: params,
    }),
  });

  return fetch(request)
    .then((response) => response.json())
    .catch((error) => {
      console.error(Formatter.error(error));
    });
}

export { createDrupalProxy };
