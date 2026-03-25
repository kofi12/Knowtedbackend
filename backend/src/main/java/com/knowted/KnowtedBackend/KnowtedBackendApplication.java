package com.knowted.KnowtedBackend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@SpringBootApplication
@EnableWebSecurity
@SuppressWarnings("unused")
public class KnowtedBackendApplication {

	public static void main(String[] args) {
		// Load .env file (safe: ignores if missing)
		Dotenv dotenv = Dotenv.configure()
				.directory(".")           // look in project root
				.ignoreIfMissing()        // don't crash if .env doesn't exist
				.load();

		// Push all .env variables into system properties so Spring sees them
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
		});

		// Optional: log that .env was loaded (helps debugging)
		if (!dotenv.entries().isEmpty()) {
			System.out.println("Loaded " + dotenv.entries().size() + " variables from .env");
		} else {
			System.out.println("No .env file found – using system env vars or defaults");
		}

		// Start Spring Boot as normal
		SpringApplication.run(KnowtedBackendApplication.class, args);
	}
}