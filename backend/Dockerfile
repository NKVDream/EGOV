Form ://microsoft.com AS build
workdir /src

copy ["backend.csproj", "./"]
run dotnet restore "./backend.csproj"

copy ..
run dotnet publish "backend.csproj" -c Release -o /app/publish

from ://microsoft.com as final
workdir /app
copy --from=build /app/publish .

expose 8080
env aspnetcore_urls=http://+:8080

entrypoint ["dotnet", "backend.dll"]