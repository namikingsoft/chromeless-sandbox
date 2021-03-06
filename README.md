Sandbox of Chromeless
==============================

## i.e. serverless.yml (chromeless proxy in VPC)
```yaml
service: chromeless-serverless

custom:
  stage: dev
  debug: "*"
  awsIotHost: ****.iot.ap-northeast-1.amazonaws.com
  chrome:
    functions:
      - run

provider:
  name: aws
  runtime: nodejs6.10
  stage: ${self:custom.stage}
  region: ap-northeast-1
  timeout: 30 # optional, in seconds, default is 6
  vpc:
    securityGroupIds:
      - sg-**** # your security group id
    subnetIds:
      - subnet-**** # your subnet id
      - subnet-****
  environment:
    DEBUG: ${self:custom.debug}
    AWS_IOT_HOST: ${self:custom.awsIotHost}
  apiKeys:
    - ${self:custom.stage}-chromeless-session-key
  iamRoleStatements:
    - Effect: "Allow"
      Action:
        - "ec2:CreateNetworkInterface"
        - "ec2:DescribeNetworkInterfaces"
        - "ec2:DeleteNetworkInterface"
      Resource:
        - "*"
    - Effect: "Allow"
      Action:
        - "iot:Connect"
        - "iot:Publish"
        - "iot:Subscribe"
        - "iot:Receive"
        - "iot:GetThingShadow"
        - "iot:UpdateThingShadow"
      Resource: "*"
    - Effect: "Allow"
      Action:
        - s3:*
      Resource:
        Fn::Join:
          - ""
          - - "arn:aws:s3:::"
            - Ref: AWS::AccountId
            - "-"
            - Ref: AWS::Region
            - -chromeless
            - /*

plugins:
  - serverless-plugin-typescript
  - serverless-plugin-chrome
  - serverless-offline

functions:
  run:
    memorySize: 1536
    timeout: 300
    handler: src/run.default
    events:
      - iot:
          sql: "SELECT * FROM 'chrome/new-session'"
    environment:
      CHROMELESS_S3_BUCKET_NAME:
        Fn::Join:
          - ""
          - - Ref: AWS::AccountId
            - "-"
            - Ref: AWS::Region
            - -chromeless
      CHROMELESS_S3_OBJECT_KEY_PREFIX: ""
      CHROMELESS_S3_BUCKET_URL:
        Fn::GetAtt:
          - Bucket
          - DomainName
  version:
    memorySize: 128
    handler: src/version.default
    events:
    - http:
        path: /version
        method: GET
  session:
    memorySize: 128
    timeout: 10
    handler: src/session.default
    events:
      - http:
          method: OPTIONS
          path: /
          private: true
      - http:
          method: GET
          path: /
          private: true
  disconnect:
    memorySize: 256
    handler: src/disconnect.default
    timeout: 10
    events:
      - iot:
          sql: "SELECT * FROM 'chrome/last-will'"

resources:
  Resources:
    RunLogGroup:
      Properties:
        RetentionInDays: 7
    VersionLogGroup:
      Properties:
        RetentionInDays: 7
    SessionLogGroup:
      Properties:
        RetentionInDays: 7
    DisconnectLogGroup:
      Properties:
        RetentionInDays: 7
    Bucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName:
          Fn::Join:
            - ""
            - - Ref: AWS::AccountId
              - "-"
              - Ref: AWS::Region
              - -chromeless
        LifecycleConfiguration:
          Rules:
          - ExpirationInDays: 1
            Status: Enabled
```
