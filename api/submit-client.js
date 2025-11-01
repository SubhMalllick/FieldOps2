import { sendEmail, formatBusinessEmail } from '../../utils/email-handler.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Basic validation
    if (!data.companyName || !data.email || !data.fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: Company Name, Email, and Full Name are required.' 
      });
    }

    // Format email content
    const emailContent = formatBusinessEmail(data);
    
    // Send email notification
    await sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      ...emailContent
    });

    console.log('Business registration processed:', { 
      company: data.companyName, 
      email: data.email,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Registration successful! We will contact you within 24 hours.' 
    });

  } catch (error) {
    console.error('Error processing business registration:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again or contact support.' 
    });
  }
}
