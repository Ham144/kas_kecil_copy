# FlowLog Service Integration Documentation

## Overview

This document describes the integration between the Next.js frontend and Nest.js backend for the FlowLog service. The integration provides a comprehensive expense tracking system with proper type safety, error handling, caching, and authentication.

## Architecture

### Backend Service (Nest.js)
- **Service**: `FlowLogService` - Handles business logic for flow logs
- **Controller**: Manages HTTP endpoints for CRUD operations
- **Database**: Uses Prisma ORM for data persistence
- **Models**: Defined in `flow-log.model.ts` with DTOs

### Frontend Integration (Next.js)
- **API Layer**: Next.js API routes as a proxy to backend services
- **TypeScript Interfaces**: Shared type definitions in `types/flowLog.ts`
- **API Service**: `FlowLogApi` class for frontend API calls
- **Components**: Updated to use new integration patterns

## Integration Components

### 1. TypeScript Interfaces (`types/flowLog.ts`)

```typescript
export enum FlowLogType {
  IN = 'IN',
  OUT = 'OUT'
}

export interface FlowLog {
  id: string;
  title: string;
  amount: number;
  category: string;
  note?: string;
  attachments?: string[];
  type: FlowLogType;
  createdAt: string;
  warehouse: Warehouse;
  createdBy: User;
}

export interface CreateFlowLogDto {
  title: string;
  amount: number;
  category: string;
  warehouseId: string;
  note?: string;
  attachments?: string[];
  type: FlowLogType;
}
```

### 2. API Service (`api/flowLog.api.ts`)

The `FlowLogApi` class provides:
- **CRUD Operations**: `registerFlowLog`, `getRecentFlowLogs`, `getFlowLogById`, `updateFlowLog`, `deleteFlowLog`
- **Specialized Methods**: `registerExpense` (forces OUT type)
- **Caching**: In-memory cache with 5-minute TTL for GET requests
- **Error Handling**: Structured error responses with proper typing
- **Logging**: Comprehensive logging for debugging

```typescript
// Example usage
const result = await FlowLogApi.registerExpense({
  title: 'Office Supplies',
  amount: 75000,
  category: 'Office Supplies',
  warehouseId: 'warehouse-1'
});

if (result.success) {
  console.log('Expense created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### 3. Next.js API Routes

#### Flow Log API (`/api/flow-log`)
- **GET**: Retrieves flow logs with optional filtering
- **POST**: Creates new flow logs with validation

#### Expense API (`/api/expense`)
- **GET**: Retrieves expenses only (forces OUT type)
- **POST**: Creates expenses only (forces OUT type)

#### Individual Flow Log API (`/api/flow-log/[id]`)
- **GET**: Retrieves specific flow log by ID
- **PATCH**: Updates specific flow log
- **DELETE**: Deletes specific flow log

### 4. Frontend Components

#### Expense Page (`/app/expense/page.tsx`)
- Uses React Query for data fetching and caching
- Implements proper loading and error states
- Integrates with new API endpoints
- Provides optimistic updates

#### ExpenseForm Component
- Updated to use `CreateFlowLogDto` interface
- Forces expense type to OUT
- Maintains form validation

#### RecentMyFlow Component
- Updated to use new `FlowLog` interface
- Displays recent expenses with proper formatting

## Authentication & Authorization

### Token Management
- Uses Next.js cookies for access token storage
- Automatically includes Authorization header in API calls
- Handles token refresh on 401/403 responses

### API Route Protection
```typescript
const cookieStore = await cookies();
const accessToken = cookieStore.get('accessToken');

if (!accessToken) {
  return NextResponse.json(
    { error: 'No access token found' },
    { status: 401 }
  );
}
```

## Error Handling

### Structured Error Responses
```typescript
export interface FlowLogError {
  message: string;
  code?: string;
  details?: any;
}

export interface FlowLogApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Error Handling Patterns
1. **API Level**: Catches and formats backend errors
2. **Service Level**: Handles network and parsing errors
3. **Component Level**: Displays user-friendly error messages

## Caching Strategy

### In-Memory Cache (`SimpleCache`)
- **TTL**: 5 minutes for flow log data
- **Key-based**: Uses filter parameters as cache keys
- **Automatic**: Transparent to consuming components
- **Manual Clear**: Provides `clearCache()` method

### React Query Integration
- **staleTime**: 5 minutes
- **cacheTime**: 10 minutes
- **Automatic Refetch**: On window focus and network reconnection

## Logging

### Logger Utility (`lib/logger`)
```typescript
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

### Logging Patterns
- **API Calls**: Log request/response details
- **Errors**: Log error details for debugging
- **Cache Operations**: Log cache hits/misses
- **Component Lifecycle**: Log mounting/unmounting

## Testing

### Unit Tests
- **API Routes**: Test request handling and error cases
- **API Service**: Test CRUD operations and caching
- **Error Scenarios**: Test network failures and validation errors

### Test Coverage
- ✅ Successful API calls
- ✅ Error handling
- ✅ Authentication failures
- ✅ Validation errors
- ✅ Cache functionality
- ✅ Type safety

## Usage Examples

### Creating an Expense
```typescript
// In component
const handleSubmitExpense = useCallback(async (expenseData: CreateFlowLogDto) => {
  const result = await FlowLogApi.registerExpense(expenseData);
  
  if (result.success) {
    toast.success('Expense created successfully');
    queryClient.invalidateQueries(['recentExpenses']);
  } else {
    toast.error(result.error || 'Failed to create expense');
  }
}, [queryClient]);
```

### Fetching Recent Expenses
```typescript
// Using React Query
const { data: recentExpenses, isLoading, error } = useQuery(
  ['recentExpenses'],
  async () => {
    const response = await fetch('/api/expense');
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return response.json();
  },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  }
);
```

## Security Considerations

1. **Authentication**: All API routes require valid access tokens
2. **CORS**: Configured to accept requests from trusted origins
3. **Input Validation**: Backend validates all input data
4. **Error Messages**: Generic error messages to prevent information leakage
5. **Rate Limiting**: Can be implemented at the API gateway level

## Performance Optimization

1. **Caching**: Multiple layers (API service, React Query)
2. **Request Debouncing**: Prevents duplicate requests
3. **Optimistic Updates**: UI updates immediately before API confirmation
4. **Lazy Loading**: Components load data only when needed
5. **Bundle Splitting**: Code splitting for better load times

## Monitoring & Debugging

1. **Console Logging**: Comprehensive logging throughout the stack
2. **Error Tracking**: Structured error responses for debugging
3. **Performance Metrics**: React Query provides built-in metrics
4. **Network Monitoring**: Browser DevTools for API call inspection

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Filtering**: More sophisticated query parameters
3. **Export Functionality**: CSV/PDF export capabilities
4. **Analytics Dashboard**: Expense trends and insights
5. **Mobile App**: React Native integration

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check access token validity
2. **CORS Errors**: Verify backend CORS configuration
3. **Cache Issues**: Clear cache using `FlowLogApi.clearCache()`
4. **Network Errors**: Check backend service availability

### Debug Steps
1. Check browser console for detailed logs
2. Verify network requests in DevTools
3. Check backend service logs
4. Validate authentication tokens
5. Test API endpoints directly

## Conclusion

This integration provides a robust, type-safe, and scalable solution for expense tracking. The multi-layered architecture ensures proper separation of concerns while maintaining clean data flow between frontend and backend components.