<?php
/**
 * Database Configuration
 * 
 * This file contains the database connection parameters for the SOAP service.
 * The connection uses the service name from docker-compose as the host.
 */

// Database connection parameters
define('DB_HOST', 'db');      // Database host (service name from docker-compose)
define('DB_DATABASE', 'epayco'); // Database name
define('DB_USER', 'root');    // Database username
define('DB_PASSWORD', 'root'); // Database password
?>
