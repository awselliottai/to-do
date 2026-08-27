import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),
        DATABASE_URL: z.string().min(1),
        DATABASE_URL_UNPOOLED: z.string().min(1),
        XAI_API_KEY: z.string().trim().optional(),
        OPENAI_API_KEY: z.string().trim().optional(),
        OPENAI_ORG_ID: z.string().trim().optional(),
        OPENAI_PROJECT_ID: z.string().trim().optional(),
        OPENROUTER_API_KEY: z.string().trim().optional(),
        MCP_SERVICE_TOKEN: z.string().trim().optional(),
    },
    client: {
        // NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
    },
    // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
    // runtimeEnv: {
    //   DATABASE_URL: process.env.DATABASE_URL,
    //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    // },
    // For Next.js >= 13.4.4, you only need to destructure client variables:
    experimental__runtimeEnv: {
        // NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    },
});