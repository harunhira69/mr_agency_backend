import { config } from "../config/index.js";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
) {
  if (
    config.mail.provider ===
    "resend"
  ) {
    if (
      !config.mail.resendApiKey
    ) {
      throw new Error(
        "RESEND_API_KEY is required when MAIL_PROVIDER=resend",
      );
    }

    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.mail.resendApiKey}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          from: config.mail.from,
          to: [to],
          subject,
          html,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Email provider failed with ${response.status}`,
      );
    }

    return;
  }

  if (!config.isProduction) {
    console.log(
      `\n[DEV EMAIL]
To: ${to}
Subject: ${subject}

${html}
`,
    );

    return;
  }

  throw new Error(
    "Email provider is not configured for production",
  );
}