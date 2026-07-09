# Build context must be the repository root (this service depends on ../common)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY common/pom.xml common/pom.xml
COPY common/src common/src
RUN mvn -q -f common/pom.xml install -DskipTests

COPY gateway/pom.xml gateway/pom.xml
RUN mvn -q -f gateway/pom.xml dependency:go-offline

COPY gateway/src gateway/src
RUN mvn -q -f gateway/pom.xml package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
