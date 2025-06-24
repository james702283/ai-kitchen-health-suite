🍳 AI Kitchen HubAI Kitchen Hub is a modern web application designed to be a comprehensive assistant for your health and culinary needs. It leverages AI to generate new recipes, helps you track your daily food intake, and provides a personal digital cookbook for your saved creations.✨ FeaturesFirebase Authentication: Secure user login and registration using email and password.AI Recipe Generator: Enter ingredients you have on hand and get new, creative recipe ideas.Daily Meal Log: Track your breakfast, lunch, dinner, and snacks for any given day. The app provides an estimated calorie count for each entry to help you monitor your intake.Personal Cookbook: Save your favorite generated recipes to your "My Saved Recipes" tab to build a personal, digital cookbook.Export & Share: Easily copy, print, or export recipes as .txt or .pdf files.🛠️ Tech StackFrontend: React & ViteBackend: FirebaseFirebase AuthenticationFirestore DatabaseStyling: Tailwind CSSIcons: Lucide React🚀 Getting StartedTo get a local copy up and running, follow these simple steps.PrerequisitesNode.js (v16 or later recommended)npm (usually comes with Node.js)InstallationClone the repositorygit clone https://github.com/your-username/ai-kitchen-health-suite.git
cd ai-kitchen-health-suite
Install NPM packagesnpm install
Set up Environment VariablesCreate a new file in the root of your project directory named .envCopy the contents of .env.example below and paste them into your new .env file.Replace the placeholder values with your actual Firebase project keys. You can find these in your Firebase project settings.# .env.example - Copy this into your .env file

VITE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
Run the Development Servernpm run dev
Your application should now be running on http://localhost:5173 (or the next available port).📜 Available ScriptsIn the project directory, you can run:npm run dev: Runs the app in development mode.npm run build: Builds the app for production to the dist folder.npm run preview: Serves the production build locally to preview it before deployment.📄 LicenseThis project is licensed under the MIT License - see the LICENSE.md file for details.
