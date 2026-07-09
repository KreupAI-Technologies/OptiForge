import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CPQDocumentTemplate,
  CPQGeneratedDocument,
} from '../entities/cpq-document.entity';
import {
  normalizeFormat,
  renderReport,
  ReportFormat,
  safeFileName,
  fileExtensionFor,
  contentTypeFor,
} from '../../../common/utils/report-render.util';

export interface GeneratedFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

@Injectable()
export class CPQDocumentService {
  constructor(
    @InjectRepository(CPQDocumentTemplate)
    private readonly templateRepo: Repository<CPQDocumentTemplate>,
    @InjectRepository(CPQGeneratedDocument)
    private readonly documentRepo: Repository<CPQGeneratedDocument>,
  ) {}

  // ---- Templates ----

  async findAllTemplates(companyId: string): Promise<CPQDocumentTemplate[]> {
    return this.templateRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async createTemplate(
    companyId: string,
    data: Partial<CPQDocumentTemplate>,
  ): Promise<CPQDocumentTemplate> {
    const entity = this.templateRepo.create({ ...data, companyId });
    return this.templateRepo.save(entity);
  }

  async findTemplate(
    companyId: string,
    id: string,
  ): Promise<CPQDocumentTemplate> {
    const entity = await this.templateRepo.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Document template ${id} not found`);
    }
    return entity;
  }

  // ---- Generated documents ----

  async findAllDocuments(companyId: string): Promise<CPQGeneratedDocument[]> {
    return this.documentRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findDocument(
    companyId: string,
    id: string,
  ): Promise<CPQGeneratedDocument> {
    const entity = await this.documentRepo.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Generated document ${id} not found`);
    }
    return entity;
  }

  /**
   * Generate a document from a template, substituting {{placeholder}} tokens
   * from the supplied variables map, and persist the resolved content.
   */
  async generate(
    companyId: string,
    data: {
      templateId?: string;
      title?: string;
      documentType?: string;
      referenceId?: string;
      customerName?: string;
      content?: string;
      variables?: Record<string, unknown>;
      generatedBy?: string;
    },
  ): Promise<CPQGeneratedDocument> {
    let baseContent = data.content ?? '';
    let documentType = data.documentType ?? 'quote';
    let title = data.title ?? 'Document';

    if (data.templateId) {
      const template = await this.findTemplate(companyId, data.templateId);
      baseContent =
        data.content ??
        template.content ??
        (template.sections ?? [])
          .map((s) => `${s.title}\n${s.body}`)
          .join('\n\n');
      documentType = data.documentType ?? template.documentType;
      title = data.title ?? template.name;
    }

    const resolvedContent = this.applyVariables(baseContent, {
      customerName: data.customerName ?? '',
      title,
      ...(data.variables ?? {}),
    });

    const doc = this.documentRepo.create({
      companyId,
      templateId: data.templateId ?? undefined,
      title,
      documentType,
      referenceId: data.referenceId ?? undefined,
      customerName: data.customerName ?? undefined,
      content: resolvedContent,
      status: 'generated',
      generatedBy: data.generatedBy ?? undefined,
    });
    return this.documentRepo.save(doc);
  }

  /**
   * Render a generated document to a downloadable file (PDF / Excel / CSV).
   * The document content is split into paragraphs and rendered as a single
   * "Content" column table so the shared report renderer can produce the file.
   */
  async exportDocument(
    companyId: string,
    id: string,
    rawFormat?: string,
  ): Promise<GeneratedFile> {
    const doc = await this.findDocument(companyId, id);
    const format: ReportFormat = normalizeFormat(rawFormat);

    const rows = (doc.content ?? '')
      .split(/\n{2,}/)
      .map((para) => para.trim())
      .filter((para) => para.length > 0)
      .map((para, i) => ({ line: i + 1, content: para }));

    const buffer = await renderReport(
      {
        title: doc.title,
        subtitle: doc.customerName
          ? `Prepared for ${doc.customerName}`
          : undefined,
        columns: [
          { key: 'line', header: '#', width: 1, numeric: true },
          { key: 'content', header: 'Content', width: 12 },
        ],
        rows,
        generatedAt: doc.createdAt ?? new Date(),
        companyLabel: doc.documentType?.toUpperCase(),
      },
      format,
    );

    return {
      buffer,
      filename: `${safeFileName(doc.title)}.${fileExtensionFor(format)}`,
      contentType: contentTypeFor(format),
    };
  }

  private applyVariables(
    template: string,
    variables: Record<string, unknown>,
  ): string {
    return (template ?? '').replace(
      /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g,
      (_match, key: string) => {
        const value = variables[key];
        return value === undefined || value === null ? '' : String(value);
      },
    );
  }
}
