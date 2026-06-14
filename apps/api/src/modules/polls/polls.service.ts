import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../common/db';
import { notificationsQueue } from '../../common/queues';
import { getIO } from '../../common/socket';
import { polls, pollOptions, pollVotes, activityLog } from '@wend/db';

export const PollsService = {
  async list(tripId: string) {
    const allPolls = await db
      .select()
      .from(polls)
      .where(eq(polls.tripId, tripId))
      .orderBy(
        sql`CASE WHEN ${polls.status} = 'open' THEN 0 ELSE 1 END`,
        sql`${polls.createdAt} DESC`,
      );

    const pollIds = allPolls.map((p) => p.id);
    if (pollIds.length === 0) return [];

    const options = await db
      .select()
      .from(pollOptions)
      .where(sql`${pollOptions.pollId} IN ${pollIds}`)
      .orderBy(pollOptions.order);

    const votes = await db
      .select()
      .from(pollVotes)
      .where(sql`${pollVotes.pollId} IN ${pollIds}`);

    return allPolls.map((poll) => ({
      ...poll,
      options: options
        .filter((o) => o.pollId === poll.id)
        .map((opt) => ({
          ...opt,
          voteCount: votes.filter((v) => v.optionId === opt.id).length,
        })),
      totalVotes: votes.filter((v) => v.pollId === poll.id).length,
    }));
  },

  async create(
    tripId: string,
    userId: string,
    data: { question: string; options: string[]; deadline?: string },
  ) {
    const result = await db.transaction(async (tx) => {
      const [poll] = await tx
        .insert(polls)
        .values({
          tripId,
          question: data.question,
          deadline: data.deadline ? new Date(data.deadline) : null,
          createdByUserId: userId,
        })
        .returning();

      const optionValues = data.options.map((text, idx) => ({
        pollId: poll!.id,
        text,
        order: idx,
      }));

      const insertedOptions = await tx
        .insert(pollOptions)
        .values(optionValues)
        .returning();

      await tx.insert(activityLog).values({
        tripId,
        actorUserId: userId,
        type: 'poll_created',
        referenceId: poll!.id,
        referenceType: 'poll',
      });

      return {
        ...poll!,
        options: insertedOptions.map((o) => ({ ...o, voteCount: 0 })),
        totalVotes: 0,
      };
    });

    getIO().to(`trip:${tripId}`).emit('poll:created', result);

    await notificationsQueue.add('fan-out', {
      activityType: 'poll_created',
      tripId,
      actorUserId: userId,
      referenceId: result.id,
      referenceType: 'poll',
    });

    return result;
  },

  async vote(pollId: string, tripId: string, userId: string, optionId: string) {
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), eq(polls.tripId, tripId)))
      .limit(1);

    if (!poll) {
      const err = new Error('Poll not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (poll.status === 'closed') {
      const err = new Error('This poll is closed') as Error & { status: number };
      err.status = 409;
      throw err;
    }

    const [option] = await db
      .select()
      .from(pollOptions)
      .where(and(eq(pollOptions.id, optionId), eq(pollOptions.pollId, pollId)))
      .limit(1);

    if (!option) {
      const err = new Error('Poll option not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    await db
      .insert(pollVotes)
      .values({
        pollId,
        userId,
        optionId,
      })
      .onConflictDoUpdate({
        target: [pollVotes.pollId, pollVotes.userId],
        set: { optionId, votedAt: new Date() },
      });

    const voteCounts = await db
      .select({
        optionId: pollVotes.optionId,
        count: sql<number>`count(*)::int`,
      })
      .from(pollVotes)
      .where(eq(pollVotes.pollId, pollId))
      .groupBy(pollVotes.optionId);

    const totalVotes = voteCounts.reduce((sum, v) => sum + v.count, 0);

    getIO().to(`trip:${tripId}`).emit('poll:vote:updated', {
      pollId,
      voteCounts,
      totalVotes,
    });

    return { pollId, voteCounts, totalVotes };
  },

  async close(pollId: string, tripId: string, userId: string) {
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), eq(polls.tripId, tripId)))
      .limit(1);

    if (!poll) {
      const err = new Error('Poll not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (poll.status === 'closed') {
      const err = new Error('Poll is already closed') as Error & { status: number };
      err.status = 409;
      throw err;
    }

    const [closed] = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(polls)
        .set({ status: 'closed', closedAt: new Date() })
        .where(eq(polls.id, pollId))
        .returning();

      await tx.insert(activityLog).values({
        tripId,
        actorUserId: userId,
        type: 'poll_closed',
        referenceId: pollId,
        referenceType: 'poll',
      });

      return [updated!];
    });

    getIO().to(`trip:${tripId}`).emit('poll:closed', closed);

    await notificationsQueue.add('fan-out', {
      activityType: 'poll_closed',
      tripId,
      actorUserId: userId,
      referenceId: pollId,
      referenceType: 'poll',
    });

    return closed;
  },
};
