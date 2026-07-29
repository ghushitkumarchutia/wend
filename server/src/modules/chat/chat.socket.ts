import { getIO } from '../../common/socket.js';
import { db } from '../../common/db.js';
import { tripMembers } from '../../db/index.js';
import { eq, and } from 'drizzle-orm';

export function registerChatHandlers(): void {
  const io = getIO();

  io.on('connection', (socket) => {
    socket.on('trip:join', async (tripId: string) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId || !tripId) return;

      const membership = await db.query.tripMembers.findFirst({
        where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)),
        columns: { id: true },
      });

      if (!membership) return;

      await socket.join(`trip:${tripId}`);
    });

    socket.on('chat:typing:start', (payload: string | { tripId: string; userName?: string }) => {
      const tripId = typeof payload === 'string' ? payload : payload?.tripId;
      const userId = socket.data.userId as string | undefined;
      const userName =
        (typeof payload === 'object' && payload?.userName) ||
        (socket.data.user as { name?: string } | undefined)?.name ||
        'Member';

      if (!userId || !tripId) return;

      socket.to(`trip:${tripId}`).emit('chat:user:typing', {
        tripId,
        userId,
        userName,
        isTyping: true,
      });
    });

    socket.on('chat:typing:stop', (payload: string | { tripId: string; userName?: string }) => {
      const tripId = typeof payload === 'string' ? payload : payload?.tripId;
      const userId = socket.data.userId as string | undefined;
      const userName =
        (typeof payload === 'object' && payload?.userName) ||
        (socket.data.user as { name?: string } | undefined)?.name ||
        'Member';

      if (!userId || !tripId) return;

      socket.to(`trip:${tripId}`).emit('chat:user:typing', {
        tripId,
        userId,
        userName,
        isTyping: false,
      });
    });
  });
}
