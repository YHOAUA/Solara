# 标签页歌词优先显示中文 (Tab Lyrics Prioritize Chinese)

## 功能概述 (Feature Overview)

本次更新实现了浏览器标签页显示歌词时优先显示中文的功能。当歌曲有双语歌词时，如果其中一个是中文，标签页将优先显示中文歌词。

This update implements the feature to prioritize displaying Chinese lyrics in the browser tab title. When a song has bilingual lyrics and one of them is Chinese, the Chinese lyrics will be displayed in the tab.

## 主要变更 (Main Changes)

### JavaScript 功能增强 (JavaScript Enhancements)

#### `js/index.js`

新增了两个辅助函数：

1. **`containsChinese(text)`** - 检测文本是否包含中文字符
   - 使用 Unicode 范围检测中文字符（U+4E00-U+9FFF 和 U+3400-U+4DBF）
   - Returns `true` if the text contains Chinese characters, `false` otherwise

2. **`getPreferredLyricForTitle(lyric)`** - 根据语言优先级选择用于标签页显示的歌词
   - 当原文是中文，翻译不是中文时 → 返回原文
   - 当原文不是中文，翻译是中文时 → 返回翻译
   - 当只有一种歌词时 → 返回该歌词
   - 当两者都是中文或都不是中文时 → 默认返回原文

3. **修改 `syncLyrics()` 函数**
   - 将 `setTabTitleLyric(activeLyric ? activeLyric.text : "")` 
   - 改为 `setTabTitleLyric(activeLyric ? getPreferredLyricForTitle(activeLyric) : "")`
   - 使标签页歌词通过智能选择函数决定显示内容

#### `js/index.min.js`

- 更新了压缩版本，包含上述所有更改

## 使用场景 (Use Cases)

### 场景 1: 中文歌曲带英文翻译
- **原文**: "我爱你"
- **翻译**: "I love you"
- **标签页显示**: "我爱你" ✅

### 场景 2: 英文歌曲带中文翻译
- **原文**: "I love you"
- **翻译**: "我爱你"
- **标签页显示**: "我爱你" ✅

### 场景 3: 纯中文歌曲（无翻译）
- **原文**: "我爱你"
- **标签页显示**: "我爱你" ✅

### 场景 4: 纯英文歌曲（无翻译）
- **原文**: "I love you"
- **标签页显示**: "I love you" ✅

### 场景 5: 双语都是中文
- **原文**: "你好"
- **翻译**: "世界"
- **标签页显示**: "你好" (默认原文)

### 场景 6: 双语都不是中文
- **原文**: "Hello"
- **翻译**: "World"
- **标签页显示**: "Hello" (默认原文)

## 技术细节 (Technical Details)

### 中文字符检测 (Chinese Character Detection)

使用正则表达式检测 Unicode 中文字符范围：
```javascript
/[\u4e00-\u9fff\u3400-\u4dbf]/
```

这覆盖了：
- **U+4E00 - U+9FFF**: CJK 统一表意文字 (CJK Unified Ideographs)
- **U+3400 - U+4DBF**: CJK 扩展 A (CJK Extension A)

### 优先级逻辑 (Priority Logic)

```
1. 如果只有一种歌词 → 显示该歌词
2. 如果有两种歌词:
   a. 原文是中文 + 翻译不是中文 → 显示原文
   b. 原文不是中文 + 翻译是中文 → 显示翻译
   c. 两者都是或都不是中文 → 默认显示原文
```

## 兼容性 (Compatibility)

- ✅ 完全向后兼容现有的歌词显示功能
- ✅ 不影响歌词面板和移动端内联歌词的显示
- ✅ 仅影响浏览器标签页标题的歌词显示
- ✅ 支持所有现有的双语歌词格式

## 测试 (Testing)

已通过单元测试验证所有场景：
- ✅ 中英混合歌词
- ✅ 英中混合歌词  
- ✅ 纯中文歌词
- ✅ 纯英文歌词
- ✅ 双中文歌词
- ✅ 双英文歌词

## 未来改进 (Future Improvements)

- [ ] 支持用户自定义标签页歌词语言偏好
- [ ] 支持其他语言的优先级设置（如日语、韩语）
- [ ] 添加设置选项允许用户选择显示原文、翻译或智能选择

## 相关文件 (Related Files)

- `js/index.js` - 主要逻辑实现
- `js/index.min.js` - 压缩版本
- `index.html` - 引用压缩版本

## 贡献者 (Contributors)

此功能由 AI 助手实现，用于优化中文用户的使用体验。
This feature was implemented by AI assistant to optimize the experience for Chinese users.
