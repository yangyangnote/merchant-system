-- 修复菜单用户ID映射问题
USE merchant_system;

-- 清空菜单数据
DELETE FROM menu;

-- 为 merchantA 分配材料类菜单
INSERT INTO menu (id, userId, name, price) VALUES
('item001', 'merchantA', '牛肉（五斤装）', '31.00'),
('item002', 'merchantA', '猪肉', '15.00'),
('item003', 'merchantA', '牛肉丸（小）', '30.00'),
('item004', 'merchantA', '生牛杂', '25.00'),
('item005', 'merchantA', '牛腩料包', '50.00'),
('item006', 'merchantA', '菜脯/箱', '60.00');

-- 为 merchantB 分配耗材类菜单
INSERT INTO menu (id, userId, name, price) VALUES
('item007', 'merchantB', '餐盒/箱', '162.00'),
('item008', 'merchantB', '餐具四件套/箱', '144.00'),
('item009', 'merchantB', '袋子', '9.00');

-- 查看修复结果
SELECT '=== 用户菜单分配 ===' as info;
SELECT u.username, m.name, m.price 
FROM users u 
LEFT JOIN menu m ON u.id = m.userId 
WHERE u.role = 'merchant'
ORDER BY u.id, m.id; 