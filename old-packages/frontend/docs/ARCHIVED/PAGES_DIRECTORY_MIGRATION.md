# Pages Directory Migration

This document explains the migration from the root `./pages` directory to `src/pages` and the GitHub Actions workflow that ensures no files are accidentally created in the deprecated directory.

## Background

Next.js applications traditionally used a root-level `./pages` directory for routing. However, as applications grow, it's often better to organize all source code within a `src` directory, including pages.

In the Bellyfed application, we've migrated all pages from the root `./pages` directory to `src/pages` to improve code organization and maintainability.

## Migration Benefits

1. **Better Code Organization**: All source code is now contained within the `src` directory, making it easier to navigate the codebase.
2. **Improved Separation of Concerns**: Clear separation between application code and configuration files.
3. **Consistent Import Paths**: All imports now use the `@/` alias, which points to the `src` directory.
4. **Easier to Apply Code Quality Tools**: Many code quality tools work better with a consistent directory structure.

## GitHub Actions Workflow

To prevent accidental creation of files in the deprecated `./pages` directory, we've set up a GitHub Actions workflow that checks for the presence of this directory and any files within it.

### Workflow File

The workflow is defined in `.github/workflows/check-no-pages-dir.yml` and runs on:

- Push to develop, staging, or main branches
- Pull requests to develop, staging, or main branches
- Manual triggering (workflow_dispatch)

### Workflow Steps

1. **Check for ./pages directory**: Verifies that the `./pages` directory doesn't exist.
2. **Check for files in ./pages path**: Ensures no files have been accidentally created in the `./pages` path.

If either check fails, the workflow will fail with an error message indicating the issue.

## What to Do If the Workflow Fails

If the GitHub Actions workflow fails, it means that files have been accidentally created in the deprecated `./pages` directory. To fix this:

1. Identify the files in the `./pages` directory (the workflow output will list them).
2. Move these files to the appropriate location in `src/pages`.
3. Remove the `./pages` directory.
4. Commit and push your changes.

## Best Practices

1. **Always create new pages in `src/pages`**: Never create pages in the root `./pages` directory.
2. **Use the `@/` alias for imports**: Import from `@/components`, `@/utils`, etc., instead of using relative paths.
3. **Run the workflow locally**: You can manually check for files in the `./pages` directory before pushing your changes:
   ```bash
   if [ -d "./pages" ]; then
     echo "The ./pages directory exists! Please move all pages to src/pages."
     find ./pages -type f | sort
     exit 1
   else
     echo "No ./pages directory found. Good job!"
   fi
   ```

## Related Documentation

- [Next.js Project Structure Documentation](https://nextjs.org/docs/getting-started/project-structure)
- [Bellyfed Dynamic Country Routing](./DYNAMIC_COUNTRY_ROUTING.md)
