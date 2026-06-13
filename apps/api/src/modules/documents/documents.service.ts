import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../common/db';
import { getPresignedPutUrl, getPresignedGetUrl } from '../../common/storage';
import { tripDocuments, activityLog } from '@wend/db';
import { ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from '@wend/shared';

const ALL_ALLOWED_TYPES = [...new Set([...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES])];

export const DocumentsService = {
  async list(tripId: string, userId: string, _userRole: string) {
    const rows = await db
      .select()
      .from(tripDocuments)
      .where(
        and(
          eq(tripDocuments.tripId, tripId),
          sql`${tripDocuments.archivedAt} IS NULL`,
        ),
      );

    return rows.filter((doc) => {
      if (doc.visibility === 'private' && doc.uploadedByUserId !== userId) {
        return false;
      }
      return true;
    });
  },

  async requestUploadUrl(
    tripId: string,
    fileName: string,
    fileType: string,
    sizeBytes: number,
  ) {
    if (!ALL_ALLOWED_TYPES.includes(fileType as (typeof ALL_ALLOWED_TYPES)[number])) {
      const err = new Error('Unsupported file type') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      const err = new Error('File exceeds maximum size') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    const ext = fileName.split('.').pop() ?? 'bin';
    const key = `trips/${tripId}/documents/${crypto.randomUUID()}.${ext}`;
    const url = await getPresignedPutUrl(key, fileType, 900);

    return { url, key };
  },

  async confirmUpload(
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
        category: data.category ?? null,
        visibility: data.visibility ?? 'shared',
      } as typeof tripDocuments.$inferInsert)
      .returning();

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'document_uploaded',
      referenceId: doc!.id,
      referenceType: 'document',
    });

    return doc;
  },

  async getDownloadUrl(documentId: string, tripId: string, userId: string) {
    const [doc] = await db
      .select()
      .from(tripDocuments)
      .where(
        and(
          eq(tripDocuments.id, documentId),
          eq(tripDocuments.tripId, tripId),
          sql`${tripDocuments.archivedAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!doc) {
      const err = new Error('Document not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (doc.visibility === 'private' && doc.uploadedByUserId !== userId) {
      const err = new Error('Access denied') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    const url = await getPresignedGetUrl(doc.storageKey, 300);
    return { url, fileName: doc.fileName };
  },

  async softDelete(
    documentId: string,
    tripId: string,
    userId: string,
    userRole: string,
  ) {
    const [doc] = await db
      .select({
        id: tripDocuments.id,
        uploadedByUserId: tripDocuments.uploadedByUserId,
      })
      .from(tripDocuments)
      .where(
        and(
          eq(tripDocuments.id, documentId),
          eq(tripDocuments.tripId, tripId),
          sql`${tripDocuments.archivedAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!doc) {
      const err = new Error('Document not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (doc.uploadedByUserId !== userId && userRole !== 'organizer') {
      const err = new Error('Only the uploader or organizer can delete this document') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    await db
      .update(tripDocuments)
      .set({ archivedAt: new Date() })
      .where(eq(tripDocuments.id, documentId));

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'document_deleted',
      referenceId: documentId,
      referenceType: 'document',
    });
  },
};
