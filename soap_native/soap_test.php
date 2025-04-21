<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Check if SOAP extension is loaded
if (extension_loaded('soap')) {
    echo "SOAP extension is loaded!<br>";
    echo "Loaded extensions: " . implode(', ', get_loaded_extensions());
} else {
    echo "SOAP extension is NOT loaded!<br>";
    echo "Loaded extensions: " . implode(', ', get_loaded_extensions());
}
?>