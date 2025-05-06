<?php
// 数据库配置
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = '3dytm';

// 连接数据库
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("数据库连接失败：" . $e->getMessage());
}

// 简单的登录验证
session_start();
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ?login=1');
    exit;
}

if (!isset($_SESSION['admin']) && !isset($_GET['login'])) {
    header('Location: ?login=1');
    exit;
}

if (isset($_GET['login'])) {
    if (isset($_POST['username']) && isset($_POST['password'])) {
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
        $stmt->execute([$_POST['username']]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($_POST['password'], $admin['password'])) {
            $_SESSION['admin'] = true;
            $_SESSION['admin_id'] = $admin['id'];
            header('Location: index.php');
            exit;
        } else {
            $error = "用户名或密码错误";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D遇太美 - 留言管理</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f2f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .login-form {
            max-width: 400px;
            margin: 100px auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
        }
        .form-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .submit-btn {
            width: 100%;
            padding: 10px;
            background: #3a8ee6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .error-message {
            color: #f44336;
            margin-bottom: 15px;
            text-align: center;
        }
        .contact-list {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .contact-item {
            border-bottom: 1px solid #eee;
            padding: 15px 0;
        }
        .contact-item:last-child {
            border-bottom: none;
        }
        .contact-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .contact-name {
            font-weight: bold;
            color: #333;
        }
        .contact-phone {
            color: #666;
        }
        .contact-ip {
            color: #999;
            font-size: 12px;
        }
        .contact-content {
            margin: 10px 0;
            color: #333;
        }
        .contact-time {
            color: #999;
            font-size: 12px;
        }
        .status-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            color: white;
        }
        .status-pending {
            background: #ff9800;
        }
        .status-done {
            background: #4caf50;
        }
        .logout-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 15px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <?php if (!isset($_SESSION['admin'])): ?>
    <div class="container">
        <div class="login-form">
            <h2>管理员登录</h2>
            <?php if (isset($error)): ?>
                <div class="error-message"><?php echo $error; ?></div>
            <?php endif; ?>
            <form method="POST">
                <div class="form-group">
                    <label>用户名</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit" class="submit-btn">登录</button>
            </form>
        </div>
    </div>
    <?php else: ?>
    <button class="logout-btn" onclick="location.href='?logout=1'">退出登录</button>
    <div class="container">
        <h1>留言管理</h1>
        <div class="contact-list" id="contactList">
            <!-- 留言列表将通过JavaScript动态加载 -->
        </div>
    </div>

    <script>
        // 获取留言列表
        function loadContacts() {
            fetch('../api/contact.php')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('网络响应错误');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('收到的数据:', data); // 调试日志
                    if (data.success && Array.isArray(data.data)) {
                        const contactList = document.getElementById('contactList');
                        contactList.innerHTML = data.data.map(contact => `
                            <div class="contact-item">
                                <div class="contact-header">
                                    <div>
                                        <span class="contact-name">${contact.name || '未填写'}</span>
                                        <span class="contact-phone">${contact.phone || '未填写'}</span>
                                    </div>
                                    <span class="contact-ip">IP: ${contact.ip || '未知'}</span>
                                </div>
                                <div class="contact-content">${contact.message || contact.content || '无内容'}</div>
                                <div class="contact-footer">
                                    <span class="contact-time">${contact.created_at || '未知时间'}</span>
                                    <button class="status-btn ${contact.status === '未处理' ? 'status-pending' : 'status-done'}"
                                            onclick="updateStatus(${contact.id}, '${contact.status === '未处理' ? '已处理' : '未处理'}')">
                                        ${contact.status || '未处理'}
                                    </button>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        console.error('数据格式错误:', data);
                        document.getElementById('contactList').innerHTML = '<div class="error-message">加载数据失败</div>';
                    }
                })
                .catch(error => {
                    console.error('加载数据失败:', error);
                    document.getElementById('contactList').innerHTML = '<div class="error-message">加载数据失败：' + error.message + '</div>';
                });
        }

        // 更新留言状态
        function updateStatus(id, status) {
            fetch('../api/contact.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    status: status
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应错误');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    loadContacts();
                } else {
                    console.error('更新状态失败:', data);
                    alert('更新状态失败：' + (data.message || '未知错误'));
                }
            })
            .catch(error => {
                console.error('更新状态失败:', error);
                alert('更新状态失败：' + error.message);
            });
        }

        // 页面加载时获取留言列表
        loadContacts();
        // 每30秒自动刷新一次
        setInterval(loadContacts, 30000);
    </script>
    <?php endif; ?>
</body>
</html> 