
import type { AppRouter } from "@bellyfed/trpc/router";
import { createTRPCReact } from "@trpc/react-query";

// Create a type-safe tRPC client
export const trpc = createTRPCReact<AppRouter>();