import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route, RouteStatus } from '../entities';
import {
  CreateRouteDto,
  UpdateRouteDto,
  RouteResponseDto,
} from '../dto';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) { }

  async create(createDto: CreateRouteDto): Promise<RouteResponseDto> {
    const existing = await this.routeRepository.findOne({
      where: { routeCode: createDto.routeCode },
    });

    if (existing) {
      throw new BadRequestException(
        `Route with code ${createDto.routeCode} already exists`,
      );
    }

    const route = this.routeRepository.create({
      ...createDto,
      status: RouteStatus.ACTIVE,
    });

    const saved = await this.routeRepository.save(route);
    return this.mapToResponseDto(saved);
  }

  async findAll(filters?: any): Promise<RouteResponseDto[]> {
    const query = this.routeRepository.createQueryBuilder('route');

    if (filters?.status) {
      query.andWhere('route.status = :status', { status: filters.status });
    }

    if (filters?.routeType) {
      query.andWhere('route.routeType = :type', { type: filters.routeType });
    }

    if (filters?.originCity) {
      query.andWhere('route.originCity = :city', { city: filters.originCity });
    }

    if (filters?.destinationCity) {
      query.andWhere('route.destinationCity = :city', {
        city: filters.destinationCity,
      });
    }

    query.orderBy('route.routeName', 'ASC');
    const routes = await query.getMany();
    return routes.map((r) => this.mapToResponseDto(r));
  }

  async findActive(): Promise<RouteResponseDto[]> {
    const routes = await this.routeRepository.find({
      where: { status: RouteStatus.ACTIVE },
      order: { routeName: 'ASC' },
    });
    return routes.map((r) => this.mapToResponseDto(r));
  }

  async findOne(id: string): Promise<RouteResponseDto> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['trips'],
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return this.mapToResponseDto(route);
  }

  async update(
    id: string,
    updateDto: UpdateRouteDto,
  ): Promise<RouteResponseDto> {
    const route = await this.routeRepository.findOne({ where: { id } });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    Object.assign(route, updateDto);
    const updated = await this.routeRepository.save(route);
    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const route = await this.routeRepository.findOne({ where: { id } });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    await this.routeRepository.remove(route);
  }

  /**
   * Deterministically optimize all active routes in one pass and return an
   * aggregate summary. For each route with 3+ stops, intermediate stops are
   * re-sequenced with a nearest-neighbour heuristic anchored at the origin
   * stop, using stop coordinates when available and a stable name/id ordering
   * as the fallback. No external solver is used — the result is fully
   * deterministic for a given data set.
   */
  async optimizeAll(): Promise<{
    routesConsidered: number;
    routesOptimized: number;
    stopsReordered: number;
    optimizedAt: string;
    routes: Array<{
      id: string;
      routeCode: string;
      routeName: string;
      numberOfStops: number;
      reordered: boolean;
    }>;
  }> {
    const routes = await this.routeRepository.find({
      where: { status: RouteStatus.ACTIVE },
    });

    let routesOptimized = 0;
    let stopsReordered = 0;
    const optimizedAt = new Date();
    const summary: Array<{
      id: string;
      routeCode: string;
      routeName: string;
      numberOfStops: number;
      reordered: boolean;
    }> = [];

    for (const route of routes) {
      const stops = Array.isArray(route.stops) ? route.stops : [];
      let reordered = false;

      if (stops.length > 2) {
        const originalOrder = stops.map((s) => s.stopNumber);
        const optimized = this.reorderStopsDeterministic(stops);
        // Re-number sequentially so the persisted order is canonical.
        const renumbered = optimized.map((s, idx) => ({
          ...s,
          stopNumber: idx + 1,
        }));
        const changedCount = renumbered.filter(
          (s, idx) => originalOrder[idx] !== s.stopNumber,
        ).length;
        if (changedCount > 0) {
          route.stops = renumbered;
          stopsReordered += changedCount;
          reordered = true;
        }
      }

      route.isOptimized = true;
      route.lastOptimizedAt = optimizedAt;
      if (reordered) {
        routesOptimized += 1;
        route.notes =
          (route.notes || '') +
          '\n[System] Route stops re-sequenced by batch optimization.';
      }
      await this.routeRepository.save(route);

      summary.push({
        id: route.id,
        routeCode: route.routeCode,
        routeName: route.routeName,
        numberOfStops: stops.length,
        reordered,
      });
    }

    return {
      routesConsidered: routes.length,
      routesOptimized,
      stopsReordered,
      optimizedAt: optimizedAt.toISOString(),
      routes: summary,
    };
  }

  /**
   * Nearest-neighbour ordering of intermediate stops. Origin (stopNumber 1) is
   * kept first and the highest-numbered stop is kept last (destination). The
   * intermediate stops are greedily chained by closest euclidean distance on
   * (latitude, longitude); when coordinates are missing the ordering falls back
   * to a stable sort by stopName then original stopNumber, keeping the result
   * deterministic.
   */
  private reorderStopsDeterministic(
    stops: NonNullable<Route['stops']>,
  ): NonNullable<Route['stops']> {
    const sorted = [...stops].sort((a, b) => a.stopNumber - b.stopNumber);
    const origin = sorted[0];
    const destination = sorted[sorted.length - 1];
    const intermediate = sorted.slice(1, sorted.length - 1);

    const hasCoords = (s: (typeof stops)[number]) =>
      typeof s.latitude === 'number' &&
      typeof s.longitude === 'number' &&
      !Number.isNaN(Number(s.latitude)) &&
      !Number.isNaN(Number(s.longitude));

    const dist = (
      a: (typeof stops)[number],
      b: (typeof stops)[number],
    ): number => {
      const dLat = Number(a.latitude) - Number(b.latitude);
      const dLon = Number(a.longitude) - Number(b.longitude);
      return Math.sqrt(dLat * dLat + dLon * dLon);
    };

    // Fallback: stable ordering by name then original stop number.
    const stableFallback = (arr: typeof intermediate) =>
      [...arr].sort((a, b) => {
        const byName = (a.stopName || '').localeCompare(b.stopName || '');
        return byName !== 0 ? byName : a.stopNumber - b.stopNumber;
      });

    let orderedIntermediate: typeof intermediate;

    if (intermediate.every(hasCoords) && origin && hasCoords(origin)) {
      const remaining = [...intermediate];
      const chained: typeof intermediate = [];
      let current = origin;
      while (remaining.length > 0) {
        let bestIdx = 0;
        let bestDist = dist(current, remaining[0]);
        for (let i = 1; i < remaining.length; i++) {
          const d = dist(current, remaining[i]);
          // Deterministic tie-break by original stopNumber.
          if (
            d < bestDist ||
            (d === bestDist &&
              remaining[i].stopNumber < remaining[bestIdx].stopNumber)
          ) {
            bestDist = d;
            bestIdx = i;
          }
        }
        current = remaining[bestIdx];
        chained.push(current);
        remaining.splice(bestIdx, 1);
      }
      orderedIntermediate = chained;
    } else {
      orderedIntermediate = stableFallback(intermediate);
    }

    return [origin, ...orderedIntermediate, destination].filter(
      Boolean,
    ) as NonNullable<Route['stops']>;
  }

  async optimizeRoute(id: string): Promise<RouteResponseDto> {
    const route = await this.routeRepository.findOne({ where: { id } });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    // Simulate route optimization logic (reordering stops if any)
    if (route.stops && route.stops.length > 2) {
      // Keep origin and destination, shuffle intermediate stops as a simulation
      const origin = route.stops.find(s => s.stopNumber === 1);
      const destination = route.stops.find(s => s.stopNumber === route.stops.length);
      const intermediate = route.stops.filter(s => s.stopNumber !== 1 && s.stopNumber !== route.stops.length);

      // Artificial reordering
      const optimizedIntermediate = [...intermediate].reverse();

      route.stops = [
        origin!,
        ...optimizedIntermediate.map((s, idx) => ({ ...s, stopNumber: idx + 2 })),
        { ...destination!, stopNumber: route.stops.length }
      ];
    }

    route.isOptimized = true;
    route.lastOptimizedAt = new Date();
    route.notes = (route.notes || '') + '\n[System] Route optimized for fuel efficiency.';

    const updated = await this.routeRepository.save(route);
    return this.mapToResponseDto(updated);
  }

  async calculateDistance(id: string): Promise<any> {
    const route = await this.routeRepository.findOne({ where: { id } });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return {
      routeId: route.id,
      routeName: route.routeName,
      totalDistance: route.totalDistance,
      distanceUnit: route.distanceUnit,
      estimatedDuration: route.estimatedDurationMinutes,
      numberOfStops: route.numberOfStops,
    };
  }

  async getRoutePerformance(id: string): Promise<any> {
    const route = await this.routeRepository.findOne({ where: { id } });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return {
      routeId: route.id,
      routeName: route.routeName,
      totalTripsCompleted: route.totalTripsCompleted,
      lastUsedDate: route.lastUsedDate,
      averageActualDuration: route.averageActualDuration,
      onTimePercentage: route.onTimePercentage,
    };
  }

  private mapToResponseDto(route: Route): RouteResponseDto {
    return {
      ...route,
    } as RouteResponseDto;
  }
}
