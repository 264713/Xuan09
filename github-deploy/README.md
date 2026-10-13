# 个人展示页（静态背景版）

将本文件夹内的 index.html、assets 文件夹和 .nojekyll 上传到 GitHub 仓库根目录。
不要上传外层的原始视频、TIFF、ZIP、工具目录及测试截图。
在仓库 Settings → Pages 中选择从分支部署，选择对应分支和 / (root)。

保留头像、桌面与手机静态背景、加载进度、图片文字和同步鼠标视差。
已移除视频及视频等待逻辑。保留纯音频，循环播放，约2秒内渐升至70%，页面左下角可开关音乐。浏览器可能要求点击进入后才允许有声播放。

改进建议：
- 继续使用 WebP 图片；新增作品采用缩略图，详情图片按需加载。
- 保留轻量 CSS 动画和文字视差，避免用 GIF 替代视频。
- 后续可以缩短分段进度停留，让访客更快进入正文。

上传说明：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
