import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportTemplate } from '../entities/export-template.entity';

// Static column-schema mapping per dataset. Backs the database/import page's
// column-mapping preview. Computed/static (no table): the source columns are a
// sensible default mapping for the given target dataset.
const IMPORT_COLUMN_SCHEMAS: Record<
  string,
  Array<{
    sourceColumn: string;
    targetColumn: string;
    dataType: string;
    required: boolean;
  }>
> = {
  customers: [
    { sourceColumn: 'customer_name', targetColumn: 'name', dataType: 'string', required: true },
    { sourceColumn: 'email_address', targetColumn: 'email', dataType: 'string', required: true },
    { sourceColumn: 'phone', targetColumn: 'phone', dataType: 'string', required: false },
    { sourceColumn: 'company', targetColumn: 'company_name', dataType: 'string', required: false },
    { sourceColumn: 'address', targetColumn: 'address', dataType: 'text', required: false },
    { sourceColumn: 'tax_id', targetColumn: 'tax_number', dataType: 'string', required: false },
  ],
  users: [
    { sourceColumn: 'full_name', targetColumn: 'name', dataType: 'string', required: true },
    { sourceColumn: 'email', targetColumn: 'email', dataType: 'string', required: true },
    { sourceColumn: 'department', targetColumn: 'department', dataType: 'string', required: false },
    { sourceColumn: 'role', targetColumn: 'role', dataType: 'string', required: false },
  ],
  products: [
    { sourceColumn: 'sku', targetColumn: 'sku', dataType: 'string', required: true },
    { sourceColumn: 'product_name', targetColumn: 'name', dataType: 'string', required: true },
    { sourceColumn: 'unit_price', targetColumn: 'price', dataType: 'number', required: false },
    { sourceColumn: 'category', targetColumn: 'category', dataType: 'string', required: false },
  ],
  inventory: [
    { sourceColumn: 'sku', targetColumn: 'sku', dataType: 'string', required: true },
    { sourceColumn: 'warehouse', targetColumn: 'warehouse_id', dataType: 'string', required: true },
    { sourceColumn: 'quantity', targetColumn: 'quantity', dataType: 'number', required: true },
  ],
  suppliers: [
    { sourceColumn: 'supplier_name', targetColumn: 'name', dataType: 'string', required: true },
    { sourceColumn: 'email', targetColumn: 'email', dataType: 'string', required: false },
    { sourceColumn: 'phone', targetColumn: 'phone', dataType: 'string', required: false },
  ],
  sales_orders: [
    { sourceColumn: 'order_number', targetColumn: 'order_number', dataType: 'string', required: true },
    { sourceColumn: 'customer', targetColumn: 'customer_id', dataType: 'string', required: true },
    { sourceColumn: 'total', targetColumn: 'total_amount', dataType: 'number', required: false },
    { sourceColumn: 'status', targetColumn: 'status', dataType: 'string', required: false },
  ],
};

@Injectable()
export class ExportTemplateService {
  constructor(
    @InjectRepository(ExportTemplate)
    private readonly repository: Repository<ExportTemplate>,
  ) {}

  private defaults(): Partial<ExportTemplate>[] {
    return [
      { name: 'Sales Report', description: 'Export all sales-related data', format: 'excel', dataset: 'sales', tables: ['sales_orders', 'quotations', 'invoices', 'customers'], filters: ['date_range', 'status'] },
      { name: 'Production Data', description: 'Work orders, BOM, and quality data', format: 'csv', dataset: 'production', tables: ['work_orders', 'bom', 'quality_checks'], filters: ['date_range'] },
      { name: 'Inventory Snapshot', description: 'Current inventory and movements', format: 'json', dataset: 'inventory', tables: ['inventory', 'stock_movements', 'warehouses'], filters: [] },
      { name: 'Full Database Dump', description: 'Complete database export with schema', format: 'sql', dataset: 'all', tables: ['*'], filters: [] },
    ];
  }

  private async ensureSeeded(companyId?: string): Promise<void> {
    const count = await this.repository.count(
      companyId ? { where: { companyId } } : {},
    );
    if (count > 0) return;
    await this.repository.save(
      this.defaults().map((d) => this.repository.create({ ...d, companyId })),
    );
  }

  async findAll(filters?: {
    companyId?: string;
    dataset?: string;
  }): Promise<ExportTemplate[]> {
    await this.ensureSeeded(filters?.companyId);
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.dataset && filters.dataset !== 'all')
      where.dataset = filters.dataset;
    return this.repository.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<ExportTemplate> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Export template ${id} not found`);
    return item;
  }

  async create(data: Partial<ExportTemplate>): Promise<ExportTemplate> {
    return this.repository.save(this.repository.create(data));
  }

  async update(
    id: string,
    data: Partial<ExportTemplate>,
  ): Promise<ExportTemplate> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  // Stamps lastUsedAt and returns the template so the UI can apply its selection.
  async apply(id: string): Promise<ExportTemplate> {
    const item = await this.findOne(id);
    item.lastUsedAt = new Date();
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }

  // Static column schema for a target dataset (no DB access). Empty array when
  // the dataset is unknown — never fabricated for arbitrary tables.
  columnSchema(dataset: string): Array<{
    sourceColumn: string;
    targetColumn: string;
    dataType: string;
    required: boolean;
  }> {
    return IMPORT_COLUMN_SCHEMAS[dataset] ?? [];
  }
}
