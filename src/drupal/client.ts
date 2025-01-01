import { bold, red } from "@std/fmt/colors";
import {
  Tool,
  Resource,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/types.ts";

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

function createDrupalProxy(url: string) {
  return {
    async tools(): Promise<Tool[]> {
      const data = await jrpc<"tools", Tool[]>(url, MCPMethods.TOOLS);
      return data.result.tools;
    },
    async resources(): Promise<Resource[]> {
      const data = await jrpc<"resources", Resource[]>(
        url,
        MCPMethods.RESOURCES
      );

      return data.result.resources;
    },
    async templates(): Promise<ResourceTemplate[]> {
      const data = await jrpc<"resourceTemplates", ResourceTemplate[]>(
        url,
        MCPMethods.TEMPLATES
      );
      return data.result.resourceTemplates;
    },
    async call(name: string, args: Record<string, unknown>) {
      const data = await jrpc<"_", unknown>(url, MCPMethods.CALL, {
        name,
        args,
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
  params?: Record<string, unknown>
): Promise<JRPCResponse<K, T>> {
  const request = new Request(url, {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method,
      params: params,
    }),
  });

  return fetch(request)
    .then((response) => response.json())
    .catch((error) => {
      console.error(`${bold(red("ERROR:"))} ${error}`);
    });
}

export { createDrupalProxy };
