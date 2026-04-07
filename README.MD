# Official MCP Server for tl;dv API

🚀 **The First and Only MCP Server for Google Meet, Zoom, and Microsoft Teams Integration**

This project provides a Model Context Protocol (MCP) server enabling seamless interaction with the [tl;dv](https://tldv.io/) API. As the pioneering MCP solution for video conferencing platforms, it unlocks the power of tl;dv's meeting intelligence across Google Meet, Zoom, and Microsoft Teams through a standardized interface. This integration allows AI models and MCP clients to access, analyze, and derive insights from your meetings across all major platforms in one unified way.

## Features

*   **List Meetings:** Retrieve meetings based on filters (query, date range, participation status, type) across all supported platforms.
*   **Get Meeting Metadata:** Fetch detailed information for a specific meeting by ID, regardless of the platform it was hosted on.
*   **Get Transcript:** Obtain the transcript for any meeting ID, with consistent formatting across all platforms.
*   **Get Highlights:** Retrieve AI-generated highlights for meetings from any supported platform.
*   **Get Meeting Notes:** Fetch AI-generated, template-driven notes for a meeting, including topics, summaries, and full markdown content.
*   **Import Meeting (Coming Soon):** Functionality to import meetings via URL from any supported platform.

## Prerequisites

*   **tl;dv Account:** A Business or Enterprise tl;dv account is required.
*   **tl;dv API Key:** You need an API key, which can be requested from your tl;dv settings: [https://tldv.io/app/settings/personal-settings/api-keys](https://tldv.io/app/settings/personal-settings/api-keys).
*   **Node.js & npm (for Node installation):** If installing via Node.js, ensure Node.js and npm are installed.
*   **Docker (for Docker installation):** If installing via Docker, ensure Docker is installed and running.

## Installation and Configuration

You can run this MCP server using either Docker or Node.js. Configure your MCP client (e.g., Claude Desktop, Cursor) to connect to the server.

### Using npx (recommended)

No installation required. Configure your MCP client:

```json
{
  "mcpServers": {
    "tldv": {
      "command": "npx",
      "args": ["-y", "@numbnp/tldv-mcp"],
      "env": {
        "TLDV_API_KEY": "your_tldv_api_key"
      }
    }
  }
}
```

Replace `your_tldv_api_key` with your tl;dv API key.

### Using Docker

Go in the repo. 

1.  **Build the Docker image:**
    ```bash
    docker build -t tldv-mcp-server .
    ```

2.  **Configure your MCP Client:**
    Update your MCP client's configuration file (e.g., `claude_desktop_config.json`). The exact location and format may vary depending on the client.

    ```json
    {
      "mcpServers": {
        "tldv": {
          "command": "docker",
          "args": [
              "run",
              "-i",
              "--init",
              "--rm",        
              "-e",          
              "TLDV_API_KEY=<your-tldv-api-key>",
              "tldv-mcp-server"
          ]
        }
      }
    }

    ```
    Replace `<your-tldv-api-key>` with your actual tl;dv API key.

### Using Node.js

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Build the server:**
    ```bash
    npm run build
    ```
    This command creates a `dist` folder containing the compiled server code (`index.js`).

3.  **Configure your MCP Client:**
    Update your MCP client's configuration file.

    ```json
    {
      "mcpServers": {
        "tldv": {
          "command": "node",
          "args": ["/absolute/path/to/tldv-mcp-server/dist/index.js"],
          "env": {
            "TLDV_API_KEY": "your_tldv_api_key"
          }
        }
      }
    }
    ```
    Replace `/absolute/path/to/tldv-mcp-server/dist/index.js` with the correct absolute path to the built server file and `your_tldv_api_key` with your tl;dv API key.

*Refer to your specific MCP client's documentation for detailed setup instructions (e.g., [Claude Tools](https://modelcontextprotocol.io/quickstart/user)).*

*Disclaimer* Once you are updating this config file, you will need to kill your MCP client and restart it for the changes to be effective. 

## Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file and add your `TLDV_API_KEY`. Other variables can be configured as needed.


3.  **Run in development mode:**
    This command starts the server with auto-reloading on file changes:
    ```bash
    npm run watch
    ```

4.  **Update client for local development:**
    Configure your MCP client to use the local development server path (typically `/path/to/your/project/dist/index.js`). Ensure the `TLDV_API_KEY` is accessible, either through the client's `env` configuration or loaded via the `.env` file by the server process.

5. **Reload your MCP Client**
    Since you are running the watch command, it will recompiled a new version. Reloading your Client (e.g Claud Desktop App), your changes will be effective. 

## Debugging

*   **Console Logs:** Check the console output when running `npm run dev` for detailed logs. The server uses the `debug` library; you can control log levels via environment variables (e.g., `DEBUG=tldv-mcp:*`).
*   **Node.js Debugger:** Utilize standard Node.js debugging tools (e.g., Chrome DevTools Inspector, VS Code debugger) by launching the server process with the appropriate flags (e.g., `node --inspect dist/index.js`).
*   **MCP Client Logs:** Check the logs provided by your MCP client, which might show the requests sent and responses received from this server.

## Learn More

*   [tl;dv Developer API Documentation](https://doc.tldv.io/)
*   [Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io/introduction)