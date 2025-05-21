package edu.iu.es.ebs.rwa;

import edu.iu.es.ep.launchpad.config.LaunchpadApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RwaApplication {

    public static void main(String[] args) {
        LaunchpadApplication.run(RwaApplication.class, args);
    }
}
