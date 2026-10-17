# Campaign: product contract

Campaign is a React Native/Expo mobile product where communities fund distribution of a message beyond its creator's network. Contributions buy advertising reach, never direct donations or creator transfers. The 25-page Hackathon_Requirements.pdf remains authoritative; REQUIREMENTS.md retains page-level coverage.

Audience: a guest discovers and reads; the same signed-in person creates, backs and follows. A separately authorized reviewer demonstrates the minimum review gates. Five persistent destinations: Home, Explore, Create, Activity, Profile.

Creator sequence is fixed: Basics → Story → Campaign & Ad Visuals → Reach → Submit. Preserve backward state, automatic durable drafts, editable manual/voice-demo assistance, separate editorial/ad media, public sources, explicit goal only at Submit, preview, consent, submission and corrections. Funding, approval, preparation, distribution and completion remain distinct.

Create entry first shows the informational vertical five-step overview, then offers Create Manually as the primary action and Create with your voice as the secondary, explicitly labelled voice-guided demo using typed input or keyboard dictation; live speech and AI are not connected. These actions precede compact Saved drafts rows. Resume uses the real device or account record, with step, storage scope and available save time shown truthfully; unavailable account save time is disclosed rather than invented. Device drafts remain usable when account loading fails, with a retry for the account list. This presentation preserves existing draft ownership, persistence and the exact five-step editor.

Campaign cover is optional and has separate add/change/remove controls. Advertising images have their own add/remove controls; neither purpose silently populates the other, and editorial images remain in Story. All use the established JPEG/PNG/WebP validation and 8 MB per-image limit. Missing ad images remain visible for review instead of implying delivery readiness.

Success: a first-time reader understands the message and sources; a backer sees the amount, fees, advertising allocation and uncertain estimate before simulated payment; a creator sees saved progress and the next action. Status, receipts, Activity, dashboard and reports reflect the same backend records. Simulated/estimated/unavailable results remain labelled.

Welcome's informational photos page horizontally in the stable order mountains (the previous second), coast (the previous third), then turtle (the previous first). Each image retains its own caption and illustrative accessibility description. Swipes and dot controls select the same measured page without completing Welcome or changing authentication, appearance or tour preferences. Explicit Welcome choices continue to govern entry into the app.

The optional native app tour explains discovery, five-step creation, advertising funding with simulated payments, and Activity versus the notification bell. A small, nonblocking Home invitation offers Show me around or Skip only after Welcome is complete and Home is settled, with no pending navigation or active interaction. It does not require campaign data or a working network. Back, Next, Skip tour and the final Start exploring action control the explanation without opening the highlighted destination or changing campaign, payment or notification-read state.

The versioned device-local offer/progress record, `campaign:walkthrough:v1`, is separate from Welcome, authentication, appearance and backend-scoped drafts. An offered, completed, skipped or interrupted tour does not automatically reopen on restart; corrupt or unreadable preferences defer to manual replay. Guest and signed-in Help expose Take the app tour, returning to Home and starting from step one. Deep links, existing authentication, the five tabs and the five-step editor retain their own workflows. Compact cards place Skip tour beside the step label and keep Back/Next or Start exploring together, retaining scalable text, accessible touch targets and small-screen scrolling. The historical [native visual review](artifacts/walkthrough-20261017/VISUAL_REVIEW.md) retains its eight earlier POCO states. The later [four-area review](artifacts/four-area-polish-20261017/VISUAL_REVIEW.md) returns bounded `ship` for the isolated-emulator packet and fourteen reconnected-POCO captures, covering compact cards, Create hierarchy and separate media in selected Dark/font1.17 and Light/font1.3 states. The compatible ARM64 update preserved the signed-in session and existing draft; a separately named fictional local draft exercised media URL previews/cancel and resumption without account save, submission or upload.

Welcome's current swipe/order/caption/dot/vertical-scroll/no-completion evidence is isolated-emulator only; physical Welcome remains UNVERIFIED because the phone session was preserved without signing out. Mounted Welcome retained turtle on a System→Light change; a font-scale Activity recreation started fresh Welcome at mountains and is not a same-mounted reset. Current source checks pass 179/179 frontend tests and TypeScript/full-source ESLint; the 47,565,328-byte ARM64 CloudTest candidate is `CD7E7757…`. [Final device proof](artifacts/four-area-polish-20261017/FINAL_DEVICE_STATE.json) confirms the installed candidate, unchanged source inputs and signed-in Dark Home restored to original font1.17/density440 with 3 unread unchanged. [Physical report](PHYSICAL_ANDROID_TEST.md) owns exact current interactions/restoration. Whole-app, TalkBack/API24–27, upload/cloud, performance and production acceptance remain separate.

The later clean-auth correction removes the standalone Settings footer from all
Welcome/Login/Register modes. Guests reach device Settings through Help; signed-in
users retain Profile Settings. Shared auth routes, form state and appearance/
currency preferences keep their existing behavior. Current final build and bounded
native evidence supersede the historical candidate facts above in PROGRESS.md.

Boundary: E:/Campaign only. Preserve the existing Expo/React Native client, FastAPI API, authentication, Query cache and scoped drafts. The current hosted configuration uses the established Render Free HTTPS service, Neon Free production PostgreSQL and authenticated Cloudinary Free campaign media; local-default SQLite remains available. Auto-deploy is off and provider credentials remain server-side or ignored. [CLOUD_DEPLOYMENT.md](docs/CLOUD_DEPLOYMENT.md) records the actual deployment and bounded persistence/native evidence; this documentation update makes no new live-cloud claim. No ERP access, new project, real payment/advertising integration, paid resources, cloud restart/redeployment, database migration, recording, publishing or organizer submission is authorized by the tour task. The Debug-signed CloudTest APK remains an internal test artifact, with production release and independent-device acceptance separately gated.

Campaign sections and Explore categories use actual native LTR horizontal pages:
left reveals the next, right the previous, no wrap. Tab/category taps select the
same page. Shared headers stay stable and each page retains its vertical list.
Activity history rows integrate into the page, retaining shared private feed and
read semantics with the quick sheet. Eligible draft deletion requires title/scope
confirmation; device deletion is durable and account deletion requires confirmed
server success. USD remains canonical; Settings can display/enter INR using an
explicit dated reference and frozen quote. Currency changes cannot change
receipts, account balances or measured/estimated reach.
