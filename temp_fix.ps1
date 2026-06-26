$content = Get-Content "d:\GitHub\blog-demo - 1\source\_posts\给女友的10000封情书.md" -Raw -Encoding UTF8
$leftQuote = [char]::ConvertFromUtf32(0x201C)
$rightQuote = [char]::ConvertFromUtf32(0x201D)
$oldText = "眼里是藏不住的艳羡，我眼前却总是想着那个说$leftQuote" + "快逃快逃" + "$rightQuote的小姑娘，那一瞬我心疼得说不出话。你说没有遗憾，我没有否认，但不论是如何"
$newText = "眼里是藏不住的艳羡。你角落里探着身子，似乎那个老讲着快逃快逃的小女孩从未走远，看着照片，只剩下心疼。但你也不是认输服软的性子"
$content = $content -replace [regex]::Escape($oldText), $newText
Set-Content -Path "d:\GitHub\blog-demo - 1\source\_posts\给女友的10000封情书.md" -Value $content -Encoding UTF8 -NoNewline
Write-Host "Done"
