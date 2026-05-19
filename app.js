// استيراد Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// كائن التهيئة الخاص بمشروعك (الذي أعطيتني إياه)
const firebaseConfig = {
    apiKey: "AIzaSyDIGQ8MTdb3XzJ8w4CuktSADkLF9MUZIYI",
    authDomain: "tradingfinanceapp.firebaseapp.com",
    projectId: "tradingfinanceapp",
    storageBucket: "tradingfinanceapp.firebasestorage.app",
    messagingSenderId: "901228416943",
    appId: "1:901228416943:web:013b973250d7b4fa4ce95a",
    measurementId: "G-59C97Y8TB5"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// انتظار تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', () => {
    // عناصر HTML
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('errorMessage');
    const googleBtn = document.getElementById('googleLoginBtn');
    const loginBtn = document.getElementById('loginBtn');

    // التأكد من وجود العناصر قبل إضافة الأحداث
    if (loginForm) {
        // تسجيل الدخول بالبريد وكلمة المرور
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            errorDiv.innerText = "";
            
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = 'جاري الدخول...';
            }

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                alert(`مرحباً ${userCredential.user.email}! تم تسجيل الدخول بنجاح.`);
                // هنا يمكنك توجيه المستخدم إلى صفحة أخرى
                // window.location.href = "dashboard.html";
            } catch (error) {
                let msg = "";
                switch (error.code) {
                    case 'auth/user-not-found': 
                        msg = "❌ البريد الإلكتروني غير مسجل"; 
                        break;
                    case 'auth/wrong-password': 
                        msg = "❌ كلمة المرور غير صحيحة"; 
                        break;
                    case 'auth/invalid-email': 
                        msg = "❌ البريد الإلكتروني غير صالح"; 
                        break;
                    default: 
                        msg = "❌ خطأ: " + error.message;
                }
                errorDiv.innerText = msg;
            } finally {
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = 'دخول';
                }
            }
        });
    }

    // تسجيل الدخول ب Google
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            errorDiv.innerText = "";
            googleBtn.disabled = true;
            googleBtn.innerHTML = 'جاري الاتصال بـ Google...';
            
            try {
                const result = await signInWithPopup(auth, googleProvider);
                alert(`مرحباً ${result.user.displayName}! تم تسجيل الدخول بنجاح عبر Google.`);
                // توجيه المستخدم
                // window.location.href = "dashboard.html";
            } catch (error) {
                errorDiv.innerText = "❌ فشل تسجيل الدخول عبر Google: " + error.message;
            } finally {
                googleBtn.disabled = false;
                googleBtn.innerHTML = 'تسجيل الدخول باستخدام Google';
            }
        });
    }
});