import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// كائن التهيئة
const firebaseConfig = {
    apiKey: "AIzaSyDIGQ8MTdb3XzJ8w4CuktSADkLF9MUZIYI",
    authDomain: "tradingfinanceapp.firebaseapp.com",
    projectId: "tradingfinanceapp",
    storageBucket: "tradingfinanceapp.firebasestorage.app",
    messagingSenderId: "901228416943",
    appId: "1:901228416943:web:013b973250d7b4fa4ce95a",
    measurementId: "G-59C97Y8TB5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const registerForm = document.getElementById('registerForm');
const errorDiv = document.getElementById('errorMessage');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    errorDiv.innerText = "";
    
    // التحقق من البيانات
    if (password !== confirmPassword) {
        errorDiv.innerText = "❌ كلمة المرور غير متطابقة";
        return;
    }
    
    if (password.length < 6) {
        errorDiv.innerText = "❌ كلمة المرور يجب أن تكون 6 أحرف أو أكثر";
        return;
    }
    
    const btn = registerForm.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = 'جاري إنشاء الحساب...';
    
    try {
        // إنشاء حساب في Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // تحديث الاسم
        await updateProfile(user, { displayName: fullName });
        
        // حفظ البيانات في Firestore
        await setDoc(doc(db, "users", user.uid), {
            fullName: fullName,
            email: email,
            createdAt: new Date(),
            virtualBalance: 100000,
            tradingChallenge: "not_started"
        });
        
        // ✅ انتقل فوراً إلى صفحة تسجيل الدخول
        window.location.href = "index.html";
        
    } catch (error) {
        let msg = "";
        switch (error.code) {
            case 'auth/email-already-in-use':
                msg = "❌ هذا البريد مسجل بالفعل";
                break;
            case 'auth/invalid-email':
                msg = "❌ بريد إلكتروني غير صالح";
                break;
            default:
                msg = "❌ خطأ: " + error.message;
        }
        errorDiv.innerText = msg;
        btn.disabled = false;
        btn.innerHTML = 'إنشاء حساب';
    }
});
