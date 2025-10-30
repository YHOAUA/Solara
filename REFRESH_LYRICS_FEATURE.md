# 刷新歌词功能 (Refresh Lyrics Feature)

## 功能描述 (Feature Description)

当播放器显示"暂无歌词"时，用户现在可以点击该文本来重新尝试加载歌词。这为用户提供了一个简单的方式来手动刷新歌词，特别是在网络不稳定或歌词服务暂时不可用的情况下。

When the player displays "暂无歌词" (No lyrics available), users can now click on this text to retry loading lyrics. This provides a simple way for users to manually refresh lyrics, especially when the network is unstable or the lyrics service is temporarily unavailable.

## 实现细节 (Implementation Details)

### JavaScript 更改 (JavaScript Changes)

1. **新增函数 `refreshLyrics()`**
   - 检查当前是否有正在播放的歌曲
   - 显示"正在重新加载歌词..."的提示
   - 调用 `loadLyrics()` 重新尝试获取歌词

2. **新增函数 `setNoLyricsHtml()`**
   - 创建可点击的"暂无歌词"消息
   - 添加点击事件监听器
   - 自动处理桌面和移动端视图

3. **替换原有的歌词显示逻辑**
   - 将所有 `setLyricsContentHtml("<div>暂无歌词</div>")` 替换为 `setNoLyricsHtml()`
   - 保持原有的状态管理和类名设置

### CSS 更改 (CSS Changes)

1. **桌面端样式 (style.css)**
   - 添加 `.no-lyrics-message` 类样式
   - 悬停时改变颜色为主题色并轻微放大
   - 点击时轻微缩小提供视觉反馈

2. **移动端样式 (mobile.css)**
   - 为移动端视图添加相应的 `.no-lyrics-message` 样式
   - 适配移动端的颜色和尺寸

## 用户体验 (User Experience)

- **视觉提示**: 鼠标悬停时，文本颜色变为主题色，提示用户可以点击
- **工具提示**: 显示"点击重新加载歌词"的提示文字
- **反馈**: 点击后立即显示"正在重新加载歌词..."，让用户知道操作已响应
- **兼容性**: 同时支持桌面端和移动端，无需额外操作

## 技术要点 (Technical Points)

- 使用 `setTimeout(..., 0)` 确保 DOM 更新后再添加事件监听器
- 事件监听器通过 `querySelectorAll` 同时绑定到桌面端和移动端的歌词容器
- 每次设置新的 HTML 时，旧的事件监听器会自动移除（元素被替换）
- CSS 过渡效果提供平滑的视觉反馈
