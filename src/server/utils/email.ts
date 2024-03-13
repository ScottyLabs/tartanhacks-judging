import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import { env } from "../../env/server.mjs";
import { generateMagicLinkToken } from "../../utils/auth";
/**
 * Send a plaintext email to recipients
 * @param recipients List of recipient emails
 * @param subject Subject of the email
 * @param text Plaintext body of the email
 * @returns true if the email was sent successfully
 */
export const sendPlaintextEmail = async (
  recipients: [string],
  subject: string,
  text: string
): Promise<void> => {
  try {
    const transporter = await getTransporter();

    // Send email
    await transporter.sendMail({
      from: env.EMAIL_CONTACT,
      to: recipients.join(", "),
      subject,
      text,
    });
  } catch (err) {
    console.error("Could not send email");
    throw err;
  }
};

export const sendMagicLinkEmail = async (
  recipientEmail: string
): Promise<void> => {
  const token = generateMagicLinkToken(recipientEmail, env.JWT_SECRET);
  const magicLink = `${env.VERCEL_URL}/auth/login?magicToken=${token}`;
  const subject = "Login to the Judging System"; //TODO: add event name here

  const text = `Click this link to login to the Judging System: ${magicLink} \n\n This link will expire in 3 minutes`;

  await sendPlaintextEmail([recipientEmail], subject, text);
};

/**
 * Construct and initialize a connection with the SMTP server
 * @return a {@link Transporter} object which can be used with node-mailer
 */
const getTransporter = async (): Promise<Transporter> => {
  // Initialize SMTP connection
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: parseInt(env.EMAIL_PORT),
    secure: env.EMAIL_TLS == "true",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify that connection was successful
  const connected = await transporter.verify();
  if (!connected) {
    throw new Error("Could not connect to SMTP server");
  }

  return transporter;
};
