# AI Notes Application
 
## Project Overview
 
This project is a modern AI-powered notes application focused on productivity,intelligent writing assistance, and premium user experience.

The application should provide:
-Smart note creation and management
-Real time AI autocomplete suggestions
-Category-based organization
-Shared collobrative notes
-Premium modern UI inspired by modern SaaS and AI products

The overall experience should feel smooth,fast,futuristic and production-ready.

## Tech Stack :

## Frontend:
 - React
 - Vite
 - Tailwind CSS

## Backend:
- Node.js 
- Express.js
- NodeMailer

## Database:
MongoDB

## AI Tech Stack:
- TipTap Editor
- Vercel AI SDK
- Claude API
- GROQ AI

## Real-Time Collobration:
 Socket.IO for real-time communication
- Send notes to another user
- Instantly receive shared notes without refresh
- View sent notes and received notes sections
- Get real -time notifications for new shared notes

## Project Creation Instructions:

## Folder Structure 
/components -> reusable UI components
/pages -> application pages
/services -> API calls
/utils -> helper functions
/context -> global state
/hooks -> custom hooks

## API rules
- Use REST API s
- Use async/await
- Proper error handling

- Return JSON responses
- Use try/catch in all API s

## Environment Variables

Store all secrets and API keys in .env files.
 
 

## Authentication and Security:
 The application should include secure authentication and authorization using jwt authentication and bcrypt password hashing.Users must be able to securely sign up,login,and stay authenticated using protected routes and token-based authentication.

 Build modern login and signup pages with multiple colours premium ui theme of the app.The authentication pages should use glassmorphism cards , soft shadows,rounded corners,modern typography , floating glow effects,and responsive layouts.

## Login Page Requirements
 The login page should include:
 email input
 password input
 show/hide password toggle
 remember me checkbox
 forgot password link
 login button

 link to signup page

## Signup Page Requirements
 The signup page should include:
 full name input
 email input
 password input
 confirm password input
 password strength validation 
 create account button
 link to login page

## Professional Features 
 folder or category support
 pin notes
 favourite notes
 trash/recycle bin
 auto-save
 dark/light mode
 tags
 markdown support
 charcater count
 last edited timestamp

## Category System
 -Freelancer work Notes
 -Personal NOTES
 -Goals
 Users should also be able to create custom categories

## UI Design System:

- Use Glassmorphism + bento combination for ui designing

## Typography Style Requirements:
 Main UI font : Geist Sans(preferred) or Satoshi
 Secondary/body font : Inter
 Hero section font : Space Grotesk for bold futuristic headings

 ## Visual Style:
 The UI should feel :
 - Premium 
 - Immersive
 - Highly readble
 - Futuristic
 - Modern 2026 aesthetic
  Keep the background :
  minimal,elegnat,immersive,smoothly animated
  Style:
  Cinematic lighting



 ## Add AI autocomplete while typing notes.
 Features :
 Suggest next words and sentences in real time
 Show ghost text suggestions while typing
 Accept suggestions using Tab Key
 Generate smart suggestions based on current note content
 smooth and fast typing experience
 similar to notion ai and gmail smart compose

Design and build a premium modern landing page for and AI-powered notes


# AI Summary Feature
Add a "Summarize with AI" button below the notes editor
When user clicks the button,generate AI summary from the notes content
Show loading state while generating summary
Display summary in a modern card below the editor
Add copy and regenerate buttons
Show validation message if notes are empty


## Navbar
Create a sticky glassmorphism navbar
 with:
AI notes logo
-Home
-About
-How it works
-Features
-FAQ
-profile
-"Get Started" CTA button

Navbar should have:
-backdrop blur
-glowing border
-smooth hover transitions
-premium modern spacing

## Analytics page Feature
Create a modern Analytics Dashboard page for the AI Notes application

Requirements:
Add a separate Analytics page in the sidebar
Use a clean dashboard-style UI with cards,charts,and statistics

Show:
Total Notes
Total Summaries Generated
Notes Created This Week
Most Used Categories
AI usage Statistics
Recently Active Notes
Word Count Analytics
Productivity Insights
-Add graphs/charts for:
Notes created over time
Category distribution
Daily activity
Include filters:
Today
Last 7 Days
Lat 30 Days
All time

## NodeMailer integration
Features:
Forgot password email sending
OTP email verification
Secure Gmail App Password Authentication
Dynamic OTP generation
Email templates for authentication flow
Error handling for failed email delivery
Send email notification when user share notes

## Notes Editor
Requirements:
-Keep the editor as the main focus area
-Add a top floating toolbar with :
-Bold
-Italic
-Underline
-Texr alignment options
-Headings
-Bullet list
-Numbered list
-Insert link

Right Side AI panel:
-Add a separate AI assistant panel 
-Include:
-Upload File tab

-YouTube Link tab
-Drag and drop upload area
-Generate Notes button
AI-generated notes should automatically appear inside the editor

Layout Structure:
-Left/Main section -> Rich text editor
-Right sidebar -> AI tools and uploads
-Sticky toolbar at top

To run the project use  these commands 

 ```bash
 npm run dev
 ```
