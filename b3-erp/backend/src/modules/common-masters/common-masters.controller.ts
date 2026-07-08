import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CommonMastersService } from './common-masters.service';

@Controller('common-masters')
export class CommonMastersController {
    constructor(private readonly commonMastersService: CommonMastersService) { }

    // ===========================
    // BULK CSV IMPORT
    // Generic endpoint: POST /common-masters/:entity/bulk
    // Body: { rows: Record<string,string>[], companyId?: string }
    // (also accepts a bare array body for convenience)
    // ===========================
    @Post(':entity/bulk')
    bulkImport(
        @Param('entity') entity: string,
        @Body() body: { rows?: Record<string, string>[]; companyId?: string } | Record<string, string>[],
        @Query('companyId') companyIdQuery?: string,
    ) {
        const rows = Array.isArray(body) ? body : (body?.rows ?? []);
        const companyId = Array.isArray(body) ? companyIdQuery : (body?.companyId ?? companyIdQuery);
        return this.commonMastersService.bulkCreate(entity, rows, companyId);
    }

    @Get('currencies')
    findAllCurrencies() {
        return this.commonMastersService.findAllCurrencies();
    }

    @Post('currencies')
    createCurrency(@Body() data: { code: string; name: string; symbol?: string; decimalDigits?: number }) {
        return this.commonMastersService.createCurrency({
            code: data.code,
            name: data.name,
            symbol: data.symbol ?? data.code,
            decimalDigits: data.decimalDigits,
        });
    }

    @Put('currencies/:id')
    updateCurrency(@Param('id') id: string, @Body() data: { code?: string; name?: string; symbol?: string; decimalDigits?: number; isActive?: boolean }) {
        return this.commonMastersService.updateCurrency(id, data);
    }

    @Delete('currencies/:id')
    deleteCurrency(@Param('id') id: string) {
        return this.commonMastersService.deleteCurrency(id);
    }

    @Post('countries')
    createCountry(@Body() data: { code: string; name: string; currency?: string; phoneCode?: string }) {
        return this.commonMastersService.createCountry(data);
    }

    @Put('countries/:id')
    updateCountry(@Param('id') id: string, @Body() data: { code?: string; name?: string; currency?: string; phoneCode?: string; isActive?: boolean }) {
        return this.commonMastersService.updateCountry(id, data);
    }

    @Delete('countries/:id')
    deleteCountry(@Param('id') id: string) {
        return this.commonMastersService.deleteCountry(id);
    }

    @Get('departments')
    findAllDepartments(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllDepartments(companyId);
    }

    @Post('departments')
    createDepartment(@Body() data: { name: string; companyId: string; branchId?: string }) {
        return this.commonMastersService.createDepartment(data);
    }

    @Put('departments/:id')
    updateDepartment(@Param('id') id: string, @Body() data: { name?: string; branchId?: string; isActive?: boolean }) {
        return this.commonMastersService.updateDepartment(id, data);
    }

    @Delete('departments/:id')
    deleteDepartment(@Param('id') id: string) {
        return this.commonMastersService.deleteDepartment(id);
    }

    @Get('designations')
    findAllDesignations(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllDesignations(companyId);
    }

    @Get('employees')
    findAllEmployees(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllEmployees(companyId);
    }

    @Get('shifts')
    findAllShifts(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllShifts(companyId);
    }

    @Get('holidays')
    findAllHolidays(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllHolidays(companyId);
    }

    @Get('uoms')
    findAllUoms(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllUoms(companyId);
    }

    @Get('countries')
    findAllCountries() {
        return this.commonMastersService.findAllCountries();
    }

    @Get('states/:countryId')
    findStatesByCountry(@Param('countryId') countryId: string) {
        return this.commonMastersService.findStatesByCountry(countryId);
    }

    @Get('cities/:stateId')
    findCitiesByState(@Param('stateId') stateId: string) {
        return this.commonMastersService.findCitiesByState(stateId);
    }

    // List-all variants (no parent filter) for the state/city master pages.
    // Distinct path so it does not collide with states/:countryId.
    @Get('states-all')
    findAllStates() {
        return this.commonMastersService.findAllStates();
    }

