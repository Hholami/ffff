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
const successDiv = document.getElementById('successMessage');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. أخذ البيانات من النموذج
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 2. مسح الرسائل القديمة
    errorDiv.innerText = "";
    successDiv.innerText = "";
    
    // 3. التحقق من صحة البيانات
    if (password !== confirmPassword) {
        errorDiv.innerText = "❌ كلمة المرور وتأكيدها غير متطابقين";
        return;
    }
    
    if (password.length < 6) {
        errorDiv.innerText = "❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        return;
    }
    
    // 4. تعطيل الزر أثناء المعالجة
    const btn = registerForm.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
    
    try {
        // 5. إنشاء حساب في Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 6. تحديث الاسم في Authentication
        await updateProfile(user, { displayName: fullName });
        
        // 7. حفظ البيانات في Firestore (قاعدة البيانات) 🔥
        await setDoc(doc(db, "users", user.uid), {
            fullName: fullName,
            email: email,
            createdAt: new Date(),
            virtualBalance: 100000,      // رصيد تجريبي
            tradingChallenge: "not_started",
            accountStatus: "active"
        });
        
        // 8. رسالة نجاح
        successDiv.innerText = "✅ تم إنشاء الحساب وحفظ البيانات بنجاح! جاري تحويلك إلى صفحة تسجيل الدخول...";
        
        // 9. الانتقال إلى صفحة تسجيل الدخول بعد 2 ثانية
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
        
    } catch (error) {
        // 10. معالجة الأخطاء
        let msg = "";
        switch (error.code) {
            case 'auth/email-already-in-use':
                msg = "❌ هذا البريد الإلكتروني مسجل بالفعل. الرجاء استخدام بريد آخر أو تسجيل الدخول.";
                break;
            case 'auth/invalid-email':
                msg = "❌ البريد الإلكتروني غير صالح";
                break;
            case 'auth/weak-password':
                msg = "❌ كلمة المرور ضعيفة جداً (استخدم 6 أحرف على الأقل)";
                break;
            default:
                msg = "❌ خطأ: " + error.message;
        }
        errorDiv.innerText = msg;
    } finally {
        // 11. إعادة تفعيل الزر
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> إنشاء حساب';
    }
});