$functionDirs = Get-ChildItem -Path "src/functions" -Directory

foreach ($dir in $functionDirs) {
    $sourcePath = Join-Path "src/functions" $dir.Name
    $targetPath = Join-Path "functions" $dir.Name
    
    # Copy files
    Copy-Item -Path "$sourcePath/*" -Destination $targetPath -Recurse -Force
    
    # Update package.json
    $packageJsonPath = Join-Path $targetPath "package.json"
    if (Test-Path $packageJsonPath) {
        $json = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        $json.scripts.lint = "eslint ."
        $json.scripts.'lint:fix' = "eslint . --fix"
        $json | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
    }
    
    # Update .eslintrc.json
    $eslintPath = Join-Path $targetPath ".eslintrc.json"
    if (Test-Path $eslintPath) {
        $eslint = Get-Content $eslintPath -Raw | ConvertFrom-Json
        $eslint.ignorePatterns = @("dist/*")
        $eslint | ConvertTo-Json -Depth 10 | Set-Content $eslintPath
    }
    
    # Update tsconfig.json
    $tsconfigPath = Join-Path $targetPath "tsconfig.json"
    if (Test-Path $tsconfigPath) {
        $tsconfig = Get-Content $tsconfigPath -Raw | ConvertFrom-Json
        $tsconfig.compilerOptions.rootDir = "."
        $tsconfig.include = @("./**/*")
        $tsconfig | ConvertTo-Json -Depth 10 | Set-Content $tsconfigPath
    }
    
    # Run prettier on all TypeScript files
    $tsFiles = Get-ChildItem -Path $targetPath -Filter "*.ts" -Recurse
    foreach ($file in $tsFiles) {
        npx prettier --write $file.FullName
    }
    
    # Install dependencies and build
    Set-Location $targetPath
    npm install
    npm run build
    Set-Location -Path "../../"
}

# Remove src/functions directory after successful migration
Remove-Item -Path "src/functions" -Recurse -Force
