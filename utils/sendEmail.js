import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient =
  SibApiV3Sdk.ApiClient.instance;

const apiKey =
  defaultClient.authentications["api-key"];

apiKey.apiKey =
  process.env.BREVO_API_KEY;

const apiInstance =
  new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (
  email,
  resetLink
) => {

  try {

    const sendSmtpEmail =
      new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: "yourmail@gmail.com",
      name: "Password Reset"
    };

    sendSmtpEmail.to = [
      {
        email: email
      }
    ];

    sendSmtpEmail.subject =
      "Reset Password";

    sendSmtpEmail.htmlContent = `
      <h2>Password Reset</h2>

      <a href="${resetLink}">
        Reset Password
      </a>
    `;

    await apiInstance.sendTransacEmail(
      sendSmtpEmail
    );

    console.log("Email Sent");

  } catch (error) {
    console.log(error);
  }
};

export default sendEmail;