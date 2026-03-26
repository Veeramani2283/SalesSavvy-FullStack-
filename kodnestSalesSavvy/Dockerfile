FROM eclipse-temurin:17-jre
WORKDIR /APP
COPY target/*.jar app.jar
EXPOSE 9090
ENTRYPOINT [ "java","-jar","app.jar" ]