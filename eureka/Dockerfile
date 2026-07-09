# Build context must be the repository root
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY eureka/pom.xml eureka/pom.xml
RUN mvn -q -f eureka/pom.xml dependency:go-offline

COPY eureka/src eureka/src
RUN mvn -q -f eureka/pom.xml package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/eureka/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
