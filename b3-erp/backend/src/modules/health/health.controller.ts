import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';

@ApiTags('System')
@Public()
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        private disk: DiskHealthIndicator,
        private memory: MemoryHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Check system health' })
    check() {
        // DB ping only: on constrained (free-tier) hosts the resident heap
        // routinely exceeds a tight 150MB assert and the '/' disk check is
        // meaningless, both of which would flap the check and fail the deploy.
        return this.health.check([
            () => this.db.pingCheck('database'),
        ]);
    }
}