    @Get('cities-all')
    findAllCities() {
        return this.commonMastersService.findAllCities();
    }

    @Get('grades')
    findAllHrGrades(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllHrGrades(companyId);
    }

    @Get('territories')
    findAllTerritories(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllTerritories(companyId);
    }

    @Get('cost-centers')
    findAllCostCenters(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllCostCenters(companyId);
    }

    @Get('plants')
    findAllPlants(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllPlants(companyId);
    }

    @Get('warehouses')
    findAllWarehouses(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllWarehouses(companyId);
    }

    @Get('exchange-rates')
    findAllExchangeRates(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllExchangeRates(companyId);
    }

    @Get('brands')
    findAllBrands(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllBrands(companyId);
    }

    @Get('hsn-sacs')
    findAllHsnSacs(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllHsnSacs(companyId);
    }

    @Get('item-categories')
    findAllItemCategories(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllItemCategories(companyId);
    }

    @Get('item-groups')
    findAllItemGroups(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllItemGroups(companyId);
    }

    @Get('items')
    findAllItems(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllItems(companyId);
    }

    @Get('customer-categories')
    findAllCustomerCategories(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllCustomerCategories(companyId);
    }

    @Get('customers')
    findAllCustomers(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllCustomers(companyId);
    }

    @Get('vendor-categories')
    findAllVendorCategories(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllVendorCategories(companyId);
    }

    @Get('vendors')
    findAllVendors(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllVendors(companyId);
    }

    // --- Financial Masters ---
    @Get('accounts')
    findAllAccounts(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllAccounts(companyId);
    }

    @Get('bank-accounts')
    findAllBankAccounts(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllBankAccounts(companyId);
    }

    @Get('taxes')
    findAllTaxes(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllTaxes(companyId);
    }

    @Get('payment-terms')
    findAllPaymentTerms(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllPaymentTerms(companyId);
    }

    @Get('price-lists')
    findAllPriceLists(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllPriceLists(companyId);
    }

    // --- Manufacturing Masters ---
    @Get('machines')
    findAllMachines(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllMachines(companyId);
    }

    @Get('work-centers')
    findAllWorkCenters(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllWorkCenters(companyId);
    }

    @Get('operations')
    findAllOperations(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllOperations(companyId);
    }

    @Get('routings')
    findAllRoutings(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllRoutings(companyId);
    }

    @Get('tools')
    findAllTools(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllTools(companyId);
    }

    @Get('quality-parameters')
    findAllQualityParameters(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllQualityParameters(companyId);
    }

    @Get('skills')
    findAllSkills(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllSkills(companyId);
    }

    @Get('batches')
    findAllBatches(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllBatches(companyId);
    }

    // --- Kitchen Manufacturing Masters ---
    @Get('cabinet-types')
    findAllCabinetTypes(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllCabinetTypes(companyId);
    }

    @Get('kitchen-hardware')
    findAllKitchenHardware(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllKitchenHardware(companyId);
    }

    @Get('kitchen-finishes')
    findAllKitchenFinishes(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllKitchenFinishes(companyId);
    }

    @Get('material-grades')
    findAllMaterialGrades(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllMaterialGrades(companyId);
    }

    @Get('kitchen-layouts')
    findAllKitchenLayouts(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllKitchenLayouts(companyId);
    }

    @Get('installation-types')
    findAllInstallationTypes(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllInstallationTypes(companyId);
    }

    @Get('kitchen-appliances')
    findAllKitchenAppliances(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllKitchenAppliances(companyId);
    }

    // --- System Masters ---
    @Get('users')
    findAllUsers(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllUsers(companyId);
    }

    @Get('roles')
    findAllRoles(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllRoles(companyId);
    }

    @Get('document-types')
    findAllDocumentTypes(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllDocumentTypes(companyId);
    }

    @Get('number-series')
    findAllNumberSeries(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllNumberSeries(companyId);
    }

    // ===========================
    // DESIGNATION CRUD
    // ===========================
    @Post('designations')
    createDesignation(@Body() data: { code: string; name: string; level?: number; grade?: string; companyId: string }) {
        return this.commonMastersService.createDesignation(data);
    }

