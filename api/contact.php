<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT');
header('Access-Control-Allow-Headers: Content-Type');

// 数据库配置
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = '3dytm';

try {
    // 连接数据库
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 获取请求方法
    $method = $_SERVER['REQUEST_METHOD'];

    // 处理POST请求（提交留言）
    if ($method === 'POST') {
        // 获取原始POST数据
        $rawData = file_get_contents('php://input');
        
        // 记录原始数据
        error_log("Raw POST data: " . $rawData);
        
        // 解析JSON数据
        $data = json_decode($rawData, true);
        
        // 记录解析后的数据
        error_log("Parsed data: " . print_r($data, true));
        
        if (!$data) {
            throw new Exception('无效的请求数据');
        }

        // 验证必填字段
        if (empty($data['name']) || empty($data['phone']) || empty($data['content'])) {
            throw new Exception('请填写所有必填字段');
        }

        // 验证姓名格式
        if (!preg_match('/^[\x{4e00}-\x{9fa5}a-zA-Z]{2,20}$/u', $data['name'])) {
            throw new Exception('姓名格式不正确');
        }

        // 验证手机号格式
        if (!preg_match('/^1[3-9]\d{9}$/', $data['phone'])) {
            throw new Exception('手机号格式不正确');
        }

        // 验证内容长度
        if (strlen($data['content']) < 10 || strlen($data['content']) > 500) {
            throw new Exception('内容长度必须在10-500个字符之间');
        }

        // 获取客户端IP
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
        
        // 获取当前时间
        $created_at = date('Y-m-d H:i:s');

        // 插入数据
        $stmt = $pdo->prepare("INSERT INTO contacts (name, phone, message, ip, created_at) VALUES (?, ?, ?, ?, ?)");
        $result = $stmt->execute([
            $data['name'], 
            $data['phone'], 
            $data['content'],
            $ip,
            $created_at
        ]);

        if ($result) {
            $response = [
                'success' => true,
                'message' => '提交成功',
                'data' => [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'content' => $data['content'],
                    'created_at' => $created_at
                ]
            ];
            
            // 记录响应数据
            error_log("Response data: " . print_r($response, true));
            
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        } else {
            throw new Exception('提交失败，请稍后重试');
        }
    }
    // 处理GET请求（获取留言列表）
    else if ($method === 'GET') {
        // 检查管理员登录状态
        session_start();
        if (!isset($_SESSION['admin'])) {
            throw new Exception('未授权访问');
        }

        // 获取所有留言
        $stmt = $pdo->query("SELECT * FROM contacts ORDER BY created_at DESC");
        $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $response = [
            'success' => true,
            'data' => $contacts
        ];
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }
    // 处理PUT请求（更新留言状态）
    else if ($method === 'PUT') {
        // 检查管理员登录状态
        session_start();
        if (!isset($_SESSION['admin'])) {
            throw new Exception('未授权访问');
        }

        // 获取PUT数据
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['id']) || !isset($data['status'])) {
            throw new Exception('无效的请求数据');
        }

        // 验证状态值
        if (!in_array($data['status'], ['未处理', '已处理'])) {
            throw new Exception('无效的状态值');
        }

        // 更新留言状态
        $stmt = $pdo->prepare("UPDATE contacts SET status = ? WHERE id = ?");
        $result = $stmt->execute([$data['status'], $data['id']]);

        if ($result) {
            $response = [
                'success' => true,
                'message' => '更新成功'
            ];
            
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        } else {
            throw new Exception('更新失败，请稍后重试');
        }
    }
    else {
        throw new Exception('不支持的请求方法');
    }

} catch(PDOException $e) {
    $response = [
        'success' => false,
        'message' => '数据库错误：' . $e->getMessage()
    ];
    
    error_log("Database error: " . $e->getMessage());
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch(Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    
    error_log("General error: " . $e->getMessage());
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}
?> 