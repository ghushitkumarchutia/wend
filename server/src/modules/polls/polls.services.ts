import { db } from '../../common/db.js';
import { getIO } from '../../common/socket.js';
import { notificationsQueue } from '../../common/queues.js';
import { logAndEmitActivity } from '../../common/activity.js';
import { polls, pollOptions, pollVotes, trips, user } from '../../db/index.js';
import { eq, and, asc, desc } from 'drizzle-orm';

export async function listPolls(tripId: string) {
  const rows = await db.query.polls.findMany({
    where: eq(polls.tripId, tripId),
    orderBy: [asc(polls.status), desc(polls.createdAt)],
    with: {
      createdBy: {
        columns: { id: true, name: true, image: true },
      },
      options: {
        orderBy: [asc(pollOptions.order)],
        columns: { id: true, text: true, order: true },
      },
      votes: {
        columns: { id: true, userId: true, optionId: true, votedAt: true },
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
    createdBy: p.createdBy
      ? {
          id: p.createdBy.id,
          name: p.createdBy.name,
          image: p.createdBy.image,
        }
      : null,
    closedAt: p.closedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    options: p.options.map((o) => {
      const optionVotes = p.votes.filter((v) => v.optionId === o.id);
      return {
        id: o.id,
        pollId: p.id,
        text: o.text,
        order: o.order,
        voteCount: optionVotes.length,
        votes: optionVotes.map((v) => ({
          id: v.id,
          pollId: p.id,
          userId: v.userId,
          optionId: v.optionId,
          votedAt: v.votedAt?.toISOString() ?? p.createdAt.toISOString(),
        })),
      };
    }),
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

  const [insertedOptions, creator] = await Promise.all([
    db
      .insert(pollOptions)
      .values(
        data.options.map((text, index) => ({
          pollId: poll.id,
          text,
          order: index,
        })),
      )
      .returning(),
    db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { id: true, name: true, image: true },
    }),
  ]);

  logAndEmitActivity({
    tripId,
    actorUserId: userId,
    type: 'poll_created',
    referenceId: poll.id,
    referenceType: 'poll',
  }).catch(() => {});

  const fullPoll = {
    id: poll.id,
    tripId: poll.tripId,
    question: poll.question,
    status: poll.status,
    deadline: poll.deadline?.toISOString() ?? null,
    createdByUserId: poll.createdByUserId,
    createdBy: creator ? { id: creator.id, name: creator.name, image: creator.image } : null,
    closedAt: poll.closedAt?.toISOString() ?? null,
    createdAt: poll.createdAt.toISOString(),
    options: insertedOptions.map((o) => ({
      id: o.id,
      pollId: poll.id,
      text: o.text,
      order: o.order,
      votes: [],
    })),
  };

  getIO().to(`trip:${tripId}`).emit('poll:created', { poll: fullPoll });

  db.query.trips
    .findFirst({ where: eq(trips.id, tripId), columns: { name: true } })
    .then((trip) => {
      notificationsQueue
        .add('poll_created', {
          type: 'poll_created',
          tripId,
          tripName: trip?.name ?? '',
          actorUserId: userId,
          actorName: creator?.name ?? 'Someone',
          referenceId: poll.id,
          referenceType: 'poll',
        })
        .catch(() => {});
    })
    .catch(() => {});

  return fullPoll;
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

  getIO().to(`trip:${tripId}`).emit('poll:vote:updated', { pollId, userId, optionId });
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
