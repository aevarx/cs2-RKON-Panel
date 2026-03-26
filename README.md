# CS2 RCON Panel (Tauri v2)

Стильная и компактная панель управления для серверов Counter-Strike 2. Разработана для турнирных администраторов и владельцев серверов, которым нужен быстрый доступ к RCON и управлению матчами без лишнего веса.

![Dashboard Preview](https://placehold.co/800x450?text=Dashboard+Screenshot+Placeholder)

## ✨ Особенности

- **Современный UI**: Темная тема, выполненная на Tailwind CSS и Radix UI.
- **Tauri v2**: Максимальная производительность и минимальный размер (менее 15 МБ).
- **MatchZy**: Встроенный генератор конфигов для MatchZy и автоматический запуск матчей.
- **RCON Dashboard**: Быстрые команды (пауза, рестарт, старт) и управление картами с автодополнением.
- **A2S Query**: Реальное отображение статуса сервера, текущей карты и игроков (с правильным учетом GOTV).
- **Портативность**: Доступна версия, не требующая установки.

## 📸 Скриншоты

### Панель управления (Dashboard)
![Dashboard](https://placehold.co/800x450?text=Dashboard+Screenshot+Placeholder)

### Генератор матчей (MatchZy)
![MatchZy Generator](https://placehold.co/800x450?text=MatchZy+Generator+Screenshot+Placeholder)

## 🚀 Быстрый старт

1. Перейдите в раздел [Releases](https://github.com/aevarx/cs2-RKON-Panel/releases).
2. Скачайте последнюю версию:
   - **cs2-rcon-panel.exe** — портативная версия (просто запустите).
   - **cs2-rcon-panel_setup.exe** — установщик для Windows.
3. Добавьте ваш сервер (IP, Port, RCON Password) и управляйте!

## 🛠 Технологии

- **Frontend**: Next.js 15, React 18, Tailwind CSS, Lucide Icons.
- **Backend**: Rust (Tauri v2), `a2s` crate, `rcon` crate.
- **Database**: SQLite (via `tauri-plugin-sql`).

## 👨‍💻 Разработка

Если вы хотите собрать проект самостоятельно:

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run tauri dev

# Сборка финального релиза
npm run tauri build
```

## 🔒 Безопасность

Проект регулярно обновляется. Зависимости (Next.js и др.) поддерживаются в актуальном состоянии для предотвращения уязвимостей.

---
*Разработано командой Aevarx.*
