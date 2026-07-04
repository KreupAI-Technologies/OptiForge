import { Injectable } from '@nestjs/common';

/**
 * In-memory-seeded troubleshooting guides service backing the after-sales
 * knowledge/troubleshooting page. Persistence contract lives in the
 * additive `as_troubleshooting_guides` table (see orphan_after_sales.sql
 * and entities/troubleshooting-guide.entity.ts).
 */
@Injectable()
export class TroubleshootingService {
  private guides: any[] = [
    {
      id: 'TG-001',
      title: 'Refrigerator Not Cooling',
      symptoms: ['Temperature above set point', 'Compressor running continuously'],
      causes: ['Dirty condenser coils', 'Low refrigerant', 'Faulty thermostat'],
      solutions: ['Clean condenser coils', 'Check refrigerant charge', 'Replace thermostat'],
      difficulty: 'medium',
      timeEstimate: 45,
      category: 'Refrigeration',
      relatedProducts: ['Commercial Refrigerator', 'Cold Room'],
      successRate: 88,
      views: 1240,
      helpful: 312,
      createdDate: '2025-11-02',
      updatedDate: '2026-05-18',
      requiresService: false,
    },
    {
      id: 'TG-002',
      title: 'Dishwasher Not Draining',
      symptoms: ['Standing water in tub', 'Error code E24'],
      causes: ['Clogged drain filter', 'Blocked drain hose', 'Faulty drain pump'],
      solutions: ['Clean drain filter', 'Clear drain hose', 'Replace drain pump'],
      difficulty: 'easy',
      timeEstimate: 30,
      category: 'Dishwashing',
      relatedProducts: ['Commercial Dishwasher'],
      successRate: 92,
      views: 860,
      helpful: 205,
      createdDate: '2025-09-14',
      updatedDate: '2026-04-30',
      requiresService: false,
    },
    {
      id: 'TG-003',
      title: 'Cooking Range Burner Ignition Failure',
      symptoms: ['Burner clicks but no flame', 'Weak spark'],
      causes: ['Clogged burner ports', 'Faulty igniter', 'Gas supply issue'],
      solutions: ['Clean burner ports', 'Replace igniter', 'Verify gas supply pressure'],
      difficulty: 'hard',
      timeEstimate: 60,
      category: 'Cooking',
      relatedProducts: ['Cooking Range', 'Commercial Cooktop'],
      successRate: 79,
      views: 540,
      helpful: 118,
      createdDate: '2025-12-01',
      updatedDate: '2026-06-05',
      requiresService: true,
    },
  ];

  getGuides(): any[] {
    return this.guides;
  }
}
