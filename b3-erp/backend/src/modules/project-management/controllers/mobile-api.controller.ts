import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectService } from '../project.service';
import { TASettlementService } from '../services/ta-settlement.service';
import { EmergencySpareService } from '../services/emergency-spare.service';
import { SitePhotoEntity } from '../entities/site-photo.entity';

@Controller('mobile-api')
export class MobileController {
    constructor(
        private readonly projectService: ProjectService,
        private readonly taSettlementService: TASettlementService,
        private readonly emergencySpareService: EmergencySpareService,
        @InjectRepository(SitePhotoEntity)
        private readonly sitePhotoRepository: Repository<SitePhotoEntity>,
    ) { }

    @Get('my-schedule/:engineerId')
    async getMySchedule(@Param('engineerId') engineerId: string) {
        // In a real app, this would filter tasks assigned to the engineer
        // For now, returning all projects as a placeholder
        const projects = await this.projectService.findAll();
        return projects.map(p => ({
            id: p.id,
            name: p.name,
            location: p.location,
            status: p.status,
            startDate: p.startDate,
            endDate: p.endDate,
        }));
    }

    @Post('check-in')
    async checkIn(@Body() body: { engineerId: string; projectId: string; location: { lat: number; lng: number } }) {
        // Log check-in
        return { message: 'Checked in successfully', timestamp: new Date() };
    }

    @Post('check-out')
    async checkOut(@Body() body: { engineerId: string; projectId: string; location: { lat: number; lng: number }; workSummary: string }) {
        // Log check-out
        return { message: 'Checked out successfully', timestamp: new Date() };
    }

    @Post('claim-ta')
    async claimTA(@Body() body: { engineerId: string; projectId: string; amount: number; description: string }) {
        return this.taSettlementService.createClaim(body.engineerId, body.projectId, body.amount, body.description);
    }

    @Post('request-spare')
    async requestSpare(@Body() body: { projectId: string; partId: string; quantity: number; urgency: string; requestedBy: string }) {
        return this.emergencySpareService.requestSpare(body.projectId, body.partId, body.quantity, body.urgency, body.requestedBy);
    }

    @Get('photos/:projectId')
    async listSitePhotos(@Param('projectId') projectId: string) {
        return this.sitePhotoRepository.find({
            where: { projectId },
            order: { createdAt: 'DESC' },
        });
    }

    @Post('upload-photo/:projectId')
    async uploadSitePhoto(@Param('projectId') projectId: string, @Body() body: { photoUrl: string; description: string }) {
        const photo = this.sitePhotoRepository.create({
            projectId,
            photoUrl: body?.photoUrl,
            description: body?.description,
        });
        return this.sitePhotoRepository.save(photo);
    }

    @Delete('photo/:id')
    async deleteSitePhoto(@Param('id') id: string) {
        const result = await this.sitePhotoRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Site photo ${id} not found`);
        return { message: 'Photo deleted successfully' };
    }
}
