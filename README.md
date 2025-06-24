# 🍳 AI Kitchen Hub

AI Kitchen Hub is a web application that helps you discover new recipes, track your meals, and manage your personal cookbook.

## ✨ Features

- **Firebase Authentication:** Secure user login and registration using email and password.
- **AI Recipe Generator:** Enter ingredients you have on hand and get new, creative recipe ideas.
- **Daily Meal Log:** Track your meals with estimated calorie counts.
- **Personal Cookbook:** Save your favorite recipes to build a personal, digital cookbook.
- **Export & Share:** Easily copy, print, or export recipes as .txt or .pdf.

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| React | Frontend Library |
| Vite | Build Tool |
| Firebase | Backend Services |
| &nbsp; ↳ Firestore | Database |
| &nbsp; ↳ Auth | User Authentication |
| Tailwind CSS | Styling |
| Lucide React | Icons |

## 🚀 Getting Started

To get a local copy up and running, please follow these steps.

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v16 or later)
- npm (Node Package Manager)

### Installation

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/YOUR_USERNAME/ai-kitchen-health-suite.git
    cd ai-kitchen-health-suite
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Set Up Environment Variables**
    Create a file named `.env` in the root of your project and add your Firebase credentials.

    ```dotenv
    # /.env
    VITE_API_KEY="YOUR_FIREBASE_API_KEY"
    VITE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    VITE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    VITE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    VITE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    VITE_APP_ID="YOUR_FIREBASE_APP_ID"
    VITE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
    ```

4.  **Run the Development Server**
    ```sh
    npm run dev
    ```
    The application will be available at http://localhost:5173.

## 📜 Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Runs the app in development mode. |
| `npm run build` | Builds the app for production. |
| `npm run preview` | Previews the production build locally. |

## 📄 License

This project is licensed under the [MIT License](LICENSE).