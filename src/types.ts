import { makeApi } from "@zodios/core";
import { z } from "zod";

declare module "bun" {
	interface Env {
		DRUPAL_BASE_URL: string;
	}
}

export const ApiDefinition = makeApi([
	{
		method: "post",
		path: "/mcp/post",
		parameters: [
			{
				name: "arguments",
				type: "Body",
				schema: z.any(),
			},
		],
		response: z.any(),
	},
]);
