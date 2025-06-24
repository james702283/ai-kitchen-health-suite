================================================================================🍳 AI KITCHEN HUB================================================================================AI Kitchen Hub is a modern web application designed to be a comprehensiveassistant for your health and culinary needs. It leverages AI to generate newrecipes, helps you track your daily food intake, and provides a personaldigital cookbook for your saved creations.✨ FEATURESFirebase Authentication: Secure user login and registration using emailand password.AI Recipe Generator: Enter ingredients you have on hand and get new,creative recipe ideas.Daily Meal Log: Track your breakfast, lunch, dinner, and snacks forany given day with estimated calorie counts.Personal Cookbook: Save your favorite generated recipes to build apersonal, digital cookbook.Export & Share: Easily copy, print, or export recipes as .txt or .pdffiles.🛠️ TECH STACKFrontend: React & ViteBackend & Database: Firebase (Authentication & Firestore)Styling: Tailwind CSSIcons: Lucide React🚀 GETTING STARTEDTo get a local copy up and running, please follow these steps.PrerequisitesEnsure you have the following installed on your machine:Node.js (v16 or later)npm (Node Package Manager)Installation GuideClone the RepositoryClone the project to your local machine.git clone https://github.com/your-username/ai-kitchen-health-suite.git
cd ai-kitchen-health-suite
Install DependenciesInstall all the required NPM packages.npm install
Set Up Environment VariablesCreate a .env file in the root of the project and add your Firebaseproject credentials.# Create this file at the root of your project: /.env

VITE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
Run the Development ServerStart the local development server.npm run dev
The application will be available at http://localhost:5173.📜 AVAILABLE SCRIPTSnpm run dev: Runs the app in development mode.npm run build: Builds the app for production.npm run preview: Previews the production build locally.📄 LICENSEThis project is licensed under the MIT License.
