# Build context must be the repository root
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY aiservice/pom.xml aiservice/pom.xml
RUN mvn -q -f aiservice/pom.xml dependency:go-offline

COPY aiservice/src aiservice/src
RUN mvn -q -f aiservice/pom.xml package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/aiservice/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
