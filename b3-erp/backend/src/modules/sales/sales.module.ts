import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../core/entities/item.entity';
import { TaxMaster } from '../finance/entities/tax.entity';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { DiscountController } from './controllers/discount.controller';
import { OrderController } from './controllers/order.controller';
import { QuotationController } from './controllers/quotation.controller';
import { SalesAnalyticsController } from './controllers/sales-analytics.controller';
import { SalesMastersController } from './controllers/sales-masters.controller';
import { ShippingMethodController } from './controllers/shipping-method.controller';
import { TaxRateController } from './controllers/tax-rate.controller';
import { Discount } from './entities/discount.entity';
import { PaymentTerms } from './entities/payment-terms.entity';
import { Quotation, QuotationItem } from './entities/quotation.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { TermsTemplate } from './entities/terms-template.entity';
import { Promotion } from './entities/promotion.entity';
import { SpecialPrice } from './entities/special-price.entity';
import { TermsTemplateController } from './controllers/terms-template.controller';
import { PromotionController } from './controllers/promotion.controller';
import { SpecialPriceController } from './controllers/special-price.controller';
import { TermsTemplateService } from './services/terms-template.service';
import { PromotionService } from './services/promotion.service';
import { SpecialPriceService } from './services/special-price.service';
import { PriceListItem } from './entities/price-list-item.entity';
import { SalesTarget } from './entities/sales-target.entity';
import { SalesReport } from './entities/sales-report.entity';
import { PriceListItemController } from './controllers/price-list-item.controller';
import { SalesTargetController } from './controllers/sales-target.controller';
import { SalesReportController } from './controllers/sales-report.controller';
import { PriceListItemService } from './services/price-list-item.service';
import { SalesTargetService } from './services/sales-target.service';
import { SalesReportService } from './services/sales-report.service';
import { RFPController } from './rfp.controller';
import { RFPService } from './rfp.service';
import { ApprovalWorkflowService } from './services/approval-workflow.service';
import { DiscountService } from './services/discount.service';
import { SalesAnalyticsService } from './services/sales-analytics.service';
import { ShippingMethodService } from './services/shipping-method.service';
import { TaxRateService } from './services/tax-rate.service';
import { BOQValidationService } from './services/boq-validation.service';
import { Customer360Service } from './services/customer-360.service';
import { InformationRequestService } from './services/information-request.service';
import { OrderService } from './services/order.service';
import { PaymentTermsSeederService } from './services/payment-terms-seeder.service';
import { PricingService } from './services/pricing.service';
import { QuotationService } from './services/quotation.service';
import { SalesMastersService } from './services/sales-masters.service';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([
      PaymentTerms,
      Quotation,
      QuotationItem,
      Item,
      TaxMaster,
      Discount,
      ShippingMethod,
      TaxRate,
      TermsTemplate,
      Promotion,
      SpecialPrice,
      PriceListItem,
      SalesTarget,
      SalesReport,
    ]),
    forwardRef(() => WorkflowModule),
  ],
  controllers: [
    RFPController,
    OrderController,
    QuotationController,
    SalesMastersController,
    DiscountController,
    SalesAnalyticsController,
    SalesTargetController,
    SalesReportController,
    ShippingMethodController,
    TaxRateController,
    TermsTemplateController,
    PromotionController,
    SpecialPriceController,
    PriceListItemController,
  ],
  providers: [
    RFPService,
    OrderService,
    QuotationService,
    SalesMastersService,
    ApprovalWorkflowService,
    PricingService,
    BOQValidationService,
    Customer360Service,
    InformationRequestService,
    PaymentTermsSeederService,
    DiscountService,
    SalesAnalyticsService,
    ShippingMethodService,
    TaxRateService,
    TermsTemplateService,
    PromotionService,
    SpecialPriceService,
    PriceListItemService,
    SalesTargetService,
    SalesReportService,
  ],
  exports: [
    RFPService,
    OrderService,
    QuotationService,
    SalesMastersService,
    ApprovalWorkflowService,
    PricingService,
    BOQValidationService,
    Customer360Service,
    InformationRequestService,
  ],
})
export class SalesModule {}
