<?php
// api/db.php
// PDO helper for database connection

/**
 * @return mixed
 */
function get_db()
{
    /**
     * @var mixed
     */
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // Configuration - update to match your environment
    $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
    $dbName = getenv('DB_NAME') ?: 'book_store';
    $dbUser = getenv('DB_USER') ?: 'root';
    $dbPass = getenv('DB_PASS') ?: '21772177';
    $dbCharset = 'utf8mb4';

    $dsn = "mysql:host={$dbHost};dbname={$dbName};charset={$dbCharset}";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];

    try {
        $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
        return $pdo;
    } catch (PDOException $e) {
        // In production, do NOT expose details. For now return null and let handlers fallback.
        error_log('DB connection error: '.$e->getMessage());
        return null;
    }
}

// Simple helper to run a prepared statement and return all results
/**
 * @param $sql
 * @param array $params
 * @return mixed
 */
function db_query_all($sql, $params = [])
{
    $pdo = get_db();
    if (!$pdo) {
        return null;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * @param $sql
 * @param array $params
 * @return mixed
 */
function db_query_one($sql, $params = [])
{
    $pdo = get_db();
    if (!$pdo) {
        return null;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch();
}
