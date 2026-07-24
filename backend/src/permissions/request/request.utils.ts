import { or, eq } from 'drizzle-orm';
import { purchaseRequest } from '../../auth/schema';

export const getRequestByIdOrNumber = (requestId: string) =>
  or(
    eq(purchaseRequest.id, requestId),
    eq(purchaseRequest.requestNumber, requestId),
  );
