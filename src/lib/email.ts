import "server-only";

type Email = { to: string; subject: string; html: string; text: string };

/**
 * Send a transactional email through Resend's HTTP API.
 * Without RESEND_API_KEY (local dev) the email is printed to the server log instead.
 */
export async function sendEmail({ to, subject, html, text }: Email) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[email:dev] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
      return;
    }
    throw new Error("RESEND_API_KEY is not configured");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: sender(), to, subject, html, text }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
}

/** EMAIL_FROM if set, else noreply@ the domain the Resend integration verified. */
function sender() {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  const domain = process.env.RESEND_EMAIL_DOMAIN;
  return domain ? `Boro <noreply@${domain}>` : "Boro <onboarding@resend.dev>";
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function resetPasswordEmail(name: string, url: string): Omit<Email, "to"> {
  const first = escape(name.split(" ")[0] ?? name);
  return {
    subject: "Reset your Boro password",
    text: `Hi ${name.split(" ")[0]},\n\nSomeone (hopefully you) asked to reset your Boro password. Open this link to choose a new one — it expires in an hour:\n\n${url}\n\nIf it wasn't you, ignore this email and your password stays the same.\n\n— Boro`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#16162b">
  <p style="font-size:28px;font-weight:800;margin:0 0 24px;color:#ff6633">boro</p>
  <p style="font-size:16px;line-height:1.5">Hi ${first},</p>
  <p style="font-size:16px;line-height:1.5">Someone (hopefully you) asked to reset your Boro password. Tap the button to choose a new one — the link expires in an hour.</p>
  <p style="margin:28px 0"><a href="${escape(url)}" style="background:#333399;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;display:inline-block">Choose a new password</a></p>
  <p style="font-size:14px;line-height:1.5;color:#6a6a7e">If it wasn't you, ignore this email and your password stays the same.</p>
</div>`,
  };
}