    @Put('designations/:id')
    updateDesignation(@Param('id') id: string, @Body() data: { code?: string; name?: string; level?: number; grade?: string; isActive?: boolean }) {
        return this.commonMastersService.updateDesignation(id, data);
    }

    @Delete('designations/:id')
    deleteDesignation(@Param('id') id: string) {
        return this.commonMastersService.deleteDesignation(id);
    }

    // ===========================
    // COST CENTER CRUD
    // ===========================
    @Post('cost-centers')
    createCostCenter(@Body() data: { code: string; name: string; companyId: string }) {
        return this.commonMastersService.createCostCenter(data);
    }

    @Put('cost-centers/:id')
    updateCostCenter(@Param('id') id: string, @Body() data: { code?: string; name?: string; isActive?: boolean }) {
        return this.commonMastersService.updateCostCenter(id, data);
    }

    @Delete('cost-centers/:id')
    deleteCostCenter(@Param('id') id: string) {
        return this.commonMastersService.deleteCostCenter(id);
    }

    // ===========================
    // PLANT CRUD
    // ===========================
    @Post('plants')
    createPlant(@Body() data: { code: string; name: string; companyId: string; branchId?: string }) {
        return this.commonMastersService.createPlant(data);
    }

    @Put('plants/:id')
    updatePlant(@Param('id') id: string, @Body() data: { code?: string; name?: string; branchId?: string; isActive?: boolean }) {
        return this.commonMastersService.updatePlant(id, data);
    }

    @Delete('plants/:id')
    deletePlant(@Param('id') id: string) {
        return this.commonMastersService.deletePlant(id);
    }

    // ===========================
    // WAREHOUSE CRUD
    // ===========================
    @Post('warehouses')
    createWarehouse(@Body() data: { code: string; name: string; companyId: string; branchId?: string; address?: string }) {
        return this.commonMastersService.createWarehouse(data);
    }

    @Put('warehouses/:id')
    updateWarehouse(@Param('id') id: string, @Body() data: { code?: string; name?: string; branchId?: string; address?: string; isActive?: boolean }) {
        return this.commonMastersService.updateWarehouse(id, data);
    }

    @Delete('warehouses/:id')
    deleteWarehouse(@Param('id') id: string) {
        return this.commonMastersService.deleteWarehouse(id);
    }

    // ===========================
    // UOM CRUD
    // ===========================
    @Post('uoms')
    createUom(@Body() data: { code: string; name: string; companyId: string }) {
        return this.commonMastersService.createUom(data);
    }

    @Put('uoms/:id')
    updateUom(@Param('id') id: string, @Body() data: { code?: string; name?: string; isActive?: boolean }) {
        return this.commonMastersService.updateUom(id, data);
    }

    @Delete('uoms/:id')
    deleteUom(@Param('id') id: string) {
        return this.commonMastersService.deleteUom(id);
    }

    // ===========================
    // ITEM CATEGORY CRUD
    // ===========================
    @Post('item-categories')
    createItemCategory(@Body() data: { name: string; companyId: string }) {
        return this.commonMastersService.createItemCategory(data);
    }

    @Put('item-categories/:id')
    updateItemCategory(@Param('id') id: string, @Body() data: { name?: string; isActive?: boolean }) {
        return this.commonMastersService.updateItemCategory(id, data);
    }

    @Delete('item-categories/:id')
    deleteItemCategory(@Param('id') id: string) {
        return this.commonMastersService.deleteItemCategory(id);
    }

    // ===========================
    // ITEM GROUP CRUD
    // ===========================
    @Post('item-groups')
    createItemGroup(@Body() data: { name: string; categoryId: string; companyId: string }) {
        return this.commonMastersService.createItemGroup(data);
    }

    @Put('item-groups/:id')
    updateItemGroup(@Param('id') id: string, @Body() data: { name?: string; categoryId?: string; isActive?: boolean }) {
        return this.commonMastersService.updateItemGroup(id, data);
    }

    @Delete('item-groups/:id')
    deleteItemGroup(@Param('id') id: string) {
        return this.commonMastersService.deleteItemGroup(id);
    }

    // ===========================
    // BRAND CRUD
    // ===========================
    @Post('brands')
    createBrand(@Body() data: { name: string; companyId: string }) {
        return this.commonMastersService.createBrand(data);
    }

