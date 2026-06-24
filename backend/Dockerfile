#Этап сборки (Build)
FROM ://microsoft.com AS build-env
WORKDIR /app

# Копируем файл проекта и восстанавливаем зависимости (кэшируемый слой)
COPY *.csproj ./
RUN dotnet restore

# Копируем весь остальной код бэкенда и собираем релизную версию
COPY . ./
RUN dotnet publish -c Release -o out

#Этап запуска (Runtime)
FROM ://microsoft.com
WORKDIR /app

# Копируем скомпилированные файлы из предыдущего этапа
COPY --from=build-env /app/out .

# Открываем порт, на котором будет слушать бэкенд внутри контейнера
EXPOSE 5170
ENV ASPNETCORE_URLS=http://+:5170

# Команда запуска бэкенда (замените Egov.dll на точное имя вашего .dll файла проекта, если оно отличается)
ENTRYPOINT ["dotnet", "Egov.dll"]
