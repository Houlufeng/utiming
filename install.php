<?php
// 数据库配置
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = '3dytm';

try {
    // 连接MySQL服务器
    $pdo = new PDO("mysql:host=$db_host", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 创建数据库
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "数据库创建成功！<br>";

    // 选择数据库
    $pdo->exec("USE `$db_name`");

    // 创建留言表
    $pdo->exec("CREATE TABLE IF NOT EXISTS `contacts` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(50) NOT NULL,
        `phone` VARCHAR(20) NOT NULL,
        `content` TEXT NOT NULL,
        `ip` VARCHAR(45) NOT NULL,
        `status` ENUM('未处理', '已处理') DEFAULT '未处理',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "留言表创建成功！<br>";

    // 创建管理员表
    $pdo->exec("CREATE TABLE IF NOT EXISTS `admins` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(50) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "管理员表创建成功！<br>";

    // 添加默认管理员账号
    $username = 'admin';
    $password = password_hash('admin123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO `admins` (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $password]);
    echo "默认管理员账号创建成功！<br>";
    echo "用户名：admin<br>";
    echo "密码：admin123<br>";

    echo "<br>安装完成！<br>";
    echo "<a href='admin/index.php'>点击进入管理后台</a>";

} catch(PDOException $e) {
    die("安装失败：" . $e->getMessage());
}
?> 