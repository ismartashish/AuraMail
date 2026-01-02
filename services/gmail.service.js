import { google } from "googleapis";

export async function sendGmail({
  accessToken,
  refreshToken,
  from,
  to,
  subject,
  html,
  attachments = [],
}) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth });

  const boundary = "AURAMAIL_BOUNDARY";

  let message = [];
  message.push(`From: ${from}`);
  message.push(`To: ${to}`);
  message.push(`Subject: ${subject}`);
  message.push("MIME-Version: 1.0");
  message.push(`Content-Type: multipart/mixed; boundary=${boundary}`);
  message.push("");
  message.push(`--${boundary}`);
  message.push("Content-Type: text/html; charset=UTF-8");
  message.push("Content-Transfer-Encoding: 7bit");
  message.push("");
  message.push(html);
  message.push("");

  for (const file of attachments) {
    message.push(`--${boundary}`);
    message.push(`Content-Type: ${file.mimeType}; name="${file.filename}"`);
    message.push("Content-Transfer-Encoding: base64");
    message.push(
      `Content-Disposition: attachment; filename="${file.filename}"`
    );
    message.push("");
    message.push(file.content.toString("base64"));
    message.push("");
  }

  message.push(`--${boundary}--`);

  const rawMessage = Buffer.from(message.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage,
    },
  });
}
