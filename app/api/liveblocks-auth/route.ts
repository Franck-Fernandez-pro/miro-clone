import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  const authorization = auth();
  const user = await currentUser();

  if (!authorization || !user)
    return new Response("Unauthorized", { status: 403 });

  const { room } = await request.json();
  const board = await convex.query(api.board.get, { id: room });

  if (board?.orgId !== authorization.orgId)
    return new Response("Unauthorized", { status: 403 });

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.firstName || "Anonymous",
      avatar: user.imageUrl,
    },
  });

  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
