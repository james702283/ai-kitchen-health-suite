import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    addDoc, 
    collection, 
    query, 
    where, 
    onSnapshot,
    deleteDoc,
    getDocs,
    enableIndexedDbPersistence
} from 'firebase/firestore';
import { BookOpen, ChefHat, HeartPulse, LogOut, Plus, Trash2, Printer, Copy, Save, FileDown, X, Share2, ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react';

// --- Helper for jsPDF ---
const jsPDF = window.jspdf?.jsPDF;

// --- Firebase Configuration & Initialization ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let app;
let auth;
let db;

try {
    if (!firebaseConfig.apiKey) {
        throw new Error("Firebase API Key is missing. Please check your .env file and ensure the server is restarted.");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    enableIndexedDbPersistence(db)
      .catch((err) => {
          if (err.code === 'failed-precondition') {
              console.warn("Firestore persistence failed-precondition. This can happen with multiple tabs open.");
          } else if (err.code === 'unimplemented') {
              console.warn("Firestore persistence is not supported in this browser.");
          }
      });
} catch (error) {
    console.error("CRITICAL: Firebase initialization failed.", error.message);
}

// --- Sample Data for Stability ---
const sampleRecipes = [
    { title: "Classic Chicken and Rice", ingredients: ["1 cup rice", "2 chicken breasts", "1 tbsp olive oil", "Salt and pepper to taste"], instructions: "1. Cook rice according to package directions.\n2. Season chicken with salt and pepper.\n3. Heat olive oil in a pan and cook chicken until golden brown.\n4. Serve chicken over rice." },
    { title: "Simple Chicken Salad", ingredients: ["2 cooked chicken breasts, shredded", "1/4 cup mayonnaise", "1 celery stalk, chopped", "Salt and pepper to taste"], instructions: "1. In a bowl, combine shredded chicken, mayonnaise, and celery.\n2. Mix well and season with salt and pepper.\n3. Serve on bread or with crackers." },
];

// --- Main App Component ---
export default function App() {
    const [activeTab, setActiveTab] = useState('generator');
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [globalNotification, setGlobalNotification] = useState('');

    const showGlobalNotification = (message) => {
        setGlobalNotification(message);
        setTimeout(() => setGlobalNotification(''), 3000);
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.async = true;
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (!auth || !db) {
            setError("Firebase services could not be initialized. Please check your configuration, network connection, and ensure services are enabled in the Firebase Console.");
            setIsAuthReady(true);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = () => {
        signOut(auth).catch(error => console.error("Sign Out Error:", error));
    };

    if (!isAuthReady) {
        return <SplashScreen />;
    }
    
    if (error) {
        return <ErrorScreen message={error} />
    }

    return (
        <div className="font-sans text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop')" }}>
            <div className="min-h-screen w-full bg-black/50 flex flex-col relative">
                {globalNotification && <Notification message={globalNotification} />}
                {!user ? (
                    <AuthScreen auth={auth} />
                ) : (
                    <>
                        <Header activeTab={activeTab} setActiveTab={setActiveTab} handleSignOut={handleSignOut} />
                        <main className="flex-grow p-4 md:p-8">
                            <TabContent activeTab={activeTab} db={db} userId={user.uid} appId={appId} showNotification={showGlobalNotification} />
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}

// --- Sub-Components ---

const SplashScreen = () => (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-900 text-white">
        <ChefHat className="w-24 h-24 animate-pulse text-green-400" />
        <h1 className="text-3xl font-bold mt-4">AI Kitchen Hub</h1>
        <p className="mt-2 text-gray-300">Initializing your culinary experience...</p>
    </div>
);

const ErrorScreen = ({ message }) => (
     <div className="h-screen w-full flex flex-col justify-center items-center bg-red-900 text-white p-4">
        <AlertTriangle className="w-24 h-24 text-yellow-300" />
        <h1 className="text-3xl font-bold mt-4">Application Error</h1>
        <p className="mt-2 text-gray-200 text-center">{message}</p>
    </div>
)

const AuthScreen = ({ auth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!auth) {
            setError("Authentication service is not available.");
            setIsLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error("Firebase Auth Error:", { code: err.code, message: err.message });
            switch (err.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setError("Invalid email or password. Please try again.");
                    break;
                case 'auth/email-already-in-use':
                    setError("An account with this email already exists. Please sign in.");
                    setIsSignUp(false);
                    break;
                case 'auth/invalid-email':
                    setError("The email address you entered is not valid.");
                    break;
                case 'auth/weak-password':
                    setError("Password is too weak. It should be at least 6 characters.");
                    break;
                case 'auth/network-request-failed':
                    setError("Network error. Please check your internet connection.");
                    break;
                case 'auth/operation-not-allowed':
                    setError("Email/Password sign-in is not enabled for this project.");
                    break;
                case 'auth/api-key-not-valid':
                     setError("The provided API key is not valid. Please ensure it is correct in the .env file.");
                     break;
                default:
                    setError(`An unexpected error occurred: ${err.code}`);
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center p-4">
            <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-gray-900/50 backdrop-blur-xl border border-white/20">
                <h1 className="text-4xl font-bold text-center mb-2">Welcome!</h1>
                <p className="text-center text-gray-300 mb-8">{isSignUp ? 'Create a new account' : 'Sign in to continue'}</p>
                {error && <p className="bg-red-500/50 text-white p-3 rounded-lg mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-black/30 p-3 rounded-lg mb-4 border border-transparent focus:border-green-400 focus:outline-none" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black/30 p-3 rounded-lg mb-6 border border-transparent focus:border-green-400 focus:outline-none" required />
                    <button type="submit" disabled={isLoading} className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg font-bold transition-colors disabled:bg-gray-500 flex justify-center items-center">
                        {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>
                <p className="text-center mt-6">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-green-400 hover:underline">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

const Header = ({ activeTab, setActiveTab, handleSignOut }) => {
    const tabs = [
        { id: 'generator', label: 'AI Recipe Generator', icon: ChefHat },
        { id: 'log', label: 'Daily Meal Log', icon: HeartPulse },
        { id: 'saved', label: 'My Saved Recipes', icon: BookOpen },
    ];

    return (
        <header className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                     <ChefHat className="w-8 h-8 text-green-400" />
                     <h1 className="text-2xl font-bold hidden md:block">AI Kitchen Hub</h1>
                </div>
                <nav className="flex-grow flex justify-center items-center space-x-2 md:space-x-4">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${activeTab === tab.id ? 'bg-green-500/30 text-green-300' : 'text-gray-300 hover:bg-white/10'}`}>
                            <tab.icon className="w-5 h-5" />
                            <span className="hidden lg:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    <button onClick={handleSignOut} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:inline">Sign Out</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

const TabContent = ({ activeTab, db, userId, appId, showNotification }) => {
    if (!db || !userId) return <div className="p-6 text-center">Loading user data...</div>;

    switch (activeTab) {
        case 'generator':
            return <RecipeGeneratorTab db={db} userId={userId} appId={appId} showNotification={showNotification}/>;
        case 'log':
            return <MealLogTab db={db} userId={userId} appId={appId} showNotification={showNotification}/>;
        case 'saved':
            return <SavedRecipesTab db={db} userId={userId} appId={appId} showNotification={showNotification}/>;
        default:
            return <RecipeGeneratorTab db={db} userId={userId} appId={appId} showNotification={showNotification}/>;
    }
};

const RecipeGeneratorTab = ({ db, userId, appId, showNotification }) => {
    const [ingredients, setIngredients] = useState('');
    const [generatedRecipes, setGeneratedRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const collectionPath = (collectionName) => `artifacts/${appId}/users/${userId}/${collectionName}`;

    const handleGenerate = async () => {
        if (!ingredients.trim()) {
            setError('Please enter some ingredients.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedRecipes([]);
        setSelectedRecipe(null);
        setTimeout(() => {
            setGeneratedRecipes(sampleRecipes);
            setIsLoading(false);
        }, 500);
    };
    
    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl">
            <h2 className="text-3xl font-bold mb-4">AI Recipe Generator</h2>
            <p className="text-gray-300 mb-6">Enter ingredients to get recipe ideas.</p>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="e.g., chicken, rice, broccoli" className="w-full md:w-1/2 h-32 bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none resize-none" />
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                     <button onClick={handleGenerate} disabled={isLoading} className="bg-green-500 hover:bg-green-600 p-4 rounded-lg font-bold transition-colors disabled:bg-gray-500 w-full flex justify-center items-center h-16">
                         {isLoading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : 'Generate Recipes'}
                    </button>
                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                </div>
            </div>

            {generatedRecipes.length > 0 && !selectedRecipe && (
                <div>
                    <h3 className="text-2xl font-bold mb-4">Recipe Ideas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedRecipes.map((recipe, index) => (
                            <div key={index} onClick={() => setSelectedRecipe(recipe)} className="bg-black/20 p-4 rounded-xl cursor-pointer hover:bg-green-500/20 transition-all transform hover:scale-105">
                                <h4 className="font-bold text-lg text-green-300">{recipe.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {selectedRecipe && <RecipeDetailView recipe={selectedRecipe} setSelectedRecipe={setSelectedRecipe} showNotification={showNotification} db={db} collectionPath={collectionPath} isGenerated={true}/>}
        </div>
    );
};

const MealLogTab = ({ db, userId, appId, showNotification }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [meals, setMeals] = useState([]);
    const [totalCalories, setTotalCalories] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!db || !userId) return;
        const path = `artifacts/${appId}/users/${userId}/mealLogs`;
        const q = query(collection(db, path), where("date", "==", date));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMeals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMeals(fetchedMeals);
            const total = fetchedMeals.reduce((sum, meal) => sum + (meal.estimatedCalories || 0), 0);
            setTotalCalories(total);
        }, (error) => {
            console.error("Error fetching meal logs:", error);
            showNotification("Error: Could not fetch meal logs.");
        });

        return () => unsubscribe();
    }, [date, db, userId, appId, showNotification]);

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    return (
        <>
            {isModalOpen && (
                <LogMealModal 
                    db={db} 
                    userId={userId} 
                    appId={appId} 
                    date={date} 
                    showNotification={showNotification}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold">Daily Meal Log</h2>
                        <p className="text-gray-300">Track your daily food consumption and calories.</p>
                    </div>
                    <input type="date" value={date} onChange={handleDateChange} className="bg-black/30 p-2 rounded-lg border border-transparent focus:border-green-400 focus:outline-none w-full sm:w-auto"/>
                </div>

                <div className="bg-black/20 p-4 rounded-xl mb-6 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Today's Summary</h3>
                    <p className="text-2xl font-bold text-green-400">{totalCalories} kcal</p>
                </div>
                
                <div className="flex justify-end mb-4">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <Plus size={18}/> Log New Meal
                    </button>
                </div>

                <div className="space-y-4 mt-6">
                    {meals.length > 0 ? (
                        meals.map(meal => (
                            <div key={meal.id} className="bg-black/20 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg text-green-300">{meal.mealType}</p>
                                    <p className="text-gray-200">{meal.description}</p>
                                </div>
                                <p className="text-xl font-semibold">{meal.estimatedCalories} kcal</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-8">No meals logged for this day yet.</p>
                    )}
                </div>
            </div>
        </>
    );
};

// --- THIS IS THE CORRECTED MODAL LOGIC ---
const LogMealModal = ({ onClose, db, userId, appId, date, showNotification }) => {
    const [mealType, setMealType] = useState('Breakfast');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Please describe your meal.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const estimatedCalories = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
            const path = `artifacts/${appId}/users/${userId}/mealLogs`;
            
            // Wait for the database write to complete
            await addDoc(collection(db, path), { date, mealType, description, estimatedCalories, createdAt: new Date() });
            
            // Only after a successful save, update the UI
            showNotification('Meal logged successfully!');
            setDescription('');
            setMealType('Breakfast');
            
        } catch (err) {
            console.error("Save Meal Error:", err);
            setError("Failed to save meal. Please try again.");
        }
        
        // This now correctly runs after the try/catch block is complete
        setIsLoading(false);
    };

    return (
        <ModalWrapper onRequestClose={onClose}>
             <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md border border-white/20 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
                <h3 className="text-2xl font-bold mb-4">Log a New Meal</h3>
                {error && <p className="bg-red-500/50 text-white p-3 rounded-lg mb-4 text-center">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-semibold text-gray-300">Meal Type</label>
                        <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none">
                            <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-300">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., A bowl of oatmeal with berries..." className="w-full h-24 bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none resize-none" required />
                    </div>
                    <p className="text-xs text-yellow-400/80">Note: Calorie counts are AI-generated estimates.</p>
                    <button type="submit" disabled={isLoading} className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg font-bold transition-colors disabled:bg-gray-500 flex justify-center items-center h-12">
                        {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Log Meal'}
                    </button>
                </form>
            </div>
        </ModalWrapper>
    );
};


const SavedRecipesTab = ({ db, userId, appId, showNotification }) => {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); 
    const collectionPath = (collectionName) => `artifacts/${appId}/users/${userId}/${collectionName}`;

    useEffect(() => {
        if (!db || !userId) return;
        const recipesCol = collection(db, `artifacts/${appId}/users/${userId}/savedRecipes`);
        const unsubscribe = onSnapshot(recipesCol, (snapshot) => {
            const fetchedRecipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecipes(fetchedRecipes);
        });
        return () => unsubscribe();
    }, [db, userId, appId]);

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, collectionPath('savedRecipes'), id));
        showNotification("Recipe deleted successfully.")
        setConfirmDelete(null);
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl">
            <h2 className="text-3xl font-bold mb-4">My Saved Recipes</h2>
            <p className="text-gray-300 mb-6">Your personal digital cookbook.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.length > 0 ? (
                    recipes.map(recipe => (
                        <div key={recipe.id} className="bg-black/20 p-4 rounded-xl flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/30 border border-transparent">
                            <div>
                                <h3 className="text-xl font-bold text-green-300 mb-2">{recipe.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-3">{Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : ''}</p>
                            </div>
                            <div className="mt-4 flex gap-2 justify-end">
                                <button onClick={() => setConfirmDelete(recipe)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><Trash2 size={18}/></button>
                                <button onClick={() => setSelectedRecipe(recipe)} className="flex-grow bg-green-500/80 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">View</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 py-8 col-span-full">You haven't saved any recipes yet.</p>
                )}
            </div>
            {selectedRecipe && <RecipeDetailView recipe={selectedRecipe} setSelectedRecipe={setSelectedRecipe} showNotification={showNotification} db={db} collectionPath={collectionPath} />}
            {confirmDelete && <ConfirmModal title="Delete Recipe" message={`Are you sure you want to permanently delete "${confirmDelete.title}"?`} onConfirm={() => handleDelete(confirmDelete.id)} onCancel={() => setConfirmDelete(null)} />}
        </div>
    );
};

const RecipeDetailView = ({ recipe, setSelectedRecipe, showNotification, db, collectionPath, isGenerated }) => {
    
    const handleCopyToClipboard = (text, type) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification(`Native share unavailable. ${type} copied to clipboard!`);
        } catch (err) {
            console.error('Copy failed: ', err);
        }
        document.body.removeChild(textArea);
    };

    const handleSave = async () => {
        if (!recipe) return;
        try {
            await addDoc(collection(db, collectionPath('savedRecipes')), { ...recipe, createdAt: new Date() });
            showNotification('Recipe saved successfully!');
        } catch (error) {
            console.error("Save Recipe Error:", error);
            showNotification("Error: Could not save recipe.");
        }
    };

    const getShareableText = () => `Check out this recipe: ${recipe.title}\n\nIngredients:\n${Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : ''}\n\nInstructions:\n${recipe.instructions ? recipe.instructions.replace(/\\n/g, '\n') : ''}`;

    const handleShare = async () => {
        const shareData = { title: recipe.title, text: getShareableText() };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                 if (err.name !== 'AbortError') {
                    console.error("Share failed, falling back to copy:", err.message);
                    handleCopyToClipboard(shareData.text, 'Recipe');
                }
            }
        } else {
            handleCopyToClipboard(shareData.text, 'Recipe');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>${recipe.title}</title><style>body{font-family:sans-serif;color:#000}h3{color:#333}ul,ol{margin-left:20px}</style></head><body>`);
        printWindow.document.write(`<h3>${recipe.title}</h3><h4>Ingredients</h4><ul>${Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ing => `<li>${ing}</li>`).join('') : ''}</ul><h4>Instructions</h4><p>${recipe.instructions ? recipe.instructions.replace(/\\n/g, '<br>') : ''}</p>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="mt-6 bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl relative">
            <button onClick={() => setSelectedRecipe(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"><X size={24}/></button>
            <h3 className="text-3xl font-bold mb-4 text-green-300">{recipe.title}</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xl font-semibold mb-2">Ingredients</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-200">{Array.isArray(recipe.ingredients) && recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                </div>
                <div>
                    <h4 className="text-xl font-semibold mb-2">Instructions</h4>
                    <div className="text-gray-200 whitespace-pre-line leading-relaxed">{recipe.instructions && recipe.instructions.replace(/\\n/g, '\n')}</div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 justify-end">
                {isGenerated && <button onClick={handleSave} className="flex items-center gap-2 bg-blue-500/80 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"><Save size={18}/> Save</button>}
                <button onClick={handleShare} className="flex items-center gap-2 bg-purple-500/80 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"><Share2 size={18}/> Share</button>
                <ExportMenu getText={getShareableText} getTitle={() => recipe.title} />
                <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"><Printer size={18}/> Print</button>
            </div>
        </div>
    );
};
const ModalWrapper = ({ children, onRequestClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center p-4" onClick={onRequestClose}>
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            {children}
        </div>
    </div>
);


const Notification = ({ message }) => (
    <div className="fixed top-24 right-8 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in-out">
        <style>{`
            @keyframes fade-in-out {
                0% { opacity: 0; transform: translateY(-20px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
            .animate-fade-in-out { animation: fade-in-out 3s ease-in-out forwards; }
        `}</style>
        <CheckCircle size={20} />
        <span>{message}</span>
    </div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <ModalWrapper onRequestClose={onCancel}>
        <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md text-center border border-white/20">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-400"/>
            </div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Delete</button>
            </div>
        </div>
    </ModalWrapper>
);

const ExportMenu = ({ getText, getTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = (format) => {
        const text = getText();
        const title = getTitle().replace(/ /g, '_');

        if (format === 'txt') {
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
            if (window.jspdf) {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const splitText = doc.splitTextToSize(text, 180);
                doc.text(splitText, 10, 10);
                doc.save(`${title}.pdf`);
            } else {
                alert('PDF library is loading. Please try again in a moment.');
            }
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-teal-500/80 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                <FileDown size={18}/> Export <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
            {isOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-gray-700/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-10">
                    <button onClick={() => handleExport('txt')} className="block w-full text-left px-4 py-2 text-sm hover:bg-teal-500/50">as .txt</button>
                    <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm hover:bg-teal-500/50">as .pdf</button>
                </div>
            )}
        </div>
    );
};
