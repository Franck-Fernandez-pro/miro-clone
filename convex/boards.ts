import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
  args: { orgId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, { orgId, search }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;
    const title = search as string;
    let boards = [];

    if (title) {
      boards = await ctx.db
        .query("boards")
        .withSearchIndex("search_title", (q) =>
          q.search("title", title).eq("orgId", orgId),
        )
        .collect();
    } else {
      boards = await ctx.db
        .query("boards")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .order("desc")
        .collect();
    }

    const boardsWithFavoriteRelation = boards.map((b) =>
      ctx.db
        .query("userFavorites")
        .withIndex("by_user_board", (q) =>
          q.eq("userId", userId).eq("boardId", b._id),
        )
        .unique()
        .then((fav) => ({ ...b, isFavorite: !!fav })),
    );

    return Promise.all(boardsWithFavoriteRelation);
  },
});
