# 双语歌词功能 (Bilingual Lyrics Feature)

## 功能概述 (Feature Overview)

本次更新添加了中英双语歌词支持，当歌曲有翻译歌词时，会同时显示原文和翻译，为用户提供更好的歌词理解体验。

This update adds bilingual lyrics support (Chinese-English). When translated lyrics are available, both original and translated lyrics will be displayed simultaneously, providing users with better lyric comprehension.

## 主要变更 (Main Changes)

### 1. JavaScript 功能增强 (JavaScript Enhancements)

#### `js/index.js`

- **状态管理 (State Management)**
  - 添加 `bilingualLyrics: true` 状态标志，用于控制双语歌词显示
  - Added `bilingualLyrics: true` state flag to control bilingual lyrics display

- **歌词加载 (Lyrics Loading)** - `loadLyrics(song)`
  - 现在会同时获取原文歌词 (`lyricData.lyric`) 和翻译歌词 (`lyricData.tlyric`)
  - Now fetches both original lyrics (`lyricData.lyric`) and translated lyrics (`lyricData.tlyric`)

- **歌词解析 (Lyrics Parsing)** - `parseLyrics(lyricText, translatedLyricText)`
  - 重构为支持两个参数：原文歌词和翻译歌词
  - Refactored to support two parameters: original and translated lyrics
  - 使用内部函数 `parseLrcLines` 解析 LRC 格式
  - Uses internal function `parseLrcLines` to parse LRC format
  - 根据时间戳将翻译歌词映射到原文歌词
  - Maps translated lyrics to original lyrics by timestamp
  - 歌词数据结构现在包含 `text`（原文）和 `translation`（翻译）字段
  - Lyric data structure now includes `text` (original) and `translation` fields

- **歌词显示 (Lyrics Display)** - `displayLyrics()`
  - 当有翻译时，以双行格式显示歌词
  - Displays lyrics in dual-line format when translation is available
  - 原文使用 `.lyric-original` 类，翻译使用 `.lyric-translation` 类
  - Original text uses `.lyric-original` class, translation uses `.lyric-translation` class
  - 整体包裹在 `.lyric-line` 容器中
  - Wrapped in `.lyric-line` container

### 2. 桌面端样式 (Desktop Styles)

#### `css/style.css`

添加了以下新样式规则 (Added the following new style rules):

- `.lyric-line` - 双语歌词行容器，使用 flexbox 纵向排列
  - Bilingual lyric line container, using vertical flexbox layout

- `.lyric-original` - 原文歌词样式
  - 常规大小和粗细
  - 使用主文本颜色
  
- `.lyric-translation` - 翻译歌词样式
  - 较小字体（85%）
  - 次要文本颜色，透明度 75%

- `.lyric-line.current` - 当前播放行的高亮样式
  - 原文：更大字体（1.3em），加粗（800）
  - 翻译：稍大字体（1.1em），半粗（600），透明度 90%
  - 使用 `--lyrics-highlight-text` CSS 变量定义的高亮颜色

### 3. 移动端样式 (Mobile Styles)

#### `css/mobile.css`

为移动端内联歌词添加了双语支持 (Added bilingual support for mobile inline lyrics):

- `.mobile-inline-lyrics__content .lyric-line` - 移动端双语歌词容器
  - Mobile bilingual lyric container

- `.mobile-inline-lyrics__content .lyric-original` - 移动端原文样式
  - 响应式字体大小：`clamp(0.82rem, 3.8vw, 0.98rem)`
  
- `.mobile-inline-lyrics__content .lyric-translation` - 移动端翻译样式
  - 较小的响应式字体：`clamp(0.72rem, 3.2vw, 0.85rem)`

- `.mobile-inline-lyrics__content .lyric-line.current` - 移动端当前行高亮
  - 原文：更大字体 `clamp(1rem, 4.2vw, 1.15rem)`，粗体
  - 翻译：中等字体 `clamp(0.88rem, 3.6vw, 1rem)`，半粗体
  - 使用主题高亮颜色和背景

### 4. 其他文件 (Other Files)

#### `.gitignore`
- 新增 `.gitignore` 文件，用于忽略不需要版本控制的文件
- Added `.gitignore` file to exclude unnecessary files from version control

## 使用说明 (Usage Instructions)

1. **自动启用 (Auto-enabled)**
   - 双语歌词功能默认开启
   - Bilingual lyrics feature is enabled by default
   
2. **兼容性 (Compatibility)**
   - 仅在歌曲有翻译歌词时显示双语格式
   - Only displays bilingual format when translated lyrics are available
   - 无翻译时自动回退到单语显示
   - Automatically falls back to single-language display when no translation exists

3. **视觉效果 (Visual Effects)**
   - 原文和翻译以不同大小和颜色区分
   - Original and translation differentiated by size and color
   - 当前播放行会同时高亮原文和翻译
   - Both original and translation are highlighted for the current playing line

## 技术细节 (Technical Details)

### 数据格式 (Data Format)

歌词数据结构 (Lyric data structure):
```javascript
{
  time: 12.34,              // 时间戳（秒）/ Timestamp in seconds
  text: "原文歌词",          // 原文 / Original text
  translation: "翻译歌词"    // 翻译 / Translation (可选/optional)
}
```

### API 响应格式 (API Response Format)

期望的 API 响应 (Expected API response):
```javascript
{
  lyric: "[00:12.34]原文歌词\n...",        // LRC 格式原文 / Original in LRC format
  tlyric: "[00:12.34]翻译歌词\n..."       // LRC 格式翻译 / Translation in LRC format
}
```

## 未来改进 (Future Improvements)

- [ ] 添加双语显示开关选项 (Add toggle option for bilingual display)
- [ ] 支持更多语言对（如日英、韩英）(Support more language pairs like JP-EN, KR-EN)
- [ ] 音译支持（罗马音）(Romanization support)
- [ ] 用户自定义字体大小和颜色 (User-customizable font size and colors)

## 测试建议 (Testing Suggestions)

1. 搜索并播放有翻译歌词的歌曲（通常是网易云音乐）
   Search and play songs with translated lyrics (usually from NetEase)

2. 检查桌面端和移动端的显示效果
   Check display on both desktop and mobile views

3. 验证当前行高亮和滚动同步
   Verify current line highlighting and scroll synchronization

4. 测试无翻译歌词时的降级行为
   Test fallback behavior when no translation is available

## 贡献 (Contributing)

如有建议或发现问题，请提交 Issue 或 Pull Request。
For suggestions or issues, please submit an Issue or Pull Request.
