#!/usr/bin/env node

/**
 * A simple Drupal MCP server to communicate drupal instance
 */

import { parseArgs } from "node:util";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListResourceTemplatesRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema,
	type Resource,
	type ResourceTemplate,
	type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Zodios, type ZodiosInstance } from "@zodios/core";
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
	private _resourceTemplates: Array<ResourceTemplate> = [];
	private _resources: Array<Resource> = [];

	constructor() {
		this.server = new Server(
			{
				name: "mcp-server-drupal",
				version: "0.0.1",
			},
			{
				capabilities: {
					tools: {},
					resources: {},
				},
			},
		);

		this.api = new Zodios(DRUPAL_BASE_URL as string, ApiDefinition);
	}

	private setupResourceHandlers(): void {
		if (this._resourceTemplates.length > 0) {
			console.error(this._resourceTemplates);

			this.server.setRequestHandler(
				ListResourceTemplatesRequestSchema,
				async () => ({
					resourceTemplates: this._resourceTemplates,
				}),
			);
		}
		if (this._resources.length > 0) {
			this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
				resources: this._resources,
			}));
		}

		this.server.setRequestHandler(
			ReadResourceRequestSchema,
			async (request) => {
				const response = await this.api.post("/mcp/post", {
					jsonrpc: "2.0",
					id: 2,
					method: "resources/read",
					params: {
						uri: request.params.uri,
					},
				});

				return response.result;
			},
		);
	}

	private setupToolHandlers(): void {
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: this._tools,
		}));

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			const response = await this.api.post("/mcp/post", {
				jsonrpc: "2.0",
				id: 2,
				method: "tools/call",
				params: {
					name: request.params.name,
					arguments: request.params.arguments,
				},
			});
			console.error(response.result);

			return response.result;
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
		const [tools, resourceTemplates, resources] = await Promise.all([
			this.api.post("/mcp/post", {
				jsonrpc: "2.0",
				id: 0,
				method: "tools/list",
			}),
			this.api.post("/mcp/post", {
				jsonrpc: "2.0",
				id: 1,
				method: "resources/templates/list",
			}),
			this.api.post("/mcp/post", {
				jsonrpc: "2.0",
				id: 2,
				method: "resources/list",
			}),
		]);

		this._tools = tools.result.tools;
		this._resourceTemplates = resourceTemplates.result.resourceTemplates;
		this._resources = resources.result.resources;

		if (this._tools.length > 0) {
			this.setupToolHandlers();
		}

		if (this._resourceTemplates.length > 0 || this._resources.length > 0) {
			this.setupResourceHandlers();
		}

		this.setupErrorHandling();

		return this;
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
