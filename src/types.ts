import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { makeApi } from "@zodios/core";
import { z } from "zod";

declare module "bun" {
	interface Env {
		DRUPAL_BASE_URL: string;
	}
}

export const ApiDefinition = makeApi([
	{
		method: "get",
		path: "/mcp/init",
		alias: "getInitializationInfo",
		description: "Get Initial Information when MCP server initializes",
		response: z.object({
			tools: ToolSchema.array(),
		}),
		errors: [
			{
				status: "default",
				schema: z.object({
					message: z.string(),
				}),
			},
		],
	},
	{
		method: "post",
		path: "/mcp/tools/execute/:toolId",
		alias: "executeTool",
		description: "Execute a tool",
		parameters: [
			{
				name: "toolId",
				type: "Path",
				schema: z.string(),
			},
			{
				name: "arguments",
				type: "Body",
				schema: z.any(),
			},
		],
		response: z.object({
			result: z.any(),
		}),
		errors: [
			{
				status: "default",
				schema: z.object({
					message: z.string(),
				}),
			},
		],
	},
]);
