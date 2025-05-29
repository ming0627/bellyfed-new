# Event Flow Troubleshooting Guide

## Overview

This guide provides operational procedures for monitoring, troubleshooting, and maintaining event flows in the Bellyfed system.

**Document Owner:** Operations Team  
**Last Updated:** [Current Date]  
**Target Audience:** Operations Staff, Support Engineers

## Monitoring Procedures

### 1. Daily Checks

#### 1.1 Queue Health

- Monitor SQS queue lengths
- Check DLQ message counts
- Review processing latency

#### 1.2 Lambda Performance

- Check error rates
- Monitor execution duration
- Review memory utilization

### 2. Alert Response

#### 2.1 DLQ Alerts

**When:** Messages appear in DLQ
**Response:**

1. Check CloudWatch logs for error details
2. Identify failure pattern
3. If systematic issue, escalate to development
4. If transient, replay messages

#### 2.2 Processing Delay Alerts

**When:** Processing time > 5 minutes
**Response:**

1. Check Lambda concurrency
2. Review SQS queue backlog
3. Verify downstream service health
4. Scale resources if needed

## Troubleshooting Procedures

### 1. Common Issues

#### 1.1 Message Processing Failures

**Symptoms:**

- Messages in DLQ
- High error rate in Lambda

**Resolution Steps:**

1. Review CloudWatch logs
2. Check message format
3. Verify permissions
4. Test downstream services

#### 1.2 Event Flow Delays

**Symptoms:**

- Increased processing time
- Queue backlog

**Resolution Steps:**

1. Check service quotas
2. Review Lambda configuration
3. Verify network connectivity
4. Scale resources if needed

### 2. Recovery Procedures

#### 2.1 DLQ Message Recovery

```bash
# Get messages from DLQ
aws sqs receive-message --queue-url $DLQ_URL

# Replay to main queue
aws sqs send-message --queue-url $MAIN_QUEUE_URL --message-body "$MESSAGE"
```

#### 2.2 Event Flow Recovery

1. Verify all services are operational
2. Clear any stuck messages
3. Reset processing state if needed
4. Monitor recovery progress

## Maintenance Procedures

### 1. Regular Maintenance

#### 1.1 Weekly Tasks

- Review CloudWatch logs
- Check DLQ contents
- Update monitoring thresholds

#### 1.2 Monthly Tasks

- Review scaling configurations
- Update alert thresholds
- Clean up old logs

### 2. Emergency Procedures

#### 2.1 Flow Shutdown

1. Stop source events
2. Process remaining messages
3. Verify DLQ is empty
4. Update status dashboard

#### 2.2 Flow Restart

1. Verify all services are ready
2. Enable source events
3. Monitor initial processing
4. Update status dashboard

## Escalation Procedures

### 1. First Level Support

- Monitor alerts
- Initial troubleshooting
- Basic recovery procedures

### 2. Second Level Support

- Complex issues
- Performance problems
- Security incidents

### 3. Development Team

- System bugs
- Architecture issues
- Performance optimization

## Related Documentation

- [TECH - Event Flow Architecture]()
- [OPS - Monitoring Dashboard Guide]()
- [TECH - AWS Service Limits]()
- [OPS - Incident Response Protocol]()

---

**Note:** Keep this guide updated with new issues and solutions as they are discovered.
