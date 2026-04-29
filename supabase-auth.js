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
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error || !user) {
            return { authenticated: false, verified: false };
        }

        // Check if email is confirmed
        const isEmailConfirmed = user.email_confirmed_at !== null;
        
        return { 
            authenticated: true, 
            verified: isEmailConfirmed,
            user: user
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
    
    if (!authStatus.authenticated) {
        // Hide main content
        document.body.style.display = 'none';
        
        // Show auth modal
        showAuthModal('signup');
        
        // Make modal visible
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.display = 'block';
            // Hide everything except modal
            const mainContent = document.querySelector('main') || document.querySelector('.container');
            if (mainContent) mainContent.style.display = 'none';
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
async function signUpUser(email, password, fullName) {
    try {
        // Create user in Supabase Auth with email confirmation required
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin,
            }
        });

        if (authError) {
            console.error('Auth Error:', authError.message);
            return { success: false, message: authError.message };
        }

        // Store user profile in database
        const { data: profileData, error: profileError } = await supabaseClient
            .from('user_profiles')
            .insert([
                {
                    user_id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    created_at: new Date().toISOString(),
                    is_newsletter_subscriber: true,
                }
            ]);

        if (profileError) {
            console.error('Profile Error:', profileError.message);
            return { success: false, message: 'فشل في إنشاء الملف الشخصي' };
        }

        return { 
            success: true, 
            message: 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.',
            user: authData.user
        };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, message: error.message };
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
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) {
            console.error('Get user error:', error.message);
            return null;
        }
        return user;
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
async function subscribeToNewsletter(email) {
    try {
        // Check if email already exists
        const { data: existingEmail, error: checkError } = await supabaseClient
            .from('newsletter_subscribers')
            .select('id')
            .eq('email', email)
            .single();

        if (existingEmail) {
            return { 
                success: false, 
                message: 'هذا البريد الإلكتروني مسجل بالفعل في النشرة البريدية.' 
            };
        }

        // Add new subscriber
        const { data, error } = await supabaseClient
            .from('newsletter_subscribers')
            .insert([
                {
                    email: email,
                    subscribed_at: new Date().toISOString(),
                    is_active: true,
                }
            ]);

        if (error) {
            console.error('Newsletter subscription error:', error.message);
            return { success: false, message: 'فشل الاشتراك. حاول مرة أخرى.' };
        }

        return { 
            success: true, 
            message: 'شكراً! تم اشتراكك في النشرة البريدية. ستتلقى آخر التحديثات.',
            data: data
        };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return { success: false, message: error.message };
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
            enforceAuthGuard();
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
