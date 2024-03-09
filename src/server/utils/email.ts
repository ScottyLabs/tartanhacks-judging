import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../env/server.mjs";
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