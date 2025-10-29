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
    companyName = 'SkyInfinit',
}) {
    const amountText = currency(amount, currencyCode);
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const invNum = invoiceNumber || `INV-${Date.now()}`;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
      padding: 48px 20px;
      margin: 0;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Main Container */
    .invoice-container {
      max-width: 720px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    /* Header */
    .invoice-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 48px 40px;
      color: #ffffff;
      position: relative;
      overflow: hidden;
    }
    .invoice-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    .invoice-header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -5%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .company-logo {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .header-subtitle {
      font-size: 15px;
      opacity: 0.9;
      font-weight: 400;
    }

    /* Body */
    .invoice-body {
      padding: 40px;
    }

    /* Top Section - Invoice & Billing Info */
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 2px solid #f1f5f9;
    }

    .info-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e2e8f0;
    }
    .info-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .info-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-row:first-child {
      padding-top: 0;
    }
    .detail-label {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }
    .detail-value {
      font-size: 14px;
      color: #1e293b;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    .billing-name {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .billing-email {
      font-size: 14px;
      color: #64748b;
    }

    /* Amount Section */
    .amount-container {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      margin-bottom: 32px;
    }
    .amount-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 12px;
    }
    .amount-value {
      font-size: 56px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
      letter-spacing: -2px;
    }
    .amount-currency {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
      margin-top: 8px;
    }

    /* Payment Button */
    .payment-section {
      text-align: center;
      margin-bottom: 32px;
    }
    .pay-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      padding: 18px 48px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none !important;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }
    .pay-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
    }

    /* Notice Box */
    .notice-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 20px 24px;
      margin-top: 32px;
    }
    .notice-icon {
      font-size: 18px;
      margin-bottom: 8px;
    }
    .notice-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .notice-text {
      font-size: 14px;
      color: #1e40af;
      line-height: 1.6;
    }

    /* Footer */
    .invoice-footer {
      background: #f8fafc;
      padding: 32px 40px;
      text-align: center;
      border-top: 2px solid #e2e8f0;
    }
    .footer-text {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .footer-meta {
      font-size: 12px;
      color: #94a3b8;
    }

    /* Responsive */
    @media (max-width: 640px) {
      body {
        padding: 24px 16px;
      }
      .invoice-header {
        padding: 36px 24px;
      }
      .company-logo {
        font-size: 26px;
      }
      .invoice-body {
        padding: 28px 24px;
      }
      .info-section {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .info-card {
        padding: 20px;
      }
      .amount-container {
        padding: 28px 20px;
      }
      .amount-value {
        font-size: 44px;
      }
      .pay-button {
        width: 100%;
        padding: 16px 32px;
      }
      .invoice-footer {
        padding: 28px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="invoice-header">
      <div class="header-content">
        <div class="company-logo">${companyName}</div>
        <div class="header-subtitle">Professional Invoice</div>
      </div>
    </div>

    <!-- Body -->
    <div class="invoice-body">
      <!-- Invoice & Billing Information -->
      <div class="info-section">
        <!-- Invoice Details -->
        <div class="info-card">
          <div class="info-label">Invoice Details</div>
          <div class="info-title">${title}</div>
          <div class="detail-row">
            <span class="detail-label">Invoice Number</span>:&nbsp;
            <span class="detail-value">${invNum}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Issue Date</span>:&nbsp;
            <span class="detail-value">${today}</span>
          </div>
        </div>

        <!-- Billing Information -->
        <div class="info-card">
          <div class="info-label">Billed To</div>
          <div class="billing-name">${recipientName || 'Valued Customer'}</div>
          ${recipientEmail ? `<div class="billing-email">${recipientEmail}</div>` : ''}
        </div>
      </div>

      <!-- Amount Due -->
      <div class="amount-container">
        <div class="amount-label">Total Amount Due</div>
        <div class="amount-value">${amountText}</div>
        <div class="amount-currency">${currencyCode.toUpperCase()}</div>
      </div>

      <!-- Payment Button -->
      ${checkoutUrl ? `
      <div class="payment-section">
        <a href="${checkoutUrl}" class="pay-button">Proceed to Payment</a>
      </div>
      ` : ''}

      <!-- Notice -->
      <div class="notice-box">
        <div class="notice-icon">ℹ️</div>
        <div class="notice-title">Need Help?</div>
        <div class="notice-text">
          This invoice was generated automatically. If you have any questions or need assistance, 
          please reply to this email and our support team will be happy to help.
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="invoice-footer">
      <div class="footer-text">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</div>
      <div class="footer-meta">Secure Payment Processing • Privacy Protected</div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { generateInvoiceHtml };