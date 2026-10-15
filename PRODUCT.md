# Campaign: product contract

Campaign is a React Native/Expo mobile product where communities fund distribution of a message beyond its creator's network. Contributions buy advertising reach, never direct donations or creator transfers. The 25-page Hackathon_Requirements.pdf remains authoritative; REQUIREMENTS.md retains page-level coverage.

Audience: a guest discovers and reads; the same signed-in person creates, backs and follows. A separately authorized reviewer demonstrates the minimum review gates. Five persistent destinations: Home, Explore, Create, Activity, Profile.

Creator sequence is fixed: Basics → Story → Campaign & Ad Visuals → Reach → Submit. Preserve backward state, automatic durable drafts, editable manual/voice-demo assistance, separate editorial/ad media, public sources, explicit goal only at Submit, preview, consent, submission and corrections. Funding, approval, preparation, distribution and completion remain distinct.

Success: a first-time reader understands the message and sources; a backer sees the amount, fees, advertising allocation and uncertain estimate before simulated payment; a creator sees saved progress and the next action. Status, receipts, Activity, dashboard and reports reflect the same backend records. Simulated/estimated/unavailable results remain labelled.

Boundary: E:/Campaign only. Keep the existing FastAPI/SQLite/API/auth/cache/draft architecture. No ERP access, new project, live payment/advertising integration, paid resources, external account creation or submission. Latest directive authorizes local embedded-JavaScript Android build investigation and verification; public hosting credentials remain external dependencies.
