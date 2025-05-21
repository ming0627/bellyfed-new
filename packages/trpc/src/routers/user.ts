import { z } from "zod";
import { publicProcedure, privateProcedure } from "../procedures/index.js";
import { router } from "../trpc.js";
import { Context } from "../context.js";

export const userRouter = router({
  // Public procedures
  getAllUsers: publicProcedure.query(({ ctx }: { ctx: any }) => {
    const context = ctx as Context;
    return context.prisma.user.findMany();
  }),

  // Private procedures (require authentication)
  me: privateProcedure.query(({ ctx }: { ctx: any }) => {
    // Get the current user based on auth context
    // In a real app, you'd get the user ID from the auth token
    // For demo purposes, using a hardcoded ID:
    // const userId = "current-user-id";

    // return ctx.prisma.user.findUnique({
    //   where: { id: userId }
    // });
  }),


});