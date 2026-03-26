// // services/email.service.js

// // RESEND VERSION (to be used when we buy a domain)

// const { Resend } = require("resend");

// const resend = new Resend(process.env.RESEND_API_KEY);
// const FROM = "StudyHub <onboarding@resend.dev>"; // update domain once verified in Resend
// const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

// // ─── Shared styles ────────────────────────────────────────────────────────────

// const baseTemplate = (content) => `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>StudyHub</title>
// </head>
// <body style="margin:0;padding:0;background:#E6F0F6;font-family:'Segoe UI',Arial,sans-serif;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
//     <tr>
//       <td align="center">
//         <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,42,71,0.10);">

//           <!-- Header -->
//           <tr>
//             <td style="background:#0F2A47;padding:28px 36px;">
//               <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
//                 Study<span style="color:#3B82F6;">Hub</span>
//               </span>
//             </td>
//           </tr>

//           <!-- Content -->
//           <tr>
//             <td style="padding:36px 36px 28px;">
//               ${content}
//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td style="background:#F8FAFC;padding:20px 36px;border-top:1px solid #E2E8F0;">
//               <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
//                 © ${new Date().getFullYear()} StudyHub · Built by students, for students.
//                 <br/>You're receiving this because you signed up at StudyHub.
//               </p>
//             </td>
//           </tr>

//         </table>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
// `;

// const btn = (href, text) =>
//   `<a href="${href}" style="display:inline-block;background:#3B82F6;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;margin-top:24px;">${text}</a>`;

// const h1 = (text) =>
//   `<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#0F2A47;">${text}</h1>`;

// const p = (text) =>
//   `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">${text}</p>`;

// const pill = (text, color = "#3B82F6") =>
//   `<span style="display:inline-block;background:${color}18;color:${color};font-weight:700;font-size:12px;padding:4px 12px;border-radius:999px;border:1px solid ${color}30;">${text}</span>`;

// const card = (content) =>
//   `<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:18px 20px;margin:20px 0;">${content}</div>`;

// // ─── Email senders ─────────────────────────────────────────────────────────────

// /**
//  * 1. Verification email sent on register
//  */
// exports.sendVerificationEmail = async (to, name, token) => {
//   const link = `${FRONTEND}/verify-email?token=${token}`;

//   await resend.emails.send({
//     from: FROM,
//     to,
//     subject: "Verify your StudyHub email",
//     html: baseTemplate(`
//       ${h1("Almost there! 🦉")}
//       ${p(`Hi <strong>${name}</strong>, welcome to StudyHub!`)}
//       ${p("You're one click away from joining thousands of students sharing notes, PYQs, and knowledge. Please verify your email to activate your account.")}
//       <div style="text-align:center;">
//         ${btn(link, "Verify My Email →")}
//       </div>
//       ${p(`<span style="font-size:13px;color:#94A3B8;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</span>`)}
//     `),
//   });
// };

// /**
//  * 2. Welcome email sent after successful verification
//  */
// exports.sendWelcomeEmail = async (to, name) => {
//   await resend.emails.send({
//     from: FROM,
//     to,
//     subject: "Welcome to StudyHub 🎉",
//     html: baseTemplate(`
//       ${h1("You're in! Welcome to StudyHub 🎉")}
//       ${p(`Hey <strong>${name}</strong>, your email is verified and your account is live.`)}
//       ${card(`
//         <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0F2A47;text-transform:uppercase;letter-spacing:0.05em;">Get started</p>
//         <ul style="margin:0;padding-left:18px;color:#475569;font-size:14px;line-height:2;">
//           <li>Browse <strong>Notes & PYQs</strong> for your subjects</li>
//           <li>Ask questions on the <strong>Q&A Forum</strong></li>
//           <li>Help peers and earn your <strong>Contributor title</strong></li>
//         </ul>
//       `)}
//       <div style="text-align:center;">
//         ${btn(`${FRONTEND}/resources`, "Explore StudyHub →")}
//       </div>
//     `),
//   });
// };

// /**
//  * 3. New answer notification — sent to question author
//  */
// exports.sendNewAnswerEmail = async (to, authorName, questionTitle, questionId, answererName) => {
//   const link = `${FRONTEND}/questions/${questionId}`;

//   await resend.emails.send({
//     from: FROM,
//     to,
//     subject: `${answererName} answered your question`,
//     html: baseTemplate(`
//       ${h1("Someone answered your question! 💬")}
//       ${p(`Hi <strong>${authorName}</strong>,`)}
//       ${p(`<strong>${answererName}</strong> just posted an answer to your question:`)}
//       ${card(`
//         <p style="margin:0;font-size:15px;font-weight:600;color:#0F2A47;">"${questionTitle}"</p>
//       `)}
//       ${p("Head over to review the answer — and if it helped, mark it as accepted to earn both of you some reputation!")}
//       <div style="text-align:center;">
//         ${btn(link, "View Answer →")}
//       </div>
//     `),
//   });
// };

