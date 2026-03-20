FROM openjdk:21-jdk

WORKDIR /app

# install maven
RUN apt-get update && apt-get install -y maven

# copy project
COPY . .

# build jar (skip tests)
RUN mvn clean package -DskipTests

# copy jar
RUN cp target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]