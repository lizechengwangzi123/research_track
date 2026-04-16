# 🔬 ResearchTrack
### 临床编辑与实验室协作全栈平台

**ResearchTrack** 是一款专为实验室科研团队和临床编辑设计的全栈协作平台。它实现了从科研构思（Ideation）到最终发表（Published）的全生命周期管理，同时集成了实时通讯、科研动态追踪及数据可视化分析功能。

---

## 🚀 在线演示
**前端地址：** [research-track.vercel.app](https://research-track.vercel.app)  
**后端接口：** [research-track.onrender.com](https://research-track.onrender.com/health)

---

## ✨ 核心功能

### 📈 论文生命周期管理 (Manuscript Intelligence)
- **动态管线追踪：** 覆盖 *构思、起草、已提交、审稿中、已发表* 五大核心阶段。
- **科学数据可视化：** 自动生成基于 SVG 的**投稿漏斗图**和**资源分配热力图**，直观掌握科研产出。
- **自定义优先级：** 支持通过排序系统灵活调整项目处理顺序。

### 💬 实验室实时同步 (Real-time Sync)
- **高级即时通讯：** 基于 Socket.io 驱动，支持聊天记录自动定位至最新消息。
- **多媒体附件：** 支持从剪贴板直接**粘贴图片**发送，或通过上传按钮共享实验文件。
- **智能通知：** 实时未读消息计数，并在收到新协作请求时发出“滴”声提醒。

### 🌐 社交与科研发现 (Network & Discovery)
- **专家搜索：** 通过邮箱精准查找同行，扩展你的科研网络。
- **好友进度追踪：** 实时查看合作伙伴的科研摘要，包括投稿期刊、审稿时长等关键指标。
- **Nature 期刊订阅：** 自动通过 RSS 抓取 Nature 官网最新的突破性研究成果。

### 🔐 安全与高可用 (Security & Reliability)
- **邮箱验证体系：** 新账户注册需通过 6 位数字验证码激活，确保实验室数据安全。
- **安全重置：** 完整的密码找回流程，通过加密邮件链接安全操作。
- **永不离线：** 内置 GitHub Actions “心跳”系统，防止免费版服务器进入睡眠状态。

---

## 🛠️ 技术栈

**前端：**
- React 19 (TypeScript)
- Vite
- Tailwind CSS 4
- Socket.io Client
- Framer Motion (动画效果)

**后端：**
- Node.js (Express)
- TypeScript
- Prisma ORM (数据库建模)
- PostgreSQL (通过 Supabase 托管)
- Socket.io (WebSockets)
- Nodemailer (邮件系统)
- RSS Parser (期刊抓取)

---

## ⚙️ 本地开发指南

### 前置要求
- Node.js (v18+)
- PostgreSQL 数据库

### 1. 克隆仓库
```bash
git clone https://github.com/lizechengwangzi123/research_track.git
cd research_track
```

### 2. 后端配置
```bash
cd server
npm install
# 创建 .env 文件并配置 DATABASE_URL, JWT_SECRET 和 SMTP 凭据
npx prisma generate
npx prisma db push
npm run dev
```

### 3. 前端配置
```bash
cd ../client
npm install --legacy-peer-deps
# 创建 .env 文件并配置 VITE_API_URL=http://localhost:3001/api
npm run dev
```

---

## 📄 开源协议
本项目采用 ISC 许可证。

---
*为全球科研共同体倾情打造 ❤️*
