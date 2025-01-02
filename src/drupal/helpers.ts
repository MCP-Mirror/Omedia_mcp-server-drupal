const DRUPAL_MCP_SUFFIX = "mcp/post";

function composeMCPEndpoint(base: string) {
  if (base.endsWith("/")) {
    return `${base}${DRUPAL_MCP_SUFFIX}`;
  }

  return `${base}/${DRUPAL_MCP_SUFFIX}`;
}

export { composeMCPEndpoint };
