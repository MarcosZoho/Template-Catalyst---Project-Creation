'use strict';

// The SDK exposes app.email().sendMail() — app.mail() does NOT exist, and in
// fire-and-forget calls the resulting TypeError fails silently. While
// debugging deliveries, always `await` the call.
//
// Catalyst Mail also requires DOUBLE verification of the FROM address:
// (1) individual email confirmation in Console → Mail → From Address, and
// (2) DNS verification (SPF + DKIM) of the FROM domain. Individual
// confirmation alone does NOT enable sending via API.
async function sendEmail(app, { to, subject, htmlBody, textBody }) {
  const email = app.email();
  return email.sendMail({
    from_email: process.env.SENDER_EMAIL,
    to_email: [to],
    subject,
    content: htmlBody || textBody,
    html_mode: !!htmlBody,
  });
}

module.exports = { sendEmail };
