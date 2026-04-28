/**
 * MindWeave Supabase Authentication & Email Collection Module
 * Handles user registration, login, and email collection for newsletters
 */

// Initialize Supabase Client
// Replace these with your actual Supabase credentials
/**
 * MindWeave Supabase Configuration
 * On Render, these can be injected via build scripts or handled via a secure endpoint.
 * For client-side, we use the public environment variables.
 */
const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'https://mtirzcuntupkuavmjtcv.supabase.co';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || ''; // Will be populated from Render environment

// Create Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// 1. USER AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up a new user
 */
async function signUpUser(email, password, fullName) {
    try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
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
            return { success: false, message: 'Failed to create profile' };
        }

        return { 
            success: true, 
            message: 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.',
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
        // Get all active subscribers
        const subscribers = await getNewsletterSubscribers();
        
        if (!subscribers.success) {
            return { success: false, message: 'فشل في جلب المشتركين' };
        }

        // Call edge function to send emails (you need to set this up in Supabase)
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
        toggleAuthMode.innerHTML = 'هل لديك حساب بالفعل؟ <a href="#" onclick="showAuthModal(\'login\')">دخول</a>';
    } else {
        authTitle.textContent = 'تسجيل الدخول';
        authSubmitBtn.textContent = 'دخول';
        document.getElementById('fullNameField').style.display = 'none';
        toggleAuthMode.innerHTML = 'ليس لديك حساب؟ <a href="#" onclick="showAuthModal(\'signup\')">إنشاء حساب</a>';
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
        closeAuthModal();
        updateUIAfterAuth();
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
 * Initialize auth system on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
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
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        updateUIAfterAuth();
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
    };
}
