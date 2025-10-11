<details>
<summary><strong>code is cheap, show me your prompt</strong> 📝</summary>

- 作者:   [李继刚](https://x.com/lijigang_com)
- 版本:   1.0
- 日期:   2025-10-10

```
你是一位深谙维特根斯坦哲学的"语言游戏设计师"。你的任务不是给单词下定义，而是为用户提供一份清晰、有趣的"游戏手册"，指导他们如何在不同的语言情境中自如地"使用"这个单词。

请严格遵循以下"游戏手册"的结构，一次性输出所有内容，确保用户阅读完毕后，就能直观地理解并牢牢记住这个单词的"玩法"。

游戏目标单词： [用户将在此处插入单词]

1. 核心游戏：这是什么"局"？
   指令：首先，请用一句话点明这个单词通常在什么样的"语言游戏"或"情景牌局"中被当作关键牌打出。描述这个"局"的本质，而不是单词的定义。

例如：对于单词"Ephemeral"，核心游戏是"捕捉并感叹那些转瞬即逝的美好"。

2. 游戏棋盘：它在哪两种"场"上玩？
   指令：为这个单词提供两个截然不同的"游戏棋盘"，并各配一句示例，展示它在不同场上的玩法。

棋盘A (思辨场)：展示该单词在抽象、哲学或正式讨论中的用法。

棋盘B (生活场)：展示该单词在日常、具体或非正式情境中的用法。

3. 游戏溯源与拆解：这副牌是如何组装的？

指令：
卡牌拆解：像拆解机械一样，将单词拆分为"前缀 - 词根 - 后缀"，并清晰标注每个部件的核心含义。

组装故事：像讲述一则轶事一样，简介这些部件是如何组合起来，使其"游戏规则"从最初的形态演变成今天这个样子的。

4. 犯规警告：常见的"错招"是什么？

指令：明确指出一个使用这个单词时最容易犯的"规"（比如与某个形近/义近词混淆），并用一句话点明如何避免这步"错招"。

5. 通关秘籍：一招制胜的记忆技巧
   指令：提供一个巧妙、甚至有些出人意料的记忆"秘籍"。这个技巧应该能瞬间将单词的核心"玩法"刻入脑海。
```

</details>

# Wittgenstein's Word Game Manual

A React + TypeScript application that generates bilingual (English/Chinese) game manuals for words using AI, inspired by Ludwig Wittgenstein's philosophy of "language games." Instead of defining words, the app teaches you how to "use" them in different contexts.

## 🎮 Features

- **AI-Powered Manual Generation**: Creates detailed game manuals for any word using multiple AI providers (DeepSeek, Gemini, OpenAI)
- **Bilingual Support**: Full English/Chinese translation with toggle functionality
- **Export Options**: Download manuals as images or share via URL
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Language Game Philosophy**: Based on Wittgenstein's concept that the meaning of a word is its use in language

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An API key for one of the supported AI providers

### Installation

1. Clone the repository
   
   ```bash
   git clone https://github.com/Cactusinhand/word-game.git
   cd word-game
   ```

2. Install dependencies
   
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory:
   
   ```bash
   # Choose ONE of the following API keys:
   
   # Option 1: DeepSeek (recommended, cost-effective)
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   
   # Option 2: Google Gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Option 3: OpenAI
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server
   
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 🎯 How to Use

1. **Enter a Word**: Type any English word in the input field
2. **Generate Manual**: Click "Design Manual" to generate a comprehensive game manual
3. **Explore**: Read through the different sections to understand how to "use" the word
4. **Toggle Languages**: Switch between English, Chinese, or bilingual view
5. **Export**: Download as an image or copy a share link

## 📋 Manual Structure

Each generated manual follows Wittgenstein's language game approach:

1. **Core Game**: The essential "game" or context where the word is used
2. **Game Boards**: Two different contexts (Abstract/Philosophical vs. Everyday/Concrete)
3. **Origin & Teardown**: Etymology and linguistic components
4. **Foul Warning**: Common usage mistakes to avoid
5. **Mastery Tip**: A memorable trick to understand the word's usage

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Multiple providers (DeepSeek, Google Gemini, OpenAI)
- **Export**: html2canvas for image generation
- **Sharing**: URL-based sharing with compression (pako)
- **Deployment**: Cloudflare Pages ready

## 🌐 Deployment

### Cloudflare Pages (Recommended)

1. **Build the project**
   
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**
   
   - Connect your GitHub repository to Cloudflare Pages
   - Use the following build settings:
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Root directory**: `/`

3. **Set Environment Variables**
   Add your API key in Cloudflare Pages dashboard:
   
   ```
   DEEPSEEK_API_KEY=your_actual_api_key_here
   ```

### Environment Variables

| Variable           | Description           | Required                 |
| ------------------ | --------------------- | ------------------------ |
| `DEEPSEEK_API_KEY` | DeepSeek AI API key   | ✅ (or one of the others) |
| `GEMINI_API_KEY`   | Google Gemini API key | ✅ (or one of the others) |
| `OPENAI_API_KEY`   | OpenAI API key        | ✅ (or one of the others) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Prompt Design**: [李继刚](https://x.com/lijigang_com) - Creator of the innovative "Language Game Designer" prompt that inspired this entire application
- Inspired by Ludwig Wittgenstein's philosophical work on language games
- Built with modern web technologies and AI capabilities
- Special thanks to the AI providers that make this project possible

---

*"Don't ask for the meaning, ask for the use."* - Ludwig Wittgenstein