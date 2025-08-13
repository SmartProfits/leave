# Leave Management System

一个基于 Firebase 的现代化请假管理系统，支持多角色权限管理。

## 功能特性

- 🔐 Firebase Authentication Email/Password 登录
- 👥 多角色权限管理 (Super Admin, Admin, User)
- 🏢 多公司/分行独立数据访问控制
- 🔒 基于公司的用户权限管理
- 🎨 现代化白色主题 Bootstrap Outline Button UI 设计
- 📱 响应式设计，支持移动端
- 🌐 英文界面
- ☁️ Firebase Realtime Database 数据存储

## 角色权限

- **Super Admin (sadmin)**: 最高权限，可以：
  - 创建和管理公司/分行
  - 创建其他用户账号并分配公司权限
  - 访问所有公司的数据
  - 系统全局管理
- **Admin**: 管理员权限，可以：
  - 访问所有公司的数据
  - 管理请假申请
  - 用户管理（受限）
- **User**: 公司管理员，只能：
  - 访问被分配的公司数据
  - 管理所属公司的员工资料
  - 为员工处理请假申请

## 技术栈

- **前端**: HTML5, CSS3, Bootstrap 5
- **后端**: Firebase
  - Authentication (Email/Password)
  - Realtime Database
- **JavaScript**: ES6+ with Firebase SDK

## 项目结构

```
leave/
├── index.html              # 登录页面
├── style.css               # 自定义样式
├── script.js               # 登录逻辑
├── sadmin-dashboard.html   # Super Admin 仪表板
├── sadmin-dashboard.js     # Super Admin 逻辑
├── admin-dashboard.html    # Admin 仪表板
├── user-dashboard.html     # User 仪表板
├── user-dashboard.js       # User 仪表板逻辑（员工资料管理）
└── README.md               # 项目说明
```

## Firebase 配置

项目已配置 Firebase，配置信息如下：
- Project ID: uniangleave
- Database URL: https://uniangleave-default-rtdb.asia-southeast1.firebasedatabase.app
- Auth Domain: uniangleave.firebaseapp.com

## 安装和运行

1. **下载项目**
   ```bash
   git clone <repository-url>
   cd leave
   ```

2. **本地运行**
   
   由于使用了 Firebase ES6 模块，需要通过 HTTP 服务器运行：
   
   **使用 Python (推荐)**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **使用 Node.js**:
   ```bash
   npx serve .
   ```
   
   **使用 Live Server (VS Code 插件)**:
   右键 index.html → Open with Live Server

3. **访问应用**
   
   打开浏览器访问 `http://localhost:8000`

## 使用说明

### 首次使用

1. **创建 Super Admin 账号**
   - 在 Firebase Console 中手动创建第一个用户
   - 在 Realtime Database 中设置该用户的角色为 'sadmin'
   
   数据库结构示例：
   ```json
   {
     "users": {
       "user_uid_here": {
         "email": "admin@example.com",
         "role": "sadmin",
         "createdAt": "2024-01-01T00:00:00.000Z",
         "lastLogin": "2024-01-01T00:00:00.000Z"
       }
     }
   }
   ```

2. **创建公司/分行**
   - 使用 Super Admin 账号登录
   - 在仪表板中点击 "Create Company"
   - 填写公司信息：
     - **Company Name**: 公司名称
     - **Location**: 所在城市/省份
     - **Company Address**: 完整地址

3. **创建用户并分配权限**
   - 点击 "Create User" 创建新用户
   - 填写用户信息：
     - **Email Address**: 登录邮箱
     - **Password**: 登录密码
     - **Name**: 用户真实姓名
     - **Role**: 选择用户角色
   - 为 User 角色选择可访问的公司
   - Admin 和 Super Admin 自动拥有所有公司访问权限

### 登录

1. 访问登录页面
2. 输入 Email 和密码
3. 可选择 "Remember me" 保存登录信息
4. 点击 "Sign In" 按钮
5. 系统会根据用户角色自动跳转到相应的仪表板

### 密码重置

1. 在登录页面点击 "Forgot your password?"
2. 输入 Email 地址
3. 查收密码重置邮件

### 员工管理（User公司管理员）

1. **选择公司**：
   - 登录后首先从下拉列表中选择要管理的公司
   - 只能看到自己有权限管理的公司
   - 选择公司后显示该公司的员工列表

2. **查看员工列表**：
   - 显示当前选中公司的所有员工
   - 包含员工编号、姓名、职位、年假和病假天数
   - 实时统计显示员工总数和请假状态

3. **添加新员工**：
   - 点击 "Add Employee" 按钮
   - 填写必填信息：
     - **姓名**: 员工真实姓名
     - **员工编号**: 在公司内唯一的标识符
     - **职位**: 从下拉列表选择或选择"Other"自定义
     - **年假**: 选择标准天数（8/10/12/14/16）或选择"Other"自定义
     - **病假**: 输入年度病假天数
     - **公司**: 自动选择当前管理的公司
   - 点击 "Save Employee" 保存信息

4. **编辑员工资料**：
   - 点击员工行的编辑按钮（铅笔图标）
   - 修改员工信息后保存

5. **删除员工**：
   - 点击员工行的删除按钮（垃圾桶图标）
   - 确认删除操作（不可撤销）

