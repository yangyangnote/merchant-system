-- 完整菜单修复 - 让每个商家都能看到所有商品
USE merchant_system;

-- 清空菜单数据
DELETE FROM menu;

-- 为每个商家添加完整的菜单（材料类+耗材类）
-- 商家A的菜单
INSERT INTO menu (id, userId, name, price) VALUES
('item001_A', 'merchantA', '牛肉（五斤装）', '31.00'),
('item002_A', 'merchantA', '猪肉', '15.00'),
('item003_A', 'merchantA', '牛肉丸（小）', '30.00'),
('item004_A', 'merchantA', '生牛杂', '25.00'),
('item005_A', 'merchantA', '牛腩料包', '50.00'),
('item006_A', 'merchantA', '菜脯/箱', '60.00'),
('item007_A', 'merchantA', '餐盒/箱', '162.00'),
('item008_A', 'merchantA', '餐具四件套/箱', '144.00'),
('item009_A', 'merchantA', '袋子', '9.00');

-- 商家B的菜单（相同商品，不同ID避免冲突）
INSERT INTO menu (id, userId, name, price) VALUES
('item001_B', 'merchantB', '牛肉（五斤装）', '31.00'),
('item002_B', 'merchantB', '猪肉', '15.00'),
('item003_B', 'merchantB', '牛肉丸（小）', '30.00'),
('item004_B', 'merchantB', '生牛杂', '25.00'),
('item005_B', 'merchantB', '牛腩料包', '50.00'),
('item006_B', 'merchantB', '菜脯/箱', '60.00'),
('item007_B', 'merchantB', '餐盒/箱', '162.00'),
('item008_B', 'merchantB', '餐具四件套/箱', '144.00'),
('item009_B', 'merchantB', '袋子', '9.00');

-- 查看结果
SELECT '=== 各商家菜单统计 ===' as info;
SELECT userId, COUNT(*) as menu_count 
FROM menu 
GROUP BY userId; 