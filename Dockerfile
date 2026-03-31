FROM eclipse-temurin:17

WORKDIR /app

COPY backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
