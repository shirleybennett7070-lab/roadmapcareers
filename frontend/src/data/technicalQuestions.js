// Technical assessment question bank - 20 hard questions for remote customer service workers
// Topics: CRM/ticketing tools, customer data security, communication platforms, basic troubleshooting,
// multi-tool workflows, email security, compliance, remote CS best practices
// All options are similarly detailed to prevent guessing by length
export const technicalQuestionBank = [
  {
    id: 1,
    question: "A customer provides their full credit card number in a live chat message while trying to make a payment. What is the CORRECT immediate action?",
    options: [
      "Copy the card number to the payment system quickly, then delete the chat message from your end to remove the sensitive data from the conversation log",
      "Ask the customer to re-enter the card number through the company's secure payment portal link, then flag the chat for your supervisor to have the message containing the card number purged from the system",
      "Acknowledge the payment details and process the transaction manually using the card number from the chat, since the customer already consented by providing it voluntarily",
      "Take a screenshot of the card number for your records in case the payment fails later, then ask the customer to delete their message from the chat window on their end"
    ],
    correctAnswer: 1,
    explanation: "PCI-DSS compliance prohibits storing or processing raw card numbers in unsecured channels like live chat. The correct action is to redirect to a secure payment portal and ensure the exposed data is purged. Never copy, screenshot, or manually process card numbers from chat."
  },
  {
    id: 2,
    question: "You're handling 3 simultaneous live chats during a busy period. One customer has been waiting 4 minutes for your response. What is the BEST approach to manage this situation?",
    options: [
      "Focus entirely on the waiting customer's issue until it's resolved, then return to the other two chats — longest-waiting customers should always be fully prioritized over newer ones",
      "Send the waiting customer a quick acknowledgment that you're looking into their issue, then systematically rotate between all three chats — prioritizing based on urgency and complexity of each",
      "Transfer the waiting customer to another available agent so you can focus on the two newer conversations — a fresh agent will provide better service than one juggling three chats",
      "Close the two newer chats with a message asking those customers to call back, then give the waiting customer your full attention since they've been waiting the longest"
    ],
    correctAnswer: 1,
    explanation: "A quick acknowledgment prevents the waiting customer from feeling ignored while you manage your queue. Systematic rotation based on urgency ensures all customers receive timely responses. Fully focusing on one customer or closing others creates worse outcomes overall."
  },
  {
    id: 3,
    question: "Your company's CRM system is running extremely slowly. Customer records take 15-20 seconds to load, and you have multiple open tickets waiting. Which troubleshooting step should you try FIRST?",
    options: [
      "Clear your browser cache and cookies, then close unnecessary browser tabs and applications — resource-heavy pages and accumulated cache data are the most common cause of CRM slowdowns",
      "Restart your computer completely to refresh all system resources — this clears memory leaks and background processes that accumulate throughout the workday and slow everything down",
      "Switch to a different browser like Firefox or Edge to see if the issue is browser-specific — Chrome is known to consume excessive memory which can slow down web-based CRM applications",
      "Contact IT support immediately and stop working tickets until the system is fixed — using a slow CRM risks entering incorrect customer data and could cause more problems than waiting"
    ],
    correctAnswer: 0,
    explanation: "Clearing cache/cookies and closing unnecessary tabs is the fastest, least disruptive first step. A full restart takes several minutes. Switching browsers is a workaround not a fix. Stopping work should be a last resort — try self-service troubleshooting first."
  },
  {
    id: 4,
    question: "A customer reaches out via chat saying they received an email from your company asking them to click a link and update their payment information. They want to verify if it's legitimate. What should you tell them?",
    options: [
      "Ask them to forward the email to your work email so you can personally review the sender address, links, and content to determine whether it came from your company's systems",
      "Tell them to look for the padlock icon in their browser when they click the link — if the site has HTTPS and shows a padlock, the email is legitimate and safe to follow",
      "Advise them not to click any links in the email and instead log into their account directly through the company's official website or app — offer to help them update their information through verified channels",
      "Confirm it's legitimate if the email contains the company logo and their correct name — phishing emails typically use generic greetings and wouldn't have access to the customer's personal details"
    ],
    correctAnswer: 2,
    explanation: "Always direct customers to use official channels (website, app) rather than email links. Phishing emails can replicate logos, use real names (from data breaches), and use HTTPS on fake sites. Having them forward suspicious emails to you also puts your system at risk."
  },
  {
    id: 5,
    question: "You accidentally send a response to the wrong customer — the email contains the correct customer's name but references a completely different account issue. What should you do IMMEDIATELY?",
    options: [
      "Send a follow-up email to the wrong recipient apologizing for the mix-up, and ask them to disregard and delete the previous message — then send the correct response to the right customer",
      "Contact the wrong recipient and the correct customer to sort out the confusion, then log the incident internally — but there's no need to escalate since no sensitive personal data like payment info was exposed",
      "Notify your supervisor or the appropriate internal team immediately, as this is a data handling incident — another customer's account details were sent to the wrong person regardless of whether payment data was included",
      "Delete the sent email from your outbox using the email recall feature to pull it back before the recipient reads it — most email platforms allow message recall within the first few minutes of sending"
    ],
    correctAnswer: 2,
    explanation: "Sending any customer's account details to the wrong person is a data incident that must be reported internally, even without payment data. Account names and issue details are still personal data. Email recall is unreliable and not a substitute for proper incident reporting."
  },
  {
    id: 6,
    question: "Someone contacts you via chat asking to look up another customer's account information, claiming to be their spouse and saying they have permission. What should you do?",
    options: [
      "Look up the account and share the information since spouses typically share service accounts — refusing would create unnecessary friction for a common and reasonable request",
      "Ask them to verify the account holder's date of birth, address, and last four of their SSN — if they can answer these security questions correctly, they likely have legitimate access to the account",
      "Decline to share the account information — explain that you can only discuss account details with the verified account holder or an authorized contact listed on the account, and offer alternatives",
      "Ask the person to have the account holder send an email from the email address on file granting written permission — once received, you can share the account details with the spouse"
    ],
    correctAnswer: 2,
    explanation: "Data privacy regulations and company policy require that account information only be shared with the verified account holder or documented authorized contacts. Social engineering attacks commonly use spousal claims. Emails can be spoofed and security questions don't prove authorization."
  },
  {
    id: 7,
    question: "Your company uses a ticketing system (like Zendesk or Freshdesk). A customer emails about an issue that already has an open ticket from a previous interaction. What's the CORRECT way to handle this?",
    options: [
      "Create a new ticket for the new email so each interaction has its own tracking number — this ensures every customer touchpoint is individually documented and nothing gets buried in a long thread",
      "Merge the new email into the existing open ticket to maintain a complete history of the customer's issue in one place — this prevents duplicate work and gives any agent full context on the ongoing situation",
      "Reply to the customer from your personal work email outside the ticketing system to give them a faster response — then update the existing ticket with a summary of your reply afterward",
      "Close the existing ticket since the customer is reopening the issue with a new email, then create a fresh ticket — closed tickets can still be referenced but the new ticket starts a clean workflow"
    ],
    correctAnswer: 1,
    explanation: "Merging into the existing ticket maintains a complete customer history in one place. Any agent who picks it up has full context. Creating duplicate tickets causes confusion, replying outside the system bypasses tracking, and closing/recreating loses workflow continuity."
  },
  {
    id: 8,
    question: "You're working from home and need to step away for 15 minutes during your shift for a personal matter. What is the CORRECT procedure?",
    options: [
      "Set your status to 'Away' in all communication tools and take your break — as long as you're back within 15 minutes, there's no need to notify anyone since remote workers have flexible break schedules",
      "Log out of all customer-facing channels, set your status to away in internal tools, notify your team lead or use your company's break/schedule system, and ensure your queue is covered before stepping away",
      "Keep your chat status as 'Available' but set an auto-response message for any incoming chats explaining you'll respond within 15 minutes — this way customers aren't redirected and your metrics aren't affected",
      "Ask a colleague to monitor your open chats and respond on your behalf using your login — this ensures seamless customer coverage and your response time metrics stay consistent"
    ],
    correctAnswer: 1,
    explanation: "Proper break procedure requires logging out of customer channels (so customers aren't routed to you), updating internal status, notifying your team, and ensuring coverage. Staying 'Available' while away creates bad customer experiences. Sharing logins violates security policy."
  },
  {
    id: 9,
    question: "A customer in your live chat is sending abusive, profanity-filled messages and demanding a supervisor. You've already attempted to de-escalate twice with empathy statements. What is the appropriate next step?",
    options: [
      "Continue attempting to resolve the issue yourself — escalating to a supervisor every time a customer uses profanity rewards bad behavior and undermines your authority as a service representative",
      "Calmly inform the customer that you understand their frustration, explain that abusive language is not acceptable per company policy, and offer to connect them with a supervisor or let them know the chat may be ended if the behavior continues",
      "Stop responding for 2-3 minutes to give the customer time to calm down — most angry customers will collect themselves after a period of silence and the conversation can resume productively",
      "Copy-paste a standard template response acknowledging their frustration and immediately transfer the chat to the supervisor queue without further engagement — minimize your exposure to the abuse"
    ],
    correctAnswer: 1,
    explanation: "After multiple de-escalation attempts, clearly communicate boundaries while remaining professional. Offer the supervisor transfer they requested, or warn that continued abuse may end the session. Going silent or auto-transferring without communication doesn't address the behavior properly."
  },
  {
    id: 10,
    question: "You receive an internal Slack message from someone claiming to be from IT, asking for your login credentials to 'run a security audit on your account.' What should you do?",
    options: [
      "Provide the information if the person's Slack profile shows they're in the IT department — internal communication channels are secured by company authentication so the request is likely legitimate",
      "Ask them to verify their identity by telling you your employee ID number first — real IT staff would have access to the employee directory and can prove they're legitimate before you share credentials",
      "Do not share your credentials — legitimate IT departments never ask for passwords through messaging. Report the message to your actual IT security team through a verified channel like the IT help desk portal",
      "Share only your username but not your password, and ask them to reset your password through the proper system instead — this gives them enough to run the audit without exposing your full credentials"
    ],
    correctAnswer: 2,
    explanation: "No legitimate IT department will ever ask for your password through any channel. This is social engineering. Even internal accounts can be compromised. Report through verified IT channels. Never share any part of your credentials regardless of who appears to be asking."
  },
  {
    id: 11,
    question: "Your screen-sharing tool freezes during a remote support session with a customer. They can no longer see your screen. What's the BEST way to handle this?",
    options: [
      "End the screen-sharing session and restart the application completely — apologize to the customer and reinitiate the screen share from scratch once the tool has fully reloaded",
      "Immediately switch to verbal instructions to keep the momentum going — describe each step clearly while you troubleshoot the screen share in the background, then resume sharing once it reconnects",
      "Ask the customer to end the session on their end and send them a new screen-share invitation link — the issue is likely on their side since screen-sharing requires a stable connection from both parties",
      "Send the customer a pre-made step-by-step PDF guide via email instead of continuing with screen sharing — written documentation is more reliable than screen sharing for technical walkthroughs"
    ],
    correctAnswer: 1,
    explanation: "Switching to verbal instructions maintains customer engagement and momentum while you troubleshoot. Ending the session entirely creates unnecessary downtime. Blaming the customer's connection is unprofessional, and sending a PDF abandons the live support interaction."
  },
  {
    id: 12,
    question: "You notice a coworker posting a screenshot of their work screen on social media. The screenshot shows customer names and partial account numbers visible in the background. What should you do?",
    options: [
      "Send them a private message suggesting they delete the post and be more careful in the future — mistakes happen, and a friendly heads-up is the most appropriate way to handle it between colleagues",
      "Comment on their social media post asking them to take it down immediately — the faster the post is removed, the less exposure the customer data receives, so speed is the priority",
      "Report it to your manager or the appropriate internal team (security, compliance) — exposed customer data is a potential data breach that requires proper documentation and response, even if accidental",
      "Ignore it since the account numbers are only partial and customer first names alone aren't enough to identify specific individuals — partial data doesn't constitute a reportable privacy violation"
    ],
    correctAnswer: 2,
    explanation: "Any exposure of customer data — even partial — is a potential data breach that must be reported through proper channels. Compliance and security teams need to assess the exposure, document it, and take appropriate action. Private messages between colleagues don't fulfill reporting obligations."
  },
  {
    id: 13,
    question: "You receive an email from a customer that includes an attachment they say is a screenshot of their error. The file is named 'error_screenshot.exe' instead of a typical image format like .png or .jpg. What should you do?",
    options: [
      "Open the file in a sandboxed environment or virtual machine first to check if it's safe — this allows you to view the content without risking your main system in case it contains malware",
      "Do not open the file — .exe is an executable program file, not an image. Inform the customer that you cannot open executable files and ask them to resend the screenshot as a .png or .jpg image instead",
      "Rename the file extension from .exe to .png and try opening it — sometimes email systems incorrectly change file extensions during transmission, and renaming it will restore the original image format",
      "Forward the attachment to your IT department and ask them to scan it and extract the image — they have tools that can safely convert executable files back to their original format if they were corrupted"
    ],
    correctAnswer: 1,
    explanation: ".exe files are executable programs that can contain malware. A real screenshot would be .png, .jpg, or .gif — never .exe. Don't open, rename, or forward it. Ask the customer to resend in a proper image format. This is a common malware delivery method disguised as customer attachments."
  },
  {
    id: 14,
    question: "A customer wants to verify their identity but can't remember the answers to their security questions. They offer to send a photo of their driver's license via chat instead. How should you handle this?",
    options: [
      "Accept the photo as an alternative form of verification — a government-issued ID is actually a stronger form of identity verification than security questions, which can be guessed or socially engineered",
      "Decline the photo and explain that your company's verification process doesn't accept images of IDs through chat — offer alternative verification methods that your company supports, such as email verification or a callback to the phone number on file",
      "Accept the photo, verify the name and address match the account, then immediately delete the image from the chat and your device to comply with data handling policies",
      "Ask the customer to email the photo of their ID to your company's support email instead of sending it through chat — email is more secure than chat for transmitting sensitive identity documents"
    ],
    correctAnswer: 1,
    explanation: "Receiving ID photos through chat creates data liability and likely violates company policy and data protection regulations. Chat logs may be stored, and you can't ensure secure handling. Always redirect to company-approved verification methods that have proper security controls."
  },
  {
    id: 15,
    question: "Your company's knowledge base article is outdated, and you've discovered the correct process has changed. A customer is asking about this exact topic right now. What should you do?",
    options: [
      "Follow the knowledge base article as written — documented processes are the company standard until officially updated, and deviating from them could create liability even if you know the process changed",
      "Provide the customer with the correct updated information based on what you know, then immediately flag the outdated article for review by submitting a correction through the proper internal feedback channel",
      "Tell the customer you need to research their question further and will call them back — use the time to confirm the correct process with your supervisor before providing potentially incorrect information",
      "Provide both the old and new process to the customer and let them decide which to follow — transparency about the inconsistency shows honesty and lets the customer make an informed choice"
    ],
    correctAnswer: 1,
    explanation: "Give the customer the correct current information — that's your job. Following known-outdated documentation helps no one. But also flag the article for correction immediately so other agents don't give wrong information. Calling back or presenting both versions creates confusion."
  },
  {
    id: 16,
    question: "You're working a remote shift and your home internet goes out completely. You have no mobile hotspot available. What is the CORRECT protocol?",
    options: [
      "Wait 10-15 minutes to see if the internet comes back on its own — most outages are brief, and your auto-away status will prevent new customers from being routed to you during the downtime",
      "Immediately contact your supervisor or team lead through your phone (call or text), report that you're offline, and follow your company's contingency plan — whether that's relocating, switching shifts, or using PTO",
      "Drive to the nearest coffee shop or library with free Wi-Fi and continue your shift from there — showing initiative to maintain productivity demonstrates reliability to your employer",
      "Send an email to your team from your phone explaining the situation and mark yourself as unavailable in the scheduling system — email documentation creates a record in case questions arise later"
    ],
    correctAnswer: 1,
    explanation: "Immediate phone contact with your supervisor is critical — they need to know you're offline so your queue can be covered. Follow established contingency plans. Working from public Wi-Fi may violate security policy. Waiting or just sending email delays the response and leaves customers unserved."
  },
  {
    id: 17,
    question: "You're working from your laptop and notice it's running unusually hot, the fan is loud, and your chat platform keeps freezing. You have active customer conversations. What's the BEST approach?",
    options: [
      "Close your laptop lid for 30 seconds to let it cool down quickly, then reopen it — the brief sleep cycle clears the thermal buildup and allows the processor to resume at normal temperature",
      "Immediately restart your computer to clear whatever process is causing the overheating — a fresh boot will resolve the thermal issue and restore normal performance for your chat sessions",
      "Close unnecessary applications and browser tabs to reduce CPU load, make sure the laptop vents aren't blocked, and if the issue persists, let your team know you may need to briefly switch devices",
      "Open Task Manager and force-close the chat platform since it's the application that's freezing — then reopen it so it gets a fresh allocation of system memory and processing power"
    ],
    correctAnswer: 2,
    explanation: "Reducing CPU load by closing unnecessary apps is the least disruptive fix while keeping your customer conversations active. Closing the lid forces sleep (disconnects you), restarting drops all chats, and force-closing the chat platform loses your active conversations."
  },
  {
    id: 18,
    question: "Your company recently switched CRM platforms, and you've noticed that some customer records migrated incorrectly — phone numbers and email addresses are swapped on certain accounts. What should you do?",
    options: [
      "Fix each incorrect record as you encounter it during your normal workflow — individually correcting records as they come up is the most efficient approach and ensures changes are verified against the actual customer",
      "Report the systemic data migration issue to your manager or the appropriate team immediately — widespread incorrect data requires a bulk correction and other agents need to be warned to verify contact information before using it",
      "Send a mass email to all affected customers asking them to log in and verify their contact information is correct — this crowdsources the verification process and ensures accuracy from the customers themselves",
      "Document each incorrect record in a personal spreadsheet and submit a batch correction request at the end of the week — collecting multiple examples first helps IT identify the pattern in the migration error"
    ],
    correctAnswer: 1,
    explanation: "Systemic data issues need immediate escalation — other agents are potentially contacting wrong people, sending sensitive information to wrong emails, or calling wrong numbers. Individual fixes are too slow, and waiting to batch them lets the problem persist and compound."
  },
  {
    id: 19,
    question: "A customer asks you to email them a copy of their full account history including all past transactions. Your system allows you to generate this report. What should you consider before sending it?",
    options: [
      "Generate and send the report immediately since the customer has already authenticated and has the right to access their own account history — any delay in providing their data could violate consumer data access rights",
      "Verify that the email address you're sending to matches the one on file for the account, confirm the customer understands the report contains sensitive financial data, and use your company's secure/encrypted email method if available",
      "Decline to send it via email and instead instruct the customer to download the report themselves through the self-service portal — emailed documents can be intercepted and your company likely prohibits sending transaction data via email",
      "Generate the report and send it as a password-protected PDF, using the customer's date of birth as the password — this adds a security layer that only the account holder would know how to open"
    ],
    correctAnswer: 1,
    explanation: "Verify the email address matches the account first (it could have been changed by social engineering). Confirm they understand what they're receiving, and use secure/encrypted delivery if available. Using DOB as a password is predictable. Refusing outright may not be necessary if secure methods exist."
  },
  {
    id: 20,
    question: "You're on a video call with your team and need to share your screen to walk through a customer case. Before sharing, what should you check?",
    options: [
      "Make sure your camera is positioned properly and your background is professional — screen sharing automatically hides your video feed, but your background may briefly show when transitioning between sharing modes",
      "Close or minimize all windows except the one you're presenting — other open tabs, personal messages, customer data from other accounts, or email notifications could accidentally be exposed to everyone on the call",
      "Enable 'Do Not Disturb' mode on your computer to prevent notification popups — system notifications are the main risk during screen sharing, and the DND setting blocks all of them across all applications",
      "Ask all participants to confirm they're in a private location before you share — screen sharing makes your content visible to anyone who can see other participants' screens, which is a data privacy concern"
    ],
    correctAnswer: 1,
    explanation: "The biggest risk is accidentally exposing other customers' data, personal messages, or sensitive information through other open windows. Close everything unnecessary first. DND helps with notifications but doesn't address open windows. Checking others' locations is impractical and doesn't address your screen."
  }
];