// /**
//  * 4. Answer accepted — sent to the person whose answer was accepted
//  */
// exports.sendAnswerAcceptedEmail = async (to, answererName, questionTitle, questionId) => {
//   const link = `${FRONTEND}/questions/${questionId}`;

//   await resend.emails.send({
//     from: FROM,
//     to,
//     subject: "Your answer was accepted ✅",
//     html: baseTemplate(`
//       ${h1("Your answer was accepted! ✅")}
//       ${p(`Great work, <strong>${answererName}</strong>!`)}
//       ${p("The question author marked your answer as the accepted solution:")}
//       ${card(`
//         <p style="margin:0;font-size:15px;font-weight:600;color:#0F2A47;">"${questionTitle}"</p>
//       `)}
//       ${p("Keep helping your peers — every accepted answer brings you closer to your next title.")}
//       <div style="text-align:center;">
//         ${btn(link, "View Your Answer →")}
//       </div>
//     `),
//   });
// };

// /**
//  * 5. Title promotion — sent when a user levels up
//  */
// exports.sendPromotionEmail = async (to, name, newTitle, level) => {
//   const TITLE_COLORS = {
//     "Helper": "#10B981",
//     "Contributor": "#3B82F6",
//     "Knowledge Ally": "#8B5CF6",
//     "Subject Guide": "#F59E0B",
//     "Trusted Mentor": "#EF4444",
//     "Apex Scholar": "#F97316",
//   };
//   const color = TITLE_COLORS[newTitle] || "#3B82F6";

//   await resend.emails.send({
//     from: FROM,
//     to,
//     subject: `You've been promoted to ${newTitle}! 🏆`,
//     html: baseTemplate(`
//       ${h1("You've been promoted! 🏆")}
//       ${p(`Impressive work, <strong>${name}</strong>!`)}
//       ${p("Your answers have made a real difference. The community has recognised your contributions and you've earned a new title:")}
//       <div style="text-align:center;margin:28px 0;">
//         <div style="display:inline-block;background:${color}12;border:2px solid ${color}40;border-radius:14px;padding:18px 36px;">
//           <div style="font-size:13px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Level ${level}</div>
//           <div style="font-size:26px;font-weight:800;color:#0F2A47;">${newTitle}</div>
//         </div>
//       </div>
//       ${p("Keep contributing to climb even higher. The Apex Scholar title awaits!")}
//       <div style="text-align:center;">
//         ${btn(`${FRONTEND}/dashboard`, "View Your Profile →")}
//       </div>
//     `),
//   });
// };


// BREVO VERSION

// services/email.service.js
const { BrevoClient } = require("@getbrevo/brevo");

// 1. Initialize the new modern client
const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const FROM_EMAIL = process.env.GMAIL_USER; // Your Gmail
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Shared styles ───────────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>StudyHub</title>
</head>
<body style="margin:0;padding:0;background:#E6F0F6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,42,71,0.10);">
          
          <!-- Header -->
          <tr>
            <td style="background:#0F2A47;padding:28px 36px;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Study<span style="color:#3B82F6;">Hub</span>
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 36px 28px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:20px 36px;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
                © ${new Date().getFullYear()} StudyHub · Built by students, for students.
                <br/>You're receiving this because you signed up at StudyHub.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const btn = (href, text) =>
  `<a href="${href}" style="display:inline-block;background:#3B82F6;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;margin-top:24px;">${text}</a>`;

const h1 = (text) =>
  `<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#0F2A47;">${text}</h1>`;

const p = (text) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">${text}</p>`;

const card = (content) =>
  `<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:18px 20px;margin:20px 0;">${content}</div>`;

// ─── Internal send helper ─────────────────────────────────────────────────────

async function send({ to, subject, html }) {
  try {
    // 2. Use the new sendTransacEmail method
    const data = await brevo.transactionalEmails.sendTransacEmail({
      subject: subject,
      htmlContent: html,
      sender: { name: "StudyHub Team", email: FROM_EMAIL },
      to: [{ email: to }]
    });
    
    console.log(`✅ Email sent successfully to ${to} via Brevo HTTP API!`);
    return data;
  } catch (error) {
    console.error("❌ Failed to send email via Brevo:", error);
    throw error;
  }
}

// ─── Email senders ────────────────────────────────────────────────────────────

