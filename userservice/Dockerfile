# Build context must be the repository root (this service depends on ../common)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY common/pom.xml common/pom.xml
COPY common/src common/src
RUN mvn -q -f common/pom.xml install -DskipTests

COPY userservice/pom.xml userservice/pom.xml
RUN mvn -q -f userservice/pom.xml dependency:go-offline

COPY userservice/src userservice/src
RUN mvn -q -f userservice/pom.xml package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/userservice/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
