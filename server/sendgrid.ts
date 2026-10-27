// SendGrid Integration - Replit Connector
import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

export async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function sendContactFormEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}) {
  console.log("📧 SendGrid: Getting client...");
  const { client, fromEmail } = await getUncachableSendGridClient();
  console.log("📧 SendGrid: Got client, fromEmail:", fromEmail);
  
  const msg = {
    to: fromEmail, // Send to the configured SendGrid email (same as from)
    from: fromEmail,
    replyTo: data.email,
    subject: `VelvetLog Contact: ${data.firstName} ${data.lastName}`,
    text: `
New Contact Form Submission

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}

Message:
${data.message}
    `,
    html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
<p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
<p><strong>Phone:</strong> ${data.phone}</p>
<hr>
<h3>Message:</h3>
<p>${data.message.replace(/\n/g, '<br>')}</p>
    `
  };

  console.log("📧 SendGrid: Sending email to:", msg.to);
  try {
    await client.send(msg);
    console.log("✅ SendGrid: Email sent successfully");
  } catch (error: any) {
    console.error("❌ SendGrid error:", error.message);
    if (error.response) {
      console.error("❌ SendGrid response body:", JSON.stringify(error.response.body));
    }
    throw error;
  }
}
