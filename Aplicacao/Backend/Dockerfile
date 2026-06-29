# Stage 1: Build da aplicacao
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copia arquivos de configuracao do Maven
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copia o codigo fonte e realiza o build
COPY src ./src
RUN ./mvnw package -DskipTests

# Stage 2: Imagem final de execucao leve
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copia o jar gerado no stage de build
COPY --from=build /app/target/MoedaEstudantil-0.1.jar app.jar

# Expõe a porta 8080 padrao do Micronaut
EXPOSE 8080

# Comando de inicializacao
ENTRYPOINT ["java", "-jar", "app.jar"]
