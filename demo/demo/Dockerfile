# Use an official Java runtime as a parent image
FROM eclipse-temurin:17-jdk-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy the project files into the container
COPY . .

# Give permission to execute the Maven wrapper
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the jar file (Ensure the name matches your pom.xml artifactId)
CMD ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]