    @Put('brands/:id')
    updateBrand(@Param('id') id: string, @Body() data: { name?: string; isActive?: boolean }) {
        return this.commonMastersService.updateBrand(id, data);
    }

    @Delete('brands/:id')
    deleteBrand(@Param('id') id: string) {
        return this.commonMastersService.deleteBrand(id);
    }

    // ===========================
    // HSN/SAC CRUD
    // ===========================
    @Post('hsn-sacs')
    createHsnSac(@Body() data: { code: string; description?: string; gstPercentage?: number; companyId: string }) {
        return this.commonMastersService.createHsnSac(data);
    }

    @Put('hsn-sacs/:id')
    updateHsnSac(@Param('id') id: string, @Body() data: { code?: string; description?: string; gstPercentage?: number; isActive?: boolean }) {
        return this.commonMastersService.updateHsnSac(id, data);
    }

    @Delete('hsn-sacs/:id')
    deleteHsnSac(@Param('id') id: string) {
        return this.commonMastersService.deleteHsnSac(id);
    }

    // ===========================
    // ITEM CRUD
    // ===========================
    @Post('items')
    createItem(@Body() data: any) {
        return this.commonMastersService.createItem(data);
    }

    @Put('items/:id')
    updateItem(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateItem(id, data);
    }

    @Delete('items/:id')
    deleteItem(@Param('id') id: string) {
        return this.commonMastersService.deleteItem(id);
    }

    // ===========================
    // CUSTOMER CATEGORY CRUD
    // ===========================
    @Post('customer-categories')
    createCustomerCategory(@Body() data: any) {
        return this.commonMastersService.createCustomerCategory(data);
    }

    @Put('customer-categories/:id')
    updateCustomerCategory(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateCustomerCategory(id, data);
    }

    @Delete('customer-categories/:id')
    deleteCustomerCategory(@Param('id') id: string) {
        return this.commonMastersService.deleteCustomerCategory(id);
    }

    // ===========================
    // CUSTOMER CRUD
    // ===========================
    @Post('customers')
    createCustomer(@Body() data: any) {
        return this.commonMastersService.createCustomer(data);
    }

    @Put('customers/:id')
    updateCustomer(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateCustomer(id, data);
    }

    @Delete('customers/:id')
    deleteCustomer(@Param('id') id: string) {
        return this.commonMastersService.deleteCustomer(id);
    }

    // ===========================
    // VENDOR CATEGORY CRUD
    // ===========================
    @Post('vendor-categories')
    createVendorCategory(@Body() data: { name: string; description?: string; companyId: string }) {
        return this.commonMastersService.createVendorCategory(data);
    }

    @Put('vendor-categories/:id')
    updateVendorCategory(@Param('id') id: string, @Body() data: { name?: string; description?: string; isActive?: boolean }) {
        return this.commonMastersService.updateVendorCategory(id, data);
    }

    @Delete('vendor-categories/:id')
    deleteVendorCategory(@Param('id') id: string) {
        return this.commonMastersService.deleteVendorCategory(id);
    }

    // ===========================
    // VENDOR CRUD
    // ===========================
    @Post('vendors')
    createVendor(@Body() data: any) {
        return this.commonMastersService.createVendor(data);
    }

    @Put('vendors/:id')
    updateVendor(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateVendor(id, data);
    }

    @Delete('vendors/:id')
    deleteVendor(@Param('id') id: string) {
        return this.commonMastersService.deleteVendor(id);
    }

    // ===========================
    // TAX CRUD
    // ===========================
    @Post('taxes')
    createTax(@Body() data: any) {
        return this.commonMastersService.createTax(data);
    }

    @Put('taxes/:id')
    updateTax(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateTax(id, data);
    }

    @Delete('taxes/:id')
    deleteTax(@Param('id') id: string) {
        return this.commonMastersService.deleteTax(id);
    }

    // ===========================
    // PAYMENT TERMS CRUD
    // ===========================
    @Post('payment-terms')
    createPaymentTerm(@Body() data: any) {
        return this.commonMastersService.createPaymentTerm(data);
    }

    @Put('payment-terms/:id')
    updatePaymentTerm(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updatePaymentTerm(id, data);
    }

