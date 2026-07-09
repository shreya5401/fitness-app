# Build context must be the repository root
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY activityservice/pom.xml activityservice/pom.xml
RUN mvn -q -f activityservice/pom.xml dependency:go-offline

COPY activityservice/src activityservice/src
RUN mvn -q -f activityservice/pom.xml package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/activityservice/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
