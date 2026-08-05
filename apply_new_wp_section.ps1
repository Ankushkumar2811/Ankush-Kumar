$section = Get-Content -Path new_wp_section.html -Raw
if (-not $section) { throw "Rendered WordPress section is empty" }
$text = Get-Content -Path index.html -Raw
$startMarker = '<article class="proj-card platform" data-platform="true" data-cat="wordpress"'
$startIndex = $text.IndexOf($startMarker)
if ($startIndex -lt 0) { throw "Start marker not found" }
$endMarker = '<article class="proj-card platform" data-cat="shopify-hero"'
$endIndex = $text.IndexOf($endMarker, $startIndex)
if ($endIndex -lt 0) {
    $endMarker = '<article class="proj-card" data-cat="shopify"'
    $endIndex = $text.IndexOf($endMarker, $startIndex)
}
if ($endIndex -lt 0) { throw "Shopify section not found" }
$newText = $text.Substring(0, $startIndex) + $section + $text.Substring($endIndex)
Set-Content -Path index.html -Value $newText
