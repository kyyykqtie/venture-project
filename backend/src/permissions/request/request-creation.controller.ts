import {
  Body,
  Controller,
  Post,
  Req,
  Patch,
  UnauthorizedException,
  UseGuards,
  Param,
  Get,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import type { AuthUser } from '../../user/types';
import { PermissionGuard } from '../../role/guards/permission.guard';
import {
  RequirePermission,
  MultipleRequirePermission,
} from '../../role/decorators/require-permission.decorator';
import { CreatePurchaseRequestDto } from './request.dto';
import { PurchaseRequestsService } from './request-creation.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { ApprovalActionDto } from '../approvals/approve.dto';
import { PdfCacheService } from '../../infrastructure/pdf-cache.service';
import { ConcurrencyLimiter } from '../../infrastructure/concurrency-limiter';

interface AuthRequest {
  user?: AuthUser;
}

@Controller('purchase-requests')
@UseGuards(PermissionGuard)
export class PurchaseRequestsController {
  private readonly limiter = new ConcurrencyLimiter(2);

  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
    private readonly approvalsService: ApprovalsService,
    private readonly pdfCacheService: PdfCacheService,
  ) {}

  @Post()
  @RequirePermission('create_request')
  create(@Body() dto: CreatePurchaseRequestDto, @Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.purchaseRequestsService.create(dto, userId);
  }

  // PATCH /purchase-requests/:id/submit
  @Patch(':id/submit')
  @RequirePermission('create_request')
  submit(@Param('id') requestId: string, @Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.purchaseRequestsService.submit(requestId, userId);
  }

  // PATCH /purchase-requests/:id/approve/initial
  @Patch(':id/approve/initial')
  @MultipleRequirePermission('approve_request_initial')
  initialApproval(
    @Param('id') requestId: string,
    @Body() dto: ApprovalActionDto,
    @Req() req: any,
  ) {
    const approverId = (req as AuthRequest).user?.id;
    if (!approverId) throw new UnauthorizedException();
    return this.approvalsService.initialApproval(requestId, dto, approverId);
  }

  // PATCH /purchase-requests/:id/approve/final
  @Patch(':id/approve/final')
  @MultipleRequirePermission('approve_request_final')
  finalApproval(
    @Param('id') requestId: string,
    @Body() dto: ApprovalActionDto,
    @Req() req: any,
  ) {
    const approverId = (req as AuthRequest).user?.id;
    if (!approverId) throw new UnauthorizedException();
    return this.approvalsService.finalApproval(requestId, dto, approverId);
  }

  // GET /purchase-requests
  @Get()
  @MultipleRequirePermission([
    'approve_request_initial',
    'approve_request_final',
    'view_all_records',
  ])
  findQueue(@Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.approvalsService.findQueueForUser(userId);
  }

  // GET /purchase-requests/mine
  @Get('mine')
  findMine(@Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.approvalsService.findMine(userId);
  }

  // GET /purchase-requests/:id/purchase-order/view
  @Get(':id/purchase-order/view')
  @UseGuards(ThrottlerGuard)
  @Throttle({ pdf: { limit: 3, ttl: 60000 } })
  async viewPurchaseOrderPdf(
    @Param('id') requestId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();

    const cacheKey = `pdf:po:${requestId}`;

    try {
      // 1. Check local in-memory cache
      const cachedPdfBase64 = this.pdfCacheService.get(cacheKey);
      if (cachedPdfBase64) {
        const pdfBuffer = Buffer.from(cachedPdfBase64, 'base64');
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=PO-${requestId}.pdf`,
          'Content-Length': pdfBuffer.length.toString(),
        });
        res.send(pdfBuffer);
        return;
      }

      // 2. Cache Miss - run generation in the concurrency limiter (max 2 parallel tasks)
      const base64Pdf = await this.limiter.run(async () => {
        // Simulate heavy CPU/rendering work
        await new Promise((resolve) => setTimeout(resolve, 500));

        const request = await this.purchaseRequestsService.findOneForPdf(
          requestId,
          userId,
        );

        if (request.status !== 'approved') {
          throw new BadRequestException(
            'Purchase request must be approved to view/generate the purchase order.',
          );
        }

        // A valid minimal PDF template
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 150 >>
stream
BT
/F1 24 Tf
100 700 Td
(Purchase Order PDF) Tj
/F1 12 Tf
0 -30 Td
(PO Number: PO-${request.requestNumber}) Tj
0 -20 Td
(Title: ${request.title}) Tj
0 -20 Td
(Budget: PHP ${request.budget}) Tj
0 -20 Td
(Status: Approved) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000212 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
412
%%EOF`;

        return Buffer.from(pdfContent).toString('base64');
      });

      // 3. Store generated base64 in cache for 1 hour (3600 seconds)
      this.pdfCacheService.set(cacheKey, base64Pdf, 3600);

      const pdfBuffer = Buffer.from(base64Pdf, 'base64');
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=PO-${requestId}.pdf`,
        'Content-Length': pdfBuffer.length.toString(),
      });
      res.send(pdfBuffer);
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Failed to generate PDF');
    }
  }

  // GET /purchase-requests/:id
  @Get(':id')
  @MultipleRequirePermission([
    'create_request',
    'approve_request_initial',
    'approve_request_final',
    'view_all_records',
  ])
  findOne(@Param('id') requestId: string, @Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.approvalsService.findOne(requestId, userId);
  }
}
