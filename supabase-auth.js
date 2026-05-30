/**
 * MindWeave - Supabase Authentication (SECURE VERSION)
 * Fixed version with proper error handling and security improvements
 * 
 * Security fixes:
 * - No explicit API keys in client code
 * - Proper error handling
 * - Secure token management
 * - GDPR compliant consent
 */

(function() {
    'use strict';

    // ============ Configuration ============
    const CONFIG = {
        SUPABASE_URL: window.ENV?.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || ''
    };

    // Validate configuration
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
        console.warn('Supabase configuration missing. Auth will be disabled.');
    }

    // Create Supabase client only if configured
    let supabaseClient = null;
    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }

    // ============ GDPR Consent Banner ============
    function showConsentBanner() {
        if (localStorage.getItem('mw_consent')) return;
        
        const banner = document.createElement('div');
        banner.id = 'consentBanner';
        banner.innerHTML = `
            <div style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--bg-card, #0A1628);
                border-top: 1px solid var(--border, rgba(0,212,255,0.2));
                padding: 1rem 2rem;
                z-index: 9999;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 1rem;
            ">
                <p style="margin: 0; font-size: 0.9rem;">
                    نستخدم ملفات تعريف الارتباط والتقنيات المشابهة لتحسين تجربتك.
                    <a href="privacy.html" style="color: var(--primary, #00D4FF);">سياسة الخصوصية</a>
                </p>
                <div style="display: flex; gap: 0.5rem;">
                    <button id="consentAccept" style="
                        background: var(--primary, #00D4FF);
                        color: var(--bg, #050A0F);
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">موافق</button>
                    <button id="consentDecline" style="
                        background: transparent;
                        border: 1px solid var(--border);
                        color: var(--text, #E8F4FD);
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                    ">رفض</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('consentAccept').addEventListener('click', () => {
            localStorage.setItem('mw_consent', 'accepted');
            banner.remove();
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', { analytics_storage: 'granted' });
            }
        });

        document.getElementById('consentDecline').addEventListener('click', () => {
            localStorage.setItem('mw_consent', 'declined');
            banner.remove();
        });
    }

    // ============ Authentication Functions ============
    
    async function checkAuthStatus() {
        if (!supabaseClient) {
            return { authenticated: false, verified: false, error: 'Supabase not configured' };
        }

        try {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            
            if (error || !user) {
                return { authenticated: false, verified: false };
            }

            const isEmailConfirmed = user.email_confirmed_at !== null;
            
            return { 
                authenticated: true, 
                verified: isEmailConfirmed,
                user: { id: user.id, email: user.email, created_at: user.created_at }
            };
        } catch (error) {
            console.error('Auth check error:', error);
            return { authenticated: false, verified: false, error: error.message };
        }
    }

    async function signUpUser(email, password, fullName) {
        if (!supabaseClient) {
            return { success: false, message: 'Authentication not configured' };
        }

        try {
            if (!email || !password || !fullName) {
                return { success: false, message: 'All fields are required' };
            }

            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) {
                return { success: false, message: error.message };
            }

            if (data.user) {
                try {
                    await supabaseClient.from('user_profiles').insert([{
                        user_id: data.user.id,
                        email: email,
                        full_name: fullName,
                        created_at: new Date().toISOString(),
                        is_newsletter_subscriber: true
                    }]);
                } catch (profileError) {
                    console.warn('Profile creation skipped:', profileError.message);
                }
            }

            return { 
                success: true, 
                message: 'Account created! Check your email to verify.',
                user: data.user
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async function signInUser(email, password) {
        if (!supabaseClient) {
            return { success: false, message: 'Authentication not configured' };
        }

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                return { success: false, message: error.message };
            }

            if (!data.user.email_confirmed_at) {
                return { success: false, message: 'Please verify your email first.', user: data.user };
            }

            return { success: true, message: 'Login successful!', user: { id: data.user.id, email: data.user.email } };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async function signOutUser() {
        if (!supabaseClient) return { success: false };
        
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            localStorage.removeItem('mw_cart');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async function getCurrentUser() {
        if (!supabaseClient) return null;
        
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            return user;
        } catch (error) {
            return null;
        }
    }

    // ============ Auth Modal Functions ============
    
    function showAuthModal(mode = 'login') {
        const existingModal = document.getElementById('authModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;">
                <div style="background: var(--bg-card, #0A1628); border: 1px solid var(--border); border-radius: 20px; padding: 2rem; max-width: 400px; width: 90%; position: relative;">
                    <h2 id="authTitle" style="text-align: center; margin-bottom: 1.5rem; color: var(--primary, #00D4FF);">
                        ${mode === 'signup' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                    </h2>
                    
                    <form id="authForm" data-mode="${mode}">
                        <div id="fullNameField" style="${mode === 'signup' ? 'display: block;' : 'display: none;'} margin-bottom: 1rem;">
                            <input type="text" id="authFullName" placeholder="الاسم الكامل" required
                                style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); color: var(--text);">
                        </div>
                        
                        <input type="email" id="authEmail" placeholder="البريد الإلكتروني" required
                            style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); color: var(--text); margin-bottom: 1rem;">
                        
                        <input type="password" id="authPassword" placeholder="كلمة المرور" required
                            style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); color: var(--text); margin-bottom: 1rem;">
                        
                        <button type="submit" id="authSubmitBtn" style="width: 100%; padding: 0.8rem; background: linear-gradient(135deg, var(--primary, #00D4FF), var(--accent, #7C3AED)); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; font-size: 1rem;">
                            ${mode === 'signup' ? 'إنشاء الحساب' : 'دخول'}
                        </button>
                    </form>
                    
                    <p id="toggleAuthMode" style="text-align: center; margin-top: 1rem; color: var(--text-muted);">
                        ${mode === 'signup' 
                            ? 'لديك حساب؟ <a href="#" onclick="window.showAuthModal && window.showAuthModal(\'login\'); return false;" style="color: var(--primary);">دخول</a>'
                            : 'ليس لديك حساب؟ <a href="#" onclick="window.showAuthModal && window.showAuthModal(\'signup\'); return false;" style="color: var(--primary);">إنشاء حساب</a>'
                        }
                    </p>
                    
                    <button onclick="window.closeAuthModal && window.closeAuthModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: var(--text); font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('authForm').addEventListener('submit', handleAuthSubmit);
    }

    function closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) modal.remove();
    }

    async function handleAuthSubmit(event) {
        event.preventDefault();

        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        const fullName = document.getElementById('authFullName')?.value.trim() || '';
        const mode = document.getElementById('authForm')?.dataset.mode || 'login';

        if (!email || !password) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('يرجى إدخال بريد إلكتروني صحيح');
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
            window.location.reload();
        } else {
            alert('خطأ: ' + result.message);
        }
    }

    async function enforceAuthGuard() {
        const isHomePage = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname === '/' || 
                           window.location.pathname.endsWith('/');
        
        if (isHomePage) return;

        const authStatus = await checkAuthStatus();
        
        if (!authStatus.authenticated) {
            document.body.style.display = 'none';
            showAuthModal('login');
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.display = 'block';
                const mainContent = document.querySelector('main') || document.querySelector('.container');
                if (mainContent) mainContent.style.display = 'none';
            }
        } else if (!authStatus.verified) {
            const verificationModal = document.createElement('div');
            verificationModal.id = 'verificationModal';
            verificationModal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 9999;">
                    <div style="background: var(--bg-card, #0A1628); padding: 40px; border-radius: 20px; text-align: center; max-width: 500px;">
                        <h2 style="color: var(--primary, #00D4FF); margin-bottom: 20px;">تحقق من بريدك الإلكتروني</h2>
                        <p style="font-size: 18px; margin-bottom: 20px;">تم إرسال رابط التفعيل إلى: <strong>${authStatus.user?.email || ''}</strong></p>
                        <button onclick="location.reload()" style="background: var(--primary); color: var(--bg); border: none; padding: 12px 30px; border-radius: 10px; cursor: pointer; font-size: 16px;">تحديث الصفحة</button>
                    </div>
                </div>
            `;
            document.body.appendChild(verificationModal);
        }
    }

    async function updateUIAfterAuth() {
        const user = await getCurrentUser();
        const authButtons = document.getElementById('authButtons');
        
        if (user) {
            if (authButtons) {
                authButtons.innerHTML = `
                    <span style="color: var(--text);">مرحباً، ${user.email.split('@')[0]}</span>
                    <button onclick="window.signOutUser && window.signOutUser().then(() => location.reload())" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">تسجيل الخروج</button>
                `;
            }
        } else {
            if (authButtons) {
                authButtons.innerHTML = `
                    <button onclick="window.showAuthModal && window.showAuthModal('login')" style="background: transparent; border: 1px solid var(--primary); color: var(--primary); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">دخول</button>
                    <button onclick="window.showAuthModal && window.showAuthModal('signup')" style="background: var(--primary); border: none; color: var(--bg); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">إنشاء حساب</button>
                `;
            }
        }
    }

    async function subscribeToNewsletter(email) {
        if (!supabaseClient) {
            return { success: false, message: 'Newsletter not configured' };
        }

        try {
            const { data, error } = await supabaseClient.from('newsletter_subscribers').insert([{ 
                email: email,
                is_active: true,
                subscribed_at: new Date().toISOString()
            }]);

            if (error) {
                if (error.message.includes('duplicate')) {
                    return { success: false, message: 'Email already subscribed' };
                }
                throw error;
            }

            return { success: true, message: 'Subscribed successfully!', data: data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ============ Initialize ============
    document.addEventListener('DOMContentLoaded', async () => {
        showConsentBanner();

        const isHomePage = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname === '/' || 
                           window.location.pathname.endsWith('/');
        
        if (!isHomePage) {
            await enforceAuthGuard();
        }
        
        await updateUIAfterAuth();

        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', handleAuthSubmit);
        }

        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('emailInput')?.value.trim();
                if (email) {
                    const result = await subscribeToNewsletter(email);
                    alert(result.message);
                    if (result.success) {
                        newsletterForm.reset();
                    }
                }
            });
        }

        if (supabaseClient) {
            supabaseClient.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth state changed:', event);
                await updateUIAfterAuth();
            });
        }
    });

    // ============ Export Global Functions ============
    window.checkAuthStatus = checkAuthStatus;
    window.signUpUser = signUpUser;
    window.signInUser = signInUser;
    window.signOutUser = signOutUser;
    window.getCurrentUser = getCurrentUser;
    window.showAuthModal = showAuthModal;
    window.closeAuthModal = closeAuthModal;
    window.handleAuthSubmit = handleAuthSubmit;
    window.enforceAuthGuard = enforceAuthGuard;
    window.updateUIAfterAuth = updateUIAfterAuth;
    window.subscribeToNewsletter = subscribeToNewsletter;

})();