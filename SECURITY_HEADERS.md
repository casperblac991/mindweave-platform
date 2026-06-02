# Security Headers Configuration for MindWeave
# Add this to your server configuration (nginx.conf, .htaccess, or web.config)

# Apache (.htaccess)
# <IfModule mod_headers.c>
#     Header always set Referrer-Policy "strict-origin-when-cross-origin"
#     Header always set Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
#     Header always set Cross-Origin-Opener-Policy "same-origin"
#     Header always set Cross-Origin-Embedder-Policy "require-corp"
#     Header always set Cross-Origin-Resource-Policy "same-origin"
# </IfModule>

# Nginx
# add_header Referrer-Policy "strict-origin-when-cross-origin" always;
# add_header Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" always;
# add_header Cross-Origin-Opener-Policy "same-origin" always;
# add_header Cross-Origin-Embedder-Policy "require-corp" always;
# add_header Cross-Origin-Resource-Policy "same-origin" always;