    @Delete('payment-terms/:id')
    deletePaymentTerm(@Param('id') id: string) {
        return this.commonMastersService.deletePaymentTerm(id);
    }

    // ===========================
    // EMPLOYEE CRUD
    // ===========================
    @Post('employees')
    createEmployee(@Body() data: any) {
        return this.commonMastersService.createEmployee(data);
    }

    @Put('employees/:id')
    updateEmployee(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateEmployee(id, data);
    }

    @Delete('employees/:id')
    deleteEmployee(@Param('id') id: string) {
        return this.commonMastersService.deleteEmployee(id);
    }

    // ===========================
    // SHIFT CRUD
    // ===========================
    @Post('shifts')
    createShift(@Body() data: { code: string; name: string; companyId: string; startTime?: string; endTime?: string }) {
        return this.commonMastersService.createShift(data);
    }

    @Put('shifts/:id')
    updateShift(@Param('id') id: string, @Body() data: { code?: string; name?: string; startTime?: string; endTime?: string; isActive?: boolean }) {
        return this.commonMastersService.updateShift(id, data);
    }

    @Delete('shifts/:id')
    deleteShift(@Param('id') id: string) {
        return this.commonMastersService.deleteShift(id);
    }

    // ===========================
    // MACHINE CRUD
    // ===========================
    @Post('machines')
    createMachine(@Body() data: any) {
        return this.commonMastersService.createMachine(data);
    }

    @Put('machines/:id')
    updateMachine(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateMachine(id, data);
    }

    @Delete('machines/:id')
    deleteMachine(@Param('id') id: string) {
        return this.commonMastersService.deleteMachine(id);
    }

    // ===========================
    // WORK CENTER CRUD
    // ===========================
    @Post('work-centers')
    createWorkCenter(@Body() data: any) {
        return this.commonMastersService.createWorkCenter(data);
    }

    @Put('work-centers/:id')
    updateWorkCenter(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateWorkCenter(id, data);
    }

    @Delete('work-centers/:id')
    deleteWorkCenter(@Param('id') id: string) {
        return this.commonMastersService.deleteWorkCenter(id);
    }

    // ===========================
    // OPERATION CRUD
    // ===========================
    @Post('operations')
    createOperation(@Body() data: any) {
        return this.commonMastersService.createOperation(data);
    }

    @Put('operations/:id')
    updateOperation(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateOperation(id, data);
    }

    @Delete('operations/:id')
    deleteOperation(@Param('id') id: string) {
        return this.commonMastersService.deleteOperation(id);
    }

    // ===========================
    // TOOL CRUD
    // ===========================
    @Post('tools')
    createTool(@Body() data: { code: string; name: string; companyId: string; description?: string; category?: string }) {
        return this.commonMastersService.createTool(data);
    }

    @Put('tools/:id')
    updateTool(@Param('id') id: string, @Body() data: { code?: string; name?: string; description?: string; category?: string; status?: string; isActive?: boolean }) {
        return this.commonMastersService.updateTool(id, data);
    }

    @Delete('tools/:id')
    deleteTool(@Param('id') id: string) {
        return this.commonMastersService.deleteTool(id);
    }

    // ===========================
    // QUALITY PARAMETER CRUD
    // ===========================
    @Post('quality-parameters')
    createQualityParameter(@Body() data: any) {
        return this.commonMastersService.createQualityParameter(data);
    }

    @Put('quality-parameters/:id')
    updateQualityParameter(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateQualityParameter(id, data);
    }

    @Delete('quality-parameters/:id')
    deleteQualityParameter(@Param('id') id: string) {
        return this.commonMastersService.deleteQualityParameter(id);
    }

    // ===========================
    // TERRITORY CRUD
    // ===========================
    @Post('territories')
    createTerritory(@Body() data: { code: string; name: string; companyId: string }) {
        return this.commonMastersService.createTerritory(data);
    }

    @Put('territories/:id')
    updateTerritory(@Param('id') id: string, @Body() data: { code?: string; name?: string; isActive?: boolean }) {
        return this.commonMastersService.updateTerritory(id, data);
    }

    @Delete('territories/:id')
    deleteTerritory(@Param('id') id: string) {
        return this.commonMastersService.deleteTerritory(id);
    }

