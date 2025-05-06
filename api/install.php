<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// 数据库配置
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = '3dytm';

try {
    // 连接数据库
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 创建contacts表
    $sql = "CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        ip VARCHAR(45) NOT NULL,
        created_at DATETIME NOT NULL,
        status ENUM('未处理', '已处理') DEFAULT '未处理',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);

    // 创建管理员表
    $sql = "CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);

    // 检查是否已存在默认管理员
    $stmt = $pdo->query("SELECT COUNT(*) FROM admins");
    if ($stmt->fetchColumn() == 0) {
        // 创建默认管理员账号
        $username = 'admin';
        $password = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
        $stmt->execute([$username, $password]);
    }

    echo json_encode([
        'success' => true,
        'message' => '数据库表创建成功',
        'default_admin' => [
            'username' => 'admin',
            'password' => 'admin123'
        ]
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => '数据库错误：' . $e->getMessage()
    ]);
}
?> 