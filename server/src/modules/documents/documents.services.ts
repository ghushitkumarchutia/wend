import { db } from '../../common/db.js';
import { getPresignedPutUrl, getPresignedGetUrl } from '../../common/storage.js';
import { tripDocuments, activityLog } from '../../db/index.js';
import { eq, and, isNull, or } from 'drizzle-orm';

export async function listDocuments(tripId: string, userId: string) {
  return db.query.tripDocuments.findMany({
    where: and(
      eq(tripDocuments.tripId, tripId),
      isNull(tripDocuments.archivedAt),
      or(eq(tripDocuments.visibility, 'shared'), eq(tripDocuments.uploadedByUserId, userId)),
    ),
    columns: {
      id: true,
      tripId: true,
      uploadedByUserId: true,
      fileName: true,
      fileType: true,
      sizeBytes: true,
      storageKey: true,
      category: true,
      visibility: true,
      archivedAt: true,
      createdAt: true,
    },
    with: {
      uploadedBy: {
        columns: {
          name: true,
        },
      },
    },
  });
}

export async function generateUploadUrl(tripId: string, fileType: string) {
  const key = `documents/${tripId}/${Date.now()}-${crypto.randomUUID()}`;
  const uploadUrl = await getPresignedPutUrl(key, fileType);
  return { uploadUrl, storageKey: key };
}

export async function confirmDocumentUpload(
  tripId: string,
  userId: string,
  data: {
    storageKey: string;
    fileName: string;
    fileType: string;
    sizeBytes: number;
    category?: string;
    visibility?: string;
  },
) {
  const [doc] = await db
    .insert(tripDocuments)
    .values({
      tripId,
      uploadedByUserId: userId,
      fileName: data.fileName,
      fileType: data.fileType,
      sizeBytes: data.sizeBytes,
      storageKey: data.storageKey,
      category: (data.category ?? null) as typeof tripDocuments.$inferInsert.category,
      visibility: (data.visibility ?? 'shared') as typeof tripDocuments.$inferInsert.visibility,
    })
    .returning();

  await db.insert(activityLog).values({
    tripId,
    actorUserId: userId,
    type: 'document_uploaded',
    referenceId: doc.id,
    referenceType: 'document',
  });

  return doc;
}

export async function getDocumentDownloadUrl(
  tripId: string,
  docId: string,
): Promise<string> {
  const doc = await db.query.tripDocuments.findFirst({
    where: and(
      eq(tripDocuments.id, docId),
      eq(tripDocuments.tripId, tripId),
      isNull(tripDocuments.archivedAt),
    ),
    columns: { storageKey: true },
  });

  if (!doc) {
    const err = new Error('Document not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return getPresignedGetUrl(doc.storageKey);
}

export async function softDeleteDocument(
  tripId: string,
  docId: string,
  userId: string,
  tripRole: string,
): Promise<void> {
  const doc = await db.query.tripDocuments.findFirst({
    where: and(
      eq(tripDocuments.id, docId),
      eq(tripDocuments.tripId, tripId),
      isNull(tripDocuments.archivedAt),
    ),
    columns: { id: true, uploadedByUserId: true },
  });

  if (!doc) {
    const err = new Error('Document not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (doc.uploadedByUserId !== userId && tripRole !== 'organizer') {
    const err = new Error('Only the uploader or organizer can delete this document') as Error & {
      status: number;
    };
    err.status = 403;
    throw err;
  }

  await db
    .update(tripDocuments)
    .set({ archivedAt: new Date() })
    .where(eq(tripDocuments.id, docId));

  await db.insert(activityLog).values({
    tripId,
    actorUserId: userId,
    type: 'document_deleted',
    referenceId: docId,
    referenceType: 'document',
  });
}
