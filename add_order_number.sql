-- 袁记商家系统 - 添加订单号字段
-- 为订单表添加专业的订单号系统

USE merchant_system;

-- 1. 添加订单号字段
ALTER TABLE orders 
ADD COLUMN order_no VARCHAR(20) UNIQUE COMMENT '订单号' AFTER id;

-- 2. 为现有订单生成订单号
-- 注意：这里使用简化的方法，实际生产中建议在应用层生成
UPDATE orders 
SET order_no = CONCAT(
    'YJ',                                    -- 袁记前缀
    DATE_FORMAT(NOW(), '%Y%m%d'),           -- 当前日期
    LPAD(
        FLOOR(RAND() * 1000000), 6, '0'     -- 6位随机数
    )
) 
WHERE order_no IS NULL;

-- 3. 查看更新结果
SELECT '=== 订单号添加完成 ===' as info;
SELECT id, order_no, status, 
       JSON_EXTRACT(items, '$[0].name') as first_item
FROM orders 
ORDER BY id DESC 
LIMIT 10; 