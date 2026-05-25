# Docker Hub Настройка для GitHub Actions

## Что нужно сделать:

### 1. Регистрация Docker Hub
1. Перейди на https://hub.docker.com/
2. Нажми "Sign Up"
3. Введи email, пароль и имя пользователя
4. Подтверди email
5. Создай репозиторий с названием `ryazhaai`

### 2. Добавление Secrets в GitHub
1. Зайди в твой GitHub репозиторий: https://github.com/Dimasick-git/RyazhaAI
2. Перейди в Settings → Secrets and variables → Actions
3. Нажми "New repository secret"
4. Добавь два секрета:

#### Secret 1: DOCKER_USERNAME
- **Name:** `DOCKER_USERNAME`
- **Value:** твой Docker Hub username (например: `dimasick`)

#### Secret 2: DOCKER_PASSWORD
- **Name:** `DOCKER_PASSWORD`
- **Value:** твой Docker Hub password или access token

### 3. Рекомендация: Используй Access Token
Вместо пароля лучше создать Access Token:
1. В Docker Hub зайди в Account Settings → Security
2. Нажми "New Access Token"
3. Дай имя токену (например: `github-actions`)
4. Выбери права: `read, write, delete`
5. Скопируй сгенерированный токен
6. Используй этот токен как `DOCKER_PASSWORD`

### 4. Проверка настройки
После добавления secrets GitHub Actions сможет:
- Автоматически логиниться в Docker Hub
- Собирать и пушить Docker образы
- Создавать теги для релизов

## Быстрая проверка

После настройки secrets запушь любой коммит в main ветку - GitHub Actions автоматически соберет и запушит Docker образ.

## Имя Docker образа
Образ будет доступен как: `dimasick/ryazhaai:latest`

## Дополнительно
- Docker образ будет содержать веб версию RyazhaAI
- Автоматически обновляется при каждом коммите в main
- Используется для деплоя в контейнерах

---
 **RYAZHA AI** - Создано в 2026 для Switch комьюнити!
