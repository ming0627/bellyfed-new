# EFS Mount Issues Troubleshooting Guide

## Common EFS Mount Errors

### Error: Failed to resolve EFS DNS name

**Error Message:**

```
ResourceInitializationError: failed to invoke EFS utils commands to set up EFS volumes: stderr: Failed to resolve "fs-XXXX.efs.region.amazonaws.com" - check that your file system ID is correct, and ensure that the VPC has an EFS mount target for this file system ID.
```

**Causes:**

1. EFS file system and ECS tasks are in different subnets
2. Missing EFS mount targets in the subnets where ECS tasks run
3. Security group issues preventing NFS traffic
4. DNS resolution issues in the VPC

**Solutions:**

1. **Ensure subnet compatibility:**

    - EFS file system should be created in the same subnets where ECS tasks run
    - Both should use the same subnet type (e.g., `PRIVATE_ISOLATED`)

2. **Check security groups:**

    - EFS security group must allow inbound NFS traffic (TCP port 2049) from the ECS task security group
    - ECS task security group must allow outbound traffic to the EFS security group on port 2049

3. **Verify mount targets:**

    - Ensure EFS mount targets exist in all subnets where ECS tasks might run
    - Check the status of mount targets in the AWS console

4. **Check IAM permissions:**

    - ECS task role needs permissions for EFS operations:
        ```
        elasticfilesystem:ClientMount
        elasticfilesystem:ClientWrite
        elasticfilesystem:ClientRootAccess
        elasticfilesystem:DescribeMountTargets
        ```

5. **DNS troubleshooting:**
    - Ensure DNS resolution is enabled in the VPC
    - Check if the EFS DNS name can be resolved from within the VPC

## Typesense and EFS

Typesense uses EFS for persistent storage of its data. This ensures that:

1. Data persists across container restarts
2. Multiple Typesense instances can share the same data
3. Data is backed up and protected against instance failures

While Typesense can technically run without EFS (using ephemeral storage), this is not recommended for production as all data would be lost when containers restart.

## Checking EFS Mount Status

To check if EFS is properly mounted in a running container:

1. **Get the task ID:**

    ```bash
    aws ecs list-tasks --cluster bellyfed-{environment} --service-name bellyfed-typesense-{environment}
    ```

2. **Execute command in the container:**

    ```bash
    aws ecs execute-command --cluster bellyfed-{environment} --task {task-id} --container TypesenseContainer --command "/bin/sh" --interactive
    ```

3. **Check the mount:**
    ```bash
    df -h
    ls -la /data
    ```

## Fixing EFS Mount Issues

If you encounter EFS mount issues:

1. **Update subnet configuration:**

    - Ensure the ECS service uses the same subnet type as the EFS file system
    - Update the `vpcSubnets` property in `TypesenseServiceStack`

2. **Add security group rules:**

    - Add explicit rules for NFS traffic (port 2049)
    - Ensure bidirectional communication between ECS and EFS

3. **Add IAM permissions:**

    - Ensure the task role has the necessary EFS permissions

4. **Redeploy the stack:**
    ```bash
    npx cdk deploy BellyfedTypesenseInfraStack-{environment}
    npx cdk deploy BellyfedTypesenseServiceStack-{environment}
    ```

## Alternative Storage Options

If EFS continues to cause issues, consider these alternatives:

1. **Use ephemeral storage for development/testing:**

    - Remove the EFS volume configuration
    - Note that data will be lost on container restart

2. **Use S3 for backups:**

    - Configure Typesense to periodically back up to S3
    - This provides data persistence without EFS

3. **Use EBS volumes:**
    - For single-instance deployments, EBS can be simpler
    - Note that this limits scaling capabilities
