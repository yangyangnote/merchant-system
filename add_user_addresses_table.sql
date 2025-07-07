-- 用户地址表
CREATE TABLE IF NOT EXISTS user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 初始化索引
ALTER TABLE user_addresses ADD INDEX idx_user_default (user_id, is_default);

-- 插入一些示例数据（可选）
-- INSERT INTO user_addresses (user_id, address, is_default) VALUES 
-- ('merchant1', '广东省深圳市南山区科技园', TRUE),
-- ('merchant1', '广东省广州市天河区珠江新城', FALSE),
-- ('merchant2', '上海市浦东新区陆家嘴金融区', TRUE); 