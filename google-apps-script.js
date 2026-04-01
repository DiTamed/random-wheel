/**
 * Google Apps Script – Vòng Quay May Mắn
 *
 * Hướng dẫn deploy:
 * 1. Mở script tại: https://script.google.com
 * 2. Tạo project mới hoặc mở project hiện tại
 * 3. Xóa toàn bộ code cũ, dán code này vào
 * 4. Bấm "Deploy" → "New deployment"
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone   ← BẮT BUỘC phải chọn Anyone
 * 5. Copy URL dạng: https://script.google.com/macros/s/AK.../exec
 *    → dán vào file .env.local: SHEET_API=https://script.google.com/macros/s/AK.../exec
 *
 * LƯU Ý: Mỗi lần sửa code phải "Deploy" → "New deployment" (không phải Manage deployments)
 */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  const rows = sheet.getDataRange().getValues();

  // Check SĐT đã tồn tại chưa (cột index 2 = Số Điện Thoại)
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][2]).trim() === String(data.phone).trim()) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'exists' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Chưa có → tạo header nếu sheet trống
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Thời Gian', 'Họ Tên', 'Số Điện Thoại', 'Chi Nhánh', 'Phần Thưởng']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#4a4a8a').setFontColor('#ffffff');
  }

  // Ghi dòng mới
  sheet.appendRow([
    new Date(),
    data.name,
    data.phone,
    data.branch,
    data.result,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
