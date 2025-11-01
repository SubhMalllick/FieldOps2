import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      companyName,
      industryType,
      fullName,
      phone,
      email,
      monthlyNeeds
    } = req.body;

    // Basic validation
    if (!companyName || !email || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Prepare email content
    const emailContent = {
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🚀 New Business Registration: ${companyName}`,
      text: `
        NEW BUSINESS REGISTRATION - FIELDOPS
        ------------------------------------
        Company Name: ${companyName}
        Industry Type: ${industryType}
        Contact Person: ${fullName}
        Phone: ${phone}
        Email: ${email}
        Monthly Verification Needs: ${monthlyNeeds}
        
        Submitted: ${new Date().toLocaleString()}
        IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px; }
                .field { margin-bottom: 10px; }
                .label { font-weight: bold; color: #1e293b; }
                .footer { color: #64748b; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🎉 New Business Registration - FieldOps</h2>
            </div>
            <div class="content">
                <h3 style="color: #1e293b;">Company Details:</h3>
                <div class="field"><span class="label">Company Name:</span> ${companyName}</div>
                <div class="field"><span class="label">Industry Type:</span> ${industryType}</div>
                <div class="field"><span class="label">Contact Person:</span> ${fullName}</div>
                <div class="field"><span class="label">Phone:</span> ${phone}</div>
                <div class="field"><span class="label">Email:</span> ${email}</div>
                <div class="field"><span class="label">Monthly Verification Needs:</span> ${monthlyNeeds}</div>
            </div>
            <div class="footer">
                <p>Submitted: ${new Date().toLocaleString()}</p>
                <p>IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}</p>
            </div>
        </body>
        </html>
      `
    };

    // Send email notification
    await transporter.sendMail(emailContent);

    console.log('Business registration received:', { companyName, email, phone });

    return res.status(200).json({ 
      success: true, 
      message: 'Registration successful! We will contact you within 24 hours.' 
    });

  } catch (error) {
    console.error('Error processing business registration:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again.' 
    });
  }
}
