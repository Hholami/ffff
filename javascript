// profile-script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// 🔥 إعدادات Firebase (انسخها من مشروعك في Firebase Console)
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
const db = getFirestore(app);
const storage = getStorage(app);

// عناصر HTML
const profileForm = document.getElementById('profileForm');
const messageDiv = document.getElementById('message');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const usernameInput = document.getElementById('username');
const phoneInput = document.getElementById('phone');
const birthDateInput = document.getElementById('birthDate');
const addressInput = document.getElementById('address');
const countryInput = document.getElementById('country');
const stateInput = document.getElementById('state');
const experienceSelect = document.getElementById('experience');
const accountTypeSelect = document.getElementById('accountType');
const initialCapitalInput = document.getElementById('initialCapital');
const totalProfitInput = document.getElementById('totalProfit');
const totalTradesInput = document.getElementById('totalTrades');
const successRateInput = document.getElementById('successRate');
const currentBalanceInput = document.getElementById('currentBalance');
const maxDrawdownInput = document.getElementById('maxDrawdown');
const profileImage = document.getElementById('profileImage');
const imageUpload = document.getElementById('imageUpload');
const userNameDisplay = document.getElementById('userNameDisplay');

let currentUser = null;

// عرض رسائل للمستخدم
function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}

// حفظ بيانات الملف الشخصي في Firestore
async function saveProfileData(userId, formData) {
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, {
            ...formData,
            updatedAt: serverTimestamp()
        }, { merge: true });
        showMessage('✅ تم حفظ البيانات بنجاح!', 'success');
    } catch (error) {
        console.error('Error saving profile:', error);
        showMessage('❌ حدث خطأ أثناء حفظ البيانات: ' + error.message, 'error');
    }
}

// جلب بيانات الملف الشخصي من Firestore وعرضها
async function loadProfileData(userId) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            firstNameInput.value = data.firstName || '';
            lastNameInput.value = data.lastName || '';
            usernameInput.value = data.username || '';
            phoneInput.value = data.phone || '';
            birthDateInput.value = data.birthDate || '';
            addressInput.value = data.address || '';
            countryInput.value = data.country || '';
            stateInput.value = data.state || '';
            experienceSelect.value = data.experience || '';
            accountTypeSelect.value = data.accountType || 'تجريبي';
            initialCapitalInput.value = data.initialCapital || '';
            totalProfitInput.value = data.totalProfit || '0';
            totalTradesInput.value = data.totalTrades || '0';
            successRateInput.value = data.successRate || '0';
            currentBalanceInput.value = data.currentBalance || '0';
            maxDrawdownInput.value = data.maxDrawdown || '';
            if (data.profileImageUrl) {
                profileImage.src = data.profileImageUrl;
            }
            // عرض اسم المستخدم في الرأس
            const displayName = data.firstName ? `${data.firstName} ${data.lastName || ''}` : data.username || 'المستخدم';
            userNameDisplay.textContent = `مرحباً، ${displayName}!`;
        } else {
            console.log('No profile document found for user. Creating new...');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('❌ حدث خطأ أثناء تحميل البيانات', 'error');
    }
}

// رفع الصورة إلى Firebase Storage
async function uploadProfileImage(file, userId) {
    try {
        const imageRef = ref(storage, `profile_images/${userId}`);
        await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(imageRef);
        // حفظ رابط الصورة في Firestore
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, { profileImageUrl: downloadURL }, { merge: true });
        profileImage.src = downloadURL;
        showMessage('✅ تم تحديث الصورة بنجاح!', 'success');
    } catch (error) {
        console.error('Error uploading image:', error);
        showMessage('❌ حدث خطأ أثناء رفع الصورة', 'error');
    }
}

// حدث رفع الصورة
imageUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0] && currentUser) {
        const file = e.target.files[0];
        uploadProfileImage(file, currentUser.uid);
    }
});

// حدث حفظ النموذج
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) {
        showMessage('❌ الرجاء تسجيل الدخول أولاً', 'error');
        return;
    }
    
    const formData = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        username: usernameInput.value,
        phone: phoneInput.value,
        birthDate: birthDateInput.value,
        address: addressInput.value,
        country: countryInput.value,
        state: stateInput.value,
        experience: experienceSelect.value,
        accountType: accountTypeSelect.value,
        initialCapital: initialCapitalInput.value,
        totalProfit: totalProfitInput.value,
        totalTrades: totalTradesInput.value,
        successRate: successRateInput.value,
        currentBalance: currentBalanceInput.value,
        maxDrawdown: maxDrawdownInput.value,
    };
    
    await saveProfileData(currentUser.uid, formData);
});

// مراقبة حالة تسجيل دخول المستخدم
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadProfileData(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});