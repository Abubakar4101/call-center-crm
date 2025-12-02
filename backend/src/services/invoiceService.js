function currency(amount, currencyCode = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode.toUpperCase() }).format(amount);
  } catch (_) {
    return `$${Number(amount).toFixed(2)}`;
  }
}

function generateInvoiceHtml({
  title = 'Payment Invoice',
  amount = 0,
  currencyCode = 'USD',
  recipientName = '',
  recipientEmail = '',
  checkoutUrl = '',
  invoiceNumber = '',
  companyName = 'SWIFT TRUCX',
  items = [],
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  notes = 'It was a pleasure working with you. Here is the invoice. Please pay this invoice asap. Thanks.',
  taxRate = 0
}) {
  const formattedAmount = currency(amount, currencyCode);
  const invNum = invoiceNumber || `INV-${Date.now()}`;

  // Handle backward compatibility or default item
  const invoiceItems = items.length > 0 ? items : [{
    description: title,
    quantity: 1,
    rate: amount,
    amount: amount
  }];

  const subtotal = invoiceItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Logo URL - assuming backend is serving uploads or use a public URL if available
  const logoUrl = `https://i.ibb.co/QF9jW6tg/swift-trucx-logo.png`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invNum}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
      color: #333 !important;
      background-color: #f8fafc !important;
      margin: 0 !important;
      padding: 40px 20px !important;
    }
    .container {
      max-width: 800px !important;
      margin: 0 auto !important;
      background: #fff !important;
      padding: 40px !important;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05) !important;
    }
    .header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: flex-start !important;
      margin-bottom: 40px !important;
    }
    .logo-container {
      max-width: 250px !important;
    }
    .logo-img {
      max-width: 100% !important;
      height: auto !important;
    }
    .invoice-details {
      text-align: right !important;
    }
    .invoice-title {
      font-size: 36px !important;
      color: #333 !important;
      margin: 0 !important;
      font-weight: 400 !important;
      letter-spacing: 1px !important;
    }
    .invoice-number {
      font-size: 16px !important;
      color: #666 !important;
      margin-top: 5px !important;
    }
    .meta-info {
      display: flex !important;
      justify-content: flex-end !important;
      margin-top: 40px !important;
      margin-bottom: 20px !important;
    }
    .meta-table {
      text-align: right !important;
    }
    .meta-label {
      color: #666 !important;
      padding-right: 20px !important;
      padding-bottom: 5px !important;
    }
    .meta-value {
      font-weight: 500 !important;
      padding-bottom: 5px !important;
    }
    .balance-bar {
      background-color: #f4f4f4 !important;
      padding: 10px 20px !important;
      display: flex !important;
      justify-content: flex-end !important;
      align-items: center !important;
      margin-bottom: 40px !important;
      border-radius: 4px !important;
    }
    .balance-label {
      font-weight: bold !important;
      margin-right: 30px !important;
      font-size: 16px !important;
    }
    .balance-amount {
      font-weight: bold !important;
      font-size: 16px !important;
    }
    .addresses {
      margin-bottom: 40px !important;
    }
    .sender-name {
      font-weight: bold !important;
      font-size: 16px !important;
      margin-bottom: 20px !important;
      text-transform: uppercase !important;
    }
    .bill-to-label {
      color: #999 !important;
      font-size: 14px !important;
      margin-bottom: 5px !important;
    }
    .bill-to-name {
      font-weight: bold !important;
      font-size: 16px !important;
      text-transform: uppercase !important;
    }
    .items-table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin-bottom: 30px !important;
    }
    .items-table th {
      background-color: #333 !important;
      color: #fff !important;
      padding: 12px !important;
      text-align: left !important;
      font-weight: 500 !important;
    }
    .items-table th:last-child {
      text-align: right !important;
    }
    .items-table th:nth-child(2), .items-table th:nth-child(3) {
        text-align: right !important;
    }
    .items-table td {
      padding: 12px !important;
      border-bottom: 1px solid #eee !important;
      color: #333 !important;
    }
    .items-table td:last-child {
      text-align: right !important;
    }
    .items-table td:nth-child(2), .items-table td:nth-child(3) {
        text-align: right !important;
    }
    .item-desc {
      font-weight: bold !important;
    }
    .totals-section {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      margin-bottom: 40px !important;
    }
    .total-row {
      display: flex !important;
      justify-content: flex-end !important;
      width: 300px !important;
      padding: 5px 0 !important;
    }
    .total-label {
      flex: 1 !important;
      text-align: right !important;
      padding-right: 30px !important;
      color: #666 !important;
    }
    .total-value {
      width: 100px !important;
      text-align: right !important;
    }
    .notes-section {
      margin-top: 40px !important;
      color: #666 !important;
      font-size: 14px !important;
    }
    .notes-label {
      margin-bottom: 5px !important;
      color: #999 !important;
    }
    .pay-btn-container {
        text-align: center !important;
        margin-top: 30px !important;
    }
    .pay-btn {
        background-color: #333 !important;
        color: white !important;
        padding: 12px 24px !important;
        text-decoration: none !important;
        border-radius: 4px !important;
        font-weight: bold !important;
    }
  </style>
</head>
<body>
  <div class="container">
<table width="100%" cellpadding="0" cellspacing="0">
 <tr>
 <td class="logo-container" align="left" style="width: 50%;">
        <img src="${logoUrl}" alt="${companyName}" class="logo-img" />
    </td>
        <td class="invoice-details" align="right" style="width: 50%;">
         <h1 class="invoice-title">INVOICE</h1>
        <div class="invoice-number"># ${invNum}</div>
     
</td>
    </tr>
    </table>

    <div class="meta-info">
      <table class="meta-table">
        <tr>
          <td class="meta-label">Date:</td>
          <td class="meta-value">${date}</td>
        </tr>
      </table>
    </div>

    <div class="balance-bar">
      <span class="balance-label">Balance Due:</span>
      <span class="balance-amount">${formattedAmount}</span>
    </div>

    <div class="addresses">
      <div class="sender-name">${companyName}</div>
      
      <div class="bill-to">
        <div class="bill-to-label">Bill To:</div>
        <div class="bill-to-name">${recipientName}</div>
        ${recipientEmail ? `<div>${recipientEmail}</div>` : ''}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th width="50%">Item</th>
          <th width="15%">Quantity</th>
          <th width="20%">Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoiceItems.map(item => `
        <tr>
          <td class="item-desc">${item.description}</td>
          <td>${item.quantity}</td>
          <td>${currency(item.rate, currencyCode)}</td>
          <td>${currency(item.amount, currencyCode)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="total-row">
        <div class="total-label">Subtotal:</div>
        <div class="total-value">${currency(subtotal, currencyCode)}</div>
      </div>
      <div class="total-row">
        <div class="total-label">Tax (${taxRate}%):</div>
        <div class="total-value">${currency(taxAmount, currencyCode)}</div>
      </div>
      <div class="total-row">
        <div class="total-label">Total:</div>
        <div class="total-value">${currency(total, currencyCode)}</div>
      </div>
    </div>

    <div class="notes-section">
      <div class="notes-label">Notes:</div>
      <div>${notes}</div>
    </div>

    ${checkoutUrl ? `
    <div class="pay-btn-container">
        <a href="${checkoutUrl}" class="pay-btn">Pay Invoice</a>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
}

module.exports = { generateInvoiceHtml };