6. **数据验证**：
   - 员工编号必须在同一公司内唯一
   - 年假和病假天数必须在合理范围内（1-365天）
   - 所有字段均为必填项

## 数据库结构

### Companies 集合
```json
{
  "companies": {
    "comp_12345": {
      "name": "Company Name",
      "location": "City, State/Province",
      "address": "Full company address",
      "createdAt": "ISO_DATE_STRING",
      "userCount": 0
    }
  }
}
```

### Users 集合
```json
{
  "users": {
    "user_uid": {
      "email": "user@example.com",
      "role": "user|admin|sadmin",
      "createdAt": "ISO_DATE_STRING",
      "lastLogin": "ISO_DATE_STRING",
      "companyPermissions": {
        "comp_12345": {
          "read": true,
          "write": true
        },
        "comp_67890": {
          "read": true,
          "write": false
        }
      },
      "profile": {
        "name": "Employee Name",
        "empNo": "EMP001",
        "position": "Manager|Supervisor|Driver|General Worker|Other",
        "annualLeave": 14,
        "medicalLeave": 14,
        "updatedAt": "ISO_DATE_STRING"
      }
    }
  }
}
```

**注意**: 
- `companyPermissions` 只适用于 `user` 角色
- `admin` 和 `sadmin` 角色自动拥有所有公司的访问权限
- `profile` 部分现在仅用于系统用户的个人信息

### Employees 集合（按公司分组）
```json
{
  "employees": {
    "comp_12345": {
      "emp_123456": {
        "name": "Employee Name",
        "empNo": "EMP001",
        "position": "Manager|Supervisor|Driver|General Worker|Other",
        "annualLeave": 14,
        "medicalLeave": 14,
        "companyId": "comp_12345",
        "createdAt": "ISO_DATE_STRING",
        "updatedAt": "ISO_DATE_STRING"
      }
    }
  }
}
```

**员工数据说明**:
- 员工按公司ID分组存储，实现数据隔离
- `empNo`: 员工编号（在同一公司内唯一）
- `position`: 职位（预设选项或自定义）
- `annualLeave`: 年假天数（预设选项：8/10/12/14/16天或自定义）
- `medicalLeave`: 病假天数

### Leave Requests 集合 (待实现)
```json
{
  "leaveRequests": {
    "request_id": {
      "userId": "user_uid",
      "type": "sick|vacation|personal",
      "startDate": "ISO_DATE_STRING",
      "endDate": "ISO_DATE_STRING",
      "reason": "请假原因",
      "status": "pending|approved|rejected",
      "createdAt": "ISO_DATE_STRING",
      "reviewedBy": "admin_uid",
      "reviewedAt": "ISO_DATE_STRING"
    }
  }
}
```

## 安全规则

建议在 Firebase Console 中设置以下安全规则：

```json
{
  "rules": {
    "companies": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'sadmin' || root.child('users').child(auth.uid).child('role').val() === 'admin')",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'sadmin'",
      "$companyId": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'sadmin' || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('companyPermissions').child($companyId).exists())"
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'sadmin' || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'sadmin'"
      }
    },
    "employees": {
      "$companyId": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'sadmin' || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('companyPermissions').child($companyId).exists())",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'sadmin' || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('companyPermissions').child($companyId).child('write').val() === true)"
      }
    },
    "leaveRequests": {
      "$companyId": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'sadmin' || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('companyPermissions').child($companyId).child('read').val() === true)",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'sadmin' || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('companyPermissions').child($companyId).child('write').val() === true)"
      }
    }
  }
}
```

## 开发计划

- [x] **Super Admin 仪表板**
  - [x] 公司/分行管理
    - [x] 创建公司（名称、位置、地址）
    - [x] 查看公司列表
    - [ ] 编辑公司信息
    - [ ] 删除公司功能
  - [x] 用户管理
    - [x] 创建用户（邮箱、密码、姓名、角色）
    - [x] 用户权限分配
    - [x] 查看用户列表（显示姓名和邮箱）
    - [ ] 编辑用户信息
    - [ ] 批量用户操作
  - [x] 系统统计

- [ ] **Admin 仪表板**
  - [ ] 请假申请审核
  - [ ] 跨公司数据查看
  - [ ] 报表生成

- [x] **User 仪表板（公司管理员）**
  - [x] 公司选择和切换功能
  - [x] 员工管理系统
    - [x] 查看公司员工列表
    - [x] 添加新员工
    - [x] 编辑员工资料
    - [x] 删除员工记录
    - [x] 员工编号在公司内唯一性验证
  - [x] 员工资料字段
    - [x] 姓名和员工编号
    - [x] 职位选择（Manager/Supervisor/Driver/General Worker/Other）
    - [x] 年假天数配置（8/10/12/14/16天或自定义）
    - [x] 病假天数配置
  - [x] 基础统计仪表板
  - [ ] 员工请假申请管理
  - [ ] 员工考勤管理

- [ ] **请假管理功能**
  - [ ] 请假类型配置
  - [ ] 审批流程设计
  - [ ] 请假日历视图
  - [ ] 邮件通知系统

## 贡献

欢迎提交 Issues 和 Pull Requests！

## 许可证

MIT License 