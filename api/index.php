<?php
// api/index.php
// Main API entry using haekkhon.php micro-router

require_once __DIR__.'/../framework/haekkhon.php';
require_once __DIR__.'/db.php';

// Try to auto-detect project URL base when this API is executed from a parent front-controller
// (e.g. when Apache's root index.php rewrites everything to index.php). This helps requests
// like api/ping to match routes registered here.
$projectUrlBase = '';
if (!empty($_SERVER['DOCUMENT_ROOT'])) {
    $docRoot = rtrim(realpath($_SERVER['DOCUMENT_ROOT']), '/');
    $projDir = rtrim(realpath(dirname(__DIR__)), '/');
    if ($docRoot && $projDir && strpos($projDir, $docRoot) === 0) {
        $projectUrlBase = substr($projDir, strlen($docRoot));
        // ensure leading slash
        if ($projectUrlBase !== '' && $projectUrlBase[0] !== '/') {
            $projectUrlBase = '/'.$projectUrlBase;
        }
    }
}

// Helper to register routes that work both under `/api` subfolder, at site root, and
// optionally under the project's URL base (useful when a parent front-controller rewrote
// the request to a different script).
/**
 * @param string $path
 * @param $handler
 */
function add_route(string $path, callable $handler)
{
    global $projectUrlBase;
    $p = $path !== '/' ? rtrim($path, '/') : $path;
    // register plain path
    route($p, $handler);
    // register /api-prefixed path (avoid duplicating if already has /api)
    if (strpos($p, '/api') !== 0) {
        route('/api'.$p, $handler);
    }
    // register project-prefixed variants when detected (e.g. api/ping)
    if (!empty($projectUrlBase)) {
        route($projectUrlBase.$p, $handler);
        if (strpos($p, '/api') !== 0) {
            route($projectUrlBase.'/api'.$p, $handler);
        }
    }
}

header('Content-Type: application/json; charset=utf-8');

/**
 * @param $data
 * @param $code
 */
function send_json($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * @return mixed
 */
function get_input_json()
{
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);
    return $json ?: [];
}

// Simple token auth placeholder
function auth_user()
{
    // Look for Authorization: Bearer <token>
    $h = getallheaders();
    if (!empty($h['Authorization'])) {
        $parts = explode(' ', $h['Authorization']);
        if (count($parts) === 2 && $parts[0] === 'Bearer') {
            $token = $parts[1];
            // In a real app, validate token (JWT or session token)
            return ['id' => 1, 'name' => 'Demo User', 'email' => 'demo@example.com'];
        }
    }
    return null;
}

// ---- Routes ----

// Health check / ping
add_route('/ping', function () {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        send_json(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    send_json(['success' => true, 'message' => 'pong', 'time' => time()]);
});

// GET api/books?search=&category=&limit=&offset=
add_route('/books', function () {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        send_json(['success' => false, 'message' => 'Method not allowed'], 405);
    }

    $q = isset($_GET['search']) ? trim($_GET['search']) : '';
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;

    // Try DB, fall back to sample data
    $pdo = get_db();
    if ($pdo) {
        try {
            $sql = "SELECT b.id, b.title, b.author, c.name as category, b.price, b.original_price, b.rating, b.reviews, b.featured, b.description, b.cover
                FROM books b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE 1=1";
            $params = [];
            if ($q !== '') {
                $sql .= " AND (b.title LIKE :q OR b.description LIKE :q)";
                $params[':q'] = "%{$q}%";
            }
            $sql .= " LIMIT :offset, :limit";
            $stmt = $pdo->prepare($sql);
            // bind explicitly for integer
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            if (isset($params[':q'])) {
                $stmt->bindValue(':q', $params[':q']);
            }

            $stmt->execute();
            $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
            send_json(['success' => true, 'data' => $books]);
        } catch (PDOException $e) {
            error_log('DB query api/books error: '.$e->getMessage());
        }
    }
    send_json(['success' => true, 'data' => []]);
});

// GET api/books/featured
add_route('/books/featured', function () {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        send_json(['success' => false, 'message' => 'Method not allowed'], 405);
    }

    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 8;

    // Try DB with featured flag or fallback
    $pdo = get_db();
    if ($pdo) {
        try {
            $sql = "SELECT b.id, b.title, b.price, b.stock, b.cover_image, b.rating,
                    a.name as author, c.name as category,
                    CASE WHEN b.discount > 0 THEN 1 ELSE 0 END as discount
                FROM books b
                LEFT JOIN authors a ON b.author_id = a.id
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.is_featured = 1 OR b.rating >= 4.5
                ORDER BY b.rating DESC, b.created_at DESC
                LIMIT :limit";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
            send_json(['success' => true, 'data' => $books]);
        } catch (PDOException $e) {
            error_log('DB query /api/books/featured error: '.$e->getMessage());
        }
    }
    send_json(['success' => true, 'data' => []]);
});

// GET /api/categories
add_route('/categories', function () {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        send_json(['success' => false, 'message' => 'Method not allowed'], 405);
    }

    $pdo = get_db();
    if ($pdo) {
        try {
            $sql = "SELECT c.id, c.name, c.icon, COUNT(b.id) as book_count
                FROM categories c
                LEFT JOIN books b ON c.id = b.category_id
                GROUP BY c.id
                ORDER BY c.name";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            send_json(['success' => true, 'data' => $categories]);
        } catch (PDOException $e) {
            error_log('DB query api/categories error: '.$e->getMessage());
        }
    }

    send_json(['success' => true, 'data' => []]);
});

// GET /api/book?id=123
add_route('/book', function () {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        send_json(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        send_json(['success' => false, 'message' => 'Missing id'], 400);
    }

    $pdo = get_db();
    if ($pdo) {
        try {
            $sql = "SELECT b.*, c.name as category_name
                FROM books b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.id = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);
            $book = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($book) {
                send_json(['success' => true, 'data' => $book]);
            } else {
                send_json(['success' => false, 'message' => 'Not found'], 404);
            }
        } catch (PDOException $e) {
            error_log('DB query api/book error: '.$e->getMessage());
            // fall through to sample fallback
        }
    }

    send_json(['success' => true, 'data' => []]);
});

// GET api/books/{id} - path parameter variant
add_route('/books/{id}', function ($id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        send_json(['success' => false, 'message' => 'Method not allowed'], 405);
    }

    $id = (int) $id;
    if ($id <= 0) {
        send_json(['success' => false, 'message' => 'Missing id'], 400);
    }

    $pdo = get_db();
    if ($pdo) {
        try {
            $sql = "SELECT b.*, c.name as category_name
                FROM books b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.id = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);
            $book = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($book) {
                send_json(['success' => true, 'data' => $book]);
            } else {
                send_json(['success' => false, 'message' => 'Not found'], 404);
            }
        } catch (PDOException $e) {
            error_log('DB query api/books/{id} error: '.$e->getMessage());
        }
    }

    send_json(['success' => true, 'data' => []]);
});

// dispatch request
dispatch();
