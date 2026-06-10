import SibApiV3Sdk from "sib-api-v3-sdk";

const sendEmail = async (email, resetLink) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;

    defaultClient.authentications["api-key"].apiKey =
      process.env.BREVO_API_KEY;

    const apiInstance =
      new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail =
      new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: "actionofak@gmail.com",
      name: "Password Reset",
    };

    sendSmtpEmail.to = [
      {
        email,
      },
    ];

    sendSmtpEmail.subject = "Password Reset";

    sendSmtpEmail.htmlContent = `
      <h2>Password Reset</h2>
      <p>Click the link below:</p>
      <a href="${resetLink}">
        Reset Password
      </a>
    `;

    const result =
      await apiInstance.sendTransacEmail(
        sendSmtpEmail
      );

    console.log("Email Sent");
    console.log(result);

  } catch (error) {
    console.log(
      error.response?.body || error
    );
  }
};

export default sendEmail;