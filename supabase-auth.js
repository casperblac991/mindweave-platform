/**
 * MindWeave Supabase Authentication & Email Collection Module
 * Handles user registration, login, and email collection for newsletters
 * WITH STRICT AUTH GUARD - No access without login and email verification
 */

// Initialize Supabase Client
const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'https://mtirzcuntupkuavmjtcv.supabase.co';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';

// Create Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// 0. AUTH GUARD - BLOCK ALL ACCESS UNTIL LOGIN
// ============================================

/**
 * Check if user is authenticated and email is verified
 */
async function checkAuthStatus() {
    try {
        // Read the persisted session first. This avoids redirecting a valid user away from
        // protected pages when a transient network check to Auth is slow or unavailable.
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        const user = session?.user;
        if (error || !user) {
            return { authenticated: false, verified: false };
        }

        const isEmailConfirmed = Boolean(user.email_confirmed_at);
        return {
            authenticated: true,
            verified: isEmailConfirmed,
            user
        };
    } catch (error) {
        console.error('Auth check error:', error);
        return { authenticated: false, verified: false };
    }
}

/**
 * Hide all content and show auth modal if user is not authenticated
 */
async function enforceAuthGuard() {
    const authStatus = await checkAuthStatus();
    const path = window.location.pathname;
    const protectedPages = ['dashboard.html', 'creators.html', 'cart.html'];
    const isProtected = protectedPages.some(p => path.endsWith(p));
    
    if (!authStatus.authenticated) {
        if (isProtected) {
            // Protect internal pages: hide content and show login
            document.body.style.display = 'none';
            window.location.href = 'login.html';
        }
    } else if (!authStatus.verified) {
        // User logged in but email not verified
        showVerificationPendingModal(authStatus.user.email);
    } else {
        // User authenticated and email verified - show content
        document.body.style.display = 'block';
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'none';
        const mainContent = document.querySelector('main') || document.querySelector('.container');
        if (mainContent) mainContent.style.display = 'block';
    }
}

/**
 * Show modal for pending email verification
 */
