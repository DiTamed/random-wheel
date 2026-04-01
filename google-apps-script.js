/**
 * Google Apps Script – Vòng Quay May Mắn
 * 
 * Hướng dẫn deploy:
 * 1. Mở script tại: https://script.google.com
 * 2. Tạo project mới hoặc mở project hiện tại
 * 3. Xóa toàn bộ code cũ, dán code này vào
 * 4. Thay SHEET_ID bên dưới bằng ID của Google Sheet của bạn
 *    (lấy từ URL: docs.google.com/spreadsheets/d/<<SHEET_ID>>/edit)
 * 5. Bấm "Deploy" → "New deployment"
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone   ← BẮT BUỘC phải chọn Anyone
 * 6. Copy URL mới → dán vào file .env (SHEET_API=...)
 */

const SHEET_ID   = 'YOUR_GOOGLE_SHEET_ID_HERE'; // ← Thay vào đây
const SHEET_NAME = 'Sheet1';                      // Tên sheet (tab) trong file

function doGet(e) {
  try {
    const params = e.parameter;
    const name   = params.name   || '';
    const phone  = params.phone  || '';
    const branch = params.branch || '';
    const result = params.result || '';
    const time   = params.time   || new Date().toISOString();

    // Mở spreadsheet
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    // Tạo header nếu sheet còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Thời Gian', 'Họ Tên', 'Số Điện Thoại', 'Chi Nhánh', 'Phần Thưởng']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#4a4a8a').setFontColor('#ffffff');
    }

    // Ghi dòng data mới
    sheet.appendRow([
      new Date(time),  // Thời gian
      name,
      phone,
      branch,
      result,
    ]);

    // Format cột thời gian
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
