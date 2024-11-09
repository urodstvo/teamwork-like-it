# Используем базовый образ Ubuntu
FROM ubuntu:latest

# Устанавливаем базовые утилиты
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    sudo \
    && apt-get clean


# Установить Go
RUN curl -Lo go1.23.3.linux-amd64.tar.gz https://golang.org/dl/go1.23.3.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.23.3.linux-amd64.tar.gz && \
    rm -f go1.23.3.linux-amd64.tar.gz

# Настройка переменных окружения
ENV GOROOT=/usr/local/go
ENV GOPATH=/go
ENV PATH=$PATH:/usr/local/go/bin:$GOPATH/bin

RUN go install golang.org/x/tools/gopls@latest

# добавляем пользователя, под которым будем работать внутри контейнера, заодно даем ему возможность делать sudo
RUN useradd -m -d /home/user -s /bin/bash user && adduser user sudo && \
    echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# дальше все действия производим уже от пользователя
USER user 

# Установка NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# подгружаем все инициализационные скрипты и переменные среды в bash
SHELL ["/bin/bash", "-c", "-l"]

# Загружаем nvm, устанавливаем Node.js версию из .nvmrc
RUN source $HOME/.nvm/nvm.sh && nvm install v22.9.0 && nvm alias default v22.9.0

# Установка зависимостей проекта (если нужно)
WORKDIR /workspace
COPY . /workspace

# Команда по умолчанию для запуска контейнера
CMD [ "/bin/bash" ]
