# Define the input SCSS file and output CSS file
$inputFile = ".\homepage.scss"
$outputFile = ".\homepage.css"

# Check if the input SCSS file exists
if (-not (Test-Path $inputFile)) {
    Write-Host "SCSS file not found: $inputFile" -ForegroundColor Red
    exit 1
}

# Compile the SCSS file to CSS
Write-Host "Compiling $inputFile to $outputFile"
sass $inputFile $outputFile

# Confirm success
if (Test-Path $outputFile) {
    Write-Host "Compilation successful: $outputFile" -ForegroundColor Green
} else {
    Write-Host "Failed to compile SCSS to CSS." -ForegroundColor Red
}
