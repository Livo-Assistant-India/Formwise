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
  "PMS\AMC PMS\0.PoA revocation letter (HDFC Bank and Demat).doc" = "HDFC Bank and Demat POA Revocation Letter.pdf"
  "Caliber\Notice of Termination - Advisory.docx" = "360 ONE Advisory Notice of Termination.pdf"
  "PMS\AMC PMS\DORMANT REMOVAL_BANK.docx" = "HDFC Bank Dormant Removal Letter.pdf"
  "..\Non-Individual\PMS\4.Board Resolution format Hdfc Bank and DP.docx" = "Board Resolution - HDFC Bank Account Closure.pdf"
  "..\Non-Individual\PMS\Board resolution format for Demat.docx" = "Board Resolution - Demat Account Closure.pdf"
  # Carries a sample firm name: make_closure_blanks.py blanks it out of the copy afterwards.
  "..\Non-Individual\Bank\Partnership firm Board Resolution format Hdfc Bank and DP_HDFC CLOSURE.docx" = "Partnership Resolution - HDFC Bank Account Closure.pdf"
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
