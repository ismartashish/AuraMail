import { sendGmail } from "../services/gmail.service.js";

export async function sendReportEmail({
  user,
  report,
}) {
  const html = `
    <h2>AuraMail Delivery Report</h2>
    <p><b>Total:</b> ${report.total}</p>
    <p><b>Sent:</b> ${report.sent.length}</p>
    <p><b>Failed:</b> ${report.failed.length}</p>

    <h3>Delivered To</h3>
    <ul>
      ${report.sent.map(e => `<li>${e}</li>`).join("")}
    </ul>

    ${
      report.failed.length
        ? `<h3>Failed</h3><ul>${report.failed
            .map(e => `<li>${e}</li>`)
            .join("")}</ul>`
        : ""
    }

    <p><i>This email is your delivery history. AuraMail stores nothing. Best Regard, Ashish jha</i></p>
  `;

  await sendGmail({
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    from: user.email,
    to: user.email,
    subject: "AuraMail – Delivery Report ✅",
    html,
  });
}