function showVerificationPendingModal(email) {
    const modal = document.getElementById('verificationModal');
    if (!modal) {
        // Create verification modal if it doesn't exist
        const verificationHTML = `
            <div id="verificationModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    text-align: center;
                    max-width: 500px;
                    direction: rtl;
                ">
                    <h2 style="color: #0000FF; margin-bottom: 20px;">تحقق من بريدك الإلكتروني</h2>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        تم إرسال رابط التفعيل إلى: <strong>${email}</strong>
                    </p>
                    <p style="color: #666; margin-bottom: 30px;">
                        يرجى التحقق من بريدك الإلكتروني والنقر على رابط التفعيل لتفعيل حسابك والوصول إلى المنصة.
                    </p>
                    <button onclick="location.reload();" style="
                        background: #0000FF;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">تحديث الصفحة</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', verificationHTML);
    } else {
        modal.style.display = 'flex';
    }
    
    // Hide main content
    const mainContent = document.querySelector('main') || document.querySelector('.container');
    if (mainContent) mainContent.style.display = 'none';
}

// ============================================
// 1. USER AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up a new user
 */
function getFriendlyAuthMessage(error) {
    const message = String(error?.message || error || '').toLowerCase();
    if (message.includes('already registered') || message.includes('already been registered')) return 'هذا البريد الإلكتروني مسجل مسبقاً. جرّب تسجيل الدخول أو استعادة كلمة المرور.';
    if (message.includes('invalid email') || message.includes('validate email address') || message.includes('invalid format')) return 'يرجى إدخال بريد إلكتروني صحيح، من دون مسافات أو رموز زائدة.';
    if (message.includes('password') && (message.includes('6') || message.includes('short'))) return 'يجب أن تتكون كلمة المرور من 6 أحرف أو أكثر.';
    if (message.includes('rate limit') || message.includes('too many')) return 'تم تجاوز عدد المحاولات. انتظر قليلاً ثم حاول مرة أخرى.';
    if (message.includes('redirect')) return 'تعذر إعداد رابط التفعيل. تواصل مع إدارة المنصة لإضافة رابط الموقع إلى إعدادات Supabase.';
    return error?.message || 'تعذر إتمام العملية. حاول مرة أخرى.';
}

/**
 * Sign up a new user. The account is created first; profile/newsletter writes are best-effort
 * so a missing table or restrictive RLS policy cannot make a valid account appear to fail.
 */
async function signUpUser(email, password, fullName) {
    const normalizedEmail = String(email || '').trim().toLowerCase().replace(/\s+/g, '');
    const normalizedName = String(fullName || '').trim();
    try {
        if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            return { success: false, message: 'يرجى إدخال بريد إلكتروني صحيح.' };
        }
        if (!password || password.length < 6) {
            return { success: false, message: 'يجب أن تتكون كلمة المرور من 6 أحرف أو أكثر.' };
        }

        const redirectTo = new URL('auth-callback.html', window.location.origin).href;
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
                emailRedirectTo: redirectTo,
                data: { full_name: normalizedName }
            }
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return { success: false, message: getFriendlyAuthMessage(authError) };
        }
        if (!authData?.user) {
            return { success: false, message: 'لم يتم إنشاء الحساب. تأكد من إعدادات Supabase ثم حاول مرة أخرى.' };
        }

        // The database trigger creates the profile atomically with auth.users. Avoid a second
        // browser-side upsert because email confirmation normally returns no authenticated session.

        // Capture the registration email as a newsletter lead without blocking auth.
        const newsletterResult = await subscribeToNewsletter(normalizedEmail, 'signup');
        if (!newsletterResult.success) console.warn('Newsletter capture deferred:', newsletterResult.message);

        const needsVerification = !authData.session;
        return {
            success: true,
            needsVerification,
            message: needsVerification
                ? 'تم إنشاء الحساب. افتح رسالة التفعيل في بريدك الإلكتروني ثم سجّل الدخول.'
                : 'تم إنشاء الحساب وتسجيل الدخول بنجاح.',
            user: authData.user
        };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, message: getFriendlyAuthMessage(error) };
    }
}

/**
 * Sign in an existing user
 */
async function signInUser(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Sign in error:', error.message);
            return { success: false, message: error.message };
        }

        // Check if email is verified
        if (!data.user.email_confirmed_at) {
            return { 
                success: false, 
                message: 'يرجى تفعيل حسابك عبر البريد الإلكتروني أولاً.',
                user: data.user
            };
        }

        return { 
            success: true, 
            message: 'تم تسجيل الدخول بنجاح!',
            user: data.user
        };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Sign out current user
 */
async function signOutUser() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Sign out error:', error.message);
            return { success: false, message: error.message };
        }
        return { success: true, message: 'تم تسجيل الخروج بنجاح!' };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Get current user session
 */
async function getCurrentUser() {
    try {
        // Use the browser's persisted Supabase session for immediate, consistent UI state.
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error || !session?.user) {
            if (error) console.error('Get user error:', error.message);
            return null;
        }
        return session.user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// ============================================
// 2. EMAIL COLLECTION FUNCTIONS
// ============================================

/**
 * Subscribe user to newsletter
 */
async function subscribeToNewsletter(email, source = 'website') {
    const normalizedEmail = String(email || '').trim().toLowerCase().replace(/\s+/g, '');
    try {
        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            return { success: false, message: 'يرجى إدخال بريد إلكتروني صحيح.' };
        }

        const { error } = await supabaseClient
            .from('newsletter_subscribers')
            .upsert({
                email: normalizedEmail,
                subscribed_at: new Date().toISOString(),
                is_active: true,
                source
            }, { onConflict: 'email' });

        if (error) {
            console.error('Newsletter subscription error:', error.message);
            // Keep a retry queue on this device instead of silently losing the lead.
            const pending = JSON.parse(localStorage.getItem('mw_pending_subscribers') || '[]');
            if (!pending.some(item => item.email === normalizedEmail)) {
                pending.push({ email: normalizedEmail, source, date: new Date().toISOString() });
                localStorage.setItem('mw_pending_subscribers', JSON.stringify(pending));
            }
            return { success: false, queued: true, message: 'تعذر الاتصال بقاعدة البيانات؛ تم حفظ طلبك مؤقتاً وسيعاد إرساله لاحقاً.' };
        }

        return { success: true, message: 'شكراً! تم تسجيل بريدك الإلكتروني بنجاح.', email: normalizedEmail };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return { success: false, message: 'تعذر حفظ البريد حالياً. حاول مرة أخرى.' };
    }
}

/**
 * Get all newsletter subscribers (for admin use)
 */
async function getNewsletterSubscribers() {
    try {
        const { data, error } = await supabaseClient
            .from('newsletter_subscribers')
            .select('*')
            .eq('is_active', true)
            .order('subscribed_at', { ascending: false });

        if (error) {
            console.error('Get subscribers error:', error.message);
            return { success: false, message: error.message };
        }

        return { success: true, data: data };
    } catch (error) {
        console.error('Get subscribers error:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Send email notification to all subscribers
 */
async function sendNewsletterUpdate(subject, content, productName) {
    try {
        const subscribers = await getNewsletterSubscribers();
        
        if (!subscribers.success) {
            return { success: false, message: 'فشل في جلب المشتركين' };
        }

        const { data, error } = await supabaseClient.functions.invoke('send-newsletter', {
            body: {
                subscribers: subscribers.data,
                subject: subject,
                content: content,
                productName: productName,
            }
        });

        if (error) {
            console.error('Send newsletter error:', error.message);
            return { success: false, message: 'فشل في إرسال النشرة البريدية' };
        }

        return { 
            success: true, 
            message: `تم إرسال النشرة البريدية إلى ${subscribers.data.length} مشترك`,
            data: data
        };
    } catch (error) {
        console.error('Send newsletter error:', error);
        return { success: false, message: error.message };
    }
}

// ============================================
// 3. UI MODAL FUNCTIONS
// ============================================

/**
 * Show login/signup modal
 */
function showAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) {
        console.error('Auth modal not found in DOM');
        return;
    }

    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const toggleAuthMode = document.getElementById('toggleAuthMode');

    if (mode === 'signup') {
        authTitle.textContent = 'إنشاء حساب جديد';
        authSubmitBtn.textContent = 'إنشاء الحساب';
        document.getElementById('fullNameField').style.display = 'block';
        toggleAuthMode.innerHTML = 'هل لديك حساب بالفعل؟ <a href="#" onclick="showAuthModal(\'login\'); return false;">دخول</a>';
    } else {
        authTitle.textContent = 'تسجيل الدخول';
        authSubmitBtn.textContent = 'دخول';
        document.getElementById('fullNameField').style.display = 'none';
        toggleAuthMode.innerHTML = 'ليس لديك حساب؟ <a href="#" onclick="showAuthModal(\'signup\'); return false;">إنشاء حساب</a>';
    }

    authForm.dataset.mode = mode;
    modal.style.display = 'flex';
}

/**
 * Close auth modal
 */
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Handle auth form submission
 */
async function handleAuthSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const fullName = document.getElementById('authFullName')?.value.trim() || '';
    const mode = document.getElementById('authForm').dataset.mode;

    if (!email || !password) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    let result;
    if (mode === 'signup') {
        if (!fullName) {
            alert('يرجى إدخال اسمك الكامل');
            return;
        }
        result = await signUpUser(email, password, fullName);
    } else {
        result = await signInUser(email, password);
    }

    if (result.success) {
        alert(result.message);
        if (mode === 'signup') {
            showVerificationPendingModal(email);
        } else {
            closeAuthModal();
            window.location.href = 'dashboard.html';
        }
    } else {
        alert('خطأ: ' + result.message);
    }
}

/**
 * Update UI after successful authentication
 */
async function updateUIAfterAuth() {
    const user = await getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    
    if (user) {
        // User is logged in
        if (authButtons) {
            authButtons.innerHTML = `
                <span>مرحباً، ${user.email}</span>
                <button onclick="signOutUser(); location.reload();" class="btn-logout">تسجيل الخروج</button>
            `;
        }
    } else {
        // User is not logged in
        if (authButtons) {
            authButtons.innerHTML = `
                <button onclick="showAuthModal('login')" class="btn-login">دخول</button>
                <button onclick="showAuthModal('signup')" class="btn-signup">إنشاء حساب</button>
            `;
        }
    }
}

// ============================================
// 4. INITIALIZATION
// ============================================

/**
 * Initialize auth system on page load with strict guard
 */
document.addEventListener('DOMContentLoaded', async () => {
    // ENFORCE AUTH GUARD - Block all access until authenticated
    await enforceAuthGuard();
    
    // Check if user is already logged in
    await updateUIAfterAuth();

    // Set up auth form handler
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }

    // Set up newsletter form handler
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput').value.trim();
            if (email) {
                const result = await subscribeToNewsletter(email);
                alert(result.message);
                if (result.success) {
                    newsletterForm.reset();
                }
            }
        });
    }

    // Listen for auth state changes
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        await enforceAuthGuard();
        await updateUIAfterAuth();
    });
});

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        signUpUser,
        signInUser,
        signOutUser,
        getCurrentUser,
        subscribeToNewsletter,
        getNewsletterSubscribers,
        sendNewsletterUpdate,
        showAuthModal,
        closeAuthModal,
        checkAuthStatus,
        enforceAuthGuard,
    };
}
