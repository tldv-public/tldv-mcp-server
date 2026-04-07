import { GetMeetingsParamsSchema } from "./api/schemas";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TldvApi } from "./api/tldv-api";
import { logger } from "./logger";
import dotenv from "dotenv";
import z from "zod";

dotenv.config();

async function main() {
  logger.info("Initializing TLDV API...");
  const tldvApi = new TldvApi({
    apiKey: process.env.TLDV_API_KEY,
  });
  
  logger.info("Starting MCP server...");
  
  const tools = {
    "get-meeting-metadata": {
      name: "get-meeting-metadata",
      description: "Get a meeting by its ID. The meeting ID is a unique identifier for a meeting. It will return the meeting metadata, including the name, the date, the organizer, participants and more.",
      inputSchema: z.object({ id: z.string() }),
    },
    "get-transcript": {
      name: "get-transcript",
      description: "Get transcript by meeting ID. The transcript is a list of messages exchanged between the participants in the meeting. It's time-stamped and contains the speaker and the message",
      inputSchema: z.object({ meetingId: z.string() }),
    },
    "list-meetings": {
      name: "list-meetings",
      description: "List all meetings based on the filters provided. You can filter by date, status, and more. Those meetings are the sames you have access to in the TLDV app.",
      inputSchema: GetMeetingsParamsSchema,
    },
    "get-highlights": {
      name: "get-highlights",
      description: "Allows you to get highlights from a meeting by providing a meeting ID.",
      inputSchema: z.object({ meetingId: z.string() }),
    },
    "get-meeting-notes": {
      name: "get-meeting-notes",
      description: "Get AI-generated, template-driven notes for a meeting by its ID. Returns structured notes with topics, summaries, and full markdown content produced by the tl;dv template configured for that meeting.",
      inputSchema: z.object({ meetingId: z.string() }),
    },
  };
  
  const server = new McpServer({
    name: "tldv-server",
    version: "1.0.0",
  }, {
    capabilities: {
      logging: {
        level: "debug",
      },
      prompts: {},
      tools: tools,
      resources: {},
    },
    instructions: "You are a helpful assistant that can help with TLDV API requests.",
  });

  //Register tool handlers
  server.tool(
    tools["get-meeting-metadata"].name,
    tools["get-meeting-metadata"].description,
    tools["get-meeting-metadata"].inputSchema.shape,
    async ({ id }) => {
      const meeting = await tldvApi.getMeeting(id);
      return {
        content: [{ type: "text", text: JSON.stringify(meeting) }]
      };
    }
  );

  server.tool(
    tools["get-transcript"].name,
    tools["get-transcript"].description,
    tools["get-transcript"].inputSchema.shape,
    async ({ meetingId }) => {
      const transcript = await tldvApi.getTranscript(meetingId);
      return {
        content: [{ type: "text", text: JSON.stringify(transcript) }]
      };
    }
  );

  server.tool(
    tools["list-meetings"].name,
    tools["list-meetings"].description,
    tools["list-meetings"].inputSchema.shape,
    async (input) => {
      const meetings = await tldvApi.getMeetings(input);
      return {
        content: [{ type: "text", text: JSON.stringify(meetings) }]
      };
    }
  );

  server.tool(
    tools["get-highlights"].name,
    tools["get-highlights"].description,
    tools["get-highlights"].inputSchema.shape,
    async ({ meetingId }) => {
      const highlights = await tldvApi.getHighlights(meetingId);
      return {
        content: [{ type: "text", text: JSON.stringify(highlights) }]
      };
    }
  );

  server.tool(
    tools["get-meeting-notes"].name,
    tools["get-meeting-notes"].description,
    tools["get-meeting-notes"].inputSchema.shape,
    async ({ meetingId }) => {
      const notes = await tldvApi.getMeetingNotes(meetingId);
      return {
        content: [{ type: "text", text: JSON.stringify(notes) }]
      };
    }
  );

  logger.info("Initializing StdioServerTransport...");
  const transport = new StdioServerTransport();

  logger.info("Connecting to MCP server...");
  await server.connect(transport);
  
  // Enable MCP logging API now that we're connected
  logger.setServer(server);
  
  logger.info("MCP server connected and ready!");
}

main().catch((error) => {
  logger.error("Fatal error in main()", error);
  process.exit(1);
});
