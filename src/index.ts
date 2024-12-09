#!/usr/bin/env node

/**
 * A simple Drupal MCP server to communicate drupal instance
 */

import { parseArgs } from "node:util";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	type CallToolResult,
	ListToolsRequestSchema,
	type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Zodios, type ZodiosInstance, isErrorFromAlias } from "@zodios/core";
import { ApiDefinition } from "./types.js";

const { values } = parseArgs({
	args: Bun.argv,
	options: {
		drupalBaseUrl: {
			type: "string",
			short: "d",
		},
	},
	strict: true,
	allowPositionals: true,
});

const DRUPAL_BASE_URL = values.drupalBaseUrl || process.env.DRUPAL_BASE_URL;

if (!DRUPAL_BASE_URL) {
	console.error(`
Error: DRUPAL_BASE_URL is required!

Please pass the base URL of your Drupal site as a command line argument:
Command line argument: --drupal-base-url=https://your-drupal-site.com (or -d)
`);
	process.exit(1);
}

class DrupalMcpServer {
	private readonly server: Server;
	private readonly api: ZodiosInstance<typeof ApiDefinition>;
	private _tools: Array<Tool> = [];

	constructor() {
		this.server = new Server(
			{
				name: "mcp-server-drupal",
				version: "0.0.1",
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.api = new Zodios(DRUPAL_BASE_URL as string, ApiDefinition);
	}

	private setupToolHandlers(): void {
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: this._tools,
		}));

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			if (
				this._tools.length === 0 ||
				!this._tools.find((t) => t.name === request.params.name)
			) {
				return {
					content: {
						mimeType: "text/plain",
						text: `Tool "${request.params.name}" not found`,
					},
					isError: true,
				};
			}

			try {
				const response = await this.api.executeTool(request.params.arguments, {
					params: {
						toolId: request.params.name,
					},
				});

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(response, null, 2),
						},
					],
				} satisfies CallToolResult;
			} catch (error) {
				if (isErrorFromAlias(ApiDefinition, "executeTool", error)) {
					return {
						content: {
							mimeType: "text/plain",
							text: `Drupal API error: ${error.message}`,
						},
						isError: true,
					};
				}

				throw error;
			}
		});
	}

	private setupErrorHandling(): void {
		this.server.onerror = (error) => {
			console.error("[MCP Error]", error);
		};

		process.on("SIGINT", async () => {
			await this.server.close();

			process.exit(0);
		});
	}

	async init() {
		try {
			const initInfo = await this.api.getInitializationInfo();
			this._tools = initInfo.tools;

			if (this._tools.length > 0) {
				this.setupToolHandlers();
			}

			this.setupErrorHandling();

			return this;
		} catch (error) {
			if (isErrorFromAlias(ApiDefinition, "getInitializationInfo", error)) {
				console.error(`Drupal API error: ${error.message}`);

				process.exit(1);
			}

			throw error;
		}
	}

	async run() {
		const transport = new StdioServerTransport();

		await this.server.connect(transport);

		// Although this is just an informative message, we must log to stderr,
		// to avoid interfering with MCP communication that happens on stdout.
		console.error("Drupal MCP server is running");
	}
}

new DrupalMcpServer().init().then((server) => server.run());
