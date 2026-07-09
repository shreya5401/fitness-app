# Build context must be the repository root
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY configserver/pom.xml configserver/pom.xml
RUN mvn -q -f configserver/pom.xml dependency:go-offline

COPY configserver/src configserver/src
RUN mvn -q -f configserver/pom.xml package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/configserver/target/*.jar app.jar
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]
