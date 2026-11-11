# Converts the Word closure / service forms (.doc / .docx) to PDF blanks in data\Blank Forms, using Microsoft Word.
# The app fills PDFs only; make_closure_forms.mjs measures and fills these converted copies (prebuiltBlank: true).
# usage (from the repo root): powershell -ExecutionPolicy Bypass -File tools\form-building\convert_word_blanks.ps1
$source = Join-Path (Resolve-Path "..") "Account Closure Forms\Individual"
$blanks = Join-Path (Resolve-Path ".") "data\Blank Forms"
$files = [ordered]@{
  "Caliber\Common Closure Form.docx" = "360 ONE Distribution POA Closure Letter.pdf"
  "Caliber\Advisory closure form.docx" = "360 ONE Advisory POA Closure Letter.pdf"
  "PMS\Consult & Alpha\360 One Portfolio Managers PMS closure Form_UPDATED.docx" = "360 ONE Portfolio Managers PMS Closure Form.pdf"
  "Bank\Revocation of POA.doc" = "HDFC Bank POA Revocation Letter.pdf"
}
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  foreach ($entry in $files.GetEnumerator()) {
    $document = $word.Documents.Open((Join-Path $source $entry.Key), $false, $true)
    $document.SaveAs([ref](Join-Path $blanks $entry.Value), [ref]17)  # 17 = wdFormatPDF
    $document.Close([ref]0)
    "converted $($entry.Value)"
  }
} finally { $word.Quit() }
