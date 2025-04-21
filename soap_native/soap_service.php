<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'db_config.php';

class DataService {
    private $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_DATABASE, DB_USER, DB_PASSWORD);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            error_log("Database connection successful");
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            die("Database connection failed: " . $e->getMessage());
        }
    }

    /**
     * Registra un nuevo cliente y crea su billetera con saldo inicial de 0
     * 
     * @param string $nombres Nombre del cliente
     * @param string $documento Documento de identidad
     * @param string $email Correo electrónico
     * @param string $telefono Número de teléfono
     * @return array Resultado de la operación
     */
    public function ingresarClienteSoap($nombres, $documento, $email, $telefono) {
        try {
            error_log("ingresarClienteSoap called with: nombres=$nombres, documento=$documento, email=$email, telefono=$telefono");
            
            // Iniciar transacción para asegurar que ambas operaciones (cliente y billetera) se completen o fallen juntas
            $this->pdo->beginTransaction();
            
            // 1. Insertar el cliente
            $stmt = $this->pdo->prepare("INSERT INTO clientes (nombres, documento, email, telefono) VALUES (:nombres, :documento, :email, :telefono)");
            $stmt->bindParam(':nombres', $nombres);
            $stmt->bindParam(':documento', $documento);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':telefono', $telefono);
            $stmt->execute();
            
            $clienteId = $this->pdo->lastInsertId();
            error_log("Cliente created successfully with ID: $clienteId");
            
            // 2. Crear la billetera para el cliente con saldo inicial de 0
            $stmtBilletera = $this->pdo->prepare("INSERT INTO billetera (cliente_id, total) VALUES (:cliente_id, 0.0)");
            $stmtBilletera->bindParam(':cliente_id', $clienteId);
            $stmtBilletera->execute();
            
            $billeteraId = $this->pdo->lastInsertId();
            error_log("Billetera created successfully with ID: $billeteraId for cliente ID: $clienteId");
            
            // Confirmar la transacción
            $this->pdo->commit();
            
            return array(
                "success" => true,
                "message" => "Cliente creado exitosamente con billetera inicial",
                "cod_error" => "00",
                "data" => array(
                    "cliente_id" => $clienteId,
                    "billetera_id" => $billeteraId,
                    "saldo_inicial" => 0.0
                )
            );
        } catch (PDOException $e) {
            error_log("Error creating cliente: " . $e->getMessage());
            
            return array(
                "success" => false,
                "message" => $e->getMessage(),
                "cod_error" => "400",
                "data" => array()
            );
        }
    }
    
    /**
     * Obtiene los datos de un cliente por su documento
     * 
     * @param string $documento Documento de identidad
     * @return array Datos del cliente o mensaje de error
     */
    /*public function getClienteByDocumento($documento) {
        try {
            error_log("getClienteByDocumento called with: documento=$documento");
            
            // Consulta para obtener el cliente y su billetera en una sola operación
            $sql = "SELECT c.*, b.id as billetera_id, b.total as saldo 
                    FROM clientes c 
                    LEFT JOIN billetera b ON c.id = b.cliente_id 
                    WHERE c.documento = :documento";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':documento', $documento);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                error_log("Cliente found: " . json_encode($result));
                
                // Formatear la respuesta
                $cliente = [
                    'id' => $result['id'],
                    'nombres' => $result['nombres'],
                    'documento' => $result['documento'],
                    'email' => $result['email'],
                    'telefono' => $result['telefono'],
                    'billetera' => [
                        'id' => $result['billetera_id'],
                        'saldo' => $result['saldo']
                    ]
                ];
                
                return array(
                    "success" => true,
                    "message" => "Cliente encontrado",
                    "cod_error" => "00",
                    "data" => $cliente
                );
            } else {
                error_log("Cliente not found with documento: $documento");
                return array(
                    "success" => false,
                    "message" => "Cliente no encontrado",
                    "cod_error" => "404",
                    "data" => array()
                );
            }
        } catch (PDOException $e) {
            error_log("Error getting cliente: " . $e->getMessage());
            
            return array(
                "success" => false,
                "message" => $e->getMessage(),
                "cod_error" => "400",
                "data" => array()
            );
        }
    }*/
    
    /**
     * Recarga la billetera de un cliente
     * 
     * @param string $documento Documento del cliente
     * @param float $monto Monto a recargar
     * @return array Resultado de la operación
     */
    public function recargarBilletera($documento, $telefono, $monto) {
        try {
            error_log("recargarBilletera called with: documento=$documento, telefono=$telefono monto=$monto");
            
            // Validar que el monto sea positivo
            if ($monto <= 0) {
                return array(
                    "success" => false,
                    "message" => "El monto de recarga debe ser mayor que cero",
                    "cod_error" => "400",
                    "data" => array()
                );
            }
            
            // Iniciar transacción
            $this->pdo->beginTransaction();
            
            // 1. Obtener el ID del cliente
            $stmtCliente = $this->pdo->prepare("SELECT id FROM clientes WHERE documento = :documento AND telefono = :telefono");
            $stmtCliente->bindParam(':telefono', $telefono);
            $stmtCliente->bindParam(':documento', $documento);
            $stmtCliente->execute();
            
            $cliente = $stmtCliente->fetch(PDO::FETCH_ASSOC);
            
            if (!$cliente) {
                $this->pdo->rollBack();
                return array(
                    "success" => false,
                    "message" => "Cliente no encontrado",
                    "cod_error" => "404",
                    "data" => array()
                );
            }
            
            $clienteId = $cliente['id'];
            
            // 2. Actualizar el saldo de la billetera
            $stmtBilletera = $this->pdo->prepare("UPDATE billetera SET total = total + :monto WHERE cliente_id = :cliente_id");
            $stmtBilletera->bindParam(':monto', $monto);
            $stmtBilletera->bindParam(':cliente_id', $clienteId);
            $stmtBilletera->execute();
            
            if ($stmtBilletera->rowCount() === 0) {
                // Si no se actualizó ninguna fila, puede ser que el cliente no tenga billetera
                $this->pdo->rollBack();
                return array(
                    "success" => false,
                    "message" => "El cliente no tiene una billetera asociada",
                    "cod_error" => "404",
                    "data" => array()
                );
            }
            
            // 3. Obtener el nuevo saldo
            $stmtSaldo = $this->pdo->prepare("SELECT id, total FROM billetera WHERE cliente_id = :cliente_id");
            $stmtSaldo->bindParam(':cliente_id', $clienteId);
            $stmtSaldo->execute();
            
            $billetera = $stmtSaldo->fetch(PDO::FETCH_ASSOC);

            // 4. Generamos transaccion
            $stmtTransaccion = $this->pdo->prepare("INSERT INTO transacciones 
                (billetera_id, tipo_transaccion, monto, saldo_anterior, saldo_nuevo, referencia, concepto, fecha_transaccion) 
                VALUES 
                (:billetera_id, :tipo_transaccion, :monto, :saldo_anterior, :saldo_nuevo, :referencia, :concepto, :fecha_transaccion)");

            $tipoTransaccion = 'ingreso';
            $fechaTransaccion = date('Y-m-d H:i:s');
            $saldoAnterior = $billetera['total'] - $monto;
            $saldoNuevo = $billetera['total'];
            $referencia = "Transaccion: [Recarga]";
            $concepto = "Servicio de recarga";

            $stmtTransaccion->bindParam(':billetera_id', $billetera['id']);
            $stmtTransaccion->bindParam(':tipo_transaccion', $tipoTransaccion);
            $stmtTransaccion->bindParam(':monto', $monto);
            $stmtTransaccion->bindParam(':saldo_anterior', $saldoAnterior);
            $stmtTransaccion->bindParam(':saldo_nuevo', $saldoNuevo);
            $stmtTransaccion->bindParam(':referencia', $referencia);
            $stmtTransaccion->bindParam(':concepto', $concepto);
            $stmtTransaccion->bindParam(':fecha_transaccion', $fechaTransaccion);

            $stmtTransaccion->execute();
            
            // Confirmar la transacción
            $this->pdo->commit();
            
            return array(
                "success" => true,
                "message" => "Recarga realizada exitosamente",
                "cod_error" => "00",
                "data" => array(
                    "cliente_id" => $clienteId,
                    "billetera_id" => $billetera['id'],
                    "monto_recargado" => $monto,
                    "nuevo_saldo" => $billetera['total']
                )
            );
        } catch (PDOException $e) {
            // Revertir la transacción en caso de error
            $this->pdo->rollBack();
            error_log("Error recargando billetera: " . $e->getMessage());
            
            return array(
                "success" => false,
                "message" => $e->getMessage(),
                "cod_error" => "400",
                "data" => array()
            );
        }
    }

    /**
     * Consulta el saldo de la billetera de un cliente
     * 
     * @param string $documento Documento del cliente
     * @param string $telefono Teléfono del cliente
     * @return array Saldo de la billetera o mensaje de error
     */
    public function consultarBilletera($documento, $telefono) {
        try {
            error_log("consultarBilletera called with: documento=$documento, telefono=$telefono");
            
            // Obtener el ID del cliente
            $stmtCliente = $this->pdo->prepare("SELECT id FROM clientes WHERE documento = :documento AND telefono = :telefono");
            $stmtCliente->bindParam(':telefono', $telefono);
            $stmtCliente->bindParam(':documento', $documento);
            $stmtCliente->execute();
            
            $cliente = $stmtCliente->fetch(PDO::FETCH_ASSOC);
            
            if (!$cliente) {
                return array(
                    "success" => false,
                    "message" => "Cliente no encontrado",
                    "cod_error" => "404",
                    "data" => array()
                );
            }
            
            $clienteId = $cliente['id'];
            
            // Consultar el saldo de la billetera
            $stmtBilletera = $this->pdo->prepare("SELECT total FROM billetera WHERE cliente_id = :cliente_id");
            $stmtBilletera->bindParam(':cliente_id', $clienteId);
            $stmtBilletera->execute();
            
            $billetera = $stmtBilletera->fetch(PDO::FETCH_ASSOC);
            
            if ($billetera) {
                return array(
                    "success" => true,
                    "message" => "Saldo consultado exitosamente",
                    "cod_error" => "00",
                    "data" => array(
                        "cliente_id" => $clienteId,
                        "saldo" => $billetera['total']
                    )
                );
            } else {
                return array(
                    "success" => false,
                    "message" => "No se encontró la billetera del cliente",
                    "cod_error" => "404",
                    "data" => array()
                );
            }
        } catch (PDOException $e) {
            error_log("Error consultando billetera: " . $e->getMessage());
            
            return array(
                "success" => false,
                "message" => $e->getMessage(),
                "cod_error" => "400",
                "data" => array()
            );
        }
    }

    /**
     * Crear un regristro en la tabla de tokens
     * 
     * @param string $documento Documento del cliente
     * @param string $telefono Teléfono del cliente
     * @param string $token Token a registrar
     * @return array Resultado de la operación
     */
    public function crearToken($documento, $telefono, $token, $monto) {
        try {
            error_log("crearToken called with: documento=$documento, telefono=$telefono, token=$token, monto=$monto");
            
            // Iniciar transacción
            $this->pdo->beginTransaction();
            
            // Obtener el ID del cliente
            $stmtCliente = $this->pdo->prepare("SELECT id, email FROM clientes WHERE documento = :documento AND telefono = :telefono");
            $stmtCliente->bindParam(':telefono', $telefono);
            $stmtCliente->bindParam(':documento', $documento);
            $stmtCliente->execute();
            
            $cliente = $stmtCliente->fetch(PDO::FETCH_ASSOC);
            
            if (!$cliente) {
                return array(
                    "success" => false,
                    "message" => "Cliente no encontrado",
                    "cod_error" => "404",
                    "data" => array()
                );
            }
            
            $clienteId = $cliente['id'];
            
            // Insertar el token
            $stmtToken = $this->pdo->prepare("INSERT INTO session (cliente_id, token, monto) VALUES (:cliente_id, :token, :monto)");
            $stmtToken->bindParam(':cliente_id', $clienteId);
            $stmtToken->bindParam(':token', $token);
            $stmtToken->bindParam(':monto', $monto);
            $stmtToken->execute();
            $tokenId = $this->pdo->lastInsertId();
            error_log("Token created successfully with ID: $tokenId for cliente ID: $clienteId");

            // Confirmar la transacción
            $this->pdo->commit();

            return array(
                "success" => true,
                "message" => "Token creado exitosamente",
                "cod_error" => "00",
                "data" => array(
                    "session_id" => $tokenId,
                    "token" => $token,
                    "email" => $cliente['email'],
                )
            );

        } catch (PDOException $e) {
            // Revertir la transacción en caso de error
            $this->pdo->rollBack();
            error_log("Error creando token: " . $e->getMessage());
            
            return array(
                "success" => false,
                "message" => $e->getMessage(),
                "cod_error" => "400",
                "data" => array()
            );
        }
    }

    /**
     * Confirmar pago con token y session_id
     * 
     * @param string $token Token a validar
     * @param string $session_id ID de la sesión
     * @return array Resultado de la operación
     */
    public function confirmarPago($session_id, $token) {
        try {
            error_log("validarToken called with: session_id=$session_id token=$token");

            // Iniciar transacción
            $this->pdo->beginTransaction();
            
            // 1. Consultar el token
            $stmtToken = $this->pdo->prepare("SELECT * FROM session WHERE id = :id AND token = :token");
            $stmtToken->bindParam(':id', $session_id);
            $stmtToken->bindParam(':token', $token);
            $stmtToken->execute();

            $session = $stmtToken->fetch(PDO::FETCH_ASSOC);
            
            if (!$session) {
                $this->pdo->rollBack();
                return array(
                    "success" => false,
                    "message" => "Token no válido o expirado",
                    "cod_error" => "401",
                    "data" => array()
                );
            }

            error_log("ACTUALIZAR BILLETERA: monto=".$session['monto']." cliente_id=".$session['cliente_id']);

            // 2. Actualizar el saldo de la billetera
            $stmtBilletera = $this->pdo->prepare("UPDATE billetera SET total = total - :monto WHERE cliente_id = :cliente_id");
            $stmtBilletera->bindParam(':monto', $session['monto']);
            $stmtBilletera->bindParam(':cliente_id',  $session['cliente_id']);
            $stmtBilletera->execute();
            
            if ($stmtBilletera->rowCount() === 0) {
                // Si no se actualizó ninguna fila, puede ser que el cliente no tenga billetera
                $this->pdo->rollBack();
                return array(
                    "success" => false,
                    "message" => "El cliente no tiene una billetera asociada",
                    "cod_error" => "404",
                    "data" => array()
                );
            }
            
            // 3. Obtener el nuevo saldo
            $stmtSaldo = $this->pdo->prepare("SELECT id, total FROM billetera WHERE cliente_id = :cliente_id");
            $stmtSaldo->bindParam(':cliente_id', $session['cliente_id']);
            $stmtSaldo->execute();
            
            $billetera = $stmtSaldo->fetch(PDO::FETCH_ASSOC);

            // 4. Generamos transaccion
            $stmtTransaccion = $this->pdo->prepare("INSERT INTO transacciones 
                (billetera_id, tipo_transaccion, monto, saldo_anterior, saldo_nuevo, referencia, concepto, fecha_transaccion) 
                VALUES 
                (:billetera_id, :tipo_transaccion, :monto, :saldo_anterior, :saldo_nuevo, :referencia, :concepto, :fecha_transaccion)");

            $tipoTransaccion = 'egreso';
            $fechaTransaccion = date('Y-m-d H:i:s');
            $saldoAnterior = $billetera['total'] + $session['monto'];
            $saldoNuevo = $billetera['total'];
            $referencia = "Transaccion: [Pago confirmado]";
            $concepto = "Se aplico un cargo por concepto de compra";

            $stmtTransaccion->bindParam(':billetera_id', $billetera['id']);
            $stmtTransaccion->bindParam(':tipo_transaccion', $tipoTransaccion);
            $stmtTransaccion->bindParam(':monto', $session['monto']);
            $stmtTransaccion->bindParam(':saldo_anterior', $saldoAnterior);
            $stmtTransaccion->bindParam(':saldo_nuevo', $saldoNuevo);
            $stmtTransaccion->bindParam(':referencia', $referencia);
            $stmtTransaccion->bindParam(':concepto', $concepto);
            $stmtTransaccion->bindParam(':fecha_transaccion', $fechaTransaccion);

            $stmtTransaccion->execute();
            
            // Confirmar la transacción
            $this->pdo->commit();

            return array(
                "success" => true,
                "message" => "Recarga realizada exitosamente",
                "cod_error" => "00",
                "data" => array(
                    "cliente_id" => $session['cliente_id'],
                    "billetera_id" => $billetera['id'],
                    "monto_recargado" => $session['monto'],
                    "nuevo_saldo" => $billetera['total']
                )
            );
        } catch (PDOException $e) {
            error_log("Error validando token: " . $e->getMessage());
            
            return array(
                "success" => false,
                "message" => $e->getMessage(),
                "cod_error" => "400",
                "data" => array()
            );
        }
    }
}

// Disable caching of WSDL file
ini_set('soap.wsdl_cache_enabled', 0);
ini_set('soap.wsdl_cache_ttl', 900);
ini_set('default_socket_timeout', 60);

// Check if SOAP extension is loaded
if (!extension_loaded('soap')) {
    error_log("SOAP extension is not loaded!");
    die("SOAP extension is not loaded. Please install the PHP SOAP extension.");
}

// Log the request
error_log("SOAP Request: " . file_get_contents('php://input'));

// Create SOAP server
$options = array(
    'uri' => 'http://soap_native/soap_service.php'
);

try {
    $server = new SoapServer(null, $options);
    $server->setClass('DataService');
    $server->handle();
} catch (Exception $e) {
    error_log("SOAP Server Error: " . $e->getMessage());
    die("SOAP Server Error: " . $e->getMessage());
}
?>
