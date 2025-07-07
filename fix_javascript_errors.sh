#!/bin/bash

echo "🔧 修复JavaScript错误并重新部署"

cd /root/merchant-system/front-end

# 备份原文件
echo "📂 备份原文件..."
cp src/components/MenuSelect.js src/components/MenuSelect.js.backup
cp src/components/OrderForm.js src/components/OrderForm.js.backup
cp src/components/OrderList.js src/components/OrderList.js.backup
cp src/components/SupplierPanel.js src/components/SupplierPanel.js.backup
cp src/components/AddressSelector.js src/components/AddressSelector.js.backup

echo "🔄 应用修复..."

# 从本地修复的文件复制到服务器
# 注意：这个脚本假设本地已经修复了这些文件

echo "🏗️ 重新构建前端..."
npm run build

echo "🔄 重启服务..."
systemctl restart nginx

echo "✅ 修复完成！"
echo "🌐 访问地址：http://175.178.164.216:8080" 