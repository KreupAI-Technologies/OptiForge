# Contributing to ManufacturingOS

Thank you for your interest in contributing to ManufacturingOS! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15.x or higher
- npm 10.x or higher
- Docker (optional, for containerized development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KreupAI-Technologies/OptiForge.git
   cd ManufacturingOS
   ```

2. **Set up the backend**
   ```bash
   cd b3-erp/backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run migration:run
   npm run start:dev
   ```

3. **Set up the frontend**
   ```bash
   cd b3-erp/frontend
   npm install
   npm run dev
   ```

4. **Run with Docker (optional)**
   ```bash
   docker-compose up -d
   ```

## Coding Standards

### TypeScript

- **Strict mode is enabled** - All code must pass TypeScript strict checks
- Use explicit types for function parameters and return values
- Avoid `any` type - use proper typing or `unknown` with type guards
- Use interfaces for object shapes, types for unions/intersections

```typescript
// ✅ Good
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad
function calculateTotal(items: any): any {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Backend (NestJS)

- Follow NestJS module-based architecture
- Use DTOs for all API inputs with class-validator decorators
- Use TypeORM entities with proper relations
- Implement services for business logic, controllers for HTTP handling
- Use dependency injection consistently

```typescript
// Controller example
@Controller('items')
@ApiTags('Inventory')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  async findAll(@Query() filters: ItemFiltersDto): Promise<Item[]> {
    return this.itemService.findAll(filters);
  }
}
```

### Frontend (Next.js/React)

- Use functional components with hooks
- Implement proper error boundaries
- Use React Query for server state
- Use Zustand for client state
- Follow component composition patterns

```typescript
// Component example
interface ItemListProps {
  filters: ItemFilters;
  onItemSelect: (item: Item) => void;
}

export function ItemList({ filters, onItemSelect }: ItemListProps) {
  const { data, isLoading, error } = useItems(filters);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul>
      {data?.map((item) => (
        <ItemRow key={item.id} item={item} onClick={onItemSelect} />
      ))}
    </ul>
  );
}
```

### API Design

- Use RESTful conventions
- Use plural nouns for resource endpoints
- Use HTTP methods appropriately (GET, POST, PUT, PATCH, DELETE)
- Return appropriate HTTP status codes
- Document all endpoints with Swagger decorators

```
GET    /api/v1/items          # List items
POST   /api/v1/items          # Create item
GET    /api/v1/items/:id      # Get item
PATCH  /api/v1/items/:id      # Update item
DELETE /api/v1/items/:id      # Delete item
```

### Database

- Use UUID primary keys
- Include audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- Use proper indexes for frequently queried columns
- Use database migrations for schema changes
- Name tables in snake_case, entities in PascalCase

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Run tests locally**
   ```bash
   # Backend tests
   cd b3-erp/backend && npm test

   # Frontend type check
   cd b3-erp/frontend && npm run type-check

   # E2E tests
   cd b3-erp/frontend && npm run test:e2e
   ```

4. **Submit a pull request**
   - Fill out the PR template
   - Link related issues
   - Request reviews from appropriate team members

5. **Address review feedback**
   - Respond to all comments
   - Push fixes in new commits (don't force push)
   - Re-request review when ready

## Testing Guidelines

### Unit Tests (Backend)

- Test services independently with mocked dependencies
- Use factories for test data generation
- Aim for 60%+ code coverage

```typescript
describe('ItemService', () => {
  let service: ItemService;
  let mockRepository: MockRepository<Item>;

  beforeEach(async () => {
    mockRepository = createMockRepository();
    const module = await Test.createTestingModule({
      providers: [
        ItemService,
        { provide: getRepositoryToken(Item), useValue: mockRepository },
      ],
    }).compile();
    service = module.get(ItemService);
  });

  it('should create an item', async () => {
    const dto = ItemFactory.createDto();
    mockRepository.save.mockResolvedValue(dto);

    const result = await service.create(dto);

    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.itemCode).toBe(dto.itemCode);
  });
});
```

### E2E Tests (Frontend)

- Test critical user journeys
- Use page objects for reusable interactions
- Run against real backend (not mocked)

```typescript
test('should create and view an item', async ({ page }) => {
  await login(page, testUsers.admin);
  await page.goto('/inventory/items/add');

  await page.fill('[name="itemCode"]', 'TEST001');
  await page.fill('[name="itemName"]', 'Test Item');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/inventory\/items\/[a-z0-9-]+/);
  await expect(page.locator('h1')).toContainText('Test Item');
});
```

## Commit Message Guidelines

Follow the conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```
feat(inventory): add low stock alerts

Implement automatic alerts when item stock falls below reorder level.
Includes email notifications and dashboard warnings.

Closes #123
```

```
fix(auth): resolve session timeout issue

Users were being logged out after 5 minutes due to incorrect
token refresh logic. Fixed by updating the refresh interval.

Fixes #456
```

## Questions?

If you have questions, please:

1. Check existing documentation in `/docs`
2. Search existing issues and discussions
3. Create a new issue with the "question" label

Thank you for contributing to ManufacturingOS!
