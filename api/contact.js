import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name = 'Valued Client',
      email,
      phone,
      contactMethod = 'WhatsApp',
      service = 'General Import Inquiry',
      vehicle = 'Not Specified',
      year = 'N/A',
      origin = 'Japan',
      vin = '',
      county = 'Dublin',
      message = 'No additional notes provided.',
      refId = `TWM-2026-${Math.floor(1000 + Math.random() * 9000)}`
    } = req.body || {};

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // Configure Nodemailer transporter with verified cPanel SMTP credentials
    const transporter = nodemailer.createTransport({
      host: 'server.w3webhosting.net',
      port: 465,
      secure: true,
      auth: {
        user: 'no-reply@truewheelmotors.ie',
        pass: 'TueWheels@2026'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // 1. Send Notification Email to Dublin Operations Desk (info@truewheelmotors.ie)
    const adminMailOptions = {
      from: `"True Wheel Motors Web Desk" <no-reply@truewheelmotors.ie>`,
      to: 'info@truewheelmotors.ie',
      replyTo: email ? `${name} <${email}>` : 'info@truewheelmotors.ie',
      subject: `[${refId}] New ${service} Inquiry: ${vehicle} (${name})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; color: #1E293B; }
            .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: #1E5AA8; color: #FFFFFF; padding: 24px; text-align: center; }
            .header h2 { margin: 0; font-size: 20px; letter-spacing: 0.5px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #F7EBBA; }
            .content { padding: 24px; }
            .badge-ref { display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; color: #1E5AA8; font-family: monospace; font-weight: bold; font-size: 14px; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px; }
            .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #D4AF37; font-weight: bold; margin: 16px 0 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px; }
            .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            .data-table td { padding: 8px 10px; font-size: 14px; border-bottom: 1px solid #F8FAFC; }
            .data-table td.label { font-weight: 600; color: #64748B; width: 38%; }
            .data-table td.value { color: #0F172A; font-weight: 500; }
            .message-box { background: #F8FAFC; border-left: 4px solid #1E5AA8; padding: 12px 16px; font-size: 14px; line-height: 1.5; color: #334155; margin-top: 8px; border-radius: 0 8px 8px 0; }
            .footer { background: #F1F5F9; padding: 16px 24px; font-size: 12px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>True Wheel Motors — Dublin Desk</h2>
              <p>New Import & Customs Inquiry Received</p>
            </div>
            <div class="content">
              <div class="badge-ref">REFERENCE: ${refId}</div>
              
              <div class="section-title">Client Information</div>
              <table class="data-table">
                <tr><td class="label">Full Name:</td><td class="value"><strong>${name}</strong></td></tr>
                <tr><td class="label">Email Address:</td><td class="value"><a href="mailto:${email}" style="color: #1E5AA8;">${email}</a></td></tr>
                <tr><td class="label">Phone / WhatsApp:</td><td class="value"><a href="tel:${phone}" style="color: #1E5AA8;">${phone}</a></td></tr>
                <tr><td class="label">Preferred Contact:</td><td class="value">${contactMethod}</td></tr>
                <tr><td class="label">Delivery County:</td><td class="value">Co. ${county}, Ireland</td></tr>
              </table>

              <div class="section-title">Service & Vehicle Requirements</div>
              <table class="data-table">
                <tr><td class="label">Service Requested:</td><td class="value"><strong>${service}</strong></td></tr>
                <tr><td class="label">Vehicle Model:</td><td class="value">${vehicle}</td></tr>
                <tr><td class="label">Year / Target:</td><td class="value">${year}</td></tr>
                <tr><td class="label">Country of Origin:</td><td class="value">${origin}</td></tr>
                ${vin ? `<tr><td class="label">Chassis / VIN:</td><td class="value"><code>${vin}</code></td></tr>` : ''}
              </table>

              <div class="section-title">Inquiry Notes / Questions</div>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <div class="footer">
              Sent via True Wheel Motors Web Desk • Revenue Authorized Customs Broker • BIMTA Verified
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(adminMailOptions);

    // 2. Send polite acknowledgment to client if email provided
    if (email) {
      const clientMailOptions = {
        from: `"True Wheel Motors Ireland" <no-reply@truewheelmotors.ie>`,
        to: email,
        subject: `Inquiry Received [${refId}] — True Wheel Motors Ireland`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; color: #1E293B; }
              .container { max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; }
              .header { background: #1E5AA8; color: #FFFFFF; padding: 26px; text-align: center; }
              .header h1 { margin: 0; font-size: 22px; }
              .header p { margin: 8px 0 0; font-size: 13px; color: #F7EBBA; }
              .content { padding: 26px; line-height: 1.6; font-size: 14px; color: #334155; }
              .box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 16px 0; }
              .contact-line { display: flex; align-items: center; gap: 8px; margin: 6px 0; font-weight: 600; color: #1E5AA8; text-decoration: none; }
              .footer { background: #F1F5F9; padding: 16px; font-size: 12px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>True Wheel Motors</h1>
                <p>Driven From Japan, Delivered With Trust</p>
              </div>
              <div class="content">
                <p>Dear <strong>${name}</strong>,</p>
                <p>Thank you for contacting True Wheel Motors. We have successfully received your inquiry regarding <strong>${service}</strong> (${vehicle}).</p>
                
                <div class="box">
                  <div style="font-size: 12px; color: #64748B; text-transform: uppercase;">Your Inquiry Reference:</div>
                  <div style="font-size: 18px; font-weight: bold; color: #1E5AA8; font-family: monospace; margin-top: 4px;">${refId}</div>
                  <div style="margin-top: 10px; font-size: 13px;">Our Dublin customs and sourcing specialists are reviewing your request and will reach out via <strong>${contactMethod}</strong> shortly.</div>
                </div>

                <p>If you need urgent assistance regarding live Tokyo auction bidding or Irish Revenue AIS customs entries, you can reach our team directly:</p>
                <p>
                  📞 <a href="tel:+353894787642" style="color: #1E5AA8; font-weight: bold;">+353 89 478 7642</a><br>
                  📞 <a href="tel:+353863783948" style="color: #1E5AA8; font-weight: bold;">+353 86 378 3948</a><br>
                  ✉️ <a href="mailto:info@truewheelmotors.ie" style="color: #1E5AA8; font-weight: bold;">info@truewheelmotors.ie</a>
                </p>

                <p>Kind regards,<br><strong>True Wheel Motors Dublin Desk</strong></p>
              </div>
              <div class="footer">
                &copy; 2026 True Wheel Motors Ltd • Revenue Authorized Customs Broker • BIMTA Verified Partner
              </div>
            </div>
          </body>
          </html>
        `
      };
      // Send client confirmation asynchronously
      transporter.sendMail(clientMailOptions).catch(err => console.error('Client autoresponder error:', err));
    }

    return res.status(200).json({
      success: true,
      refId,
      message: 'Inquiry received and email dispatched successfully'
    });

  } catch (error) {
    console.error('API Contact Error:', error);
    return res.status(500).json({
      error: 'Failed to dispatch email inquiry',
      details: error.message
    });
  }
}