    // ===========================
    // STATE CRUD
    // ===========================
    @Post('states')
    createState(@Body() data: { code: string; name: string; countryId: string }) {
        return this.commonMastersService.createState(data);
    }

    @Put('states/:id')
    updateState(@Param('id') id: string, @Body() data: { code?: string; name?: string; countryId?: string; isActive?: boolean }) {
        return this.commonMastersService.updateState(id, data);
    }

    @Delete('states/:id')
    deleteState(@Param('id') id: string) {
        return this.commonMastersService.deleteState(id);
    }

    // ===========================
    // CITY CRUD
    // ===========================
    @Post('cities')
    createCity(@Body() data: { name: string; stateId: string; pincode?: string }) {
        return this.commonMastersService.createCity(data);
    }

    @Put('cities/:id')
    updateCity(@Param('id') id: string, @Body() data: { name?: string; stateId?: string; pincode?: string; isActive?: boolean }) {
        return this.commonMastersService.updateCity(id, data);
    }

    @Delete('cities/:id')
    deleteCity(@Param('id') id: string) {
        return this.commonMastersService.deleteCity(id);
    }

    // ===========================
    // HR GRADE CRUD
    // ===========================
    @Post('grades')
    createHrGrade(@Body() data: {
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
        return this.commonMastersService.createHrGrade(data);
    }

    @Put('grades/:id')
    updateHrGrade(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateHrGrade(id, data);
    }

    @Delete('grades/:id')
    deleteHrGrade(@Param('id') id: string) {
        return this.commonMastersService.deleteHrGrade(id);
    }

    // ===========================
    // BRANCH CRUD
    // ===========================
    @Get('branches')
    findAllBranches(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllBranches(companyId);
    }

    @Get('branches/:id')
    findBranchById(@Param('id') id: string) {
        return this.commonMastersService.findBranchById(id);
    }

    @Post('branches')
    createBranch(@Body() data: any) {
        return this.commonMastersService.createBranch(data);
    }

    @Put('branches/:id')
    updateBranch(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateBranch(id, data);
    }

    @Delete('branches/:id')
    deleteBranch(@Param('id') id: string) {
        return this.commonMastersService.deleteBranch(id);
    }

    // ===========================
    // BARCODE CRUD
    // ===========================
    @Get('barcodes')
    findAllBarcodes(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllBarcodes(companyId);
    }

    @Post('barcodes')
    createBarcode(@Body() data: any) {
        return this.commonMastersService.createBarcode(data);
    }

    @Put('barcodes/:id')
    updateBarcode(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateBarcode(id, data);
    }

    @Delete('barcodes/:id')
    deleteBarcode(@Param('id') id: string) {
        return this.commonMastersService.deleteBarcode(id);
    }

    // ===========================
    // COUNTER MATERIAL CRUD
    // ===========================
    @Get('counter-materials')
    findAllCounterMaterials(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllCounterMaterials(companyId);
    }

    @Post('counter-materials')
    createCounterMaterial(@Body() data: any) {
        return this.commonMastersService.createCounterMaterial(data);
    }

    @Put('counter-materials/:id')
    updateCounterMaterial(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateCounterMaterial(id, data);
    }

    @Delete('counter-materials/:id')
    deleteCounterMaterial(@Param('id') id: string) {
        return this.commonMastersService.deleteCounterMaterial(id);
    }

    // ===========================
    // LOCATION CRUD
    // ===========================
    @Get('locations')
    findAllLocations(@Query('companyId') companyId: string) {
        return this.commonMastersService.findAllLocations(companyId);
    }

    @Get('locations/:id')
    findLocationById(@Param('id') id: string) {
        return this.commonMastersService.findLocationById(id);
    }

    @Post('locations')
    createLocation(@Body() data: any) {
        return this.commonMastersService.createLocation(data);
    }

    @Put('locations/:id')
    updateLocation(@Param('id') id: string, @Body() data: any) {
        return this.commonMastersService.updateLocation(id, data);
    }

    @Delete('locations/:id')
    deleteLocation(@Param('id') id: string) {
        return this.commonMastersService.deleteLocation(id);
    }

}
