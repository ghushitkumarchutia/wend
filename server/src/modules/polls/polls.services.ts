import { db } from '../../common/db.js';
import { getIO } from '../../common/socket.js';
import { polls, pollOptions, pollVotes, activityLog } from '../../db/index.js';
import { eq, and, sql, asc, desc } from 'drizzle-orm';

export async function listPolls(tripId: string) {
  const rows = await db.query.polls.findMany({
    where: eq(polls.tripId, tripId),
    orderBy: [asc(polls.status), desc(polls.createdAt)],
    with: {
      options: {
        orderBy: [asc(pollOptions.order)],
        columns: { id: true, text: true, order: true },
      },
      votes: {
        columns: { userId: true, optionId: true },
      },
    },
  });

  return rows.map((p) => ({
    id: p.id,
    tripId: p.tripId,
    question: p.question,
    status: p.status,
    deadline: p.deadline?.toISOString() ?? null,
    createdByUserId: p.createdByUserId,
    closedAt: p.closedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    options: p.options.map((o) => ({
      id: o.id,
      text: o.text,
      order: o.order,
      voteCount: p.votes.filter((v) => v.optionId === o.id).length,
    })),
    totalVotes: p.votes.length,
  }));
}

export async function createPoll(
  tripId: string,
  userId: string,
  data: { question: string; options: string[]; deadline?: string },
) {
  const [poll] = await db
    .insert(polls)
    .values({
      tripId,
      question: data.question,
      deadline: data.deadline ? new Date(data.deadline) : null,
      createdByUserId: userId,
    })
    .returning();

  await db.insert(pollOptions).values(
    data.options.map((text, index) => ({
      pollId: poll.id,
      text,
      order: index,
    })),
  );

  await db.insert(activityLog).values({
    tripId,
    actorUserId: userId,
    type: 'poll_created',
    referenceId: poll.id,
    referenceType: 'poll',
  });

  getIO().to(`trip:${tripId}`).emit('poll:created', { pollId: poll.id, question: data.question });

  return poll;
}

export async function castOrChangeVote(
  tripId: string,
  pollId: string,
  userId: string,
  optionId: string,
): Promise<void> {
  const poll = await db.query.polls.findFirst({
    where: and(eq(polls.id, pollId), eq(polls.tripId, tripId)),
    columns: { status: true },
  });

  if (!poll) {
    const err = new Error('Poll not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (poll.status === 'closed') {
    const err = new Error('Poll is closed') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const option = await db.query.pollOptions.findFirst({
    where: and(eq(pollOptions.id, optionId), eq(pollOptions.pollId, pollId)),
    columns: { id: true },
  });

  if (!option) {
    const err = new Error('Option not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const existingVote = await db.query.pollVotes.findFirst({
    where: and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)),
    columns: { id: true },
  });

  if (existingVote) {
    await db
      .update(pollVotes)
      .set({ optionId, votedAt: new Date() })
      .where(eq(pollVotes.id, existingVote.id));
  } else {
    await db.insert(pollVotes).values({
      pollId,
      userId,
      optionId,
    });
  }

  const voteCounts = await db
    .select({
      optionId: pollVotes.optionId,
      count: sql<number>`count(*)::int`,
    })
    .from(pollVotes)
    .where(eq(pollVotes.pollId, pollId))
    .groupBy(pollVotes.optionId);

  getIO().to(`trip:${tripId}`).emit('poll:vote:updated', { pollId, voteCounts });
}

export async function closePoll(tripId: string, pollId: string): Promise<void> {
  const [closed] = await db
    .update(polls)
    .set({ status: 'closed', closedAt: new Date() })
    .where(and(eq(polls.id, pollId), eq(polls.tripId, tripId), eq(polls.status, 'open')))
    .returning({ id: polls.id });

  if (!closed) {
    const err = new Error('Poll not found or already closed') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  getIO().to(`trip:${tripId}`).emit('poll:closed', { pollId });
}
