import type { Server, Socket } from 'socket.io';
import { eq, and } from 'drizzle-orm';
import { db } from '../../common/db';
import { tripMembers } from '@wend/db';

export function registerChatHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on('trip:join', async (tripId: string) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId || !tripId) return;

      const [membership] = await db
        .select({ role: tripMembers.role })
        .from(tripMembers)
        .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)))
        .limit(1);

      if (!membership) return;

      await socket.join(`trip:${tripId}`);
      socket.data.tripId = tripId;
    });

    socket.on('chat:typing:start', () => {
      const tripId = socket.data.tripId as string | undefined;
      const userId = socket.data.userId as string | undefined;
      const userName = (socket.data.user as { name?: string })?.name ?? 'Unknown';

      if (!tripId || !userId) return;

      socket.to(`trip:${tripId}`).emit('chat:user:typing', {
        userId,
        userName,
      });
    });
  });
}
