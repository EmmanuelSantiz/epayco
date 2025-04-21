FROM php:7.4-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libxml2-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    soap

# Verify SOAP extension is installed
RUN php -m | grep soap

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Create a phpinfo file to verify PHP configuration
RUN echo "<?php phpinfo(); ?>" > /var/www/html/info.php

# Copy PHP configuration
COPY php.ini /usr/local/etc/php/

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]
