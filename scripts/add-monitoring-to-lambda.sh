#!/bin/bash

# Script to add monitoring utilities to existing Lambda functions
# Usage: ./scripts/add-monitoring-to-lambda.sh <function-name>

set -e

FUNCTION_NAME=$1

if [ -z "$FUNCTION_NAME" ]; then
  echo "Usage: ./scripts/add-monitoring-to-lambda.sh <function-name>"
  echo "Example: ./scripts/add-monitoring-to-lambda.sh processOrder"
  exit 1
fi

FUNCTION_DIR="amplify/data/functions/$FUNCTION_NAME"
HANDLER_FILE="$FUNCTION_DIR/handler.ts"
RESOURCE_FILE="$FUNCTION_DIR/resource.ts"

if [ ! -f "$HANDLER_FILE" ]; then
  echo "Error: Handler file not found: $HANDLER_FILE"
  exit 1
fi

echo "Adding monitoring to $FUNCTION_NAME..."

# Backup original file
cp "$HANDLER_FILE" "$HANDLER_FILE.backup"
echo "✓ Created backup: $HANDLER_FILE.backup"

# Check if monitoring is already added
if grep -q "from '../shared/logger'" "$HANDLER_FILE"; then
  echo "⚠ Monitoring utilities already imported in $HANDLER_FILE"
  echo "  Skipping import additions"
else
  # Add imports at the top of the file (after existing imports)
  echo "✓ Adding monitoring imports..."
  
  # This is a simplified approach - in production, use a proper AST parser
  echo "
// Monitoring utilities
import { createLogger } from '../shared/logger';
import { withErrorHandling } from '../shared/errorHandler';
import { recordMetric, flushMetrics } from '../shared/metrics';
import { traceAWSClient } from '../shared/tracing';
" >> "$HANDLER_FILE.tmp"
  
  cat "$HANDLER_FILE" >> "$HANDLER_FILE.tmp"
  mv "$HANDLER_FILE.tmp" "$HANDLER_FILE"
fi

echo "
✓ Monitoring utilities added to $FUNCTION_NAME

Next steps:
1. Review the changes in $HANDLER_FILE
2. Update your handler implementation to use the utilities:
   
   const logger = createLogger();
   const client = traceAWSClient(new DynamoDBClient({}));
   
   const handlerImpl = async (event, context) => {
     logger.setContext({ requestId: context.requestId });
     logger.info('Processing request');
     
     try {
       // ... your logic
       recordMetric('Success', 1);
       await flushMetrics();
       return { statusCode: 200, body: '...' };
     } catch (error) {
       await flushMetrics();
       throw error;
     }
   };
   
   export const handler = withErrorHandling(handlerImpl);

3. Test the function locally
4. Deploy with: npx amplify sandbox

For detailed examples, see:
- amplify/data/functions/processOrder/handler-with-monitoring.ts
- docs/MONITORING_SETUP.md
"

echo "Original file backed up to: $HANDLER_FILE.backup"
