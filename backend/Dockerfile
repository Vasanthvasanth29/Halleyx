FROM eclipse-temurin:21-jdk

WORKDIR /app

RUN apt-get update && apt-get install -y maven

COPY . .

RUN mvn clean package -DskipTests

RUN cp target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]