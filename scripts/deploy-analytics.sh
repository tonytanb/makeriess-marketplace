#!/bin/bash

# Deploy Analytics Infrastructure
# This script deploys the Kinesis, Firehose, Glue, and Athena infrastructure for analytics

set -e

# Configuration
ENVIRONMENT=${1:-dev}
STACK_NAME="makeriess-analytics-${ENVIRONMENT}"
TEMPLATE_FILE="amplify/custom/analytics/analytics-infrastructure.json"
REGION=${AWS_REGION:-us-east-1}

echo "🚀 Deploying Analytics Infrastructure for environment: ${ENVIRONMENT}"
echo "Stack Name: ${STACK_NAME}"
echo "Region: ${REGION}"
echo ""

# Check if stack exists
if aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${REGION} >/dev/null 2>&1; then
    echo "📦 Stack exists. Updating..."
    aws cloudformation update-stack \
        --stack-name ${STACK_NAME} \
        --template-body file://${TEMPLATE_FILE} \
        --parameters ParameterKey=EnvironmentName,ParameterValue=${ENVIRONMENT} \
        --capabilities CAPABILITY_IAM \
        --region ${REGION}
    
    echo "⏳ Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete \
        --stack-name ${STACK_NAME} \
        --region ${REGION}
else
    echo "📦 Stack does not exist. Creating..."
    aws cloudformation create-stack \
        --stack-name ${STACK_NAME} \
        --template-body file://${TEMPLATE_FILE} \
        --parameters ParameterKey=EnvironmentName,ParameterValue=${ENVIRONMENT} \
        --capabilities CAPABILITY_IAM \
        --region ${REGION}
    
    echo "⏳ Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete \
        --stack-name ${STACK_NAME} \
        --region ${REGION}
fi

echo ""
echo "✅ Stack deployment complete!"
echo ""

# Get stack outputs
echo "📊 Stack Outputs:"
aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

# Get Kinesis Stream ARN for event source mapping
KINESIS_STREAM_ARN=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`KinesisStreamArn`].OutputValue' \
    --output text)

KINESIS_STREAM_NAME=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`KinesisStreamName`].OutputValue' \
    --output text)

ANALYTICS_TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`AnalyticsTableName`].OutputValue' \
    --output text)

GLUE_DATABASE_NAME=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`GlueDatabaseName`].OutputValue' \
    --output text)

echo ""
echo "🔧 Configuration for Lambda Functions:"
echo "KINESIS_STREAM_NAME=${KINESIS_STREAM_NAME}"
echo "ANALYTICS_TABLE=${ANALYTICS_TABLE_NAME}"
echo "ATHENA_DATABASE=${GLUE_DATABASE_NAME}"
echo ""

# Check if Lambda function exists and create event source mapping
LAMBDA_FUNCTION_NAME="analyticsEventProcessor-${ENVIRONMENT}"

if aws lambda get-function --function-name ${LAMBDA_FUNCTION_NAME} --region ${REGION} >/dev/null 2>&1; then
    echo "🔗 Setting up Kinesis event source mapping for Lambda..."
    
    # Check if event source mapping already exists
    EXISTING_MAPPING=$(aws lambda list-event-source-mappings \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --event-source-arn ${KINESIS_STREAM_ARN} \
        --region ${REGION} \
        --query 'EventSourceMappings[0].UUID' \
        --output text)
    
    if [ "${EXISTING_MAPPING}" != "None" ] && [ -n "${EXISTING_MAPPING}" ]; then
        echo "✅ Event source mapping already exists: ${EXISTING_MAPPING}"
    else
        aws lambda create-event-source-mapping \
            --function-name ${LAMBDA_FUNCTION_NAME} \
            --event-source-arn ${KINESIS_STREAM_ARN} \
            --starting-position LATEST \
            --batch-size 100 \
            --maximum-batching-window-in-seconds 10 \
            --region ${REGION}
        echo "✅ Event source mapping created"
    fi
else
    echo "⚠️  Lambda function ${LAMBDA_FUNCTION_NAME} not found. Deploy Amplify backend first."
    echo "   Then run this script again to create the event source mapping."
fi

echo ""
echo "📝 Next Steps:"
echo "1. Update Lambda function environment variables with the values above"
echo "2. Run Glue crawler: aws glue start-crawler --name makeriess-analytics-crawler-${ENVIRONMENT}"
echo "3. Create Athena views using queries in amplify/custom/analytics/athena-queries.sql"
echo "4. Set up QuickSight dashboard using amplify/custom/analytics/quicksight-dashboard-config.json"
echo ""
echo "🎉 Analytics infrastructure deployment complete!"
