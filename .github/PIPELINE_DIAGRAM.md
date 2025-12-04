# CI/CD Pipeline Diagram

## Complete Pipeline Flow

```mermaid
graph TB
    Start[Developer Push] --> Branch{Which Branch?}
    
    Branch -->|feature/*| PR[Pull Request]
    Branch -->|develop| Staging[Staging Pipeline]
    Branch -->|main| Production[Production Pipeline]
    
    PR --> PRChecks[PR Checks]
    PRChecks --> Validate[Validate PR Title]
    PRChecks --> TestBuild[Test & Build]
    PRChecks --> Quality[Code Quality]
    PRChecks --> DepReview[Dependency Review]
    PRChecks --> A11y[Accessibility]
    
    Validate --> PRComment[Post PR Comment]
    TestBuild --> PRComment
    Quality --> PRComment
    DepReview --> PRComment
    A11y --> PRComment
    
    PRComment --> Merge{Approved?}
    Merge -->|No| FixIssues[Fix Issues]
    FixIssues --> PR
    Merge -->|Yes| Staging
    
    Staging --> StagingTest[Test & Lint]
    StagingTest --> StagingSecurity[Security Scan]
    StagingSecurity --> StagingDeploy[Deploy to Staging]
    StagingDeploy --> E2E[Run E2E Tests]
    E2E --> StagingNotify[Slack Notification]
    
    StagingNotify --> ReadyForProd{Ready for Production?}
    ReadyForProd -->|No| FixStaging[Fix Issues]
    FixStaging --> Staging
    ReadyForProd -->|Yes| Production
    
    Production --> ProdTest[Test & Lint]
    ProdTest --> ProdSecurity[Security Scan]
    ProdSecurity --> Approval{Manual Approval}
    
    Approval -->|Rejected| Stop[Stop Deployment]
    Approval -->|Approved| Canary[Canary Deployment 10%]
    
    Canary --> Monitor[Monitor 1 Hour]
    Monitor --> Metrics{Check Metrics}
    
    Metrics -->|Error Rate > 5%| Rollback[Automatic Rollback]
    Metrics -->|Healthy| Promote[Promote to 100%]
    
    Rollback --> RollbackNotify[Slack Alert]
    Promote --> PostMonitor[Post-Deployment Monitoring]
    PostMonitor --> Release[Create GitHub Release]
    Release --> ProdNotify[Slack Notification]
    
    style Start fill:#90EE90
    style Stop fill:#FFB6C1
    style Rollback fill:#FF6B6B
    style Promote fill:#90EE90
    style Release fill:#87CEEB
```

## Canary Deployment Detail

```mermaid
graph LR
    Deploy[Deploy New Version] --> Split[Traffic Split]
    Split --> Old[90% Old Version]
    Split --> New[10% New Version]
    
    New --> Monitor[Monitor Metrics]
    Monitor --> ErrorRate[Check Error Rate]
    Monitor --> Latency[Check Latency]
    Monitor --> Success[Check Success Rate]
    
    ErrorRate --> Decision{Healthy?}
    Latency --> Decision
    Success --> Decision
    
    Decision -->|Yes| Promote[Promote to 100%]
    Decision -->|No| Rollback[Rollback to Old]
    
    Promote --> Complete[Deployment Complete]
    Rollback --> Alert[Alert Team]
    
    style Deploy fill:#87CEEB
    style Promote fill:#90EE90
    style Rollback fill:#FF6B6B
    style Complete fill:#90EE90
    style Alert fill:#FFB6C1
```

## Branch Strategy

```mermaid
gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Setup"
    
    branch feature/auth
    checkout feature/auth
    commit id: "Add login"
    commit id: "Add signup"
    
    checkout develop
    merge feature/auth tag: "PR Merged"
    commit id: "Deploy Staging" type: HIGHLIGHT
    
    branch feature/products
    checkout feature/products
    commit id: "Add products"
    
    checkout develop
    merge feature/products
    commit id: "Deploy Staging" type: HIGHLIGHT
    
    checkout main
    merge develop tag: "v1.0.0"
    commit id: "Deploy Production" type: HIGHLIGHT
```

## Deployment Timeline

