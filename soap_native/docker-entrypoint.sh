#!/bin/bash
set -e

# Display PHP modules
echo "PHP Modules:"
php -m

# Check if SOAP extension is loaded
if php -m | grep -q soap; then
    echo "SOAP extension is loaded successfully!"
else
    echo "ERROR: SOAP extension is not loaded!"
    exit 1
fi

# Create test files
echo "<?php phpinfo(); ?>" > /var/www/html/info.php
echo "<?php echo 'SOAP extension status: ' . (extension_loaded('soap') ? 'Loaded' : 'Not loaded'); ?>" > /var/www/html/soap-test.php

# Execute the original entrypoint
exec "$@"