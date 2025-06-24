🍳 AI Kitchen Hub✨ FeaturesFirebase Authentication: Secure user login and registration using email and password.AI Recipe Generator: Enter ingredients you have on hand and get new, creative recipe ideas.Daily Meal Log: Track your meals with estimated calorie counts.Personal Cookbook: Save your favorite recipes to build a personal, digital cookbook.Export & Share: Easily copy, print, or export recipes as .txt or .pdf.🛠️ Tech StackTechnologyPurposeReactFrontend LibraryViteBuild ToolFirebaseBackend Services ↳ FirestoreDatabase ↳ AuthUser AuthenticationTailwind CSSStylingLucide ReactIcons🚀 Getting StartedTo get a local copy up and running, please follow these steps.PrerequisitesEnsure you have the following installed on your machine:Node.js (v16 or later)npm (Node Package Manager)InstallationClone the Repositorygit clone https://github.com/YOUR_USERNAME/ai-kitchen-health-suite.git
cd ai-kitchen-health-suite
Install Dependenciesnpm install
Set Up Environment VariablesCreate a file named .env in the root of your project and add your Firebase credentials.# /.env
VITE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
Run the Development Servernpm run dev
The application will be available at http://localhost:5173.📜 Available ScriptsScriptDescriptionnpm run devRuns the app in development mode.npm run buildBuilds the app for production.npm run previewPreviews the production build locally.📄 LicenseThis project is licensed under the MIT License.