```mermaid
gantt
    title Production Deployment Timeline
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Pre-Deploy
    Tests & Build           :done, 00:00, 5m
    Security Scan          :done, 00:05, 3m
    Manual Approval        :done, 00:08, 10m
    
    section Canary
    Deploy 10%             :active, 00:18, 2m
    Monitor Metrics        :active, 00:20, 60m
    
    section Promotion
    Promote to 100%        :crit, 01:20, 5m
    Post-Deploy Monitor    :01:25, 5m
    Create Release         :01:30, 2m
```

## Monitoring Flow

```mermaid
graph TB
    Deploy[Deployment] --> CloudWatch[CloudWatch Metrics]
    
    CloudWatch --> Lambda[Lambda Errors]
    CloudWatch --> API[API Gateway 5xx]
    CloudWatch --> DB[DynamoDB Throttling]
    CloudWatch --> Latency[API Latency]
    
    Lambda --> Check{Threshold?}
    API --> Check
    DB --> Check
    Latency --> Check
    
    Check -->|Exceeded| Alert[Trigger Alert]
    Check -->|Normal| Continue[Continue Monitoring]
    
    Alert --> Slack[Slack Notification]
    Alert --> Rollback[Auto Rollback]
    
    Continue --> Dashboard[CloudWatch Dashboard]
    
    style Deploy fill:#87CEEB
    style Alert fill:#FF6B6B
    style Rollback fill:#FF6B6B
    style Continue fill:#90EE90
```

## Rollback Process

```mermaid
graph TB
    Issue[Issue Detected] --> Decision{Auto or Manual?}
    
    Decision -->|Auto| AutoRollback[Automatic Rollback]
    Decision -->|Manual| ManualRollback[Manual Rollback]
    
    AutoRollback --> Trigger[Trigger Rollback]
    ManualRollback --> Script[Run Rollback Script]
    
    Trigger --> GetPrevious[Get Previous Version]
    Script --> GetPrevious
    
    GetPrevious --> Deploy[Deploy Previous Version]
    Deploy --> Verify[Verify Deployment]
    
    Verify --> Success{Successful?}
    Success -->|Yes| Notify[Notify Team]
    Success -->|No| Escalate[Escalate to Team]
    
    Notify --> Investigate[Investigate Root Cause]
    Escalate --> Investigate
    
    style Issue fill:#FFB6C1
    style AutoRollback fill:#FF6B6B
    style ManualRollback fill:#FFA500
    style Notify fill:#90EE90
    style Escalate fill:#FF6B6B
```

## Security Scanning Flow

```mermaid
graph LR
    Code[Code Push] --> Audit[npm audit]
    Code --> Snyk[Snyk Scan]
    Code --> Sonar[SonarCloud]
    
    Audit --> Vulns{Vulnerabilities?}
    Snyk --> Vulns
    Sonar --> Quality{Quality Issues?}
    
    Vulns -->|High| Block[Block Deployment]
    Vulns -->|Low/Medium| Warn[Warning Only]
    Vulns -->|None| Pass[Pass]
    
    Quality -->|Critical| Block
    Quality -->|Minor| Warn
    Quality -->|None| Pass
    
    Block --> Issue[Create GitHub Issue]
    Warn --> Continue[Continue Pipeline]
    Pass --> Continue
    
    style Block fill:#FF6B6B
    style Warn fill:#FFA500
    style Pass fill:#90EE90
```

## E2E Testing Flow

```mermaid
graph TB
    Deploy[Staging Deployed] --> Install[Install Playwright]
    Install --> Tests[Run E2E Tests]
    
    Tests --> Homepage[Homepage Tests]
    Tests --> Products[Product Tests]
    Tests --> Cart[Cart Tests]
    Tests --> Auth[Auth Tests]
    
    Homepage --> Results{All Pass?}
    Products --> Results
    Cart --> Results
    Auth --> Results
    
    Results -->|Yes| Artifacts[Upload Artifacts]
    Results -->|No| Artifacts
    
    Artifacts --> Report[Generate Report]
    Report --> Notify[Notify Team]
    
    Results -->|Yes| Approve[Approve for Production]
    Results -->|No| Fix[Fix Issues]
    
    style Results fill:#87CEEB
    style Approve fill:#90EE90
    style Fix fill:#FFB6C1
```

## Legend

- 🟢 Green: Success/Healthy
- 🔴 Red: Error/Rollback
- 🟡 Yellow: Warning/Manual Action
- 🔵 Blue: In Progress/Active
- 🟣 Purple: Highlight/Important
