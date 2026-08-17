# AoE4 兵種相剋練習

世紀帝國 IV 兵種相剋練習工具：左右各一個文明兵種，點出剋制的一方或「無明顯相剋」，可 30 秒挑戰或不計時練習，並統計錯誤率。

**直接玩**：開啟 `index.html`（單一檔案、離線可玩），或部署到 GitHub Pages 後用網址開。

## 資料來源
- 兵種數值：[AoE4 World data](https://data.aoe4world.com/)（`units/all-unified.json`）
- 兵種圖片：Age of Empires Fandom 百科各單位頁面的遊戲截圖
- 中文譯名：依 RekoWiki 世紀帝國 IV 單位列表校對

## 判定邏輯（同成本兩群互打）
特殊機制例外 ＞ 遊戲內加成傷害 ＞ 兵種類型相剋表；同類型比同成本戰力，差距不大則為「無明顯相剋」；沒把握的組合不出題。

## 重新建置
```
cd src
curl -o unified.json https://data.aoe4world.com/units/all-unified.json
node build.js ../index.html
```
`scrape.js` / `pick.js` 用來抓取與挑選 Fandom 的模型截圖（結果已存在 `pick.json` 與 `models/`）。
