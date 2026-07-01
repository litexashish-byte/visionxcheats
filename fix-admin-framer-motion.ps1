$adminDir = "C:\Users\ASHISH SINGH\Desktop\New folder (2)\frontend\app\admin"

$files = @(
    "dashboard\page.js",
    "users\page.js",
    "free-panels\page.js",
    "paid-panels\page.js",
    "settings\page.js",
    "downloads\page.js",
    "licenses\page.js"
)

foreach ($file in $files) {
    $path = Join-Path $adminDir $file
    if (-not (Test-Path $path)) {
        Write-Output "SKIP: $file not found"
        continue
    }
    
    $content = Get-Content $path -Raw -Encoding UTF8
    $original = $content
    
    # Remove framer-motion import lines
    $content = $content -replace "import\s*\{\s*motion\s*\}\s*from\s*'framer-motion';?\s*\n?", ""
    $content = $content -replace "import\s*\{\s*motion\s*,\s*AnimatePresence\s*\}\s*from\s*'framer-motion';?\s*\n?", ""
    $content = $content -replace "import\s*\{\s*AnimatePresence\s*,\s*motion\s*\}\s*from\s*'framer-motion';?\s*\n?", ""
    $content = $content -replace "import\s*\{\s*AnimatePresence\s*\}\s*from\s'framer-motion';?\s*\n?", ""
    
    # Replace <motion.div with <div (remove animation props)
    $content = $content -replace "<motion\.div", "<div"
    $content = $content -replace "</motion\.div>", "</div>"
    
    # Replace AnimatePresence with Fragment
    $content = $content -replace "<AnimatePresence>", "<>"
    $content = $content -replace "</AnimatePresence>", "</>"
    
    # Remove motion-specific props from div tags
    # variants={containerVariants} or variants={itemVariants}
    $content = $content -replace "\s*variants=\{[a-zA-Z]+\}", ""
    # initial={{ opacity: 0, y: 20 }}
    $content = $content -replace "\s*initial=\{\{[^}]+\}\}", ""
    # animate={{ opacity: 1, y: 0 }}
    $content = $content -replace "\s*animate=\{\{[^}]+\}\}", ""
    # whileHover={{ scale: 1.02 }}
    $content = $content -replace "\s*whileHover=\{\{[^}]+\}\}", ""
    # whileTap={{ scale: 0.98 }}
    $content = $content -replace "\s*whileTap=\{\{[^}]+\}\}", ""
    # exit={{ opacity: 0, y: -20 }}
    $content = $content -replace "\s*exit=\{\{[^}]+\}\}", ""
    # transition={{ duration: 0.3 }}
    $content = $content -replace "\s*transition=\{\{[^}]+\}\}", ""
    
    # Remove variant object definitions (containerVariants, itemVariants)
    $content = $content -replace "const\s+containerVariants\s*=\s*\{[^}]+\};?\s*\n?", ""
    $content = $content -replace "const\s+itemVariants\s*=\s*\{[^}]+\};?\s*\n?", ""
    
    # Clean up multiple blank lines
    $content = $content -replace "\n\s*\n\s*\n", "`n`n"
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Output "FIXED: $file"
    } else {
        Write-Output "UNCHANGED: $file"
    }
}

Write-Output "`nDone!"