[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/tldv-public-tldv-mcp-server-badge.png)](https://mseep.ai/app/tldv-public-tldv-mcp-server)

# Official MCP Server for tl;dv API

Connect your tl;dv meeting library to AI assistants through the Model Context Protocol.

tl;dv hosts this server. Connect it from the connector directory in Claude or ChatGPT, authorize it with OAuth, and start querying your library. No installation or API key is required. This repository holds the local build for anyone who would rather run the server themselves.

**This is the only official tl;dv MCP repository.** Any tl;dv MCP server you find on GitHub, GitLab, npm, or elsewhere is not maintained by tl;dv. If you find one, please report it to tl;dv at [support@tldv.io](mailto:support@tldv.io).
Last updated September 2026.

## Official MCP

- Claude: https://claude.ai/directory/connectors/
- ChatGPT: https://chatgpt.com/#settings/Connectors
- Official tl;dv documentation: https://tldv.notion.site/tl-dv-MCP-Official-Documentation-330cce15f3ba80638f5ac0253e3b8fd4

## At a glance

- **Availability:** included on the tl;dv Pro plan and above.
- **Hosting:** hosted by tl;dv. No local install required.
- **Authentication:** OAuth, not an API key. Access tokens last for five minutes.
- **Permissions:** scoped, approved in your browser, and revocable at any time from your tl;dv account without changing your password. The connector inherits your existing tl;dv library permissions and cannot reach any meeting you could not already open in the app. That limit is enforced server-side rather than described in the tool text.
- **Connecting:** available in the Claude and ChatGPT connector directories. On ChatGPT, connectors require a paid plan, and on workspace plans, an admin may need to enable them first.
- **Access:** read-only. The server cannot create, edit, delete, or share meetings.
- **Default scope:** searches cover meetings you took part in. To widen this, ask for it, such as "include meetings I wasn't part of."
- **Meeting organizer's plan:** you can only reach a meeting through the server if its organizer is also on Pro or above.
- **Results per query:** a search returns up to 50 meetings.
- **Admin controls:** organization admins can block MCP access through integration policies.
- **Security:** the API and the MCP endpoint are both covered by tl;dv's SOC 2 program and included in the pentest scope. See [trust.tldv.io](https://trust.tldv.io).

## Features

- **Search Meetings:** retrieve meetings based on filters, including query, date range, participation status, and type, with pagination.
- **Get Meeting Metadata:** fetch details for a specific meeting by ID, including title, date, duration, status, organizer, participants, and meeting URL.
- **Get Meeting Transcript:** obtain the full transcript for any meeting ID, returned in Markdown.
- **Get Meeting Notes:** retrieve AI-generated notes, manual notes, timestamps, and AI-processing status.
- **Get User Profile:** retrieve your tl;dv profile, role, registration date, and team size. (Only available on the Remote MCP server)

## How meetings get into your library

The MCP server reads meetings that tl;dv has already recorded. They get there in two ways.

- **The tl;dv bot** joins Google Meet, Zoom, and Microsoft Teams calls as a visible participant. With calendar sync, it joins scheduled meetings automatically and captures video and audio.
- **The tl;dv desktop app** records system audio from your Mac or Windows machine without a bot joining. Because it captures device audio rather than meeting data, it works on any platform that produces sound, including Slack huddles, Discord, WhatsApp, Google Meet, Zoom, and Teams. Bot-free recordings are audio only, so they contain no video, screen sharing, or chat.
- **The tl;dv mobile app** records in-person audio from your mobile device running iOS and Android. Works offline and syncs to your workspace when the device is back online. These recordings are audio only.

Recording without a bot removes the visible participant, not the obligation to tell people they are being recorded. Consent requirements apply to in-person conversations too, and they vary by jurisdiction.

---

## Running the server locally

This repository is a local build you run yourself and authenticate with a tl;dv API key rather than OAuth. Most people should use the hosted connector described above; if your MCP client doesn't support remote connectors, you can use this local version.

### Disclaimer

Although this is the official local MCP server repo maintained by the tl;dv team, we don't update it regularly because we are prioritizing remote MCP servers.

### Prerequisites

- **tl;dv Account:** A Pro plan or above.
- **tl;dv API Key:** You need an API key, which can be requested from your tl;dv settings: <https://tldv.io/app/settings/personal-settings/api-keys>.
- **Node.js and npm (for Node installation):** If installing via Node.js, make sure Node.js and npm are installed.
- **Docker (for Docker installation):** If installing via Docker, make sure Docker is installed and running.

## Installation and Configuration

You can run this MCP server using either Docker or Node.js. Configure your MCP client (e.g., Claude Desktop, Cursor) to connect to the server.

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

_Refer to your specific MCP client's documentation for detailed setup instructions (e.g., [Claude Tools](https://modelcontextprotocol.io/quickstart/user))._

_Disclaimer_ Once you are updating this config file, you will need to kill your MCP client and restart it for the changes to be effective.

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

5.  **Reload your MCP Client**
    Since you are running the watch command, it will recompiled a new version. Reloading your Client (e.g Claud Desktop App), your changes will be effective.

## Debugging

- **Console Logs:** Check the console output when running `npm run dev` for detailed logs. The server uses the `debug` library; you can control log levels via environment variables (e.g., `DEBUG=tldv-mcp:*`).
- **Node.js Debugger:** Utilize standard Node.js debugging tools (e.g., Chrome DevTools Inspector, VS Code debugger) by launching the server process with the appropriate flags (e.g., `node --inspect dist/index.js`).
- **MCP Client Logs:** Check the logs provided by your MCP client, which might show the requests sent and responses received from this server.

## Learn More

- [tl;dv Developer API Documentation](https://doc.tldv.io/)
- [Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io/introduction)
