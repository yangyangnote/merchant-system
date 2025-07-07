-- 袁记商家系统 - 更新本地菜单数据
-- 使其与生产环境保持一致

USE merchant_system;

-- 清空旧的菜单数据
DELETE FROM menu;

-- 插入真实菜单数据（与生产环境一致）
-- 材料类
INSERT INTO menu (id, userId, name, price) VALUES
('item001', '1', '牛肉（五斤装）', '31.00'),
('item002', '1', '猪肉', '15.00'),
('item003', '1', '牛肉丸（小）', '30.00'),
('item004', '1', '生牛杂', '25.00'),
('item005', '1', '牛腩料包', '50.00'),
('item006', '1', '菜脯/箱', '60.00');

-- 耗材类  
INSERT INTO menu (id, userId, name, price) VALUES
('item007', '1', '餐盒/箱', '162.00'),
('item008', '1', '餐具四件套/箱', '144.00'),
('item009', '1', '袋子', '9.00');

-- 查看更新结果
SELECT '=== 本地菜单更新完成 ===' as status;
SELECT * FROM menu ORDER BY id; 