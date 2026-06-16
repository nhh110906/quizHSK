# QuizHSK

Web học từ vựng HSK miễn phí cho người Việt — clone lấy cảm hứng từ [OpenQuiz.ai](https://openquiz.ai) với **tất cả tính năng Premium mở khóa miễn phí**.

## Tính năng

- Flashcard + Spaced Repetition (SRS) — HSK 1-6 (~9,700 từ)
- Luyện chính tả, điền từ, sắp xếp câu, dịch thuật
- AI tạo flashcard từ văn bản (miễn phí ∞)
- AI lộ trình học cá nhân (miễn phí ∞)
- Hội thoại AI theo tình huống (miễn phí ∞)

## Chạy local

```bash
npm run install:all
npm run build-data
npm run build
npm start
```

Mở http://localhost:3001

## Dev mode

```bash
npm run install:all
npm run build-data
npm run dev
```

Frontend: http://localhost:5173 · API: http://localhost:3001

## Stack

- React + Vite (frontend)
- Express (API)
- Dữ liệu HSK từ [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) (MIT)

## Deploy

Render: push lên GitHub, tạo Web Service từ repo này.
