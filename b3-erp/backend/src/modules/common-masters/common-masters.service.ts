import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommonMastersService {
    constructor(private prisma: PrismaService) { }

    // ===========================
    // GENERIC CRUD HELPER METHODS
    // ===========================

    private async findByIdOrThrow<T>(model: any, id: string, modelName: string): Promise<T> {
        const record = await model.findUnique({ where: { id } });
        if (!record) {
            throw new NotFoundException(`${modelName} with id ${id} not found`);
        }
        return record;
    }

    // --- Currencies ---
    async findAllCurrencies() {
        return this.prisma.currency.findMany({
            where: { isActive: true },
            orderBy: { code: 'asc' },
        });
    }

    // --- Departments ---
    async findAllDepartments(companyId: string) {
        return this.prisma.department.findMany({
            where: { companyId },
            include: { branch: true },
            orderBy: { name: 'asc' },
        });
    }

    async createDepartment(data: { name: string; companyId: string; branchId?: string }) {
        return this.prisma.department.create({ data });
    }

    async updateDepartment(id: string, data: { name?: string; branchId?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.department, id, 'Department');
        return this.prisma.department.update({ where: { id }, data });
    }

    async deleteDepartment(id: string) {
        await this.findByIdOrThrow(this.prisma.department, id, 'Department');
        return this.prisma.department.delete({ where: { id } });
    }

    // --- Designations ---
    async findAllDesignations(companyId: string) {
        return this.prisma.designation.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
    }

    // --- Employee Masters ---
    async findAllEmployees(companyId: string) {
        return this.prisma.employee.findMany({
            where: { companyId, isActive: true },
            include: {
                designation: true,
                department: true,
                branch: true,
            },
            orderBy: { firstName: 'asc' },
        });
    }

    async findAllShifts(companyId: string) {
        return this.prisma.shift.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllHolidays(companyId: string) {
        return this.prisma.holiday.findMany({
            where: { companyId, isActive: true },
            orderBy: { date: 'asc' },
        });
    }

    // --- UOMs ---
    async findAllUoms(companyId: string) {
        return this.prisma.uom.findMany({
            where: { companyId },
            orderBy: { code: 'asc' },
        });
    }

    // --- Countries/States/Cities ---
    async findAllCountries() {
        return this.prisma.country.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
    }

    async findStatesByCountry(countryId: string) {
        return this.prisma.state.findMany({
            where: { countryId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findCitiesByState(stateId: string) {
        return this.prisma.city.findMany({
            where: { stateId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    // List-all variants for the state/city master pages (no parent filter).
    async findAllStates() {
        return this.prisma.state.findMany({
            include: { country: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllCities() {
        return this.prisma.city.findMany({
            include: { state: { include: { country: true } } },
            orderBy: { name: 'asc' },
        });
    }

    async findAllTerritories(companyId: string) {
        return this.prisma.territory.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    // --- Cost Centers ---
    async findAllCostCenters(companyId: string) {
        return this.prisma.costCenter.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
    }

    // --- Plants ---
    async findAllPlants(companyId: string) {
        return this.prisma.plant.findMany({
            where: { companyId },
            include: { branch: true },
            orderBy: { name: 'asc' },
        });
    }

    // --- Warehouses ---
    async findAllWarehouses(companyId: string) {
        return this.prisma.warehouse.findMany({
            where: { companyId },
            include: { branch: true },
            orderBy: { warehouseName: 'asc' },
        });
    }

    // --- Exchange Rates ---
    async findAllExchangeRates(companyId: string) {
        return this.prisma.exchangeRate.findMany({
            where: { companyId },
            include: { fromCurrency: true, toCurrency: true },
            orderBy: { effectiveDate: 'desc' },
        });
    }

    // --- Product & Item Masters ---
    async findAllBrands(companyId: string) {
        return this.prisma.brand.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
    }

    async findAllHsnSacs(companyId: string) {
        return this.prisma.hsnSac.findMany({
            where: { companyId },
            orderBy: { code: 'asc' },
        });
    }

    async findAllItemCategories(companyId: string) {
        return this.prisma.itemCategory.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
    }

    async findAllItemGroups(companyId: string) {
        return this.prisma.itemGroup.findMany({
            where: { companyId },
            include: { category: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllItems(companyId: string) {
        return this.prisma.item.findMany({
            where: { companyId },
            include: {
                category: true,
                group: true,
                uom: true,
                brand: true,
                hsnSac: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    // --- Stakeholder Masters ---
    async findAllCustomerCategories(companyId: string) {
        return this.prisma.customerCategory.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
    }

    async findAllCustomers(companyId: string) {
        return this.prisma.customer.findMany({
            where: { companyId },
            include: { category: true },
            orderBy: { customerName: 'asc' },
        });
    }

    async findAllVendorCategories(companyId: string) {
        return this.prisma.vendorCategory.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
    }

    async findAllVendors(companyId: string) {
        return this.prisma.vendor.findMany({
            where: { companyId },
            include: { category: true },
            orderBy: { vendorName: 'asc' },
        });
    }

    // --- Financial Masters ---
    async findAllAccounts(companyId: string) {
        return this.prisma.account.findMany({
            where: { companyId },
            orderBy: { accountCode: 'asc' },
        });
    }

    async findAllBankAccounts(companyId: string) {
        return this.prisma.bankAccount.findMany({
            where: { companyId },
            orderBy: { bankName: 'asc' },
        });
    }

    async findAllTaxes(companyId: string) {
        return this.prisma.tax.findMany({
            where: { companyId },
            orderBy: { taxCode: 'asc' },
        });
    }

    async findAllPaymentTerms(companyId: string) {
        return this.prisma.paymentTerm.findMany({
            where: { companyId },
            orderBy: { termCode: 'asc' },
        });
    }

    async findAllPriceLists(companyId: string) {
        return this.prisma.priceList.findMany({
            where: { companyId },
            include: { items: true },
            orderBy: { priceListCode: 'asc' },
        });
    }

    // --- Manufacturing Masters ---
    async findAllMachines(companyId: string) {
        return this.prisma.machine.findMany({
            where: { companyId, isActive: true },
            include: { workCenter: true },
            orderBy: { machineName: 'asc' },
        });
    }

    async findAllWorkCenters(companyId: string) {
        return this.prisma.workCenter.findMany({
            where: { companyId, isActive: true },
            include: {
                department: true,
                uom: true,
                machines: true,
                operations: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    async findAllOperations(companyId: string) {
        return this.prisma.operation.findMany({
            where: { companyId, isActive: true },
            include: { workCenter: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllRoutings(companyId: string) {
        return this.prisma.routing.findMany({
            where: { companyId, isActive: true },
            include: {
                item: true,
                steps: {
                    include: {
                        operation: true,
                        workCenter: true,
                    },
                    orderBy: { stepNumber: 'asc' },
                },
            },
            orderBy: { code: 'asc' },
        });
    }

    async findAllTools(companyId: string) {
        return this.prisma.tool.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllQualityParameters(companyId: string) {
        return this.prisma.qualityParameter.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllSkills(companyId: string) {
        return this.prisma.skill.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllBatches(companyId: string) {
        return this.prisma.batch.findMany({
            where: { companyId, isActive: true },
            include: { item: true },
            orderBy: { batchNumber: 'desc' },
        });
    }

    // --- Kitchen Manufacturing Masters ---
    async findAllCabinetTypes(companyId: string) {
        return this.prisma.cabinetType.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllKitchenHardware(companyId: string) {
        return this.prisma.kitchenHardware.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllKitchenFinishes(companyId: string) {
        return this.prisma.kitchenFinish.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllMaterialGrades(companyId: string) {
        return this.prisma.materialGrade.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllKitchenLayouts(companyId: string) {
        return this.prisma.kitchenLayout.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllInstallationTypes(companyId: string) {
        return this.prisma.installationType.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findAllKitchenAppliances(companyId: string) {
        return this.prisma.kitchenAppliance.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    // --- System Masters ---
    async findAllUsers(companyId: string) {
        return this.prisma.user.findMany({
            where: { companyId, isActive: true },
            include: {
                role: true,
                employee: {
                    include: {
                        designation: true,
                        department: true,
                    }
                }
            },
            orderBy: { username: 'asc' },
        });
    }

    async findAllRoles(companyId: string) {
        return this.prisma.role.findMany({
            where: { companyId, isActive: true },
            include: {
                permissions: true,
                users: true,
            },
            orderBy: { roleName: 'asc' },
        });
    }

    async findAllDocumentTypes(companyId: string) {
        return this.prisma.documentType.findMany({
            where: { companyId, isActive: true },
            orderBy: { typeName: 'asc' },
        });
    }

    async findAllNumberSeries(companyId: string) {
        return this.prisma.numberSeries.findMany({
            where: { companyId, isActive: true },
            orderBy: { seriesName: 'asc' },
        });
    }

    // ===========================
    // DESIGNATION CRUD
    // ===========================
    async createDesignation(data: { code: string; name: string; level?: number; grade?: string; companyId: string }) {
        return this.prisma.designation.create({ data });
    }

    async updateDesignation(id: string, data: { code?: string; name?: string; level?: number; grade?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.designation, id, 'Designation');
        return this.prisma.designation.update({ where: { id }, data });
    }

    async deleteDesignation(id: string) {
        await this.findByIdOrThrow(this.prisma.designation, id, 'Designation');
        return this.prisma.designation.delete({ where: { id } });
    }

    // ===========================
    // COST CENTER CRUD
    // ===========================
    async createCostCenter(data: { code: string; name: string; companyId: string }) {
        return this.prisma.costCenter.create({ data });
    }

    async updateCostCenter(id: string, data: { code?: string; name?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.costCenter, id, 'CostCenter');
        return this.prisma.costCenter.update({ where: { id }, data });
    }

    async deleteCostCenter(id: string) {
        await this.findByIdOrThrow(this.prisma.costCenter, id, 'CostCenter');
        return this.prisma.costCenter.delete({ where: { id } });
    }

    // ===========================
    // PLANT CRUD
    // ===========================
    async createPlant(data: { code: string; name: string; companyId: string; branchId?: string }) {
        return this.prisma.plant.create({ data });
    }

    async updatePlant(id: string, data: { code?: string; name?: string; branchId?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.plant, id, 'Plant');
        return this.prisma.plant.update({ where: { id }, data });
    }

    async deletePlant(id: string) {
        await this.findByIdOrThrow(this.prisma.plant, id, 'Plant');
        return this.prisma.plant.delete({ where: { id } });
    }

    // ===========================
    // WAREHOUSE CRUD
    // ===========================
    async createWarehouse(data: { code: string; name: string; companyId: string; branchId?: string; address?: string }) {
        return this.prisma.warehouse.create({
            data: {
                warehouseCode: data.code,
                warehouseName: data.name,
                companyId: data.companyId,
                branchId: data.branchId,
                address: data.address,
                status: 'Active',
            }
        });
    }

    async updateWarehouse(id: string, data: { code?: string; name?: string; branchId?: string; address?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.warehouse, id, 'Warehouse');
        return this.prisma.warehouse.update({
            where: { id },
            data: {
                warehouseCode: data.code,
                warehouseName: data.name,
                branchId: data.branchId,
                address: data.address,
                isActive: data.isActive,
            }
        });
    }

    async deleteWarehouse(id: string) {
        await this.findByIdOrThrow(this.prisma.warehouse, id, 'Warehouse');
        return this.prisma.warehouse.delete({ where: { id } });
    }

    // ===========================
    // UOM CRUD
    // ===========================
    async createUom(data: { code: string; name: string; companyId: string }) {
        return this.prisma.uom.create({ data });
    }

    async updateUom(id: string, data: { code?: string; name?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.uom, id, 'Uom');
        return this.prisma.uom.update({ where: { id }, data });
    }

    async deleteUom(id: string) {
        await this.findByIdOrThrow(this.prisma.uom, id, 'Uom');
        return this.prisma.uom.delete({ where: { id } });
    }

    // ===========================
    // ITEM CATEGORY CRUD
    // ===========================
    async createItemCategory(data: { name: string; companyId: string }) {
        return this.prisma.itemCategory.create({ data });
    }

    async updateItemCategory(id: string, data: { name?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.itemCategory, id, 'ItemCategory');
        return this.prisma.itemCategory.update({ where: { id }, data });
    }

    async deleteItemCategory(id: string) {
        await this.findByIdOrThrow(this.prisma.itemCategory, id, 'ItemCategory');
        return this.prisma.itemCategory.delete({ where: { id } });
    }

    // ===========================
    // ITEM GROUP CRUD
    // ===========================
    async createItemGroup(data: { name: string; categoryId: string; companyId: string }) {
        return this.prisma.itemGroup.create({ data });
    }

    async updateItemGroup(id: string, data: { name?: string; categoryId?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.itemGroup, id, 'ItemGroup');
        return this.prisma.itemGroup.update({ where: { id }, data });
    }

    async deleteItemGroup(id: string) {
        await this.findByIdOrThrow(this.prisma.itemGroup, id, 'ItemGroup');
        return this.prisma.itemGroup.delete({ where: { id } });
    }

    // ===========================
    // BRAND CRUD
    // ===========================
    async createBrand(data: { name: string; companyId: string }) {
        return this.prisma.brand.create({ data });
    }

    async updateBrand(id: string, data: { name?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.brand, id, 'Brand');
        return this.prisma.brand.update({ where: { id }, data });
    }

    async deleteBrand(id: string) {
        await this.findByIdOrThrow(this.prisma.brand, id, 'Brand');
        return this.prisma.brand.delete({ where: { id } });
    }

    // ===========================
    // HSN/SAC CRUD
    // ===========================
    async createHsnSac(data: { code: string; description?: string; gstPercentage?: number; companyId: string }) {
        return this.prisma.hsnSac.create({ data });
    }

    async updateHsnSac(id: string, data: { code?: string; description?: string; gstPercentage?: number; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.hsnSac, id, 'HsnSac');
        return this.prisma.hsnSac.update({ where: { id }, data });
    }

    async deleteHsnSac(id: string) {
        await this.findByIdOrThrow(this.prisma.hsnSac, id, 'HsnSac');
        return this.prisma.hsnSac.delete({ where: { id } });
    }

    // ===========================
    // ITEM CRUD
    // ===========================
    async createItem(data: {
        code: string; name: string; itemType: string; companyId: string;
        categoryId?: string; groupId?: string; uomId: string; brandId?: string;
        hsnSacId?: string; description?: string; purchasePrice?: number; sellingPrice?: number;
    }) {
        return this.prisma.item.create({ data });
    }

    async updateItem(id: string, data: {
        code?: string; name?: string; itemType?: string; categoryId?: string;
        groupId?: string; uomId?: string; brandId?: string; hsnSacId?: string;
        description?: string; purchasePrice?: number; sellingPrice?: number; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.item, id, 'Item');
        return this.prisma.item.update({ where: { id }, data });
    }

    async deleteItem(id: string) {
        await this.findByIdOrThrow(this.prisma.item, id, 'Item');
        return this.prisma.item.delete({ where: { id } });
    }

    // ===========================
    // CUSTOMER CATEGORY CRUD
    // ===========================
    async createCustomerCategory(data: {
        code: string; name: string; companyId: string;
        description?: string; color?: string; level?: string; classification?: string;
    }) {
        return this.prisma.customerCategory.create({ data });
    }

    async updateCustomerCategory(id: string, data: {
        code?: string; name?: string; description?: string; color?: string;
        level?: string; classification?: string; status?: string;
    }) {
        await this.findByIdOrThrow(this.prisma.customerCategory, id, 'CustomerCategory');
        return this.prisma.customerCategory.update({ where: { id }, data });
    }

    async deleteCustomerCategory(id: string) {
        await this.findByIdOrThrow(this.prisma.customerCategory, id, 'CustomerCategory');
        return this.prisma.customerCategory.delete({ where: { id } });
    }

    // ===========================
    // CUSTOMER CRUD
    // ===========================
    async createCustomer(data: {
        customerCode: string; customerName: string; companyId: string;
        customerType?: string; categoryId?: string; contactPerson?: string;
        email?: string; phone?: string;
    }) {
        return this.prisma.customer.create({ data });
    }

    async updateCustomer(id: string, data: {
        customerCode?: string; customerName?: string; customerType?: string;
        categoryId?: string; contactPerson?: string; email?: string;
        phone?: string; status?: string;
    }) {
        await this.findByIdOrThrow(this.prisma.customer, id, 'Customer');
        return this.prisma.customer.update({ where: { id }, data });
    }

    async deleteCustomer(id: string) {
        await this.findByIdOrThrow(this.prisma.customer, id, 'Customer');
        return this.prisma.customer.delete({ where: { id } });
    }

    // ===========================
    // VENDOR CATEGORY CRUD
    // ===========================
    async createVendorCategory(data: { name: string; description?: string; companyId: string }) {
        return this.prisma.vendorCategory.create({ data });
    }

    async updateVendorCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.vendorCategory, id, 'VendorCategory');
        return this.prisma.vendorCategory.update({ where: { id }, data });
    }

    async deleteVendorCategory(id: string) {
        await this.findByIdOrThrow(this.prisma.vendorCategory, id, 'VendorCategory');
        return this.prisma.vendorCategory.delete({ where: { id } });
    }

    // ===========================
    // VENDOR CRUD
    // ===========================
    async createVendor(data: {
        vendorCode: string; vendorName: string; companyId: string;
        vendorType?: string; categoryId?: string; contactPerson?: string;
        email?: string; phone?: string;
    }) {
        return this.prisma.vendor.create({ data });
    }

    async updateVendor(id: string, data: {
        vendorCode?: string; vendorName?: string; vendorType?: string;
        categoryId?: string; contactPerson?: string; email?: string;
        phone?: string; status?: string;
    }) {
        await this.findByIdOrThrow(this.prisma.vendor, id, 'Vendor');
        return this.prisma.vendor.update({ where: { id }, data });
    }

    async deleteVendor(id: string) {
        await this.findByIdOrThrow(this.prisma.vendor, id, 'Vendor');
        return this.prisma.vendor.delete({ where: { id } });
    }

    // ===========================
    // TAX CRUD
    // ===========================
    async createTax(data: {
        taxCode: string; taxName: string; taxType: string; rate: number;
        companyId: string; rateType?: string; description?: string;
    }) {
        return this.prisma.tax.create({ data });
    }

    async updateTax(id: string, data: {
        taxCode?: string; taxName?: string; taxType?: string;
        rate?: number; rateType?: string; description?: string; status?: string;
    }) {
        await this.findByIdOrThrow(this.prisma.tax, id, 'Tax');
        return this.prisma.tax.update({ where: { id }, data });
    }

    async deleteTax(id: string) {
        await this.findByIdOrThrow(this.prisma.tax, id, 'Tax');
        return this.prisma.tax.delete({ where: { id } });
    }

    // ===========================
    // PAYMENT TERMS CRUD
    // ===========================
    async createPaymentTerm(data: {
        termCode: string; termName: string; paymentType: string;
        companyId: string; dueDays?: number; description?: string;
    }) {
        return this.prisma.paymentTerm.create({ data });
    }

    async updatePaymentTerm(id: string, data: {
        termCode?: string; termName?: string; paymentType?: string;
        dueDays?: number; description?: string; status?: string;
    }) {
        await this.findByIdOrThrow(this.prisma.paymentTerm, id, 'PaymentTerm');
        return this.prisma.paymentTerm.update({ where: { id }, data });
    }

    async deletePaymentTerm(id: string) {
        await this.findByIdOrThrow(this.prisma.paymentTerm, id, 'PaymentTerm');
        return this.prisma.paymentTerm.delete({ where: { id } });
    }

    // ===========================
    // EMPLOYEE CRUD
    // ===========================
    async createEmployee(data: {
        employeeCode: string; firstName: string; lastName: string;
        companyId: string; designationId?: string; departmentId?: string;
        branchId?: string; email?: string; phone?: string;
    }) {
        return this.prisma.employee.create({ data });
    }

    async updateEmployee(id: string, data: {
        employeeCode?: string; firstName?: string; lastName?: string;
        designationId?: string; departmentId?: string; branchId?: string;
        email?: string; phone?: string; status?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.employee, id, 'Employee');
        return this.prisma.employee.update({ where: { id }, data });
    }

    async deleteEmployee(id: string) {
        await this.findByIdOrThrow(this.prisma.employee, id, 'Employee');
        return this.prisma.employee.delete({ where: { id } });
    }

    // ===========================
    // SHIFT CRUD
    // ===========================
    async createShift(data: { code: string; name: string; companyId: string; startTime?: string; endTime?: string }) {
        return this.prisma.shift.create({ data });
    }

    async updateShift(id: string, data: { code?: string; name?: string; startTime?: string; endTime?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.shift, id, 'Shift');
        return this.prisma.shift.update({ where: { id }, data });
    }

    async deleteShift(id: string) {
        await this.findByIdOrThrow(this.prisma.shift, id, 'Shift');
        return this.prisma.shift.delete({ where: { id } });
    }

    // ===========================
    // MACHINE CRUD
    // ===========================
    async createMachine(data: {
        machineCode: string; machineName: string; companyId: string;
        description?: string; category?: string; manufacturer?: string;
        model?: string; workCenterId?: string;
    }) {
        return this.prisma.machine.create({ data });
    }

    async updateMachine(id: string, data: {
        machineCode?: string; machineName?: string; description?: string;
        category?: string; manufacturer?: string; model?: string;
        workCenterId?: string; status?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.machine, id, 'Machine');
        return this.prisma.machine.update({ where: { id }, data });
    }

    async deleteMachine(id: string) {
        await this.findByIdOrThrow(this.prisma.machine, id, 'Machine');
        return this.prisma.machine.delete({ where: { id } });
    }

    // ===========================
    // WORK CENTER CRUD
    // ===========================
    async createWorkCenter(data: {
        code: string; name: string; companyId: string;
        type?: string; departmentId?: string; location?: string;
        dailyCapacity?: number; uomId?: string;
    }) {
        return this.prisma.workCenter.create({ data });
    }

    async updateWorkCenter(id: string, data: {
        code?: string; name?: string; type?: string; departmentId?: string;
        location?: string; dailyCapacity?: number; uomId?: string;
        efficiency?: number; status?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.workCenter, id, 'WorkCenter');
        return this.prisma.workCenter.update({ where: { id }, data });
    }

    async deleteWorkCenter(id: string) {
        await this.findByIdOrThrow(this.prisma.workCenter, id, 'WorkCenter');
        return this.prisma.workCenter.delete({ where: { id } });
    }

    // ===========================
    // OPERATION CRUD
    // ===========================
    async createOperation(data: {
        code: string; name: string; workCenterId: string; companyId: string;
        description?: string; setupTime?: number; runTime?: number;
    }) {
        return this.prisma.operation.create({ data });
    }

    async updateOperation(id: string, data: {
        code?: string; name?: string; workCenterId?: string;
        description?: string; setupTime?: number; runTime?: number; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.operation, id, 'Operation');
        return this.prisma.operation.update({ where: { id }, data });
    }

    async deleteOperation(id: string) {
        await this.findByIdOrThrow(this.prisma.operation, id, 'Operation');
        return this.prisma.operation.delete({ where: { id } });
    }

    // ===========================
    // TOOL CRUD
    // ===========================
    async createTool(data: { code: string; name: string; companyId: string; description?: string; category?: string }) {
        return this.prisma.tool.create({ data });
    }

    async updateTool(id: string, data: { code?: string; name?: string; description?: string; category?: string; status?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.tool, id, 'Tool');
        return this.prisma.tool.update({ where: { id }, data });
    }

    async deleteTool(id: string) {
        await this.findByIdOrThrow(this.prisma.tool, id, 'Tool');
        return this.prisma.tool.delete({ where: { id } });
    }

    // ===========================
    // QUALITY PARAMETER CRUD
    // ===========================
    async createQualityParameter(data: {
        code: string; name: string; companyId: string;
        description?: string; unit?: string; minValue?: number;
        maxValue?: number; targetValue?: number;
    }) {
        return this.prisma.qualityParameter.create({ data });
    }

    async updateQualityParameter(id: string, data: {
        code?: string; name?: string; description?: string;
        unit?: string; minValue?: number; maxValue?: number;
        targetValue?: number; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.qualityParameter, id, 'QualityParameter');
        return this.prisma.qualityParameter.update({ where: { id }, data });
    }

    async deleteQualityParameter(id: string) {
        await this.findByIdOrThrow(this.prisma.qualityParameter, id, 'QualityParameter');
        return this.prisma.qualityParameter.delete({ where: { id } });
    }

    // ===========================
    // TERRITORY CRUD
    // ===========================
    async createTerritory(data: { code: string; name: string; companyId: string }) {
        return this.prisma.territory.create({ data });
    }

    async updateTerritory(id: string, data: { code?: string; name?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.territory, id, 'Territory');
        return this.prisma.territory.update({ where: { id }, data });
    }

    async deleteTerritory(id: string) {
        await this.findByIdOrThrow(this.prisma.territory, id, 'Territory');
        return this.prisma.territory.delete({ where: { id } });
    }

    // ===========================
    // COMPANY CRUD
    // ===========================
    async findAllCompanies() {
        return this.prisma.company.findMany({
            include: { baseCurrency: true },
            orderBy: { name: 'asc' },
        });
    }

    async findCompanyById(id: string) {
        return this.findByIdOrThrow(this.prisma.company, id, 'Company');
    }

    async createCompany(data: {
        name: string; taxId: string; registrationNumber?: string;
        baseCurrencyId?: string; logoUrl?: string; address?: string;
        email?: string; phone?: string;
    }) {
        return this.prisma.company.create({ data });
    }

    async updateCompany(id: string, data: {
        name?: string; taxId?: string; registrationNumber?: string;
        baseCurrencyId?: string; logoUrl?: string; address?: string;
        email?: string; phone?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.company, id, 'Company');
        return this.prisma.company.update({ where: { id }, data });
    }

    async deleteCompany(id: string) {
        await this.findByIdOrThrow(this.prisma.company, id, 'Company');
        return this.prisma.company.delete({ where: { id } });
    }

    // ===========================
    // BRANCH CRUD
    // ===========================
    async findAllBranches(companyId: string) {
        return this.prisma.branch.findMany({
            where: { companyId },
            include: { city: { include: { state: { include: { country: true } } } } },
            orderBy: { name: 'asc' },
        });
    }

    async findBranchById(id: string) {
        return this.findByIdOrThrow(this.prisma.branch, id, 'Branch');
    }

    async createBranch(data: {
        name: string; companyId: string; cityId?: string; address?: string;
    }) {
        return this.prisma.branch.create({ data });
    }

    async updateBranch(id: string, data: {
        name?: string; cityId?: string; address?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.branch, id, 'Branch');
        return this.prisma.branch.update({ where: { id }, data });
    }

    async deleteBranch(id: string) {
        await this.findByIdOrThrow(this.prisma.branch, id, 'Branch');
        return this.prisma.branch.delete({ where: { id } });
    }

    // ===========================
    // CURRENCY CRUD
    // ===========================
    async createCurrency(data: {
        code: string; name: string; symbol: string; decimalDigits?: number;
    }) {
        return this.prisma.currency.create({ data });
    }

    async updateCurrency(id: string, data: {
        code?: string; name?: string; symbol?: string;
        decimalDigits?: number; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.currency, id, 'Currency');
        return this.prisma.currency.update({ where: { id }, data });
    }

    async deleteCurrency(id: string) {
        await this.findByIdOrThrow(this.prisma.currency, id, 'Currency');
        return this.prisma.currency.delete({ where: { id } });
    }

    // ===========================
    // EXCHANGE RATE CRUD
    // ===========================
    async createExchangeRate(data: {
        fromCurrencyId: string; toCurrencyId: string; rate: number;
        effectiveDate: Date; companyId: string;
    }) {
        return this.prisma.exchangeRate.create({ data });
    }

    async updateExchangeRate(id: string, data: {
        rate?: number; effectiveDate?: Date; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.exchangeRate, id, 'ExchangeRate');
        return this.prisma.exchangeRate.update({ where: { id }, data });
    }

    async deleteExchangeRate(id: string) {
        await this.findByIdOrThrow(this.prisma.exchangeRate, id, 'ExchangeRate');
        return this.prisma.exchangeRate.delete({ where: { id } });
    }

    // ===========================
    // UOM CONVERSION CRUD
    // ===========================
    async findAllUomConversions(companyId: string) {
        return this.prisma.uomConversion.findMany({
            where: { companyId },
            include: { fromUom: true, toUom: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createUomConversion(data: {
        fromUomId: string; toUomId: string; factor: number; companyId: string;
    }) {
        return this.prisma.uomConversion.create({ data });
    }

    async updateUomConversion(id: string, data: {
        factor?: number;
    }) {
        await this.findByIdOrThrow(this.prisma.uomConversion, id, 'UomConversion');
        return this.prisma.uomConversion.update({ where: { id }, data });
    }

    async deleteUomConversion(id: string) {
        await this.findByIdOrThrow(this.prisma.uomConversion, id, 'UomConversion');
        return this.prisma.uomConversion.delete({ where: { id } });
    }

    // ===========================
    // BARCODE CRUD
    // ===========================
    async findAllBarcodes(companyId: string) {
        return this.prisma.barcode.findMany({
            where: { companyId },
            include: { item: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createBarcode(data: {
        code: string; itemId: string; companyId: string;
    }) {
        return this.prisma.barcode.create({ data });
    }

    async updateBarcode(id: string, data: {
        code?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.barcode, id, 'Barcode');
        return this.prisma.barcode.update({ where: { id }, data });
    }

    async deleteBarcode(id: string) {
        await this.findByIdOrThrow(this.prisma.barcode, id, 'Barcode');
        return this.prisma.barcode.delete({ where: { id } });
    }

    // ===========================
    // ACCOUNT CRUD
    // ===========================
    async createAccount(data: {
        accountCode: string; accountName: string; accountType: string;
        companyId: string; parentAccountId?: string; description?: string;
    }) {
        return this.prisma.account.create({ data });
    }

    async updateAccount(id: string, data: {
        accountCode?: string; accountName?: string; accountType?: string;
        parentAccountId?: string; description?: string; status?: string;
    }) {
        await this.findByIdOrThrow(this.prisma.account, id, 'Account');
        return this.prisma.account.update({ where: { id }, data });
    }

    async deleteAccount(id: string) {
        await this.findByIdOrThrow(this.prisma.account, id, 'Account');
        return this.prisma.account.delete({ where: { id } });
    }

    // ===========================
    // BANK ACCOUNT CRUD
    // ===========================
    async createBankAccount(data: {
        accountNumber: string; bankName: string; accountType: string;
        ifscCode: string; accountHolderName: string; companyId: string;
        branchName?: string; currency?: string;
    }) {
        return this.prisma.bankAccount.create({ data });
    }

    async updateBankAccount(id: string, data: {
        accountNumber?: string; bankName?: string; branchName?: string;
        ifscCode?: string; accountType?: string; accountHolderName?: string;
        currency?: string; status?: string;
    }) {
        await this.findByIdOrThrow(this.prisma.bankAccount, id, 'BankAccount');
        return this.prisma.bankAccount.update({ where: { id }, data });
    }

    async deleteBankAccount(id: string) {
        await this.findByIdOrThrow(this.prisma.bankAccount, id, 'BankAccount');
        return this.prisma.bankAccount.delete({ where: { id } });
    }

    // ===========================
    // PRICE LIST CRUD
    // ===========================
    async createPriceList(data: {
        priceListCode: string; priceListName: string; effectiveFrom: Date;
        companyId: string; description?: string; effectiveTo?: Date;
        currency?: string; customerCategory?: string;
    }) {
        return this.prisma.priceList.create({ data });
    }

    async updatePriceList(id: string, data: {
        priceListCode?: string; priceListName?: string; description?: string;
        effectiveFrom?: Date; effectiveTo?: Date; currency?: string;
        customerCategory?: string; status?: string;
    }) {
        await this.findByIdOrThrow(this.prisma.priceList, id, 'PriceList');
        return this.prisma.priceList.update({ where: { id }, data });
    }

    async deletePriceList(id: string) {
        await this.findByIdOrThrow(this.prisma.priceList, id, 'PriceList');
        return this.prisma.priceList.delete({ where: { id } });
    }

    // ===========================
    // SKILL CRUD
    // ===========================
    async createSkill(data: {
        code: string; name: string; companyId: string;
        description?: string; category?: string;
    }) {
        return this.prisma.skill.create({ data });
    }

    async updateSkill(id: string, data: {
        code?: string; name?: string; description?: string;
        category?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.skill, id, 'Skill');
        return this.prisma.skill.update({ where: { id }, data });
    }

    async deleteSkill(id: string) {
        await this.findByIdOrThrow(this.prisma.skill, id, 'Skill');
        return this.prisma.skill.delete({ where: { id } });
    }

    // ===========================
    // HOLIDAY CRUD
    // ===========================
    async createHoliday(data: {
        name: string; date: Date; companyId: string;
        type?: string; description?: string;
    }) {
        return this.prisma.holiday.create({ data });
    }

    async updateHoliday(id: string, data: {
        name?: string; date?: Date; type?: string;
        description?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.holiday, id, 'Holiday');
        return this.prisma.holiday.update({ where: { id }, data });
    }

    async deleteHoliday(id: string) {
        await this.findByIdOrThrow(this.prisma.holiday, id, 'Holiday');
        return this.prisma.holiday.delete({ where: { id } });
    }

    // ===========================
    // CABINET TYPE CRUD
    // ===========================
    async createCabinetType(data: {
        code: string; name: string; category: string; companyId: string;
        subcategory?: string; depth?: number; height?: number;
    }) {
        return this.prisma.cabinetType.create({ data });
    }

    async updateCabinetType(id: string, data: {
        code?: string; name?: string; category?: string;
        subcategory?: string; depth?: number; height?: number; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.cabinetType, id, 'CabinetType');
        return this.prisma.cabinetType.update({ where: { id }, data });
    }

    async deleteCabinetType(id: string) {
        await this.findByIdOrThrow(this.prisma.cabinetType, id, 'CabinetType');
        return this.prisma.cabinetType.delete({ where: { id } });
    }

    // ===========================
    // KITCHEN HARDWARE CRUD
    // ===========================
    async createKitchenHardware(data: {
        code: string; name: string; category: string; companyId: string;
        subcategory?: string; brand?: string; warranty?: string;
    }) {
        return this.prisma.kitchenHardware.create({ data });
    }

    async updateKitchenHardware(id: string, data: {
        code?: string; name?: string; category?: string;
        subcategory?: string; brand?: string; warranty?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.kitchenHardware, id, 'KitchenHardware');
        return this.prisma.kitchenHardware.update({ where: { id }, data });
    }

    async deleteKitchenHardware(id: string) {
        await this.findByIdOrThrow(this.prisma.kitchenHardware, id, 'KitchenHardware');
        return this.prisma.kitchenHardware.delete({ where: { id } });
    }

    // ===========================
    // KITCHEN FINISH CRUD
    // ===========================
    async createKitchenFinish(data: {
        code: string; name: string; category: string; companyId: string;
        subcategory?: string; pricePerUnit?: number; maintenance?: string;
    }) {
        return this.prisma.kitchenFinish.create({ data });
    }

    async updateKitchenFinish(id: string, data: {
        code?: string; name?: string; category?: string;
        subcategory?: string; pricePerUnit?: number; maintenance?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.kitchenFinish, id, 'KitchenFinish');
        return this.prisma.kitchenFinish.update({ where: { id }, data });
    }

    async deleteKitchenFinish(id: string) {
        await this.findByIdOrThrow(this.prisma.kitchenFinish, id, 'KitchenFinish');
        return this.prisma.kitchenFinish.delete({ where: { id } });
    }

    // ===========================
    // MATERIAL GRADE CRUD
    // ===========================
    async createMaterialGrade(data: {
        code: string; name: string; category: string; grade: string; companyId: string;
        pricePerUnit?: number; warranty?: string;
    }) {
        return this.prisma.materialGrade.create({ data });
    }

    async updateMaterialGrade(id: string, data: {
        code?: string; name?: string; category?: string; grade?: string;
        pricePerUnit?: number; warranty?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.materialGrade, id, 'MaterialGrade');
        return this.prisma.materialGrade.update({ where: { id }, data });
    }

    async deleteMaterialGrade(id: string) {
        await this.findByIdOrThrow(this.prisma.materialGrade, id, 'MaterialGrade');
        return this.prisma.materialGrade.delete({ where: { id } });
    }

    // ===========================
    // KITCHEN LAYOUT CRUD
    // ===========================
    async createKitchenLayout(data: {
        code: string; name: string; layoutType: string; style: string; companyId: string;
        estimatedCost?: number;
    }) {
        return this.prisma.kitchenLayout.create({ data });
    }

    async updateKitchenLayout(id: string, data: {
        code?: string; name?: string; layoutType?: string; style?: string;
        estimatedCost?: number; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.kitchenLayout, id, 'KitchenLayout');
        return this.prisma.kitchenLayout.update({ where: { id }, data });
    }

    async deleteKitchenLayout(id: string) {
        await this.findByIdOrThrow(this.prisma.kitchenLayout, id, 'KitchenLayout');
        return this.prisma.kitchenLayout.delete({ where: { id } });
    }

    // ===========================
    // INSTALLATION TYPE CRUD
    // ===========================
    async createInstallationType(data: {
        code: string; name: string; category: string; complexity: string; companyId: string;
        warranty?: string;
    }) {
        return this.prisma.installationType.create({ data });
    }

    async updateInstallationType(id: string, data: {
        code?: string; name?: string; category?: string; complexity?: string;
        warranty?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.installationType, id, 'InstallationType');
        return this.prisma.installationType.update({ where: { id }, data });
    }

    async deleteInstallationType(id: string) {
        await this.findByIdOrThrow(this.prisma.installationType, id, 'InstallationType');
        return this.prisma.installationType.delete({ where: { id } });
    }

    // ===========================
    // KITCHEN APPLIANCE CRUD
    // ===========================
    async createKitchenAppliance(data: {
        code: string; name: string; category: string; companyId: string;
        subcategory?: string; brand?: string; model?: string; price?: number;
    }) {
        return this.prisma.kitchenAppliance.create({ data });
    }

    async updateKitchenAppliance(id: string, data: {
        code?: string; name?: string; category?: string; subcategory?: string;
        brand?: string; model?: string; price?: number; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.kitchenAppliance, id, 'KitchenAppliance');
        return this.prisma.kitchenAppliance.update({ where: { id }, data });
    }

    async deleteKitchenAppliance(id: string) {
        await this.findByIdOrThrow(this.prisma.kitchenAppliance, id, 'KitchenAppliance');
        return this.prisma.kitchenAppliance.delete({ where: { id } });
    }

    // ===========================
    // COUNTER MATERIAL CRUD
    // ===========================
    async findAllCounterMaterials(companyId: string) {
        return this.prisma.counterMaterial.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async createCounterMaterial(data: {
        code: string; name: string; materialType: string; companyId: string;
        category?: string; thickness?: string[]; colors?: string[]; finishes?: string[];
        durability?: string; heatResistance?: string; stainResistance?: string;
        scratchResistance?: string; pricePerSqFt?: number; minimumOrderSqFt?: number;
        leadTimeDays?: number; specifications?: any; careInstructions?: string;
        warranty?: string; supplier?: string; origin?: string; certification?: string[];
    }) {
        return this.prisma.counterMaterial.create({ data });
    }

    async updateCounterMaterial(id: string, data: {
        code?: string; name?: string; materialType?: string; category?: string;
        thickness?: string[]; colors?: string[]; finishes?: string[];
        durability?: string; heatResistance?: string; stainResistance?: string;
        scratchResistance?: string; pricePerSqFt?: number; minimumOrderSqFt?: number;
        leadTimeDays?: number; specifications?: any; careInstructions?: string;
        warranty?: string; supplier?: string; origin?: string; certification?: string[];
        status?: string; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.counterMaterial, id, 'CounterMaterial');
        return this.prisma.counterMaterial.update({ where: { id }, data });
    }

    async deleteCounterMaterial(id: string) {
        await this.findByIdOrThrow(this.prisma.counterMaterial, id, 'CounterMaterial');
        return this.prisma.counterMaterial.delete({ where: { id } });
    }

    // ===========================
    // DOCUMENT TYPE CRUD
    // ===========================
    async createDocumentType(data: {
        typeCode: string; typeName: string; category: string; companyId: string;
        description?: string; isMandatory?: boolean;
    }) {
        return this.prisma.documentType.create({ data });
    }

    async updateDocumentType(id: string, data: {
        typeCode?: string; typeName?: string; category?: string;
        description?: string; isMandatory?: boolean; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.documentType, id, 'DocumentType');
        return this.prisma.documentType.update({ where: { id }, data });
    }

    async deleteDocumentType(id: string) {
        await this.findByIdOrThrow(this.prisma.documentType, id, 'DocumentType');
        return this.prisma.documentType.delete({ where: { id } });
    }

    // ===========================
    // NUMBER SERIES CRUD
    // ===========================
    async createNumberSeries(data: {
        seriesCode: string; seriesName: string; documentType: string;
        module: string; companyId: string; prefix?: string; currentNumber?: number;
    }) {
        return this.prisma.numberSeries.create({ data });
    }

    async updateNumberSeries(id: string, data: {
        seriesCode?: string; seriesName?: string; documentType?: string;
        module?: string; prefix?: string; currentNumber?: number; isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.numberSeries, id, 'NumberSeries');
        return this.prisma.numberSeries.update({ where: { id }, data });
    }

    async deleteNumberSeries(id: string) {
        await this.findByIdOrThrow(this.prisma.numberSeries, id, 'NumberSeries');
        return this.prisma.numberSeries.delete({ where: { id } });
    }

    // ===========================
    // GEOGRAPHIC CRUD (Country, State, City)
    // ===========================
    async createCountry(data: { code: string; name: string; currency?: string; phoneCode?: string }) {
        return this.prisma.country.create({ data });
    }

    async updateCountry(id: string, data: { code?: string; name?: string; currency?: string; phoneCode?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.country, id, 'Country');
        return this.prisma.country.update({ where: { id }, data });
    }

    async deleteCountry(id: string) {
        await this.findByIdOrThrow(this.prisma.country, id, 'Country');
        return this.prisma.country.delete({ where: { id } });
    }

    async createState(data: { code: string; name: string; countryId: string }) {
        return this.prisma.state.create({ data });
    }

    async updateState(id: string, data: { code?: string; name?: string; countryId?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.state, id, 'State');
        return this.prisma.state.update({ where: { id }, data });
    }

    async deleteState(id: string) {
        await this.findByIdOrThrow(this.prisma.state, id, 'State');
        return this.prisma.state.delete({ where: { id } });
    }

    async createCity(data: { name: string; stateId: string; pincode?: string }) {
        return this.prisma.city.create({ data });
    }

    async updateCity(id: string, data: { name?: string; stateId?: string; pincode?: string; isActive?: boolean }) {
        await this.findByIdOrThrow(this.prisma.city, id, 'City');
        return this.prisma.city.update({ where: { id }, data });
    }

    async deleteCity(id: string) {
        await this.findByIdOrThrow(this.prisma.city, id, 'City');
        return this.prisma.city.delete({ where: { id } });
    }

    // --- HR Grades (grade-master page) ---
    async findAllHrGrades(companyId: string) {
        return this.prisma.hrGrade.findMany({
            where: { companyId, isActive: true },
            orderBy: { level: 'asc' },
        });
    }

    async createHrGrade(data: {
        gradeCode: string;
        gradeName: string;
        companyId: string;
        level?: number;
        category?: string;
        minSalary?: number;
        maxSalary?: number;
        currency?: string;
        benefits?: any;
        leaveEntitlement?: any;
        perks?: string[];
        probationPeriod?: number;
        noticePeriod?: number;
        appraisalCycle?: string;
        eligibleDesignations?: string[];
        description?: string;
    }) {
        return this.prisma.hrGrade.create({ data });
    }

    async updateHrGrade(id: string, data: {
        gradeCode?: string;
        gradeName?: string;
        level?: number;
        category?: string;
        minSalary?: number;
        maxSalary?: number;
        currency?: string;
        benefits?: any;
        leaveEntitlement?: any;
        perks?: string[];
        probationPeriod?: number;
        noticePeriod?: number;
        appraisalCycle?: string;
        eligibleDesignations?: string[];
        description?: string;
        isActive?: boolean;
    }) {
        await this.findByIdOrThrow(this.prisma.hrGrade, id, 'HrGrade');
        return this.prisma.hrGrade.update({ where: { id }, data });
    }

    async deleteHrGrade(id: string) {
        await this.findByIdOrThrow(this.prisma.hrGrade, id, 'HrGrade');
        return this.prisma.hrGrade.delete({ where: { id } });
    }

}
