import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HandoverCertificate, HandoverStatus } from '../entities/handover-certificate.entity';
import { InstallationTask, InstallationStatus } from '../entities/installation-task.entity';
import { Project } from '../../project/entities/project.entity';

@Injectable()
export class ProjectClosureService {
    constructor(
        @InjectRepository(HandoverCertificate)
        private certificateRepository: Repository<HandoverCertificate>,
        @InjectRepository(InstallationTask)
        private installationRepository: Repository<InstallationTask>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
    ) { }

    async getProjectClosureStatus(projectId: string) {
        // Check for open installation tasks (snags)
        const openTasks = await this.installationRepository.count({
            where: { projectId, status: InstallationStatus.IN_PROGRESS }
        });

        // Simulate billing check (In a real system, would query Finance module)
        const hasOutstandingBalance = false; // Mocked

        return {
            snagClearance: openTasks === 0,
            billingCleared: !hasOutstandingBalance,
            handoverReady: openTasks === 0 && !hasOutstandingBalance
        };
    }

    async initiateHandover(projectId: string, feedback?: { rating?: number; feedback?: string }): Promise<HandoverCertificate> {
        const stats = await this.getProjectClosureStatus(projectId);
        if (!stats.handoverReady) {
            throw new BadRequestException('HARD GATE: Project is not ready for closure. Ensure all snags are cleared and billing is settled.');
        }

        const cert = this.certificateRepository.create({
            projectId,
            status: HandoverStatus.PENDING,
            closureRating: feedback?.rating ?? undefined,
            closureFeedback: feedback?.feedback ?? undefined,
        });
        return this.certificateRepository.save(cert);
    }

    async signHandover(certId: string, signatory: string, title: string): Promise<HandoverCertificate> {
        const cert = await this.certificateRepository.findOne({ where: { id: certId } });
        if (!cert) throw new NotFoundException('Certificate not found');

        cert.clientSignatory = signatory;
        cert.signatoryTitle = title;
        cert.signedAt = new Date();
        cert.status = HandoverStatus.SIGNED;
        cert.certificateUrl = `/api/project-management/export/certificate/${certId}.pdf`;

        // Mark project as completed
        const project = await this.projectRepository.findOne({ where: { id: cert.projectId } });
        if (project) {
            // Depending on project entity, update status
            // project.status = 'COMPLETED'; 
            // await this.projectRepository.save(project);
        }

        return this.certificateRepository.save(cert);
    }

    async getCertificate(projectId: string): Promise<HandoverCertificate | null> {
        return this.certificateRepository.findOne({ where: { projectId }, order: { createdAt: 'DESC' } });
    }
}