exports.sendVerificationEmail = async (to, name, token) => {
  const link = `${FRONTEND}/verify-email?token=${token}`;
  await send({
    to,
    subject: "Verify your StudyHub email",
    html: baseTemplate(`
      ${h1("Almost there! 🦉")}
      ${p(`Hi <strong>${name}</strong>, welcome to StudyHub!`)}
      ${p("You're one click away from joining thousands of students sharing notes, PYQs, and knowledge. Please verify your email to activate your account.")}
      <div style="text-align:center;">
        ${btn(link, "Verify My Email →")}
      </div>
      ${p(`<span style="font-size:13px;color:#94A3B8;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</span>`)}
    `),
  });
};

exports.sendWelcomeEmail = async (to, name) => {
  await send({
    to,
    subject: "Welcome to StudyHub 🎉",
    html: baseTemplate(`
      ${h1("You're in! Welcome to StudyHub 🎉")}
      ${p(`Hey <strong>${name}</strong>, your email is verified and your account is live.`)}
      ${card(`
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0F2A47;text-transform:uppercase;letter-spacing:0.05em;">Get started</p>
        <ul style="margin:0;padding-left:18px;color:#475569;font-size:14px;line-height:2;">
          <li>Browse <strong>Notes & PYQs</strong> for your subjects</li>
          <li>Ask questions on the <strong>Q&A Forum</strong></li>
          <li>Help peers and earn your <strong>Contributor title</strong></li>
        </ul>
      `)}
      <div style="text-align:center;">
        ${btn(`${FRONTEND}/resources`, "Explore StudyHub →")}
      </div>
    `),
  });
};

exports.sendNewAnswerEmail = async (
  to,
  authorName,
  questionTitle,
  questionId,
  answererName,
) => {
  const link = `${FRONTEND}/questions/${questionId}`;
  await send({
    to,
    subject: `${answererName} answered your question`,
    html: baseTemplate(`
      ${h1("Someone answered your question! 💬")}
      ${p(`Hi <strong>${authorName}</strong>,`)}
      ${p(`<strong>${answererName}</strong> just posted an answer to your question:`)}
      ${card(`<p style="margin:0;font-size:15px;font-weight:600;color:#0F2A47;">"${questionTitle}"</p>`)}
      ${p("Head over to review the answer — and if it helped, mark it as accepted to earn both of you some reputation!")}
      <div style="text-align:center;">
        ${btn(link, "View Answer →")}
      </div>
    `),
  });
};

exports.sendAnswerAcceptedEmail = async (
  to,
  answererName,
  questionTitle,
  questionId,
) => {
  const link = `${FRONTEND}/questions/${questionId}`;
  await send({
    to,
    subject: "Your answer was accepted ✅",
    html: baseTemplate(`
      ${h1("Your answer was accepted! ✅")}
      ${p(`Great work, <strong>${answererName}</strong>!`)}
      ${p("The question author marked your answer as the accepted solution:")}
      ${card(`<p style="margin:0;font-size:15px;font-weight:600;color:#0F2A47;">"${questionTitle}"</p>`)}
      ${p("Keep helping your peers — every accepted answer brings you closer to your next title.")}
      <div style="text-align:center;">
        ${btn(link, "View Your Answer →")}
      </div>
    `),
  });
};

exports.sendPromotionEmail = async (to, name, newTitle, level) => {
  const TITLE_COLORS = {
    Helper: "#10B981",
    Contributor: "#3B82F6",
    "Knowledge Ally": "#8B5CF6",
    "Subject Guide": "#F59E0B",
    "Trusted Mentor": "#EF4444",
    "Apex Scholar": "#F97316",
  };
  const color = TITLE_COLORS[newTitle] || "#3B82F6";

  await send({
    to,
    subject: `You've been promoted to ${newTitle}! 🏆`,
    html: baseTemplate(`
      ${h1("You've been promoted! 🏆")}
      ${p(`Impressive work, <strong>${name}</strong>!`)}
      ${p("Your answers have made a real difference. The community has recognised your contributions and you've earned a new title:")}
      <div style="text-align:center;margin:28px 0;">
        <div style="display:inline-block;background:${color}12;border:2px solid ${color}40;border-radius:14px;padding:18px 36px;">
          <div style="font-size:13px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Level ${level}</div>
          <div style="font-size:26px;font-weight:800;color:#0F2A47;">${newTitle}</div>
        </div>
      </div>
      ${p("Keep contributing to climb even higher. The Apex Scholar title awaits!")}
      <div style="text-align:center;">
        ${btn(`${FRONTEND}/dashboard`, "View Your Profile →")}
      </div>
    `),
  });
};
